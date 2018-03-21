var net = require('net');

export default class socketConfig {

    constructor(socket, option = {}) {
        this.socket = socket
        if (!option.cb) {
            console.log('不存在消息处理函数，初始化失败');
            global.logger.error('不存在消息处理函数，初始化失败')
            return false
        }
        this.cb = option.cb
    }

    init(waitTime = 600) {

        let sock = this.socket
        console.log(sock);

        global.logger.debug('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort)
        console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

        this.socket.on('data', data => {
            this.cb(data, this.socket)
        });


        //设置超时时间
        sock.setTimeout(1000 * waitTime, function () {
            console.log('客户端在' + waitTime + 's内未通信，将断开连接...');
            global.logger.info('客户端在' + waitTime + 's内未通信，将断开连接...')
        });

        // 为这个socket实例添加一个"close"事件处理函数
        sock.on('close', function () {
            global.globalIndex = 0
            console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
            global.logger.info('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort)
        });

        // 为这个socket实例添加一个"end"事件处理函数
        sock.on('end', function () {
            global.globalIndex = 0
            console.log('end: ' + sock.remoteAddress + ' ' + sock.remotePort);
            global.logger.info('end: ' + sock.remoteAddress + ' ' + sock.remotePort)
        });

        // 为这个socket实例添加一个"error"事件处理函数
        sock.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
                console.log('Address in use, retrying...');
                global.logger.error('Address in use, retrying...')
                setTimeout(() => {
                    sock.close();
                    sock.listen(PORT, HOST);
                }, 1000);
            }
        });

        // 为这个socket实例添加一个"timeout"事件处理函数
        sock.on('timeout', () => {
            console.log('socket timeout');
            global.logger.info('socket timeout')
            sock.end();
        });

    }


}