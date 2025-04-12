"use client";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useState, useEffect } from "react";
import { webSocketService } from "@/utils/websocket";
import { Button, Input, App, message as AntdMessage } from "antd";

export default function Chat() {
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [username, setUsername] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const { value: token } = useLocalStorage<string>("token", "");

    useEffect(() => {
        const userDataString = localStorage.getItem("user");
        let userFromStorage = "";

        if (userDataString) {
            try {
                const userData = JSON.parse(userDataString);
                setUsername(userData.username);
                userFromStorage = userData.username;
            } catch (error) {
                console.error("Failed to parse user data:", error);
            }
        }

        if (!token || !userFromStorage) return;

        const connectToChat = async () => {
            try {
                await webSocketService.connect("chat", "global_chat", token, userFromStorage);
                setIsConnected(true);

                await webSocketService.sendMessage(`${userFromStorage} joined the chat.`);
            } catch (error) {
                console.error("Failed to connect to chat:", error);
            }
        };

        connectToChat();

        const handleMessage = (message: unknown) => {
            let parsed = "";

            if (typeof message === "string") {
                parsed = message.replace("Server received: ", "");
            } else if (typeof message === "object") {
                parsed = JSON.stringify(message); // fallback for JSON
            }

            if (parsed && !messages.includes(parsed)) {
                setMessages((prev) => [...prev, parsed]);
            }
        };

        webSocketService.addListener(handleMessage);

        return () => {
            webSocketService.removeListener(handleMessage);
        };
    }, [token]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        if (!username) {
            AntdMessage.warning("No username found.");
            return;
        }

        try {
            await webSocketService.sendMessage(`${username}: ${input}`);
            setInput("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    return (
        <App>
            <div className="flex flex-col h-full w-[95%] p-4 bg-[#181818]">
                <div className="flex-1 overflow-y-auto p-2 mb-2 bg-[#181818] text-white rounded-lg space-y-2">
                    {messages.map((msg, index) => {
                        const isMe = msg.startsWith(`${username}:`);
                        const isJoinMessage = msg.includes("joined the chat");
                        const isLeftMessage = msg.includes("left the chat");

                        let messageStyle = "text-white";

                        if (isJoinMessage || isLeftMessage) {
                            messageStyle = "text-gray-500";
                        } else if (isMe) {
                            messageStyle = "text-red-400 !ml-5 text-left";
                        }

                        return (
                            <div
                                key={index}
                                className={`p-2 rounded-lg ${messageStyle} !ml-5 text-left`}
                            >
                                {msg}
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-2 bg-[#181818]">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter a message"
                        className="flex-1"
                    />
                    <Button type="primary" onClick={sendMessage} disabled={!isConnected}>
                        Send
                    </Button>
                </div>
            </div>
        </App>
    );
}