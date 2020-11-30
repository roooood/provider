const { Room } = require("colyseus");

class State {
    constructor() {
        this.started = false;
    }
}

class ServerDemo extends Room {
    maxClients = 100;
    onCreate(options) {
        this.setState(new State());

        this.onMessage("*", (client, type, message) => {
            this.receive(client, type, message);
        });
    }

    onAuth(client, options, req) {
        return true;
    }

    onJoin(client, options, auth) {
        console.log("ChatRoom created!", options);
        this.state.custom = client.sessionId;
        client.send("status", "Welcome!");
        //this.setMetadata({ user: +1 });
    }

    receive(client, type, message) {
        console.log("message:", message);
        switch (type) {
            case 'move':
                console.log("send message to user");
                client.send('hi', { user: 1 })
                break;
        }
    }
    async onLeave(client, consented) {
        console.log(client.sessionId, "left", { consented });
        this.broadcast("messages", `${client.sessionId} left.`);
        try {
            if (consented) {
                throw new Error("left_manually");
            }
            await this.allowReconnection(client, 60);
            console.log("Reconnected!");
            client.send("status", "Welcome back!");

        } catch (e) {
            console.log(e);
        }
    }
    onDispose() {
        console.log("Dispose ChatRoom");
        // return new Promise((resolve, reject) => {
        //     doDatabaseOperation((err, data) => {
        //         if (err) {
        //             reject(err);
        //         } else {
        //             resolve(data);
        //         }
        //     });
        // });
    }
}


module.exports = ServerDemo;