var protobuf = require("protobufjs");
var config = require('config');
var shuffle = require('knuth-shuffle').knuthShuffle;
import {
    getMessageId,
    getMessageHash,
    getWxMsgInfo,
    getSendWxMsgBuf,
    getMessageIndex,
    getOneConnectGlobalObject
} from "./msg_tool"

export default class MsgHandle {

    constructor(protobufFile, messageId = '') {
        this.protobufRoot = protobuf.Root.fromJSON(require(protobufFile))
        this.messageHandle = ''
        if (messageId) {
            try {
                this.messageHandle = this.protobufRoot.lookupType("msg." + messageId)
                this.messageId = messageId
            } catch (error) {
                this.messageId = ''
                global.logger.error("MsgHandle.js/constructor:" + error)
                console.log(error)
            }
        }
    }

    getMessageHandle(messageId = '') {
        if (this.messageHandle && !messageId) {
            return this.messageHandle
        } else if (messageId) {
            this.changeMessageHandle(messageId)
            return this.messageHandle
        } else {
            console.log('没有实例化消息')
            global.logger.error("MsgHandle.js/getMessageHandle: 【MsgHandle】没有实例化")

            return false
        }
    }

    changeMessageHandle(messageId) {
        let flag = true
        try {
            this.messageHandle = this.protobufRoot.lookupType("msg." + messageId)
            this.messageId = messageId
        } catch (error) {
            this.messageId = ''
            flag = true
            global.logger.error("MsgHandle.js/changeMessageHandle:" + error)
            console.log(error)
        }
        return flag
    }

    getDataPayload(messageId, payload) {
        let returnObj = {}
        if (!messageId || typeof (messageId) == 'undefined') {
            global.logger.error("MsgHandle.js/getDataPayload: MessageId为空")
            return returnObj
        }
        this.changeMessageHandle(messageId)
        this.messageId = messageId
        try {

            let fields = this.messageHandle.fieldsArray
            let oneValue = this.getOnePayloadValue(messageId)
            fields.forEach(item => {
                if (item.repeated && oneValue[item.name] && oneValue[item.name].parent) {
                    returnObj[item.name] = [this.handleParentPayloadValue(oneValue[item.name], item.name)[item.name]]
                } else if (oneValue[item.name] && !oneValue[item.name].parent) {
                    returnObj[item.name] = oneValue[item.name]
                }
            });
            return returnObj
        } catch (error) {
            global.logger.error("MsgHandle.js/getDataPayload:" + error)
            console.log(error);
        }
        return returnObj
    }

    handleParentPayloadValue(oneValue, MsgName) {
        let returnObj = {}
        if (!oneValue.parent) {
            return returnObj
        }
        let returnObjNow = this.getOnePayloadValue(oneValue.parent, oneValue.type)
        returnObj[MsgName] = {}
        for (let p in returnObjNow) {
            if (returnObjNow.parent) {
                returnObj[MsgName] = [this.handleParentPayloadValue(returnObjNow[p], p)]
            } else {
                returnObj[MsgName][p] = returnObjNow[p]
            }
        }
        return returnObj
    }

    getOnePayloadValue(messageId, type) {
        let payloadInfo = config.get(messageId)
        if ('none' == payloadInfo.type || !payloadInfo.type || !payloadInfo.value || payloadInfo.value.length < 1) {
            return {}
        }
        let allValue = payloadInfo.value
        let oneValue = {}
        if ('one' == type) {
            oneValue = allValue[0]
        } else if ('random' == type) {
            oneValue = shuffle(allValue.slice(0))[0];
        } else if ('one' == payloadInfo.type && allValue.length >= 1) {
            oneValue = allValue[0]
        } else if ('random' == payloadInfo.type) {
            oneValue = shuffle(allValue.slice(0))[0];
        }
        return oneValue
    }

    handlePayload(payload) {
        var errMsg = this.messageHandle.verify(payload)
        if (errMsg) {
            global.logger.error("MsgHandle.js/handlePayload:" + errMsg)
            console.log(errMsg)
            return false
        }
        return true
    }

    createProtoBuf(payload) {
        if (!this.handlePayload(payload)) {
            return false;
        }
        let buffer = ''
        try {
            let messageFromObject = this.messageHandle.create(payload)
            buffer = this.messageHandle.encode(messageFromObject).finish()
        } catch (error) {
            global.logger.error("MsgHandle.js/createProtoBuf:" + error)
        }
        return buffer
    }

    getPayloadObject(buffer) {
        let object = {}
        try {
            let message = this.messageHandle.decode(buffer)
            object = this.messageHandle.toObject(message, {
                longs: String,
                enums: String,
                bytes: String,
            });
        } catch (error) {
            global.logger.error("MsgHandle.js/getPayloadObject:" + error)
        }
        return object
    }

    /**
     * 
     * @param {*} socketId 
     * @param {*} messageId 消息的id，不是hash
     * 获取发送数据包
     */
    getSendMsg(socketId, messageId, dataPayload) {
        let index = getMessageIndex(socketId)
        let messageIdHash = getMessageHash(messageId)
        if (!dataPayload) {
            dataPayload = this.getDataPayload(messageId)
        }
        let sendMsg = getSendWxMsgBuf({
            index: index,
            msgId: messageIdHash,
            dataPayload: this.createProtoBuf(dataPayload)
        })
        global.logger.info("MsgHandle.js/getSendMsg/ socketId为:" + socketId + ",消息ID为：" + messageId + ',发送的数据为：' + JSON.stringify(dataPayload))
        return sendMsg
    }

    /**
     * 
     * @param {*} data 
     * @param {*} msgHandle 
     * 获取接受的消息体
     */
    getResponseMsg(responseObj, socketId) {
        let msgId = getMessageId(responseObj.msgId)
        this.changeMessageHandle(msgId)
        responseObj = this.getPayloadObject(responseObj.dataPayload)
        global.logger.info("MsgHandle.js/getResponseMsg/ socketId为:" + socketId + ",消息ID为：" + msgId + ',接受到的数据为：' + JSON.stringify(responseObj))

        return responseObj
    }

    /**
     * 
     * @param {*} socket 
     * @param {*} msg 
     * @param {*} time  second
     * 发送消息
     */
    handleToSendMsg(socket, msg, time = 0) {
        if (time > 0) {
            setTimeout(() => {
                socket.write(msg)
            }, time * 1000)
        } else {
            socket.write(msg)
        }
    }
}