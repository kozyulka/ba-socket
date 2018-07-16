'use strict';

const socket = io.connect();

setTimeout(() => {
    console.log('send message');
    socket.emit('message', 'Hi, Mark!');
}, 500);

socket.on('message', (message) => {
    console.log(message);
});
