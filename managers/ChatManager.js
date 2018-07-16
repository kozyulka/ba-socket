'use strict';

class ChatManager {
    constructor() {
        this.users = [];
        // this.messages = [];
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
            loginTime: Date.now(),
            logoutTime: 0
        });
    }

    // addMessage(message) {
    //     this.messages.push({
    //         sender: message.sender,
    //         time: Date.now(),
    //         text: message.text
    //     });
    //     console.log(this.messages);
    // }
}

module.exports = ChatManager;
