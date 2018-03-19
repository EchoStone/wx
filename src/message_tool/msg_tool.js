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
 * 获取索引index
 */
export function getMessageIndex() {
    global.globalIndex = global.globalIndex + 1
    return global.globalIndex
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
    let mesObj = {
        AIServerConnectRequest: 2785961655,
        AIServerConnectReponse: 1586407982,
        GetPointRequest: 702164294,
        GetPointReponse: 3512394207,
        MovePointRequest: 59566240,
        MovePointReponse: 4211876921,
        MoveTargetRequest: 2990857003,
        MoveTargetReponse: 1254365106,
        CancelMoveRequest: 1121888714,
        CancelMoveReponse: 3126748499,
        GetPlayerInfoRequest: 4016959104,
        GetPlayerInfoReponse: 401416729,
        ItemPosRequest: 660862707,
        GetAllPickItemRequest: 2746640407,
        GetAllPickItemReponse: 1530307726,
        GetPickItemRequest: 2067007416,
        GetPickItemReponse: 2209663777,
        PickItemRequest: 875318030,
        PickItemReponse: 3433858967,
        PlayerAttackRequest: 3152321684,
        PlayerAttackReponse: 1130647565,
        BagItemInfo: 4244934888,
        GetBagItemRequest: 1454155941,
        GetBagItemReponse: 2922144828,
        UseBagItemRequest: 2908652331,
        UseBagItemReponse: 1440632754,
        NearPlayerInfo: 3783402788,
        GetNearPlayerRequest: 2220825613,
        GetNearPlayerReponse: 2095042708,
        SwitchWeaponRequest: 3848697889,
        SwitchWeaponReponse: 501658808,
        EquipWeaponRequest: 1463367448,
        EquipWeaponReponse: 2948201345,
        HorseRideRequest: 1064094392,
        HorseRideReponse: 3354134049,
        NearRideInfo: 1849914018,
        GetHorseRequest: 2009770969,
        GetHorseReponse: 2404017984,
        LookAtRequest: 2719392492,
        LookAtReponse: 1519808117,
        LaunchRequest: 1592313100,
        LaunchReponse: 2791836053,
    }
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