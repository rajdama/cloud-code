const http = require("http");
const express = require("express");
const fs = require("fs/promises");
const { Server: SocketServer } = require("socket.io");
const path = require("path");
const cors = require("cors");

const pty = require("node-pty");
const ptyProcess = pty.spawn("powershell.exe", [], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  cwd: path.join(process.cwd(), "user"),
  env: process.env,
});

const app = express();
const server = http.createServer(app);
const io = new SocketServer({
  cors: "*",
});

app.use(cors());

io.attach(server);

ptyProcess.onData((data) => {
  io.emit("terminal:data", data);
});

io.on("connection", (socket) => {
  console.log(`Socket connected`, socket.id);

  socket.on("terminal:write", (data) => {
    console.log("Term", data);
    ptyProcess.write(data);
  });
});

server.listen(9000, () => console.log(`🐳 Docker server running on port 9000`));
