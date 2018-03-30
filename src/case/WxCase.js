/**
 * 
 * @param {*} socket 
 * rideHorse 骑马的case
 */
export async function rideHorse(socket) {

    socket.aiController.movePointRequest() // 移动
    await socket.aiController.wait(10);

    let getHorseRe = await socket.aiController.getHorseRequest(); // 获取周围马位置
    socket.aiController.cancelMoveRequest()
    let horseInfo = getHorseRe.HorseInfo;
    if (horseInfo.ride) {
        socket.aiController.movePointRequest() // 移动
        await socket.aiController.wait(10);
        getHorseRe = await socket.aiController.getHorseRequest();
        socket.aiController.cancelMoveRequest()
    }
    if (horseInfo.ride) {
        socket.aiController.movePointRequest() // 移动
        await socket.aiController.wait(10);
        getHorseRe = await socket.aiController.getHorseRequest();
        socket.aiController.cancelMoveRequest()
    }
    if (horseInfo.ride) {
        console.log('dont can ride horse case over');
    }

    let moveObj = {
        X: horseInfo.x,
        Y: horseInfo.y,
        nearby: 10
    }
    socket.aiController.movePointRequest(moveObj) // 移动
    await socket.aiController.wait(10);

    let getPointRe = await socket.aiController.getPointRequest();
    let f = true
    while (f) {
        if (getPointRe.X + 30 < horseInfo.x || getPointRe.X + 30 > horseInfo.x) {
            socket.aiController.cancelMoveRequest()
            f = false
        } else {
            getPointRe = await socket.aiController.getPointRequest();
        }
    }

    let lookAtRe = await socket.aiController.lookAtRequest({
        x: getPointRe.X,
        y: getPointRe.Y,
        z: getPointRe.Z
    }); // 设置摄像机看向的目标位置 远程,骑马用(看向位置) 

    //  上马( 在马附近 摄像机必须看向马(必须配合LookAtRequest),才能使用 )
    let horseRideRe = await socket.aiController.horseRideRequest({
        ride: true
    }); // 上马

    if (!horseRideRe.result) {

    }
    socket.aiController.movePointRequest()
    await socket.aiController.wait(10);
    getPointRe = await socket.aiController.getPointRequest();

    let over = true
    while (over) {
        if (getPointRe.X - 20 <= 0) {
            over = false
            console.log('游戏结束,到达指定地点');
        } else {
            await socket.aiController.wait(10);
            getPointRe = await socket.aiController.getPointRequest();
        }
    }
}


export async function moveAndCancel(socket) {

    let moveRe = await socket.aiController.movePointRequest() // 移动
    pRe(moveRe, 'move')
    await socket.aiController.wait(10);

    let getHorseRe = await socket.aiController.getHorseRequest(); // 获取周围马位置

    pRe(getHorseRe, 'getHorseRe')

    p('over')
}

/**
 * 
 * @param {} re打印结果 
 */
function pRe(re, msg) {
    console.log('========这是' + msg + '的结果,Start ========');
    for (let i in re) {
        console.log('key:【' + i + '】的值：' + re[i]);
    }
    console.log('========这是' + msg + '的结果,End ========');

}

function p(d) {
    console.log(d);
}