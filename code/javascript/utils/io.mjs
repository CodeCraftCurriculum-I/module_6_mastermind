import * as readline from "node:readline"

const keyStatus = {
    "space": false,
    "escape": false,
    "q": false,
    "up":false,
    "down":false,
    "left":false,
    "right":false,
    "d":false,
}

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
}

process.stdin.on("keypress", (str, key) => {
    if (keyStatus.hasOwnProperty(key.name)) {
        keyStatus[key.name] = true;
    }
});

export {keyStatus}