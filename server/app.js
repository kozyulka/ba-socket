'use strict';

const express = require('express');
const http = require('http');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const ChatManager = require('./ChatManager');

const app = express();
const server = http.Server(app);
const io = socket(server);
const chatManager = new ChatManager();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('../client'));

app.post('/login', (req, res) => {
    const user = {
        name: req.body.name,
        nickname: req.body.nickname,
        loginTime: req.body.loginTime
    };

    if (chatManager.isUserExisting(user)) {
        res.status(403);
        return res.end();
    }

    chatManager.addUser(user);
    res.end();
});

io.on('connection', (socket) => {
    const users = chatManager.getUsers();
    const messages = chatManager.getMessages();
    const nickname = socket.handshake.query.nickname;

    io.emit('users', users);
    io.emit('history', messages);

    socket.on('message', (message) => {
        socket.broadcast.emit('message', message);
        chatManager.addMessage(message);
    });

    socket.on('typing', (nickname) => {
        socket.broadcast.emit('typing', nickname);
    });

    socket.on('disconnect', () => {
        chatManager.setUserLogoutTime(nickname);

        const users = chatManager.getUsers();

        socket.broadcast.emit('users', users);
        socket.broadcast.emit('disconnected', nickname);
    });
});

server.listen(8080, () => {
    console.log('Listening');
});
