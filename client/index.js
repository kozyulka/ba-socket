'use strict';

const socket = io.connect();
const messagesContainer = document.getElementById('chatMessages');
const messageInput = document.getElementById('myMessage');
const messages = [];
const outgoingMessages = [];

const sendMessage = () => {
    const messageText = messageInput.value;
    messageInput.value = '';

    socket.emit('message', messageText);
    addOutgoingMessage(messageText);
    showOutgoingMessages(messageText);
};

const addOutgoingMessage = (text) => {
    let outgoingMessage = {
        sender: 'me',
        time: Date.now(),
        text: text
    };

    outgoingMessages.push(outgoingMessage);
};

const addMessage = (text) => {
    let message = {
        sender: 'not me',
        time: Date.now(),
        text: text
    };

    messages.push(message);
};

const showOutgoingMessages = () => {

    let html = outgoingMessages
    .map((outgoingMessage) => {
            return `
            <div class="chat-message-wrapper">
                <div class="chat-message outgoing">
                    <div class="chat-message-info">
                         <div class="chat-message-info-sender">${outgoingMessage.sender}</div>
                         <div class="chat-message-info-time">${outgoingMessage.time}</div>
                    </div>
                    <div class="chat-message-text">${outgoingMessage.text}</div>
                </div>
             </div>
            `;
    })
    .join('');


    messagesContainer.innerHTML = html;
};

const showMessages = () => {

    let html = messages
    .map((message) => {
        return
        `
        <div class="chat-message-wrapper">
            <div class="chat-message">
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

socket.on('message', (messageText) => {
    console.log(messageText);
    addMessage(messageText);
    showMessages();
});

messageInput.addEventListener('keyup', (event) => {
    event.preventDefault();

    if (event.keyCode === 13) {
        sendMessage();
    }
});
