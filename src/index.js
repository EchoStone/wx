import MsgHandle from "./message_tool/MsgHandle"
import Log4jsConfig from "./config/Log4jsConfig"
import socketConfig from "./config/socketConfig"


var net = require('net');
var fs = require('fs');
var path = require('path');

const logger = (new Log4jsConfig()).getLogger()
const maxConnections = 100
const waitTime = 60 * 100
const protoFilePath = __dirname + '/protobuf/bundle.json'
var PORT = 9602;
var HOST = '0.0.0.0';

function registerDataEnvent(data, socket) {

    let msgHandle = new MsgHandle(protoFilePath)

    let requestInfo = msgHandle.getResponseMsg(data, socket.socketId)
    console.log(requestInfo);

    let sendMsg = msgHandle.getSendMsg(socket.socketId, 'MovePointRequest')

    msgHandle.handleToSendMsg(socket, sendMsg)

    // setTimeout(function () {
    //     let sendCancelMoveRequestMsg = msgHandle.getSendMsg(socket.socketId, 'CancelMoveRequest')
    //     socket.write(sendCancelMoveRequestMsg)
    // }, 10000)
}

var server = net.createServer(function (socket) {
    new socketConfig(socket, {
        waitTime,
        cb: registerDataEnvent
    }).init(waitTime)
}).listen(PORT, HOST);
server.maxConnections = maxConnections

console.log('Server listening on ' + HOST + ':' + PORT);