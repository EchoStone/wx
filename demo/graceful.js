module.exports = function (app) {
    var cluster = require('cluster');
    var numCPUs = require('os').cpus().length;
    var workerList = new Array();
    var sigkill = false;

    if (cluster.isMaster) {
        for (var i = 0; i < numCPUs; i++) {
            var env = process.env;
            var worker = cluster.fork(env);
            workerList.push(worker);
        }

        process.on('SIGUSR2', function () {
            console.log("Received SIGUSR2 from system");
            console.log("There are " + workerList.length + " workers running");
            workerList.forEach(function (worker) {
                console.log("Sending STOP message to worker PID=" + worker.pid);
                worker.send({ cmd: "stop" });
            });
        });

        process.on('SIGINT', function () {
            sigint = true;
            process.exit();
        });

        cluster.on('death', function (worker) {
            if (sigkill) {
                logger.warn("SIGKINT received - not respawning workers");
                return;
            }
            var newWorker = cluster.fork();
            console.log('Worker ' + worker.pid + ' died and it will be re-spawned');

            removeWorkerFromListByPID(worker.pid);
            workerList.push(newWorker);
        });
    } else {
        process.on('message', function (msg) {
            if (msg.cmd && msg.cmd == 'stop') {
                console.log("Received STOP signal from master");
                app.close();
                process.exit();
            }
        });
        app.listen(3000);
    }

    function removeWorkerFromListByPID(pid) {
        var counter = -1;
        workerList.forEach(function (worker) {
            ++counter;
            if (worker.pid === pid) {
                workerList.splice(counter, 1);
            }
        });
    }
}