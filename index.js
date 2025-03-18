const express = require('express');
const http = require('http');
const fs = require("fs");
const socketIo = require("socket.io");
const cors = require("cors");


const app = express();
app.use(cors());
const logFile = "logs.txt";


const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

const PORT = 5000 || process.env.PORT;


function readLast10Lines(filePath, numofLines = 10) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                reject(err);
            }
            const lines = data.trim().split("\n");
            const last10Lines = lines.slice(-numofLines).join("\n");
            resolve(last10Lines);
        })

    })

}

fs.watchFile(logFile, async() => {
    console.log("log file updated....");
    const last10Lines = await readLast10Lines(logFile);
    io.emit('log_update', last10Lines);
})


// for client-side...
io.on("connection", async(socket) => {
    console.log("connected to socket...");

    // first time load...
    const last10Lines = await readLast10Lines(logFile)
    socket.emit('log_update', last10Lines);

    socket.on('disconnect',()=>{
        console.log("socket disconnected...");
    })
})

server.listen(PORT, async() => {
    console.log(`Server is running on port ${PORT}`);
})

