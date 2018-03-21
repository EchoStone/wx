import {
    getMessageId,
    getMessageHash,
    getWxMsgInfo,
    getSendWxMsgBuf,
    getMessageIndex,
    getOneConnectGlobalObject
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

        let index = getMessageIndex(socket.socketId)
        console.log("index ============= " + index);

        let dataPayload = msgHandle.getDataPayload(msgId)
        console.log(dataPayload);
        console.log("=============333333============");

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
// var protobufRoot = protobuf.Root.fromJSON(require("./protobuf/bundle.json"));
// var protobufFile = path.join(__dirname, "./protobuf/bundle.json");

// Obtain a message type