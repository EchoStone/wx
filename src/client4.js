// var dgram = require('dgram');
var dgram = require('net');

var protobuf = require("protobufjs");
var PORT = 9602;
var HOST = '127.0.0.1';
// var HOST = '47.91.244.187';


protobuf.load("AIMsg.proto", function (err, root) {
    if (err) {
        throw err;
    }

    var AIMsg = root.lookupType("msg.AIServerConnectRequest");
    var MovePointRequest = AIMsg
    var AIServerConnectReponse = root.lookupType("msg.AIServerConnectReponse");

    var coverRspObj = {
        PlayerId: 29322
    };

    var errMsg = MovePointRequest.verify(coverRspObj);
    var message = MovePointRequest.create(coverRspObj);
    var buffer = MovePointRequest.encode(message).finish();
    var msgIdRequest = 2785961655;
    var index = 1
    const bufIndex = Buffer.allocUnsafe(2);
    bufIndex.writeUInt16LE(index)

    const bufMsgIdRequest = Buffer.allocUnsafe(4);
    bufMsgIdRequest.writeUInt32LE(msgIdRequest)

    var msgLength = buffer.length
    const bufMsgLength = Buffer.allocUnsafe(4);
    bufMsgLength.writeUInt32LE(msgLength)

    const totalLength = bufIndex.length + bufMsgIdRequest.length + bufMsgLength.length + buffer.length;
    message = Buffer.concat([bufIndex, bufMsgIdRequest, bufMsgLength, buffer], totalLength);
    console.log("连接的时候message长度：" + message.length);

    var socket = new dgram.Socket();

    console.log("zhi:=====" + bufMsgIdRequest.readUInt32LE(0))

    // var playMsg = AIServerConnectRequest.create(playMsgObj);
    // var bufferPlay = AIServerConnectRequest.encode(playMsg).finish();

    socket.connect(PORT, HOST, function () {

        console.log('CONNECTED TO: ' + HOST + ':' + PORT);
        // 建立连接后立即向服务器发送数据，服务器将收到这些数据 
        // socket.write('I am Chuck Norris!');
        // socket.write(message);
        console.log(message);
        console.log(" connect 发送message长度：" + message.length);

        socket.write(message);


        // console.log(buffer)
        // socket.write(message2);


    });



    //  var contentBuf1 = Buffer.concat([Buffer.from([0x01]), message]);
    // //拼接结束标志
    //     contentBuf1 = Buffer.concat([contentBuf1, Buffer.from([0x0D, 0x0A])]);
    var MovePointRequest = root.lookupType("msg.MovePointRequest");

    var GetAllPickItemReponse = root.lookupType("msg.GetAllPickItemReponse");

    socket.on("data", function (msg) {

        // console.log("[UDP-CLIENT] Received message: " + HelloCoverRsp.decode(msg).reply + " from " + rinfo.address + ":" + rinfo.port);
        msg = msg.slice(10, msg.length)
        console.log(MovePointRequest.decode(msg));
        console.log(" on data 发送message长度：" + message.length);

        // socket.write(message);

        coverRspObj = {
            result: 1
        };
        var MovePointReponse = root.lookupType("msg.MovePointReponse");

        message = MovePointReponse.create(coverRspObj);
        buffer = MovePointReponse.encode(message).finish();
        msgIdRequest = 4211876921;
        index = 1
        const bufIndex2 = Buffer.allocUnsafe(2);
        bufIndex2.writeUInt16LE(index)

        const bufMsgIdRequest2 = Buffer.allocUnsafe(4);
        bufMsgIdRequest2.writeUInt32LE(msgIdRequest)

        var msgLength2 = buffer.length
        const bufMsgLength2 = Buffer.allocUnsafe(4);
        bufMsgLength2.writeUInt32LE(msgLength2)

        const totalLength2 = bufIndex2.length + bufMsgIdRequest2.length + bufMsgLength2.length + buffer.length;
        message2 = Buffer.concat([bufIndex2, bufMsgIdRequest2, bufMsgLength2, buffer], totalLength2);
        socket.write(message2);
        //udpSocket = null;
    });


    // socket.on('error', function (err) {

    //     console.log('socket err');
    //     console.log(err);
    // });
});