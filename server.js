const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors()); // CORS 설정
app.use(express.json()); // JSON 요청을 처리하기 위한 설정

let messages = []; // 채팅 메시지를 저장할 배열

// 채팅 목록 반환
app.get('/messages', (req, res) => {
    res.json(messages); // 클라이언트에 채팅 목록 전송
});

// WebSocket 연결 설정
wss.on('connection', (ws) => {
    console.log('Client connected');

    // 클라이언트에서 메시지 수신
    ws.on('message', (message) => {
        const msg = JSON.parse(message); // JSON 형식으로 변환
        messages.push(msg); // 메시지 배열에 추가
        // 모든 클라이언트에게 메시지 전송
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(messages)); // 전체 채팅 목록 전송
            }
        });
    });

    // 클라이언트 연결 종료 시
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// 서버 실행
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});