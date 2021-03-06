export default class Pusher {
    constructor(io, socket, messageHandle) {
        this.io = io
        io.pusher = this
        this.socket = socket
        this.messageHandle = messageHandle
    }

    push(name, payload) {
        console.log(`Pusher.push ${name}`)
        if (Object.prototype.toString.call(payload)) {
            payload = payload[0]
        }
        let sendMsg = this.messageHandle.getSendMsg(this.socket.socketId, name, payload)
        this.messageHandle.handleToSendMsg(this.socket, sendMsg)
    }
}