'use strict';

class ChatManager {
    constructor() {
        this.users = [];
        this.messages = [];
    }

    isUserExisting(user) {
        for (let index = 0; index < this.users.length; index++) {
            if (this.users[index].nickname === user.nickname) {
                return true;
            }
        }

        return false;
    }

    addUser(user) {
        this.users.push({
            name: user.name,
            nickname: user.nickname,
            loginTime: user.loginTime,
            logoutTime: 0
        });
    }

    getUsers() {
        return this.users;
    }

    addMessage(message) {
        this.messages.push(message);

        if (this.messages.length > 5) {
            this.messages.shift();
        }
    }

    getMessages() {
        return this.messages;
    }
}

module.exports = ChatManager;
