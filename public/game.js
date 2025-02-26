const socket = io();

// Récupérer le pseudo attribué
let pseudo = sessionStorage.getItem("pseudo");
document.getElementById("player-name").innerText = `Vous êtes : ${pseudo}`;

// Gestion du tchat
const chatInput = document.getElementById("chat-input");
const chatBox = document.getElementById("chat-box");

function sendMessage() {
    const msg = chatInput.value.trim();
    if (msg) {
        socket.emit("chat message", { pseudo, msg }); // Envoie un objet avec le pseudo et le message
        chatInput.value = "";
    }
}

socket.on("chat message", ({ pseudo, msg }) => {
    chatBox.innerHTML += `<p><strong>${pseudo}</strong> : ${msg}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll auto vers le bas
});

// Mise à jour de la liste des joueurs connectés avec les pseudos
const playerList = document.getElementById("player-list");

socket.on("update players", (players) => {
    playerList.innerHTML = ""; // Réinitialise la liste
    players.forEach(player => {
        playerList.innerHTML += `<li>${player}</li>`;
    });
});
