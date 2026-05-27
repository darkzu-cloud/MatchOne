let username = "";
const CHAT_ROOM_KEY = "matchone_global_chat_stream";

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

    // 🌗 DECOUPLED THEME SWITCH (Guaranteed to work 100% of the time)
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        if (currentTheme === "dark") {
            document.documentElement.removeAttribute("data-theme");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
        }
    });

    // 🚪 DECOUPLED LOGIN BUTTON (Guaranteed to work 100% of the time)
    joinBtn.addEventListener("click", () => {
        username = usernameInput.value.trim();
        if (!username) {
            alert("Please input a screen name to access MatchOne!");
            return;
        }
        loginContainer.classList.add("hidden");
        chatContainer.classList.remove("hidden");
        loadMessages(); // Load room data instantly upon sign-in
    });

    // 📥 FETCH AND RENDER LOGS
    async function loadMessages() {
        try {
            // Fetch cloud data string from Puter Network
            let dataString = await puter.kv.get(CHAT_ROOM_KEY);
            let messagesArray = dataString ? JSON.parse(dataString) : [];

            messagesContainer.innerHTML = ""; // Clear view board

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
            messagesContainer.scrollTop = messagesContainer.scrollHeight; // Anchor bottom tracking
        } catch (err) {
            console.error("Cloud synchronization drop:", err);
        }
    }

    // ✉️ TRANSMIT OUTBOUND MESSAGES
    async function sendMessage() {
        const rawText = messageInput.value.trim();
        if (!rawText || !username) return;

        try {
            // Fetch current room history matrix
            let dataString = await puter.kv.get(CHAT_ROOM_KEY);
            let messagesArray = dataString ? JSON.parse(dataString) : [];

            // Append the new message object
            messagesArray.push({
                name: username,
                message: rawText,
                timestamp: Date.now()
            });

            // Cap memory size to the last 50 entries to keep loads ultra-fast
            if (messagesArray.length > 50) {
                messagesArray.shift();
            }

            // Sync matrix back into Puter's cloud pipeline
            await puter.kv.set(CHAT_ROOM_KEY, JSON.stringify(messagesArray));
            messageInput.value = "";
            loadMessages(); // Instantly update user's board layout
        } catch (error) {
            console.error("Transmission error:", error);
        }
    }

    sendBtn.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });

    // 🔄 AUTOMATIC SYNC LOOP: Synchronizes different people chatting at the same time
    setInterval(() => {
        if (!chatContainer.classList.contains("hidden")) {
            loadMessages();
        }
    }, 2500); // Polling loop runs every 2.5 seconds to check for new messages
});
