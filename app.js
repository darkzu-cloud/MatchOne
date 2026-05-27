// ✅ MATCHONE OFFICIAL REGISTERED CORE CONFIGURATION BLOCK
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

// Initialize Database inside a safety block to protect UI events from crashing
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
    } else {
        console.warn("Firebase SDK libraries failed to map on network load. Interface running in Offline Mode.");
    }
} catch (error) {
    console.error("Database connection failure:", error);
}

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

// Complete application interface rendering loop
document.addEventListener("DOMContentLoaded", () => {
    const loginContainer = document.getElementById("login-container");
    const chatContainer = document.getElementById("chat-container");
    const usernameInput = document.getElementById("username-input");
    const joinBtn = document.getElementById("join-btn");
    const messageInput = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");
    const messagesContainer = document.getElementById("messages-container");
    const themeToggle = document.getElementById("theme-toggle");

    // 🌗 THEME TOGGLE (Isolated from Database Layer - Works Instantly)
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

    // LOBBY TRANSITION INTERFACE BUTTON (Isolated - Works Instantly)
    if (joinBtn) {
        joinBtn.addEventListener("click", () => {
            username = cleanText(usernameInput.value.trim());
            if (!username) {
                alert("Please input a screen name to access MatchOne!");
                return;
            }
            loginContainer.classList.add("hidden");
            chatContainer.classList.remove("hidden");
        });
    }

    // CLOUD TRANSACTION DATA WRITER
    async function sendMessage() {
        if (!db) {
            alert("Database offline. Check your internet connection.");
            return;
        }
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
                console.error("Firestore database push block error: ", error);
            }
        }
    }

    if (sendBtn) sendBtn.addEventListener("click", sendMessage);
    if (messageInput) {
        messageInput.addEventListener("keypress", (e) => { 
            if (e.key === "Enter") sendMessage(); 
        });
    }

    // LIVE STREAM LAYOUT SYNCHRONIZER
    if (db) {
        db.collection("messages")
          .orderBy("timestamp", "asc")
          .limitToLast(50)
          .onSnapshot((snapshot) => {
              messagesContainer.innerHTML = ""; // Clear list structure

              snapshot.forEach((doc) => {
                  const data = doc.data();
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
              messagesContainer.scrollTop = messagesContainer.scrollHeight; // Focus lock bottom snap
          }, (error) => {
              console.error("Snapshot data synchronization error: ", error);
          });
    }
});
