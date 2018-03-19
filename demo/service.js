var PORT = 9602;
var HOST = '127.0.0.1';
var net = require('net');
var protobuf = require("protobufjs");


protobuf.load("AIMsg.proto", function (err, root) {
        console.log(11111111)

    if (err)
        throw err;

    // Obtain a message type
    net.createServer(function(sock) {

      console.log(2222)

      // 我们获得一个连接 - 该连接自动关联一个socket对象
      // console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

      // 为这个socket实例添加一个"data"事件处理函数
      sock.on('data', function(data) {
        console.log(333)
        var AIMsg = root.lookupType("msg.MovePointRequest");
        var MovePointRequest = AIMsg

        var coverRspObj = {
            X: 99,
            Y: 20
        };
        var errMsg = MovePointRequest.verify(coverRspObj);
        // if (errMsg) {
        //     throw Error(errMsg);
        // }
        var message = MovePointRequest.create(coverRspObj);
        var buffer = MovePointRequest.encode(message).finish();

        var message = buffer;

        //  var contentBuf1 = Buffer.concat([Buffer.from([0x01]), message]);
        // //拼接结束标志
        //     contentBuf1 = Buffer.concat([contentBuf1, Buffer.from([0x0D, 0x0A])]);

        sock.write(message)

      });

      // 为这个socket实例添加一个"close"事件处理函数
      sock.on('close', function(data) {
        console.log('CLOSED: ' +
          sock.remoteAddress + ' ' + sock.remotePort);
      });

    }).listen(PORT, HOST);

});
console.log('Server listening on ' + HOST + ':' + PORT);








