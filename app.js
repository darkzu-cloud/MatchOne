// Import Firestore modules directly from the official web CDN
import { initializeApp } from "https://gstatic.com";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot } from "https://gstatic.com";

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

// Initialize Firebase Core & Firestore Database Engine
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Point to a collection called "messages"
const messagesCollection = collection(db, "messages");

// Structural Query: Order messages by time sent, limit stream history to the latest 50
const recentMessagesQuery = query(messagesCollection, orderBy("timestamp", "asc"), limit(50));

// Runtime parameters
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

    // Dark/Light view toggle handler
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        if (currentTheme === "dark") {
            document.documentElement.removeAttribute("data-theme");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
        }
    });

    // Username lobby event
    joinBtn.addEventListener("click", () => {
        username = cleanText(usernameInput.value.trim());
        if (!username) {
            alert("Please input a screen name to access MatchOne!");
            return;
        }
        loginContainer.classList.add("hidden");
        chatContainer.classList.remove("hidden");
    });

    // Push new document structures to Firestore collection
    async function sendMessage() {
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
                console.error("Error writing message to Firestore: ", error);
            }
        }
    }

    sendBtn.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });

    // Live continuous WebSockets snapshot listener intercepting live data changes
    onSnapshot(recentMessagesQuery, (snapshot) => {
        // Clear message board before refreshing list to prevent duplicates
        messagesContainer.innerHTML = "";

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
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Keep view pinned to bottom
    });
});
