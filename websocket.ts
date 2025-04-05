class WebSocketService {
    private socket: WebSocket | null = null;
    private listeners: ((data: unknown) => void)[] = [];

    constructor() { }

    public connect(gameID: string) {
        this.socket = new WebSocket(`ws://localhost:8080/ws?gameID=${gameID}`);

        // Fix: Use arrow function to maintain 'this' context
        this.socket.onmessage = (event) => this.handleMessage(event);

        this.socket.onopen = () => {
            console.log("WebSocket connection opened.");
        };

        this.socket.onclose = () => {
            console.log("WebSocket connection closed.");
        };
    }

    public addListener(listener: (data: unknown) => void) {
        this.listeners.push(listener);
    }

    public removeListener(listener: (data: unknown) => void) {
        this.listeners = this.listeners.filter((l) => l !== listener);
    }

    private handleMessage(event: MessageEvent) {
        //const data = JSON.parse(event.data); //! needed later when sending json data
        this.listeners.forEach((listener) => listener(event.data));
    }

}

export const webSocketService = new WebSocketService();