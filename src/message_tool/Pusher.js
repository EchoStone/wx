export default class Pusher {
    constructor(io, socket, messageHandle) {
        this.io = io
        io.pusher = this
        // console.log("=====");
        // console.log(socket.socketId);
        // console.log("===222==");
        this.socket = socket
        this.messageHandle = messageHandle
    }

    push(name, payload) {
        if (Object.prototype.toString.call(payload)) {
            payload = payload[0]
        }
        let sendMsg = this.messageHandle.getSendMsg(this.socket.socketId, name, payload)
        this.messageHandle.handleToSendMsg(this.socket, sendMsg)
    }
}