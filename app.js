import { initializeApp } from "https://gstatic.com";
import { getDatabase, ref, push, query, limitToLast, onChildAdded } from "https://gstatic.com";

// ⚠️ PASTE YOUR EXACT FIREBASE CONFIGURATION HERE
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, "messages");
const recentMessagesQuery = query(messagesRef, limitToLast(50));

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

    joinBtn.addEventListener("click", () => {
        username = cleanText(usernameInput.value.trim());
        if (!username) {
            alert("Please input a screen name to access MatchOne!");
            return;
        }
        loginContainer.classList.add("hidden");
        chatContainer.classList.remove("hidden");
    });

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
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
});
