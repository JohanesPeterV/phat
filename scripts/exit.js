const config = require('../values/config.json');
const fetch = require("node-fetch");

const fs = require("fs");
const path = require("path");
function handleExit(options, exitCode) {
    if (options.cleanup) {
        const dir = "./assets/202";
        fs.readdirSync(dir).forEach((file) =>
            fs.unlink(path.join(dir, file), (err) => {
                if (err) throw err;
            })
        );
    }
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

function initListeners() {
    process.stdin.resume();
    process.on("exit", handleExit.bind(null, {cleanup: true}));
    process.on("SIGINT", handleExit.bind(null, {exit: true}));
    process.on("SIGUSR1", handleExit.bind(null, {exit: true}));
    process.on("SIGUSR2", handleExit.bind(null, {exit: true}));
    process.on("uncaughtException", handleExit.bind(null, {exit: true}));
}


initListeners();
