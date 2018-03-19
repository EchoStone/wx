const log4js = require('log4js');

export default class Log4jsConfig {
    constructor(logFileName = 'protobuf') {
        if (!global.log4js || !global.logger) {
            log4js.configure({
                appenders: {
                    protobuf: {
                        type: 'dateFile',
                        filename: 'logs/' + logFileName + '-err-',
                        pattern: "-yyyy-MM-dd.log",
                        alwaysIncludePattern: true,
                        category: 'protobuf'
                    },
                    // info: {
                    //     type: 'dateFile',
                    //     filename: 'logs/' + logFileName + '-info-',
                    //     pattern: "-yyyy-MM-dd.log",
                    //     alwaysIncludePattern: true,
                    //     category: 'info'
                    // }
                },
                categories: {
                    default: {
                        appenders: ['protobuf'],
                        level: 'all'
                    }
                }
            });

            this.logger = log4js.getLogger('protobuf');
            // this.loggerInfo = log4js.getLogger('info');
            global.log4js = log4js
            global.logger = this.logger
            // global.loggerInfo = this.loggerInfo
        }
    }

    getLogger(which = '') {
        if ('info' == which) {
            return this.loggerInfo
        }
        return this.logger
    }
}
// logger.trace('Entering cheese testing');
// logger.debug('Got cheese.');
// logger.info('Cheese is Gouda.');
// logger.warn('Cheese is quite smelly.');
// logger.error('Cheese is too ripe!');
// logger.fatal('Cheese was breeding ground for listeria.');