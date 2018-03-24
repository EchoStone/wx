"use strict"

const am = require('../data/action_map')

String.prototype.initialUpper = function () {
    return this[0].toLocaleUpperCase() + this.slice(1)
}

String.prototype.initialLower = function () {
    return this[0].toLocaleLowerCase() + this.slice(1)
}

class Action {
    constructor(name, callback) {
        this._name = name
        this.callback = callback
        this.payload = Array.prototype.slice.call(arguments, 2)
    }

    /**
     * 当服务器的消息到达的时候触发
     */
    delivery(response) {
        // console.log("Action.delivery")
        // console.log(response)
        this.callback(response)
    }

    get name() {
        return this._name
    }

    set name(value) {
        this._name = value
    }
}

class Response {
    /**
     * 
     * @param {string} name 
     * @param {Object} payload 
     */
    constructor(name, payload) {
        this.name = name

        Object.keys(payload).forEach((key) => {
            this[key] = payload[key]
        })
    }

    equal(action) {

        return this._name.initialLower() == action.name
    }

    get name() {
        return this._name
    }

    set name(value) {
        this._name = value
    }
}

class WXIO {
    constructor() {
        this.actions = []
    }

    /**
     * 
     * @param {Response} response 
     */
    feed(response) {
        // console.log('WXIO.feed')
        var actions = [];
        for (var action of this.actions) {
            // console.log(action.name)
            // console.log(action.payload)
            if (response.equal(action)) {
                action.delivery(response)
            } else {
                actions.push(action)
            }
        }
        // console.log("=====" + actions);

        this.actions = actions
    }

    executeAction(action) {
        this.actions.push(action)
        this._pusher.push(action.name.initialUpper(), action.payload)
    }

    /**
     * @var Pusher
     */
    get pusher() {
        return this._pusher
    }

    /**
     * let io = WXIO()
     * io.pusher = pusher
     * 
     * @param Pusher pusher
     * @return void
     */
    set pusher(pusher) {
        this._pusher = pusher
    }
}

class AIController {

    constructor(io) {
        this.io = io

        this.actions = []
        for (var actionName of Object.keys(am)) {
            this.actions.push(actionName.initialLower())
        }

        for (var key of this.actions) {
            this[key] = function (key) {
                return function () {

                    return new Promise((resolve, reject) => {

                        let args = [
                            key,
                            (response) => {
                                resolve(response)
                            }
                        ]
                            .concat(Array.prototype.slice.call(arguments, 0))

                        let action = Reflect.construct(
                            Action,
                            args
                        )

                        this.io.executeAction(action)
                    })
                }
            }(key)
        }
    }

    /**
     * 等待若干秒
     * 
     * controller.move(1, 1).wait(5)
     * 
     * @param int seconds
     */
    async wait(seconds) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, seconds * 1000)
        })
    }
}

class Pusher {
    push(name, payload) {

    }
}

module.exports = {
    AIController: AIController,
    WXIO: WXIO,
    Response: Response
}