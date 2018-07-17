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
let socket;

const scrollToBottom = (div) => {
    div.scrollTop = div.scrollHeight - div.clientHeight;
}

const addMessage = (messageData) => {
    const message = {
        text: messageData.text,
        sender: messageData.sender,
        time: moment(messageData.time).format("ddd, MM/D/YY, HH:mm:ss"),
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
                <div class="chat-message-info-sender">@${message.sender}</div>
                <div class="chat-message-info-time">${message.time}</div>
            </div>
            <div class="chat-message-text">${message.text}</div>
        </div>
    `;

    messagesContainer.appendChild(element);

    scrollToBottom(messagesContainer);
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
                            <div class="chat-message-info-sender">@${message.sender}</div>
                            <div class="chat-message-info-time">${moment(message.time).format("ddd, MM/D/YY, HH:mm:ss")}</div>
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
    const currentTime = moment();
    const html = users
        .map((user) => {
            if (user.logoutTime) {
                const timeSinceLogout= currentTime.diff(moment(user.logoutTime));

                if (timeSinceLogout < 60000) {
                    user.status = 'just left';
                    user.label = 'left';
                } else {
                    user.status = 'offline';
                    user.label = 'offline';
                }
            } else if (user.loginTime) {
                const timeSinceLogin = currentTime.diff(moment(user.loginTime));

                if ( timeSinceLogin < 60000) {
                    user.status = 'just appeared';
                    user.label = 'appeared';
                } else {
                    user.status = 'online';
                    user.label = 'online';
                }
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

    scrollToBottom(usersContainer);
};

const addTypingUser = (nickname) => {
    if (!typingUsers.includes(nickname)) {
        typingUsers.push(nickname);
    }

    showTyping();
};

 const removeTypingUser = (nickname) => {
    const index = typingUsers.indexOf(nickname);

    if (index !== -1) {
        typingUsers.splice(index, 1);
    }

    showTyping();
 };

const showTyping = () => {
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
        text: messageInput.value,
        time: Date.now()
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
    socket = io.connect('', {
        query: `nickname=${user.nickname}`,
    });

    socket.on('message',(message) => {
        addMessage(message);
        removeTypingUser(message.sender);
    });
    socket.on('users', showUsers);
    socket.on('history', showHistory);
    socket.on('typing', addTypingUser);
};

const login = () => {
    const data = {
        name: userNameInput.value,
        nickname: userNicknameInput.value,
        loginTime: Date.now(),
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
