'use strict';

const messagesContainer = document.getElementById('chatMessages');
const usersContainer = document.getElementById('users');
const typingUsersContainer = document.getElementById('typingUsers');
const messageInput = document.getElementById('myMessage');
const userNameInput = document.getElementById('userName');
const userNicknameInput = document.getElementById('userNickname');
const messages = [];
const user = {};

let typingUsers = [];
let currentTime = moment();
let socket;

const addMessage = (messageData) => {
    const message = {
        text: messageData.text,
        sender: messageData.sender,
        time: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
    };

    messages.push(message);
    showMessage(message);
};

const showMessage = (message) => {
    const element = document.createElement('div');
    let className = 'chat-message';

    if (message.sender === user.nickname) {
        className += ' outgoing';
    }

    element.className = 'chat-message-wrapper';
    element.innerHTML = `
        <div class="${className}">
            <div class="chat-message-info">
                <div class="chat-message-info-sender">${message.sender}</div>
                <div class="chat-message-info-time">${message.time}</div>
            </div>
            <div class="chat-message-text">${message.text}</div>
        </div>
    `;

    messagesContainer.appendChild(element);
};

const showHistory = (messagesHistory) => {
    const html = messagesHistory
        .map((message) => {
            let className = 'chat-message';

            if (message.sender === user.nickname) {
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

const showUsers = (users) => {
    const html = users
        .map((user) => {
            const timeSinceLogin = currentTime.diff(user.loginTime);

            user.status = 'offline';

            if (user.loginTime) {
                user.status = 'online';
            }

            if ( timeSinceLogin < 60000) {
                user.status = 'just appeared';
            }

            switch(user.status) {
                case 'online':
                user.label = 'online';
                break;

                case 'just appeared':
                user.label = 'appeared';
                break;

                case 'just left':
                user.label = 'left';
            }

            return `
            <div class="chat-user">
                <div class="chat-user-info">
                    <div class="chat-user-info-name">${user.name}</div>
                    <div class="chat-user-info-nickname">@${user.nickname}</div>
                </div>
                <div class="chat-user-label">
                    <span class="chat-user-label-color ${user.label}"></span>
                    <span class="chat-user-label-status">${user.status}</span>
                </div>
            </div>
        `;
        })
        .join('');

    usersContainer.innerHTML = html;
};

const addTypingUser = (nickname) => {
    if (!typingUsers.includes(nickname)) {
        typingUsers.push(nickname);
    }
    showTyping(typingUsers);
};

const showTyping = (typingUsers) => {
    const html = typingUsers
    .map((user) => {
        return `
        <div class="typing-user">
            <span class="typing-user-nickname">@${user}</span>
            <span class="typing-user-text">is typing...</span>
        </div>
    `
    })
    .join('');

    typingUsersContainer.innerHTML = html;
};

const sendMessage = () => {
    const message = {
        sender: user.nickname,
        text: messageInput.value
    };

    messageInput.value = '';

    socket.emit('message', message);
    addMessage(message);
};

messageInput.addEventListener('keydown', (event) => {
    if (event.keyCode === 13) {
        event.preventDefault();
        sendMessage();
    }

    socket.emit('typing', user.nickname);
});

const startChat = () => {
    socket = io.connect();

    socket.on('message', addMessage);
    socket.on('users', showUsers);
    socket.on('history', showHistory);
    socket.on('typing', addTypingUser);
};

const login = () => {
    const data = {
        name: userNameInput.value,
        nickname: userNicknameInput.value,
        loginTime: moment()
    };

    fetch('/login', {
        method: 'post',
        body: JSON.stringify(data),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        if (response.status === 403) {
            return;
        }

        user.name = data.name;
        user.nickname = data.nickname;

        const loginWindow = document.getElementById('loginWindow');
        const chatWrapper = document.getElementById('chatWrapper');

        loginWindow.remove();

        chatWrapper.style.display = 'flex';

        startChat();
    });
};
