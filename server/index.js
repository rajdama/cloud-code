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
  console.log(data);
  io.emit("terminal:data", data);
});

io.on("connection", (socket) => {
  console.log(`Socket connected`, socket.id);

  socket.on("terminal:write", (data) => {
    console.log("Term", data);
    ptyProcess.write(data);
  });
});

app.get("/files", async (req, res) => {
  const fileTree = await generateFileTree("./user");
  return res.json({ tree: fileTree });
});

server.listen(9000, () => console.log(`🐳 Docker server running on port 9000`));

async function generateFileTree(directory) {
  const tree = {};

  async function buildTree(currentDir, currentTree) {
    const files = await fs.readdir(currentDir);

    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        currentTree[file] = {};
        await buildTree(filePath, currentTree[file]);
      } else {
        currentTree[file] = null;
      }
    }
  }

  await buildTree(directory, tree);
  return tree;
}
