const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const players = {};
const usedUsernames = new Set(); // Pseudos déjà utilisés
let gameStarted = false;

// Génère un pseudo aléatoire
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

function updatePlayersList() {
    io.emit("update players", Object.values(players));
}

io.on('connection', (socket) => {
    if (gameStarted) {
        socket.emit("game started"); // Rediriger les nouveaux joueurs directement vers le jeu s'il est déjà lancé
        return;
    }

    const username = generateUniqueUsername();
    players[socket.id] = username;
    socket.emit('set username', username);
    
    console.log(`Nouvel utilisateur : ${username} (ID: ${socket.id})`);

    updatePlayersList();

    socket.on('chat message', ({ username, msg }) => {
        io.emit('chat message', { username, msg });
    });

    // Déconnexion
    socket.on('disconnect', () => {
        usedUsernames.delete(players[socket.id]);
        delete players[socket.id];
        updatePlayersList();
    });
});

server.listen(3000, '192.168.154.113', () => {
    console.log('Serveur démarré sur http://192.168.154.113:3000');
});
