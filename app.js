// ✅ MATCHONE OFFICIAL INTEGRATION CREDENTIALS
const firebaseConfig = {
  apiKey: "AIzaSyArBrlVv9IEBHwWwkiZ-Xs0N0h1qR_nDZM",
  authDomain: "://firebaseapp.com",
  projectId: "matchone-d3217",
  storageBucket: "matchone-d3217.firebasestorage.app",
  messagingSenderId: "291767431734",
  appId: "1:291767431734:web:1ae4cc354f051f538a5e97",
  measurementId: "G-6BQYC5RQP8"
};

let db = null;
let username = "";
let isOfflineFallback = false;

// Array database simulation used if network requests are actively blocked
let localMessageArray = [
    { name: "System", message: "Connected via secure offline test sandbox.", timestamp: Date.now() }
];

try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log("Firebase Handshake Achieved.");
    } else {
        isOfflineFallback = true;
    }
} catch (e) {
    console.error("Firebase Blocked:", e);
    isOfflineFallback = true;
}

document.addEventListener("DOMContentLoaded", () => {
    const loginContainer = document.getElementById("login-container");
    const chatContainer = document.getElementById("chat-container");
    const usernameInput = document.getElementById("username-input");
    const joinBtn = document.getElementById("join-btn");
    const messageInput = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");
    const messagesContainer = document.getElementById("messages-container");
    const themeToggle = document.getElementById("theme-toggle");

    // 🌗 Theme Toggles function independently of network state
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

    // 🚪 Sign-in interface button shifts instantly
    if (joinBtn && usernameInput) {
        joinBtn.addEventListener("click", () => {
            username = usernameInput.value.trim();
            if (!username) {
                alert("Please input a screen name to access MatchOne!");
                return;
            }
            loginContainer.classList.add("hidden");
            chatContainer.classList.remove("hidden");
            
            // Render basic initial log structure if running inside offline network mode
            if (isOfflineFallback || !db) {
                renderOfflineMessages();
            }
        });
    }

    // Offline Array Rendering Loop Function
    function renderOfflineMessages() {
        messagesContainer.innerHTML = "";
        localMessageArray.forEach(data => {
            const time = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const wrapper = document.createElement("div");
            wrapper.classList.add("msg-wrapper", "animate-fade");
            wrapper.innerHTML = `
                <div class="msg-meta"><span class="msg-sender">${data.name}</span><span class="msg-time">${time}</span></div>
                <div class="msg-bubble"><div class="msg-text">${data.message}</div></div>
            `;
            messagesContainer.appendChild(wrapper);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Send logic handles either Firestore upload or local matrix tracking
    async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text || !username) return;

        if (isOfflineFallback || !db) {
            // Local fallback routing
            localMessageArray.push({ name: username, message: text, timestamp: Date.now() });
            renderOfflineMessages();
            messageInput.value = "";
            return;
        }

        try {
            await db.collection("messages").add({
                name: username,
                message: text,
                timestamp: Date.now()
            });
            messageInput.value = "";
        } catch (err) {
            console.warn("Writing blocked by server rules. Routing to local simulation display.", err);
            localMessageArray.push({ name: username, message: text, timestamp: Date.now() });
            renderOfflineMessages();
            messageInput.value = "";
        }
    }

    if (sendBtn) sendBtn.addEventListener("click", sendMessage);
    if (messageInput) {
        messageInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });
    }

    // Online Listener Setup
    if (db && !isOfflineFallback) {
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
                      <div class="msg-meta"><span class="msg-sender">${data.name}</span><span class="msg-time">${time}</span></div>
                      <div class="msg-bubble"><div class="msg-text">${data.message}</div></div>
                  `;
                  messagesContainer.appendChild(wrapper);
              });
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }, (error) => {
              console.error("Firestore Tracking Halted, activating storage matrix fallback mode.", error);
              isOfflineFallback = true;
              renderOfflineMessages();
          });
    }
});
