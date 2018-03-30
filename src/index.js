import MsgHandle from "./message_tool/MsgHandle"
import Log4jsConfig from "./config/Log4jsConfig"
import socketConfig from "./config/socketConfig"
import PusherPool from "./message_tool/PusherPool"
import Pusher from "./message_tool/Pusher"
import {
    getWxMsgInfo,
    getMessageId,
    getSmallMsgInfo
} from "./message_tool/msg_tool"

import {
    rideHorse,
    moveAndCancel
} from "./case/WxCase"

import {
    AIController,
    Response,
    WXIO,
} from "./event/events"

var util = require('util')
var graylog2 = require("graylog2");
var graylogger = new graylog2.graylog({
    servers: [{
        'host': '118.89.166.193',
        port: 12201
    },],
    // hostname: 'server.name', // the name of this host
    // (optional, default: os.hostname())
    facility: 'Node.js', // the facility for these log messages
    // (optional, default: "Node.js")
    bufferSize: 1350 // max UDP packet size, should never exceed the
    // MTU of your system (optional, default: 1400)
})

var old = {}
var context = {}

for (var level of ['log', 'info', 'warn', 'debug']) {
    old[level] = console[level]
    console[level] = function (level, logger) {
        return function () {
            var args = Array.prototype.slice.call(arguments, 0)
            var out = util.format.apply(util, args) + "\n"
            process.stdout.write(out)
            logger[level](out, context)
        }
    }(level, graylogger)
}

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
    let responseObj = getWxMsgInfo(data)
    let requestInfo = msgHandle.getResponseMsg(responseObj, socket.socketId)
    // console.log(`registerDataEnvent ${responseObj.msgId}`)
    let response = new Response(getMessageId(responseObj.msgId), requestInfo)
    response.msgInfo = getSmallMsgInfo(responseObj)
    socket.aiController.io.feed(response)
    // console.log("数据到达：" + getMessageId(responseObj.msgId));
}

// 连接后触发
async function connection(socket) {
    // await sock.aiController.wait(8)
    socket.aiController.aIServerConnectReponse() // 连接成功

    // let moveRe = await socket.aiController.movePointRequest() // 移动

    await socket.aiController.wait(5) // 等待5s
    moveAndCancel(socket)
    // rideHorse(socket)

    // let getPointRe = await socket.aiController.getPointRequest(); //  获取当前AI位置
    // let getPlayerInfoRe = await socket.aiController.getPlayerInfoRequest(); // 得到当前玩家的血量等信息
    // let getAllPickItemRe = await socket.aiController.getAllPickItemRequest(); // 获取周围所有可拾取物品列表

    // //  target 目标ID 追着目标移动(一直到满足移动精度设定的距离后停下来)
    // let moveTargetRe = await socket.aiController.moveTargetRequest({ target: 100, nearby: 200 }); // 当前AI移动(目标)

    // let cancelMoveRe = await socket.aiController.cancelMoveRequest(); // 取消移动

    // // let itemPosRe = await socket.aiController.itemPosRequest();
    // //(配合GetAllPickItemRequest 使用, 上一条消息(GetAllPickItemRequest) 指获取到当前客户端所能刷新到所有物品的信息,但是可能在很远,无法拾取到)
    // let getPickItemRe = await socket.aiController.getPickItemRequest();

    // let pickItemRe = await socket.aiController.pickItemRequest({ itemUId: 100 }); //  物品的世界ID 周围可拾取物品UID

    // let setAttackIdRe = await socket.aiController.setAttackIdRequest(); // 搜索当前面向的其他AI 并且锁定他
    // let cancelAttackIdRe = await socket.aiController.cancelAttackIdRequest(); // 取消设置当前目标ID

    // let getAttackIdRe = await socket.aiController.getAttackIdRequest(); //获取当前目标ID

    // //  1-普通攻击(不需要学习技能书就能攻击) 2-4 -3个技能攻击(学习相应武器对应的技能书后能使用,顺序和学习的顺序一致)
    // let playerAttackRe = await socket.aiController.playerAttackRequest({ skillAttack: 1 }); // 攻击指令

    // let getBagItemRe = await socket.aiController.getBagItemRequest(); // 获取背包索引和物品信息 

    // let useBagItemRe = await socket.aiController.useBagItemRequest({
    //     bagItems: {
    //         "itemindex": 12,
    //         "itemId": 22,
    //         "num": 33
    //     }
    // }); // 使用物品

    // let getNearPlayerRe = await socket.aiController.getNearPlayerRequest(); // 获取周围其他AI

    // // 切换武器 AI->client
    // // 切换当前武器 现在游戏近战一共 3个位置 0,1,2 分别代表 空手 1号栏位 和 2号栏位
    // // 当前默认空手, 假设一号栏位有武器(拾取武器后自动根据顺序装备到1,2号栏位), 切换1号栏位武器 就直接传递1进去 . 要是再次传个1进去, 会变成收起武器,这时候变成空手
    // // 3号栏位是远程武器栏位
    // let switchWeaponRe = await socket.aiController.switchWeaponRequest({ pos: 1 });

    // //  装备武器 将背包指定格子的武器装备到指定栏位上去(1,2,3)
    // let equipWeaponRe = await socket.aiController.equipWeaponRequest({ bagIndex: 1, equipIndex: 1 })

    // let getHorseRe = await socket.aiController.getHorseRequest(); // 获取周围马位置
    // let lookAtRe = await socket.aiController.lookAtRequest({ x: 100, y: 122, z: 333 }); // 设置摄像机看向的目标位置 远程,骑马用(看向位置) 
    // //  上马( 在马附近 摄像机必须看向马(必须配合LookAtRequest),才能使用 )
    // let horseRideRe = await socket.aiController.horseRideRequest({ ride: true }); // 上马

    // let launchRe = await socket.aiController.launchRequest(); //远程用射击  (在有远程武器和弹药的情况下, 使用3切换远程, 可以调用使用射击)


    // await sock.aiController.wait(5)
    // console.log("等了5s");

    // let getAllPickItemRequest = await sock.aiController.getAllPickItemRequest()
    // console.log(getAllPickItemRequest);

    console.log(555333);


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
    connection(sock)
})

console.log('Server listening on ' + HOST + ':' + PORT);