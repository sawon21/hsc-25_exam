// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCE5aliCVhZIps60it6F52LtpVyRCyeIsE",
    authDomain: "bd-train-e69b0.firebaseapp.com",
    databaseURL: "https://bd-train-e69b0-default-rtdb.firebaseio.com",
    projectId: "bd-train-e69b0",
    storageBucket: "bd-train-e69b0.appspot.com",
    messagingSenderId: "15363398567",
    appId: "1:15363398567:web:653119f2014b7506267482",
    measurementId: "G-T8VK7ZGHV1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM elements
const roomSection = document.getElementById("room-section");
const chatSection = document.getElementById("chat-section");
const messagesDiv = document.getElementById("messages");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message");
const usernameInput = document.getElementById("username");
const partnerInput = document.getElementById("partner");
const toggleDarkModeBtn = document.getElementById("toggle-dark-mode");
const createRoomBtn = document.getElementById("create-room");
const joinRoomBtn = document.getElementById("join-room");
const btnBack = document.getElementById("btn-back");
const chatTitle = document.getElementById("chat-title");
const deleteRoomBtn = document.getElementById("delete-room");
const noticeDiv = document.getElementById("notice");

// Variables
let currentRoom = null;
let isDarkMode = false;

// Display Notice
function showNotice(message) {
    noticeDiv.textContent = message;
    noticeDiv.style.display = 'block';
    setTimeout(() => {
        noticeDiv.style.display = 'none';
    }, 3000);  // Hide notice after 3 seconds
}

// Create Room
createRoomBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    const partner = partnerInput.value.trim();

    if (!username || !partner) {
        showNotice("Please enter both usernames!");
        return;
    }

    const roomId = generateRoomId(username, partner);
    const roomRef = ref(db, `chatRooms/${roomId}`);

    // Check if the room already exists
    onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
            showNotice("Room with this name already exists. Please choose another username.");
        } else {
            // Create a new room
            set(roomRef, {
                users: {
                    [username]: true,
                    [partner]: true
                },
                messages: []
            }).then(() => {
                switchToChat(roomId, partner);
            });
        }
    });
});

// Join Room
joinRoomBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    const partner = partnerInput.value.trim();

    if (!username || !partner) {
        showNotice("Please enter both usernames!");
        return;
    }

    const roomId = generateRoomId(username, partner);
    const roomRef = ref(db, `chatRooms/${roomId}`);

    onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
            switchToChat(roomId, partner);
        } else {
            showNotice("Room does not exist or invalid username pair!");
        }
    });
});

// Switch to Chat Section
function switchToChat(roomId, partnerName) {
    currentRoom = roomId;
    chatTitle.innerText = `Chat with ${partnerName}`;
    roomSection.style.display = "none";
    chatSection.style.display = "block";
    btnBack.classList.remove("d-none");
    loadMessages(roomId);
}

// Back to Room Section
btnBack.addEventListener("click", () => {
    roomSection.style.display = "block";
    chatSection.style.display = "none";
    btnBack.classList.add("d-none");
});

// Send Message
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const message = messageInput.value.trim();

    if (!username || !message) return;

    const messageRef = ref(db, `chatRooms/${currentRoom}/messages`);
    const newMessageRef = push(messageRef);

    set(newMessageRef, {
        user: username,
        message: message,
        timestamp: Date.now()
    });

    messageInput.value = "";
});

// Load Messages
function loadMessages(roomId) {
    const messagesRef = ref(db, `chatRooms/${roomId}/messages`);

    onValue(messagesRef, (snapshot) => {
        messagesDiv.innerHTML = "";
        const messages = snapshot.val();

        if (messages) {
            Object.keys(messages).forEach((key) => {
                const messageData = messages[key];
                const messageElement = createMessageElement(messageData);
                messagesDiv.appendChild(messageElement);
            });
        }

        scrollToBottom();
    });
}

// Create Message Element
function createMessageElement(data) {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("chat-message");
    if (data.user !== usernameInput.value.trim()) {
        messageContainer.classList.add("received");
    }

    const avatar = document.createElement("div");
    avatar.classList.add("avatar");
    avatar.textContent = data.user.charAt(0).toUpperCase();

    const content = document.createElement("div");
    content.classList.add("content");

    const text = document.createElement("p");
    text.classList.add("mb-1");
    text.textContent = data.message;

    const timestamp = document.createElement("small");
    timestamp.classList.add("text-muted");
    timestamp.textContent = new Date(data.timestamp).toLocaleTimeString();

    content.appendChild(text);
    content.appendChild(timestamp);
    messageContainer.appendChild(avatar);
    messageContainer.appendChild(content);

    return messageContainer;
}

// Scroll to Bottom
function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Toggle Dark Mode
toggleDarkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    isDarkMode = !isDarkMode;
    toggleDarkModeBtn.innerHTML = isDarkMode
        ? '<i class="bi bi-sun"></i>'
        : '<i class="bi bi-moon"></i>';
});

// Delete Chat Room
deleteRoomBtn.addEventListener("click", () => {
    const roomRef = ref(db, `chatRooms/${currentRoom}`);
    remove(roomRef).then(() => {
        showNotice("Chat room deleted successfully.");
        roomSection.style.display = "block";
        chatSection.style.display = "none";
        btnBack.classList.add("d-none");
    }).catch(error => {
        showNotice("Failed to delete room: " + error.message);
    });
});

// Generate Room ID
function generateRoomId(user1, user2) {
    return [user1, user2].sort().join("_");
}