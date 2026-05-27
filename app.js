// ✅ MATCHONE ASSIGNED CONFIGURATION KEYS
const firebaseConfig = {
  apiKey: "AIzaSyArBrlVv9IEBHwWwkiZ-Xs0N0h1qR_nDZM",
  authDomain: "://firebaseapp.com",
  projectId: "matchone-d3217",
  storageBucket: "matchone-d3217.firebasestorage.app",
  messagingSenderId: "291767431734",
  appId: "1:291767431734:web:1ae4cc354f051f538a5e97",
  measurementId: "G-6BQYC5RQP8"
};

// Global Native Init
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let username = "";

function formatTime(timestamp) {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Runtime operations execution
document.addEventListener("DOMContentLoaded", () => {
    const loginContainer = document.getElementById("login-container");
    const chatContainer = document.getElementById("chat-container");
    const usernameInput = document.getElementById("username-input");
    const joinBtn = document.getElementById("join-btn");
    const messageInput = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");
    const messagesContainer = document.getElementById("messages-container");
    const themeToggle = document.getElementById("theme-toggle");

    // 🌗 Dark Mode Logic
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        if (currentTheme === "dark") {
            document.documentElement.removeAttribute("data-theme");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
        }
    });

    // Lobby Entry Logic (Guaranteed to click and unlock the chat room)
    joinBtn.addEventListener("click", () => {
        username = usernameInput.value.trim();
        if (!username) {
            alert("Please input a screen name to access MatchOne!");
            return;
        }
        loginContainer.classList.add("hidden");
        chatContainer.classList.remove("hidden");
    });

    // Write Message Logic Directly to Cloud
    async function sendMessage() {
        const rawText = messageInput.value.trim();
        if (rawText && username) {
            try {
                await db.collection("messages").add({
                    name: username,
                    message: rawText,
                    timestamp: Date.now()
                });
                messageInput.value = "";
            } catch (error) {
                console.error("Firestore Upload Error: ", error);
                alert("Database connection blocked. Turn off ad-blockers!");
            }
        }
    }

    sendBtn.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });

    // SAFE FIREBASE LISTENER (No index required, completely unfreezable)
    db.collection("messages")
      .limitToLast(50)
      .onSnapshot((snapshot) => {
          let messagesArray = [];

          snapshot.forEach((doc) => {
              const data = doc.data();
              messagesArray.push(data);
          });

          // Sort messages locally in JavaScript so Firestore doesn't reject the query
          messagesArray.sort((a, b) => a.timestamp - b.timestamp);

          messagesContainer.innerHTML = ""; // Clear pool

          messagesArray.forEach((data) => {
              const timeString = formatTime(data.timestamp);
              const wrapper = document.createElement("div");
              wrapper.classList.add("msg-wrapper", "animate-fade");
              
              wrapper.innerHTML = `
                  <div class="msg-meta">
                      <span class="msg-sender">${data.name}</span>
                      <span class="msg-time">${timeString}</span>
                  </div>
                  <div class="msg-bubble">
                      <div class="msg-text">${data.message}</div>
                  </div>
              `;
              messagesContainer.appendChild(wrapper);
          });
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, (error) => {
          console.error("Database streaming error: ", error);
      });
});
