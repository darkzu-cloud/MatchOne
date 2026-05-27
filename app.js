// Import core modular Firebase features directly via web CDN browser modules
import { initializeApp } from "https://gstatic.com";
import { getDatabase, ref, push, query, limitToLast, onChildAdded } from "https://gstatic.com";

// ✅ YOUR OFFICIAL MATCHONE PRODUCTION APP CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyArBrlVv9IEBHwWwkiZ-Xs0N0h1qR_nDZM",
  authDomain: "matchone-d3217.firebaseapp.com",
  projectId: "matchone-d3217",
  storageBucket: "matchone-d3217.firebasestorage.app",
  messagingSenderId: "291767431734",
  appId: "1:291767431734:web:1ae4cc354f051f538a5e97",
  measurementId: "G-6BQYC5RQP8"
};

// Initialize Firebase Core Engine
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Target the explicit "messages" tree inside your database rules setup
const messagesRef = ref(db, "messages");

// Structural snapshot optimization layer: pulling strictly the last 50 entries
const recentMessagesQuery = query(messagesRef, limitToLast(50));

// Core runtime memory parameters
let username = "";
const badWords = ["badword1", "badword2", "stupid", "jerk"]; // Expand list as needed

// Dynamic sanitization script tracking toxic phrasing
function cleanText(text) {
    let filteredText = text;
    badWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        filteredText = filteredText.replace(regex, "****");
    });
    return filteredText;
}

// Convert Unix snapshots into readable localized timestamps (HH:MM)
function formatTime(timestamp) {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Global script block execution isolated until document painting resolves
document.addEventListener("DOMContentLoaded", () => {
    const loginContainer = document.getElementById("login-container");
    const chatContainer = document.getElementById("chat-container");
    const usernameInput = document.getElementById("username-input");
    const joinBtn = document.getElementById("join-btn");
    const messageInput = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");
    const messagesContainer = document.getElementById("messages-container");
    const themeToggle = document.getElementById("theme-toggle");

    // 🌗 Dark Mode System Toggle Execution
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        if (currentTheme === "dark") {
            document.documentElement.removeAttribute("data-theme");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
        }
    });

    // Handle authentication wrapper onboarding event
    joinBtn.addEventListener("click", () => {
        username = cleanText(usernameInput.value.trim());
        if (!username) {
            alert("Please input a screen name to access MatchOne!");
            return;
        }
        loginContainer.classList.add("hidden");
        chatContainer.classList.remove("hidden");
    });

    // Compile variables and push structured JSON properties upstream
    function sendMessage() {
        const rawText = messageInput.value.trim();
        if (rawText && username) {
            push(messagesRef, {
                name: username,
                message: cleanText(rawText),
                timestamp: Date.now()
            });
            messageInput.value = "";
        }
    }

    sendBtn.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });

    // Live WebSockets listener intercepting incoming realtime updates
    onChildAdded(recentMessagesQuery, (snapshot) => {
        const data = snapshot.val();
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
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Anchor UI scroll tracking to bottom
    });
});
