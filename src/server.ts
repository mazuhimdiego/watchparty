import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

class App {
    private app: express.Application;
    private httpServer: http.Server;
    private io: Server;
    private videoUrl: string = '';
    private isVideoPlaying: boolean = false;

    constructor() {
        this.app = express();
        this.httpServer = http.createServer(this.app);
        this.io = new Server(this.httpServer);
        this.setupRoutes();
        this.listenServer();
        this.listenSocket();
    }

    private setupRoutes() {
        this.app.get('/', (req, res) => {
            res.sendFile(__dirname + '/index.html');
        });
    }

    private listenServer() {
        this.httpServer.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    }

    private listenSocket() {
        this.io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            // Enviar a URL do vídeo atual para um novo cliente
            if (this.videoUrl !== '') {
                socket.emit('loadVideo', this.videoUrl);
            }

            // Receber e emitir mensagens do chat
            socket.on('message', (msg) => {
                console.log('Received message:', msg);
                this.io.emit('message', msg);
            });

            // Receber e armazenar a URL do vídeo
            socket.on('videoUrl', (videoUrl: string) => {
                console.log('Received video URL:', videoUrl);
                this.videoUrl = videoUrl;
                this.io.emit('loadVideo', videoUrl);
            });

            // Controle de play/pause do vídeo
            socket.on('pauseVideo', () => {
                console.log('Received pause command');
                this.isVideoPlaying = false;
                this.io.emit('pauseVideo');
            });

            socket.on('playVideo', () => {
                console.log('Received play command');
                this.isVideoPlaying = true;
                this.io.emit('playVideo');
            });

            // Transmitir o estado atual do vídeo para um novo cliente
            if (this.isVideoPlaying) {
                socket.emit('playVideo');
            } else {
                socket.emit('pauseVideo');
            }
        });
    }
}

const app = new App();
