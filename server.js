const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const players = {}; // Stocke les vrais noms et pseudos
const usedUsernames = new Set(); // Pseudos déjà utilisés
let gameStarted = false;

// Génère un pseudo aléatoire unique
function generateUniqueUsername() {
    const nouns = ['Hervé', 'Adam', 'Lucien', 'Julie', 'Sonya', 'Roger', 'Jean', 'Arthur', 'Léa', 'Marvin'];
    
    let username;
    do {
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        username = `${randomNoun}`;
    } while (usedUsernames.has(username));
    
    usedUsernames.add(username);
    return username;
}

// Met à jour la liste des joueurs côté client
function updatePlayersList() {
    io.emit("update players", Object.values(players).map(p => p.realName || "En attente..."));
}

io.on('connection', (socket) => {
    if (gameStarted) {
        socket.emit("game started"); // Redirige les nouveaux joueurs si le jeu est en cours
        return;
    }

    console.log(`Nouvelle connexion (ID: ${socket.id})`);

    // Étape 1 : Demander le vrai nom au joueur
    socket.emit("request real name");

    socket.on("send real name", (realName) => {
        if (!realName) return;

        players[socket.id] = { realName, username: null }; // On stocke le vrai nom
        console.log(`Joueur enregistré : ${realName}`);
        
        updatePlayersList();
    });

    // Quand l'hôte clique sur "Lancer la partie"
    socket.on("start game", () => {
        if (gameStarted) return;
        gameStarted = true;

        // Attribution des pseudos à chaque joueur
        Object.keys(players).forEach((id) => {
            players[id].username = generateUniqueUsername();
        });

        io.emit("game started", Object.values(players).map(p => p.username)); // Envoie les pseudos aux joueurs
    });

    // Gestion du tchat
    socket.on('chat message', ({ username, msg }) => {
        io.emit('chat message', { username, msg });
    });

    // Déconnexion
    socket.on('disconnect', () => {
        if (players[socket.id]) {
            usedUsernames.delete(players[socket.id].username);
            delete players[socket.id];
            updatePlayersList();
        }
    });
});

server.listen(3000, '192.168.154.113', () => {
    console.log('Serveur démarré sur http://x:3000');
});
