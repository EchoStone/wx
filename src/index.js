import {
    getMessageId,
    getMessageHash,
    getWxMsgInfo,
    getSendWxMsgBuf,
    getMessageIndex
} from "./message_tool/msg_tool"
import MsgHandle from "./message_tool/MsgHandle"
import Log4jsConfig from "./config/Log4jsConfig"
import socketConfig from "./config/socketConfig"


var net = require('net');
var fs = require('fs');
var path = require('path');

const logger = (new Log4jsConfig()).getLogger()
const maxConnections = 100
const waitTime = 100
var PORT = 9602;
var HOST = '0.0.0.0';
global.globalIndex = 0;

function registerDataEnvent(data, socket) {

    setTimeout(function () {
        let requestInfo = getWxMsgInfo(data)

        if (!requestInfo.msgId) {
            logger.debug('解封包失败: ' + JSON.stringify(data))
            return false
        }
        console.log("============111111==============");
        let msgId = getMessageId(requestInfo.msgId) // MovePointRequest
        let msgHandle = new MsgHandle(__dirname + "/protobuf/bundle.json", msgId)
        console.log(msgHandle.getPayloadObject(requestInfo.dataPayload));
        global.logger.debug(msgHandle.getPayloadObject(requestInfo.dataPayload))
        console.log("============2222222==============");

        let messageIdHash = 59566240 // MovePointRequest
        // messageIdHash = 1530307726 // GetAllPickItemReponse
        msgId = getMessageId(messageIdHash)
        // msgHandle.changeMessageHandle(msgId)
        // console.log(msgHandle.getMessageHandle().fieldsArray);

        let index = getMessageIndex()
        let dataPayload = msgHandle.getDataPayload(msgId)
        console.log(dataPayload);
        console.log("=============333333============");

        // let dataPayload = {
        //     items: [{
        //         itemUId: 84,
        //         itemId: 92,
        //         X: 2002,
        //         Y: 3002
        //     }]
        // }
        // msgHandle.changeMessageHandle(msgId)
        let sendMsg = getSendWxMsgBuf({
            index: index,
            msgId: messageIdHash,
            dataPayload: msgHandle.createProtoBuf(dataPayload)
        })
        socket.write(sendMsg)
    }, 100);

}

var server = net.createServer(function (socket) {
    new socketConfig(socket, {
        waitTime,
        cb: registerDataEnvent
    }).init(waitTime)
}).listen(PORT, HOST);
server.maxConnections = maxConnections

console.log('Server listening on ' + HOST + ':' + PORT);




// server.registerDataEnvent((data) => {
//     setTimeout(function () {
//         let requestInfo = getWxMsgInfo(data)

//         if (!requestInfo.msgId) {
//             logger.debug('解封包失败: ' + JSON.stringify(data))
//             return false
//         }
//         console.log("============111111==============");
//         let msgId = getMessageId(requestInfo.msgId) // MovePointRequest
//         let msgHandle = new MsgHandle(__dirname + "/protobuf/bundle.json", msgId)
//         console.log(msgHandle.getPayloadObject(requestInfo.dataPayload));
//         global.logger.debug(msgHandle.getPayloadObject(requestInfo.dataPayload))
//         console.log("============2222222==============");

//         let messageIdHash = 59566240 // MovePointRequest
//         // messageIdHash = 1530307726 // GetAllPickItemReponse
//         msgId = getMessageId(messageIdHash)
//         // msgHandle.changeMessageHandle(msgId)
//         // console.log(msgHandle.getMessageHandle().fieldsArray);

//         let index = getMessageIndex()
//         let dataPayload = msgHandle.getDataPayload(msgId)
//         console.log(dataPayload);
//         console.log("=============333333============");

//         // let dataPayload = {
//         //     items: [{
//         //         itemUId: 84,
//         //         itemId: 92,
//         //         X: 2002,
//         //         Y: 3002
//         //     }]
//         // }
//         // msgHandle.changeMessageHandle(msgId)
//         let sendMsg = getSendWxMsgBuf({
//             index: index,
//             msgId: messageIdHash,
//             dataPayload: msgHandle.createProtoBuf(dataPayload)
//         })
//         socket.write(sendMsg)
//     }, 100);

// })
// var protobufRoot = protobuf.Root.fromJSON(require("./protobuf/bundle.json"));
// var protobufFile = path.join(__dirname, "./protobuf/bundle.json");

// Obtain a message type