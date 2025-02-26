const socket = io();
let username = "Joueur"; // Par défaut

socket.on("set username", (name) => {
    username = name;
    document.getElementById("player-name").innerText = `Vous êtes : ${username}`;
});

// Gestion du tchat
const chatInput = document.getElementById("chat-input");
const chatBox = document.getElementById("chat-box");

function sendMessage() {
    const msg = chatInput.value.trim();
    if (msg) {
        socket.emit("chat message", { username, msg }); // Envoie un objet avec le pseudo et le message
        chatInput.value = "";
    }
}

socket.on("chat message", ({ username, msg }) => {
    chatBox.innerHTML += `<p><strong>${username}</strong> : ${msg}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll auto vers le bas
});

// Mise à jour de la liste des joueurs connectés
const playerList = document.getElementById("player-list");

socket.on("update players", (players) => {
    playerList.innerHTML = ""; // Réinitialise la liste
    players.forEach(player => {
        playerList.innerHTML += `<li>${player}</li>`;
    });
});
