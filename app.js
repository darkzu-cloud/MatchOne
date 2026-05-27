let username = "";
const LOCAL_STORAGE_KEY = "matchone_synchronized_lounge_messages";

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

    // 🌗 DARK MODE: Fully isolated from external scripts. Changes theme instantly.
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        if (currentTheme === "dark") {
            document.documentElement.removeAttribute("data-theme");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
        }
    });

    // 🚪 LOGIN TRANSITION SCREEN: Changes panels instantly.
    joinBtn.addEventListener("click", () => {
        username = usernameInput.value.trim();
        if (!username) {
            alert("Please input a screen name to access MatchOne!");
            return;
        }
        loginContainer.classList.add("hidden");
        chatContainer.classList.remove("hidden");
        renderLounge(); // Fetch list data immediately
    });

    // 📥 LAYOUT RENDERER Loop
    function renderLounge() {
        let savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        let messagesArray = savedData ? JSON.parse(savedData) : [];

        messagesContainer.innerHTML = ""; // Refresh canvas pane

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
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Anchor bottom tracking window
    }

    // ✉️ SEND OUTBOUND SIGNAL
    function sendMessage() {
        const rawText = messageInput.value.trim();
        if (!rawText || !username) return;

        let savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        let messagesArray = savedData ? JSON.parse(savedData) : [];

        // Push new entry straight into synchronization array
        messagesArray.push({
            name: username,
            message: rawText,
            timestamp: Date.now()
        });

        // Cap array bounds length to 50 items to optimize memory performance
        if (messagesArray.length > 50) {
            messagesArray.shift();
        }

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messagesArray));
        messageInput.value = "";
        renderLounge(); // Repaint screen locally
    }

    sendBtn.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });

    // 🔄 SIMULTANEOUS WIRE INTERACTIVE BROADCAST LISTENER
    // Automatically repaints the window screen the moment another tab types a message!
    window.addEventListener("storage", (e) => {
        if (e.key === LOCAL_STORAGE_KEY && !chatContainer.classList.contains("hidden")) {
            renderLounge();
        }
    });
});
