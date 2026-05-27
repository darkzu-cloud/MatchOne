// ✅ MATCHONE ASSIGNED FIREBASE CREDENTIAL CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyArBrlVv9IEBHwWwkiZ-Xs0N0h1qR_nDZM",
  authDomain: "://firebaseapp.com",
  projectId: "matchone-d3217",
  storageBucket: "matchone-d3217.firebasestorage.app",
  messagingSenderId: "291767431734",
  appId: "1:291767431734:web:1ae4cc354f051f538a5e97",
  measurementId: "G-6BQYC5RQP8"
};

// Start Cloud Initialization Engine
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let username = "";
const badWords = ["badword1", "badword2", "stupid", "jerk"];

function cleanText(text) {
    let filteredText = text;
    badWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        filteredText = filteredText.replace(regex, "****");
    });
    return filteredText;
}

function formatTime(timestamp) {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Attach UI Event Handlers
document.addEventListener("DOMContentLoaded", () => {
    const loginContainer = document.getElementById("login-container");
    const chatContainer = document.getElementById("chat-container");
    const usernameInput = document.getElementById("username-input");
    const joinBtn = document.getElementById("join-btn");
    const messageInput = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");
    const messagesContainer = document.getElementById("messages-container");
    const themeToggle = document.getElementById("theme-toggle");

    // 🌗 Theme Toggler Component
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        if (currentTheme === "dark") {
            document.documentElement.removeAttribute("data-theme");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
        }
    });

    // 🚪 Core Screen Login Transition (Guaranteed Unfreezable)
    joinBtn.addEventListener("click", () => {
        username = cleanText(usernameInput.value.trim());
        if (!username) {
            alert("Please input a screen name to access MatchOne!");
            return;
        }
        loginContainer.classList.add("hidden");
        chatContainer.classList.remove("hidden");
    });

    // ✉️ Send Data Stream Outbound
    async function sendMessage() {
        const rawText = messageInput.value.trim();
        if (rawText && username) {
            try {
                await db.collection("messages").add({
                    name: username,
                    message: cleanText(rawText),
                    timestamp: Date.now()
                });
                messageInput.value = "";
            } catch (error) {
                console.error("Firestore Write Blocked:", error);
                alert("Database link interrupted. Please disable browser adblock extensions.");
            }
        }
    }

    sendBtn.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });

    // 🌐 REAL-TIME SIMULTANEOUS CHAT ROOM STREAM (No indices required, unfreezable)
    db.collection("messages")
      .limitToLast(50)
      .onSnapshot((snapshot) => {
          let messagesArray = [];

          snapshot.forEach((doc) => {
              const data = doc.data();
              messagesArray.push(data);
          });

          // Sort messages inside JavaScript array so database engine never crashes
          messagesArray.sort((a, b) => a.timestamp - b.timestamp);

          messagesContainer.innerHTML = ""; // Refresh clean pane setup

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
          messagesContainer.scrollTop = messagesContainer.scrollHeight; // Focus lock scrolling tracking down
      }, (error) => {
          console.error("Database streaming failed:", error);
      });
});
