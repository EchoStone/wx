import MsgHandle from "./message_tool/MsgHandle"
import Log4jsConfig from "./config/Log4jsConfig"
import socketConfig from "./config/socketConfig"
import PusherPool from "./message_tool/PusherPool"
import Pusher from "./message_tool/Pusher"
import {
    getWxMsgInfo,
    getMessageId
} from "./message_tool/msg_tool"

import {
    AIController,
    Response,
    WXIO,
} from "./event/events"

var net = require('net');
var fs = require('fs');
var path = require('path');

const logger = (new Log4jsConfig()).getLogger()
const maxConnections = 100
const waitTime = 60 * 100
const protoFilePath = __dirname + '/protobuf/bundle.json'
var PORT = 9602;
var HOST = '0.0.0.0';
const msgHandle = new MsgHandle(protoFilePath)
const pusherPoolHandle = new PusherPool()

async function registerDataEnvent(data, socket) {
    // console.log(pusherPoolHandle.getAll());
    console.log(`registerDataEnvent ${data.length}`)
    let responseObj = getWxMsgInfo(data)
    let requestInfo = msgHandle.getResponseMsg(responseObj, socket.socketId)
    console.log(`registerDataEnvent ${responseObj.msgId}`)
    socket.aiController.io.feed(new Response(getMessageId(responseObj.msgId), responseObj.dataPayload))
    console.log("数据到达：" + getMessageId(responseObj.msgId));
    if (requestInfo) {
        // console.log('requestInfo');

        // console.log(requestInfo);
    }

    // await socket.aiController.wait(1)
    // await socket.aiController.movePointRequest()
    // let sendMsg = msgHandle.getSendMsg(socket.socketId, 'MovePointRequest')

    // msgHandle.handleToSendMsg(socket, sendMsg)

    // setTimeout(function () {
    //     let sendCancelMoveRequestMsg = msgHandle.getSendMsg(socket.socketId, 'CancelMoveRequest')
    //     socket.write(sendCancelMoveRequestMsg)
    // }, 10000)
}

function connection(socket) {

}

var server = net.createServer(function (socket) {

    new socketConfig(socket, {
        waitTime,
        cb: registerDataEnvent,
        pusherPoolHandle,
        msgHandle
    }).init(waitTime)
}).listen(PORT, HOST);
server.maxConnections = maxConnections

server.on('connection', async (sock) => {

    console.log(sock.socketId);

    // sock.aiController.AIServerConnectRequest.then((player) => {

    // })



    // await sock.aiController.wait(5)
    // console.log(3333);
    try {
        // let re = await sock.aiController.movePointRequest()
        sock.aiController.movePointRequest().then((res) => {
            console.log(res)
        }).catch((err) => {
            console.log(err)
        })
        // console.log("connection re :" + re);

    } catch (error) {
        console.log("connection re : error");
        console.log(error);
    }

    try {
        // await sock.aiController.wait(5)
        // console.log("等了5s");

        // let getAllPickItemRequest = await sock.aiController.getAllPickItemRequest()
        // console.log(getAllPickItemRequest);
    } catch (error) {
        console.log("getAllPickItemRequest 超时");

    }
    console.log(555333);


})

console.log('Server listening on ' + HOST + ':' + PORT);