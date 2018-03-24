export default class PusherPool {
    constructor() {
        this.poll = new Map()
    }

    setPool(socketID, pusher) {
        this.poll[socketID] = pusher
    }

    getPool(socketID) {
        return this.poll[socketID]
    }
}