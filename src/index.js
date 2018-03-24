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
const io = new WXIO()
const pusherPoolHandle = new PusherPool()
const msgHandle = new MsgHandle(protoFilePath)
const aiController = new AIController(io)

async function registerDataEnvent(data, socket) {
    // console.log(pusherPoolHandle.getAll());
    let responseObj = getWxMsgInfo(data)
    let requestInfo = msgHandle.getResponseMsg(responseObj, socket.socketId)
    socket.aiController.io.feed(new Response(getMessageId(responseObj.msgId), responseObj.dataPayload))

    if (requestInfo) {
        console.log(requestInfo);
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

// server.on('connection', async (socket) => {
//     pusherPoolHandle.setPool(socket.socketId, new Pusher(io, socket, msgHandle))
//     socket.aiController = aiController
//     socket.pusherPoolHandle = pusherPoolHandle
//     console.log(222);

//     // let re = await socket.aiController.movePointRequest()

//     // console.log(re);
//     // console.log("===3333==");


// })

console.log('Server listening on ' + HOST + ':' + PORT);