let username = "";
let pieSocketRef = null;

// Unique public room id channel key for your MatchOne application
const CLOUD_ROOM_CHANNEL = "matchone_global_lounge_room_99";

function formatTime(timestamp) {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Render incoming messages directly to the chat window screen
function appendMessageToScreen(name, text, timestamp) {
    const messagesContainer = document.getElementById("messages-container");
    if (!messagesContainer) return;

    const timeString = formatTime(timestamp);
    const wrapper = document.createElement("div");
    wrapper.classList.add("msg-wrapper", "animate-fade");
    
    wrapper.innerHTML = `
        <div class="msg-meta">
            <span class="msg-sender">${name}</span>
            <span class="msg-time">${timeString}</span>
        </div>
        <div class="msg-bubble">
            <div class="msg-text">${text}</div>
        </div>
    `;
    messagesContainer.appendChild(wrapper);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Focus lock bottom snap
}

document.addEventListener("DOMContentLoaded", () => {
    const loginContainer = document.getElementById("login-container");
    const chatContainer = document.getElementById("chat-container");
    const usernameInput = document.getElementById("username-input");
    const joinBtn = document.getElementById("join-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const messageInput = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");
    const themeToggle = document.getElementById("theme-toggle");

    // 🌗 DARK MODE TOGGLE ENGINE
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        if (currentTheme === "dark") {
            document.documentElement.removeAttribute("data-theme");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
        }
    });

    // 🔄 GLOBAL LIVE WIRE CONNECT: Connects different people instantly
    function initializeGlobalLiveSync() {
        if (pieSocketRef) return; // Prevent multiple connections

        // Connect using a free open-source developer key from PieSocket Network
        pieSocketRef = new PieSocket({
            clusterId: "demo",
            apiKey: "oCd7EMZwZgSMrwH76HwDz6feEsb6g06YpAms6ZIn" 
        });

        const chatRoomWire = pieSocketRef.subscribe(CLOUD_ROOM_CHANNEL);

        // Listen for live messages typed by other people on other devices
        chatRoomWire.on("message", (msg) => {
            try {
                const data = JSON.parse(msg.data);
                appendMessageToScreen(data.name, data.message, data.timestamp);
            } catch (e) {
                console.error("Format read error:", e);
            }
        });
    }

    // 🚪 AUTO-LOGIN REFRESH FIX CHECK
    // If a name is already saved, skip login screen and keep them in the room
    const savedName = localStorage.getItem("matchone_active_session_username");
    if (savedName) {
        username = savedName;
        loginContainer.classList.add("hidden");
        chatContainer.classList.remove("hidden");
        initializeGlobalLiveSync();
    }

    // LOGIN ACTION
    joinBtn.addEventListener("click", () => {
        username = usernameInput.value.trim();
        if (!username) {
            alert("Please input a screen name to access MatchOne!");
            return;
        }
        // Save name to device storage so page refreshes don't logout
        localStorage.setItem("matchone_active_session_username", username);
        
        loginContainer.classList.add("hidden");
        chatContainer.classList.remove("hidden");
        initializeGlobalLiveSync();
    });

    // LOGOUT ACTION (Manual Leave)
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("matchone_active_session_username");
        location.reload(); // Refresh to wipe screen state
    });

    // ✉️ SEND MESSAGES TO EVERYONE SIMULTANEOUSLY
    function sendMessage() {
        const rawText = messageInput.value.trim();
        if (!rawText || !username || !pieSocketRef) return;

        const payloadPacket = {
            name: username,
            message: rawText,
            timestamp: Date.now()
        };

        // Broadcast package to everyone across the global cloud network
        pieSocketRef.publish(CLOUD_ROOM_CHANNEL, JSON.stringify(payloadPacket));
        
        messageInput.value = ""; // Clear text box input
    }

    sendBtn.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });
});
