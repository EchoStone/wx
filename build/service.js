'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PORT = 9602;
var HOST = '127.0.0.1';
var net = require('net');
var fs = require('fs');

var protobuf = require("protobufjs");

protobuf.load("AIMsg.proto", function (err, root) {

  if (err) throw err;

  // Obtain a message type
  net.createServer(function (sock) {

    var AIServerConnectRequest = root.lookupType("msg.AIServerConnectRequest");

    // 我们获得一个连接 - 该连接自动关联一个socket对象
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

    // 为这个socket实例添加一个"data"事件处理函数
    // sock.on('connection',function(){
    //           console.log(222433);

    //   // console.log(AIServerConnectRequest.decode(data).PlayerId);
    // });

    sock.on('data', function (data) {
      // fs.writeFileSync('./message.txt',data);

      // console.log(AIServerConnectRequest.decode(data).PlayerId);

      setTimeout(function () {

        console.log('消息长度：' + data.length);
        var jsonData = (0, _stringify2.default)(data);
        jsonData = JSON.parse(jsonData);
        var test = data;
        console.log('索引：' + test.readUInt16LE(0));
        var msgId = test.readUInt32LE(2);
        console.log('消息ID：' + msgId);
        console.log('消息长度：' + test.readUInt32LE(6));

        // var copy = new Buffer(jsonData);
        data = data.slice(10, data.length);
        // console.log(jsonData)
        var message = '';
        // try{

        var requestMsg = AIServerConnectRequest.decode(data);

        // if(typeof(requestMsg.PlayerId) != "undefined"){
        console.log("游戏选手ID：" + requestMsg.PlayerId);

        var AIMsg = root.lookupType("msg.MovePointRequest");
        var MovePointRequest = AIMsg;
        var AIServerConnectReponse = root.lookupType("msg.AIServerConnectReponse");

        var coverRspObj = {
          X: 100,
          Y: 100
        };

        var AIServerConnectReponseResult = {
          result: 0
        };
        var errMsgRes = MovePointRequest.verify(AIServerConnectReponseResult);

        var errMsg = MovePointRequest.verify(coverRspObj);
        // if (errMsg) {
        //     throw Error(errMsg);
        // }
        var message = MovePointRequest.create(coverRspObj);
        var buffer = MovePointRequest.encode(message).finish();

        var messageConnect = MovePointRequest.create(AIServerConnectReponseResult);
        var bufferConnect = MovePointRequest.encode(messageConnect).finish();

        var index = test.readUInt16LE(0);
        // var index = test.readUInt16LE(0) + 1

        var msgIdRequest = 59566240;

        if (index == 1) {
          // buffer = bufferConnect
          // msgIdRequest = 1586407982
        }

        var bufIndex = Buffer.allocUnsafe(2);
        bufIndex.writeUInt16LE(index);

        var bufMsgIdRequest = Buffer.allocUnsafe(4);
        bufMsgIdRequest.writeUInt32LE(msgIdRequest);

        console.log("zhi:=====" + bufMsgIdRequest.readUInt32LE(0));

        var msgLength = buffer.length;
        var bufMsgLength = Buffer.allocUnsafe(4);
        bufMsgLength.writeUInt32LE(msgLength);

        var totalLength = bufIndex.length + bufMsgIdRequest.length + bufMsgLength.length + buffer.length;
        message = Buffer.concat([bufIndex, bufMsgIdRequest, bufMsgLength, buffer], totalLength);
        // message = Buffer.concat([buffer,bufMsgLength,bufMsgIdRequest,bufIndex], totalLength);
        // }

        // }catch(e){
        //   message = 'json error'
        // }


        //  var contentBuf1 = Buffer.concat([Buffer.from([0x01]), message]);
        // //拼接结束标志
        //     contentBuf1 = Buffer.concat([contentBuf1, Buffer.from([0x0D, 0x0A])]);
        console.log("发送的消息为:" + message);
        sock.write(message);
      }, 10000);
    });

    // 为这个socket实例添加一个"close"事件处理函数
    sock.on('close', function () {
      console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });

    sock.on('error', function (e) {
      console.log('error');
    });
  }).listen(PORT, HOST);
});
console.log('Server listening on ' + HOST + ':' + PORT);
//# sourceMappingURL=service.js.map