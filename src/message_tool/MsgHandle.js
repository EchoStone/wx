var protobuf = require("protobufjs");
var config = require('config');
var shuffle = require('knuth-shuffle').knuthShuffle;

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
        if (!messageId) {
            global.logger.error("MsgHandle.js/getDataPayload: MessageId为空")
            return returnObj
        }
        this.changeMessageHandle(messageId)
        this.messageId = messageId
        try {
            let payloadInfo = config.get(messageId)
            if (!payloadInfo.type || !payloadInfo.value || payloadInfo.value.length < 1) {
                return returnObj
            }
            let allValue = payloadInfo.value
            let oneValue = {}
            if ('one' == payloadInfo.type && allValue.length >= 1) {
                oneValue = allValue[0]
            } else if ('random' == payloadInfo.type) {
                oneValue = shuffle(allValue.slice(0))[0];
            }
            let fields = this.messageHandle.fieldsArray
            fields.forEach(item => {
                if (oneValue[item.name]) {
                    returnObj[item.name] = oneValue[item.name]
                }
            });

        } catch (error) {
            global.logger.error("MsgHandle.js/getDataPayload:" + error)
            console.log(error);
        }
        return returnObj
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


}