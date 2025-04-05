class WebSocketService {
    private socket: WebSocket | null = null;
    private listeners: ((data: unknown) => void)[] = [];
    private messageQueue: string[] = [];  // 메시지 대기열

    constructor() { }

    public connect(gameID: string) {
        this.socket = new WebSocket(`ws://localhost:8080/ws?gameID=${gameID}`);

        this.socket.onmessage = (event) => this.handleMessage(event);

        this.socket.onopen = () => {
            console.log("WebSocket connection opened.");
            // send message in the queue
            this.messageQueue.forEach((message) => this.socket?.send(message));
            this.messageQueue = [];
        };

        this.socket.onclose = () => {
            console.log("WebSocket connection closed.");
        };
    }

    public sendMessage(message: string) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.error("WebSocket is not connected. Queueing message.");
            this.messageQueue.push(message); // before connection, add message to the queue
        }
    }

    public sendLogoutMessage(username: string) {
        const message = `${username} left the chat.`;
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.error("WebSocket is not connected.");
            this.messageQueue.push(message);
        }
    }

    public addListener(listener: (data: unknown) => void) {
        this.listeners.push(listener);
    }

    public removeListener(listener: (data: unknown) => void) {
        this.listeners = this.listeners.filter((l) => l !== listener);
    }

    private handleMessage(event: MessageEvent) {
        this.listeners.forEach((listener) => listener(event.data));
    }
}

export const webSocketService = new WebSocketService();