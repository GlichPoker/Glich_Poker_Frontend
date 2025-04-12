import { getApiDomain } from "@/utils/domain";

class WebSocketService {
    private socket: WebSocket | null = null;
    private listeners: ((data: unknown) => void)[] = [];
    private messageQueue: string[] = [];
    private connectionPromise: Promise<void> | null = null;
    private isConnecting: boolean = false;
    private baseURL: string;

    constructor() {
        this.baseURL = getApiDomain();
    }

    public connect(service: string, gameID: string, token: string, userID: string = "") {
        // Don't create multiple connections if one is already in progress
        if (service !== "chat" && service !== "game") {
            console.error("Invalid service type. Only 'chat' and 'game' are supported.");
            return;
        }

        if (this.isConnecting) {
            return this.connectionPromise;
        }
        
        this.isConnecting = true;
        
        this.connectionPromise = new Promise<void>((resolve) => {
            if (userID === "") {
                this.socket = new WebSocket(`${this.baseURL}/ws/${service}?gameID=${gameID}&token=${token}`);
            }else {
                this.socket = new WebSocket(`${this.baseURL}/ws/${service}?gameID=${gameID}&token=${token}&userID=${userID}`);
            }
            

            this.socket.onmessage = (event) => this.handleMessage(event);

            this.socket.onopen = () => {
                console.log("WebSocket connection opened.");
                this.isConnecting = false;
                
                // Only process the queue when we're sure the connection is established
                setTimeout(() => {
                    this.processQueue();
                }, 100);
                
                resolve();
            };

            this.socket.onclose = () => {
                console.log("WebSocket connection closed.");
                this.isConnecting = false;
                this.socket = null;
            };
            
            this.socket.onerror = (error) => {
                console.error("WebSocket error:", error);
                this.isConnecting = false;
            };
        });
        
        return this.connectionPromise;
    }
    
    private processQueue() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN && this.messageQueue.length > 0) {
            console.log(`Processing ${this.messageQueue.length} queued messages`);
            
            const queueCopy = [...this.messageQueue];
            this.messageQueue = [];
            
            queueCopy.forEach((message) => {
                try {
                    this.socket?.send(message);
                } catch (error) {
                    console.error("Error sending queued message:", error);
                    // Re-queue the message
                    this.messageQueue.push(message);
                }
            });
        }
    }

    public async sendMessage(message: string) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            try {
                this.socket.send(message);
            } catch (error) {
                console.error("Error sending message:", error);
                this.messageQueue.push(message);
            }
        } else {
            console.log("WebSocket is not connected. Queueing message.");
            this.messageQueue.push(message);
        }
    }

    public async sendLogoutMessage(username: string) {
        const message = `${username} left the chat.`;
        await this.sendMessage(message);
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
