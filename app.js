// Import Firestore modules directly from the official web CDN
import { initializeApp } from "https://gstatic.com";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot } from "https://gstatic.com";

// ✅ YOUR OFFICIAL MATCHONE PRODUCTION APP CONFIGURATION
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
let messagesCollection = null;
let recentMessagesQuery = null;

// Attempt database connection without freezing the entire script architecture
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    messagesCollection = collection(db, "messages");
    recentMessagesQuery = query(messagesCollection, orderBy("timestamp", "asc"), limit(50));
} catch (error) {
    console.error("Firebase Initialization Failure:", error);
}

// Runtime workspace memory setup
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

// Enforce UI execution loop matching document layout painting
document.addEventListener("DOMContentLoaded", () => {
    const loginContainer = document.getElementById("login-container");
    const chatContainer = document.getElementById("chat-container");
    const usernameInput = document.getElementById("username-input");
    const joinBtn = document.getElementById("join-btn");
    const messageInput = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");
    const messagesContainer = document.getElementById("messages-container");
    const themeToggle = document.getElementById("theme-toggle");

    // 🌗 DARK MODE LOGIC (Isolated to prevent database locks from freezing it)
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

    // LOBBY ENTRY SYSTEM LOGIC
    if (joinBtn && usernameInput) {
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

    // MESSAGE TRANSMISSION LOGIC
    async function sendMessage() {
        if (!messagesCollection) return;
        const rawText = messageInput.value.trim();
        if (rawText && username) {
            try {
                await addDoc(messagesCollection, {
                    name: username,
                    message: cleanText(rawText),
                    timestamp: Date.now()
                });
                messageInput.value = "";
            } catch (error) {
                console.error("Error writing message to Firestore:", error);
            }
        }
    }

    if (sendBtn) sendBtn.addEventListener("click", sendMessage);
    if (messageInput) {
        messageInput.addEventListener("keypress", (e) => { 
            if (e.key === "Enter") sendMessage(); 
        });
    }

    // DATA STREAM RENDERER LOGIC
    if (recentMessagesQuery) {
        onSnapshot(recentMessagesQuery, (snapshot) => {
            messagesContainer.innerHTML = ""; // Clear existing blocks to prevent duplicating views

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
            messagesContainer.scrollTop = messagesContainer.scrollHeight; // Autoscroll pinned
        }, (error) => {
            console.error("Firestore Streaming Interrupt Error:", error);
        });
    }
});
