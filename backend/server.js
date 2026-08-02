require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const setupSocketHandlers = require('./src/socket');
const KeyboardSimulator = require('./src/services/keyboardSimulator');

const path = require('path');
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 키보드 시뮬레이터 생성
const keyboardSimulator = new KeyboardSimulator();

// 소켓 핸들러에 시뮬레이터 주입
setupSocketHandlers(io, keyboardSimulator);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// 종료 시 정리
process.on('SIGINT', () => {
  keyboardSimulator.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  keyboardSimulator.destroy();
  process.exit(0);
});
