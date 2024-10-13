const express = require('express');
const WebSocket = require('ws');
const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// 메모리에 저장할 채팅 목록
let chatHistory = [];

// 클라이언트가 연결되었을 때
wss.on('connection', ws => {
    console.log('Client connected');

    // 새로운 클라이언트가 접속하면 기존 채팅 기록 전송
    ws.send(JSON.stringify({ type: 'history', data: chatHistory }));

    // 클라이언트로부터 메시지가 오면 처리
    ws.on('message', message => {
        try {
            // 받은 메시지를 JSON으로 파싱
            const parsedMessage = JSON.parse(message);
            console.log(`Received: ${parsedMessage.text}`);

            // 새로운 메시지를 저장
            chatHistory.push(parsedMessage);

            // 모든 클라이언트에 새 메시지 전달
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'message', data: parsedMessage.text }));
                }
            });
        } catch (error) {
            console.error('Invalid JSON received:', error);
        }
    });

    ws.on('close', () => console.log('Client disconnected'));
});

// 정적 파일 서비스 (HTML, JS, CSS 파일 제공)
app.use(express.static('public'));

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});