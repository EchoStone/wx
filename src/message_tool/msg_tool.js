var shortid = require('shortid');
const am = require('../data/action_map')

/**
 * 
 * @param {*} hash 
 * 获取消息id
 */
export function getMessageId(hash) {
    let mesObj = getAllMessageHash()
    let messageId = ''

    for (let p in mesObj) {
        if (mesObj[p] == hash) {
            messageId = p
        }
    }
    if (!messageId) {
        global.logger.error("msg_tool.js/getMessageId: hash值为:" + hash + "，无对应消息ID")
    }
    return messageId
}


/**
 * 
 * @param {*} messageId 
 * 获取消息的Hash值
 */
export function getMessageHash(messageId) {
    let mesObj = getAllMessageHash()
    let hash = 0

    for (let p in mesObj) {
        if (p == messageId) {
            hash = mesObj[p]
        }
    }
    if (!hash) {
        global.logger.error("msg_tool.js/getMessageHash: messageId:" + messageId + "，无对应消息Hash")
    }
    return hash
}

/**
 * 所有消息内容
 */
function getAllMessageHash() {
    let mesObj = am;
    return mesObj;
}

/**
 * 
 * @param {*} data 
 * 得到武侠的消息信息
 */
export function getWxMsgInfo(data) {
    let result = {}
    try {
        let index = data.readUInt16LE(0)
        let msgId = data.readUInt32LE(2)
        let msgLength = data.readUInt32LE(6)
        let dataPayload = data.slice(10, data.length)
        result = {
            index,
            msgId,
            msgLength,
            dataPayload
        }
    } catch (error) {
        global.logger.error("msg_tool.js/getWxMsgInfo:" + error)
    }

    if (!result.msgId || typeof (result.msgId) == 'undefined') {
        global.logger.error('msg_tool/getWxMsgInfo,解封包失败: ' + JSON.stringify(data))
    }
    return result
}

/**
 * 
 * @param {*} data 
 * 获取发送消息
 */
export function getSendWxMsgBuf(data) {
    let messageBuf = ''
    try {
        const bufIndex = Buffer.allocUnsafe(2);
        bufIndex.writeUInt16LE(data.index)
        const bufMsgIdRequest = Buffer.allocUnsafe(4);
        bufMsgIdRequest.writeUInt32LE(data.msgId)
        var msgLength = data.dataPayload.length
        const bufMsgLength = Buffer.allocUnsafe(4);
        bufMsgLength.writeUInt32LE(msgLength)

        const totalLength = bufIndex.length + bufMsgIdRequest.length + bufMsgLength.length + data.dataPayload.length;
        messageBuf = Buffer.concat([bufIndex, bufMsgIdRequest, bufMsgLength, data.dataPayload], totalLength);
    } catch (error) {
        global.logger.error("msg_tool.js/getSendWxMsgBuf:" + error)
    }
    return messageBuf
}

export function getShortId() {
    let socketId = shortid.generate();
    return socketId
}

/**
 * 获取索引index
 */
export function getMessageIndex(id) {
    setOneConnectGlobalIndexAddOne(id)
    let obj = getOneConnectGlobalObject(id)
    return obj.index
}

export function getSmallMsgInfo(responseObj) {
    return {
        index: responseObj.index,
        msgHash: responseObj.msgId,
        msgId: getMessageId(responseObj.msgId),
        msgLength: responseObj.msgLength,
    }
}


function getOneConnectGlobalObject(id) {
    if (!id || typeof (id) == 'undefined') {
        global.logger.error("msg_tool.js/getOneConnectGlobalObject: socketId 不能为空")
        return {}
    }
    let objectInfo = global[id]
    if (!objectInfo || typeof (objectInfo) == 'undefined') {
        objectInfo = {
            index: 0,
            socket_id: id,
            openBagTime: 0
        }
        global[id] = objectInfo
    }
    return objectInfo
}

function setOneConnectGlobalObject(id, key, value) {
    if (!id) {
        global.logger.error("msg_tool.js/setOneConnectGlobalObject: socketId 不能为空")
    }
    if (!key) {
        global.logger.error("msg_tool.js/setOneConnectGlobalObject: key 不能为空")
    }
    let objectInfo = global[id]
    let flag = false
    if (objectInfo && typeof (objectInfo) != 'undefined') {
        objectInfo[key] = value
        global[id] = objectInfo
        flag = true
    }
    if (!flag) {
        global.logger.error("msg_tool.js/setOneConnectGlobalObject: 设置用户全局属性失败")
    }
    return flag
}

function setOneConnectGlobalIndexAddOne(id) {
    if (!id) {
        global.logger.error("msg_tool.js/setOneConnectGlobalIndexAddOne: socketId 不能为空")
    }
    let objectInfo = global[id]
    let flag = false
    if (objectInfo && typeof (objectInfo) != 'undefined') {

        flag = setOneConnectGlobalObject(id, 'index', objectInfo['index'] + 1)
    }
    if (!flag) {
        global.logger.error("msg_tool.js/setOneConnectGlobalIndexAddOne: 索引+1 失败")
    }
    return flag
}

exports.getOneConnectGlobalObject = getOneConnectGlobalObject
exports.setOneConnectGlobalObject = setOneConnectGlobalObject
exports.setOneConnectGlobalIndexAddOne = setOneConnectGlobalIndexAddOne