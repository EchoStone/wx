'use strict';

// var dgram = require('dgram');
var dgram = require('net');

var protobuf = require("protobufjs");
var PORT = 9602;
var HOST = '127.0.0.1';

protobuf.load("AIMsg.proto", function (err, root) {
    if (err) {
        throw err;
    }

    var AIMsg = root.lookupType("msg.AIServerConnectRequest");
    var MovePointRequest = AIMsg;
    var AIServerConnectReponse = root.lookupType("msg.AIServerConnectReponse");

    var coverRspObj = {
        PlayerId: 2931
    };

    var errMsg = MovePointRequest.verify(coverRspObj);
    var message = MovePointRequest.create(coverRspObj);
    var buffer = MovePointRequest.encode(message).finish();
    var msgIdRequest = 2785961655;
    var index = 1;
    var bufIndex = Buffer.allocUnsafe(2);
    bufIndex.writeUInt16LE(index);

    var bufMsgIdRequest = Buffer.allocUnsafe(4);
    bufMsgIdRequest.writeUInt32LE(msgIdRequest);

    var msgLength = buffer.length;
    var bufMsgLength = Buffer.allocUnsafe(4);
    bufMsgLength.writeUInt32LE(msgLength);

    var totalLength = bufIndex.length + bufMsgIdRequest.length + bufMsgLength.length + buffer.length;
    message = Buffer.concat([bufIndex, bufMsgIdRequest, bufMsgLength, buffer], totalLength);
    var socket = new dgram.Socket();

    console.log("zhi:=====" + bufMsgIdRequest.readUInt32LE(0));

    // var playMsg = AIServerConnectRequest.create(playMsgObj);
    // var bufferPlay = AIServerConnectRequest.encode(playMsg).finish();

    socket.connect(PORT, HOST, function () {

        console.log('CONNECTED TO: ' + HOST + ':' + PORT);
        // 建立连接后立即向服务器发送数据，服务器将收到这些数据 
        // socket.write('I am Chuck Norris!');
        // socket.write(message);
        console.log(buffer);
        socket.write(message);
    });

    //  var contentBuf1 = Buffer.concat([Buffer.from([0x01]), message]);
    // //拼接结束标志
    //     contentBuf1 = Buffer.concat([contentBuf1, Buffer.from([0x0D, 0x0A])]);
    var MovePointRequest = root.lookupType("msg.MovePointRequest");

    socket.on("data", function (msg) {
        // console.log("[UDP-CLIENT] Received message: " + HelloCoverRsp.decode(msg).reply + " from " + rinfo.address + ":" + rinfo.port);
        console.log(MovePointRequest.decode(msg).X);

        //udpSocket = null;
    });

    // socket.on('error', function (err) {

    //     console.log('socket err');
    //     console.log(err);
    // });
});
//# sourceMappingURL=client4.js.map