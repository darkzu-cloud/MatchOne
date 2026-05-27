// ✅ RECOGNIZED FIREBASE ACCOUNT DEFINITIONS
const firebaseConfig = {
  apiKey: "AIzaSyArBrlVv9IEBHwWwkiZ-Xs0N0h1qR_nDZM",
  authDomain: "matchone-d3217.firebaseapp.com",
  projectId: "matchone-d3217",
  storageBucket: "matchone-d3217.firebasestorage.app",
  messagingSenderId: "291767431734",
  appId: "1:291767431734:web:1ae4cc354f051f538a5e97",
  measurementId: "G-6BQYC5RQP8"
};

let db = null;
let username = "";

// 🚀 CRITICAL FIX: Wrap Firebase engine setup inside a Try/Catch block.
// This prevents Firebase initialization issues from breaking your layout buttons.
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log("Firebase Engine Handshake Successful.");
    } else {
        console.error("External Firebase scripts were blocked by the browser network layer.");
    }
} catch (e) {
    console.error("Firebase Configuration Interruption:", e);
}

// Global Document Layout Execution Thread
document.addEventListener("DOMContentLoaded", () => {
    const loginContainer = document.getElementById("login-container");
    const chatContainer = document.getElementById("chat-container");
    const usernameInput = document.getElementById("username-input");
    const joinBtn = document.getElementById("join-btn");
    const messageInput = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");
    const messagesContainer = document.getElementById("messages-container");
    const themeToggle = document.getElementById("theme-toggle");

    // 🌗 DECOUPLED THEME TOGGLE: Works instantly, independent of database status.
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            if (currentTheme === "dark") {
                document.documentElement.removeAttribute("data-theme");
            } else {
                document.documentElement.setAttribute("data-theme", "dark");
            }
        });
    }

    // 🚪 DECOUPLED LOGIN NAVIGATION: Works instantly, independent of database status.
    if (joinBtn && usernameInput) {
        joinBtn.addEventListener("click", () => {
            username = usernameInput.value.trim();
            if (!username) {
                alert("Please input a screen name to access MatchOne!");
                return;
            }
            loginContainer.classList.add("hidden");
            chatContainer.classList.remove("hidden");
        });
    }

    // TRANSMIT MESSAGE FLOW
    async function sendMessage() {
        if (!db) {
            alert("Database Connection Error. Running app locally in Offline mode.");
            return;
        }
        const text = messageInput.value.trim();
        if (text && username) {
            try {
                await db.collection("messages").add({
                    name: username,
                    message: text,
                    timestamp: Date.now()
                });
                messageInput.value = "";
            } catch (err) {
                console.error("Firestore Write Blocked:", err);
            }
        }
    }

    if (sendBtn) sendBtn.addEventListener("click", sendMessage);
    if (messageInput) {
        messageInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });
    }

    // FIREBASE CONTENT RENDERING ENGINE
    if (db) {
        db.collection("messages")
          .orderBy("timestamp", "asc")
          .limitToLast(50)
          .onSnapshot((snapshot) => {
              messagesContainer.innerHTML = "";
              snapshot.forEach((doc) => {
                  const data = doc.data();
                  const time = data.timestamp ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
                  
                  const wrapper = document.createElement("div");
                  wrapper.classList.add("msg-wrapper", "animate-fade");
                  wrapper.innerHTML = `
                      <div class="msg-meta">
                          <span class="msg-sender">${data.name}</span>
                          <span class="msg-time">${time}</span>
                      </div>
                      <div class="msg-bubble"><div class="msg-text">${data.message}</div></div>
                  `;
                  messagesContainer.appendChild(wrapper);
              });
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }, (error) => {
              console.error("Firestore Stream Closed:", error);
          });
    }
});
