// ✅ INITIALIZE APP KEYS WITH ASSIGNED PRODUCTION SPECIFICATIONS
const firebaseConfig = {
  apiKey: "AIzaSyArBrlVv9IEBHwWwkiZ-Xs0N0h1qR_nDZM",
  authDomain: "://firebaseapp.com",
  projectId: "matchone-d3217",
  storageBucket: "matchone-d3217.firebasestorage.app",
  messagingSenderId: "291767431734",
  appId: "1:291767431734:web:1ae4cc354f051f538a5e97",
  measurementId: "G-6BQYC5RQP8"
};

// Start Global Instance Structures
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

// Bind operations directly to window loading layout thread
document.addEventListener("DOMContentLoaded", () => {
    const loginContainer = document.getElementById("login-container");
    const chatContainer = document.getElementById("chat-container");
    const usernameInput = document.getElementById("username-input");
    const joinBtn = document.getElementById("join-btn");
    const messageInput = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");
    const messagesContainer = document.getElementById("messages-container");
    const themeToggle = document.getElementById("theme-toggle");

    // 🌗 Fast Theme Switcher Logic
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        if (currentTheme === "dark") {
            document.documentElement.removeAttribute("data-theme");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
        }
    });

    // Lobby Interface Control Logic
    joinBtn.addEventListener("click", () => {
        username = cleanText(usernameInput.value.trim());
        if (!username) {
            alert("Please input a screen name to access MatchOne!");
            return;
        }
        loginContainer.classList.add("hidden");
        chatContainer.classList.remove("hidden");
    });

    // Upstream Transaction Writer Logic
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
                console.error("Firestore Write Block Alert: ", error);
            }
        }
    }

    sendBtn.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });

    // Live Streaming Core Engine Query Broker
    db.collection("messages")
      .orderBy("timestamp", "asc")
      .limitToLast(50)
      .onSnapshot((snapshot) => {
          messagesContainer.innerHTML = ""; // Wipe container map template to repaint stream safely

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
          messagesContainer.scrollTop = messagesContainer.scrollHeight; // Fast tracking scrolling snap
      }, (error) => {
          console.error("Realtime Synchronization Interrupted: ", error);
      });
});
