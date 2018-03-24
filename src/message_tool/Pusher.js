export default class Pusher {
    constructor(io, socket, messageHandle) {
        this.io = io
        io.pusher = this
        this.socket = socket
        this.messageHandle = messageHandle
    }

    push(name, payload) {
        let sendMsg = this.messageHandle.getSendMsg(this.socket.socketId, name, payload)
        this.messageHandle.handleToSendMsg(socket, sendMsg)
    }
}