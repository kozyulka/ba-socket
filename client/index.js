'use strict';

const socket = io.connect();
const messagesContainer = document.getElementById('chatMessages');
const messageInput = document.getElementById('myMessage');
const messages = [];

const addMessage = (text, sender) => {
    const message = {
        text,
        sender,
        time: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
    };

    messages.push(message);
};

const showMessages = () => {
    const html = messages
        .map((message) => {
            let className = 'chat-message';

            if (message.sender === 'me') {
                className += ' outgoing';
            }

            return `
                <div class="chat-message-wrapper">
                    <div class="${className}">
                        <div class="chat-message-info">
                            <div class="chat-message-info-sender">${message.sender}</div>
                            <div class="chat-message-info-time">${message.time}</div>
                        </div>
                        <div class="chat-message-text">${message.text}</div>
                    </div>
                </div>
            `;
        })
        .join('');

    messagesContainer.innerHTML = html;
};

const sendMessage = () => {
    const messageText = messageInput.value;
    messageInput.value = '';

    socket.emit('message', messageText);
    addMessage(messageText, 'me');
    showMessages(messageText);
};

socket.on('message', (messageText) => {
    console.log(messageText);
    addMessage(messageText, 'user');
    showMessages();
});

messageInput.addEventListener('keyup', (event) => {
    event.preventDefault();

    if (event.keyCode === 13) {
        sendMessage();
    }
});
