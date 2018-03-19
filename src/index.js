import {
    getMessageId,
    getMessageHash,
    getWxMsgInfo,
    getSendWxMsgBuf,
    getMessageIndex
} from "./message_tool/msg_tool"
import MsgHandle from "./message_tool/MsgHandle"
import Log4jsConfig from "./config/Log4jsConfig"

var net = require('net');
var fs = require('fs');
var path = require('path');
// var config = require('config');
// console.log(config.get('Customer.dbConfig'));

const logger = (new Log4jsConfig()).getLogger()

var PORT = 9602;
var HOST = '0.0.0.0';
global.globalIndex = 0;


// var protobufRoot = protobuf.Root.fromJSON(require("./protobuf/bundle.json"));
// var protobufFile = path.join(__dirname, "./protobuf/bundle.json");

// Obtain a message type
net.createServer(function (sock) {

    // 我们获得一个连接 - 该连接自动关联一个socket对象
    logger.debug('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort)
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

    sock.on('data', function (data) {
        setTimeout(function () {
            let requestInfo = getWxMsgInfo(data)
            console.log(requestInfo);

            if (!requestInfo.msgId) {
                logger.debug('解封包失败: ' + JSON.stringify(data))
                return false
            }
            console.log("==========================");
            let msgId = getMessageId(requestInfo.msgId) // MovePointRequest
            let msgHandle = new MsgHandle(__dirname + "/protobuf/bundle.json", msgId)
            console.log(msgHandle.getPayloadObject(requestInfo.dataPayload));
            global.logger.debug(msgHandle.getPayloadObject(requestInfo.dataPayload))
            console.log("==========================");

            let messageIdHash = 59566240
            msgId = getMessageId(messageIdHash) // MovePointRequest
            // msgHandle.changeMessageHandle(msgId)
            let index = getMessageIndex()
            let dataPayload = msgHandle.getDataPayload(msgId)
            // let dataPayload = {
            //     X: 2000, // 移动点X坐标
            //     Y: 1593, // 移动点Y坐标
            //     nearby: 10 // 移动精度
            // }
            let sendMsg = getSendWxMsgBuf({
                index: index,
                msgId: messageIdHash,
                dataPayload: msgHandle.createProtoBuf(dataPayload)
            })
            sock.write(sendMsg)

            // // var copy = new Buffer(jsonData);
            // data = data.slice(10, data.length)
            // // console.log(jsonData)
            // var message = '';
            // // try{

            // var requestMsg = AIServerConnectRequest.decode(data);

            // // if(typeof(requestMsg.PlayerId) != "undefined"){
            // console.log("游戏选手ID：" + requestMsg.PlayerId)

            // var AIMsg = root.lookupType("msg.MovePointRequest");
            // var MovePointRequest = AIMsg
            // var AIServerConnectReponse = root.lookupType("msg.AIServerConnectReponse");

            // var coverRspObj = {
            //     X: 100,
            //     Y: 100
            // };

            // var AIServerConnectReponseResult = {
            //     result: 0
            // }
            // var errMsgRes = MovePointRequest.verify(AIServerConnectReponseResult);


            // var errMsg = MovePointRequest.verify(coverRspObj);
            // // if (errMsg) {
            // //     throw Error(errMsg);
            // // }
            // var message = MovePointRequest.create(coverRspObj);
            // var buffer = MovePointRequest.encode(message).finish();

            // var messageConnect = MovePointRequest.create(AIServerConnectReponseResult);
            // var bufferConnect = MovePointRequest.encode(messageConnect).finish();

            // var index = test.readUInt16LE(0)
            // // var index = test.readUInt16LE(0) + 1

            // var msgIdRequest = 59566240;

            // if (index == 1) {
            //     // buffer = bufferConnect
            //     // msgIdRequest = 1586407982
            // }

            // const bufIndex = Buffer.allocUnsafe(2);
            // bufIndex.writeUInt16LE(index)

            // const bufMsgIdRequest = Buffer.allocUnsafe(4);
            // bufMsgIdRequest.writeUInt32LE(msgIdRequest)

            // console.log("zhi:=====" + bufMsgIdRequest.readUInt32LE(0))

            // var msgLength = buffer.length
            // const bufMsgLength = Buffer.allocUnsafe(4);
            // bufMsgLength.writeUInt32LE(msgLength)

            // const totalLength = bufIndex.length + bufMsgIdRequest.length + bufMsgLength.length + buffer.length;
            // message = Buffer.concat([bufIndex, bufMsgIdRequest, bufMsgLength, buffer], totalLength);

            // console.log("发送的消息为:" + message)
            // sock.write(message)

        }, 100);

    });

    // 为这个socket实例添加一个"close"事件处理函数
    sock.on('close', function () {
        global.globalIndex = 0
        console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
        global.logger.info('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort)

    });

    sock.on('error', function (e) {
        global.logger.error(e)
        console.log(e)
    });


}).listen(PORT, HOST);

console.log('Server listening on ' + HOST + ':' + PORT);


// let messageId = getMessageId(2785961655)
// messageId = 'MovePointRequest'
// let msgHandle = new MsgHandle(__dirname + "/protobuf/bundle.json", messageId)

// let messageHandle = msgHandle.getMessageHandle()
// console.log(messageHandle.fields);


/*
console.log('over');


let messageId = getMessageId(2785961655)

// var messageHandle = protobufRoot.lookupType("msg." + messageId);

let msgHandle = new MsgHandle(__dirname + "/protobuf/bundle.json", messageId)

let messageHandle = msgHandle.getMessageHandle()

var payload = {
    PlayerId: 50
};
// throw Error('err');
var errMsg = msgHandle.handlePayload(payload);

console.log(errMsg);

var buffer = msgHandle.createProtoBuf(payload)
var object = msgHandle.getPayloadObject(buffer)
console.log(object);


// let hash = getMessageHash(messageId)
// console.log(messageId);
// console.log(hash);
*/