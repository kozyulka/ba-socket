'use strict';

const express = require('express');
const http = require('http');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const ChatManager = require('./managers/ChatManager');

const app = express();
const server = http.Server(app);
const io = socket(server);
const chatManager = new ChatManager();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('client'));

app.post('/login', (req, res) => {
    const user = {
        name: req.body.name,
        nickname: req.body.nickname,
    };

    if (chatManager.isUserExisting(user)) {
        res.status(403);
        return res.end();
    }

    chatManager.addUser(user);
    res.end();
});

// app.post('/chat', (req, res) => {
//     const message = {
//         sender: req.body.sender,
//         text: req.body.text,
//     };

//     chatManager.addMessage(message);
//     res.end();
// });

io.on('connection', (socket) => {
    console.log('New connection');

    socket.on('message', (message) => {
        socket.broadcast.emit('message', message);
    });
});

server.listen(8080, () => {
    console.log('Listening');
});
