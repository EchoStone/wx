// var dgram = require('dgram');
var dgram = require('net');

var protobuf = require("protobufjs");
var PORT = 9602;
var HOST = '127.0.0.1';

protobuf.load("AIMsg.proto", function (err, root) {
    if (err) {
        throw err;
    }
    /**
     * 获取消息类型
     * HelloCoverReq：构造请求实例
     * HelloCoverRsp：构造响应实例
     */
    var MovePointReponse = root.lookupType("msg.MovePointReponse");
    var AIServerConnectRequest = root.lookupType("msg.AIServerConnectRequest");

    var coverReqObj = { result: 100};
    var playMsgObj = { PlayerId: 777};
    var errMsg = MovePointReponse.verify(coverReqObj);
    if (errMsg) {
        throw Error(errMsg);
    }

    playMsgErr = AIServerConnectRequest.verify(playMsgObj);
    if (errMsg) {
        throw Error(errMsg);
    }

    var message = MovePointReponse.create(coverReqObj);
    console.log(message)
    var buffer = MovePointReponse.encode(message).finish();
    var message = buffer;

    var socket = new dgram.Socket();

    var playMsg = AIServerConnectRequest.create(playMsgObj);
    var bufferPlay = AIServerConnectRequest.encode(playMsg).finish();

    socket.connect(PORT, HOST, function() {

    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    // 建立连接后立即向服务器发送数据，服务器将收到这些数据 
    // socket.write('I am Chuck Norris!');
    socket.write(bufferPlay);


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