"use client";

import { useState, useEffect } from "react";
import { webSocketService } from "@/utils/websocket";
import { Button, Input, App } from "antd";

export default function Chat() {
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [username, setUsername] = useState("");
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // retrieve username from localStorage
        const userDataString = localStorage.getItem("user");
        if (userDataString) {
            try {
                const userData = JSON.parse(userDataString);
                setUsername(userData.username);
            } catch (error) {
                console.error("Failed to parse user data:", error);
            }
        }

        // connect websocket
        const connectToChat = async () => {
            try {
                await webSocketService.connect("chat-room");
                setIsConnected(true);
                
                // Only send join message after successful connection
                if (username) {
                    await webSocketService.sendMessage(`${username} joined the chat.`);
                }
            } catch (error) {
                console.error("Failed to connect to chat:", error);
            }
        };
        
        connectToChat();

        const handleMessage = (message: unknown) => {
            const receivedMessage = message as string;
            const formattedMessage = receivedMessage.replace("Server received: ", ""); // remove 'server received'

            setMessages((prevMessages) => {
                // Prevent adding duplicate messages
                if (!prevMessages.includes(formattedMessage)) {
                    return [...prevMessages, formattedMessage];
                }
                return prevMessages;
            });
        };

        webSocketService.addListener(handleMessage);

        return () => {
            webSocketService.removeListener(handleMessage);
        };
    }, [username]);

    const sendMessage = async () => {
        if (input.trim()) {
            if (!username) {
                // Using App context message API in message handler
                return;
            }

            try {
                // send message to server
                await webSocketService.sendMessage(`${username}: ${input}`);
                setInput("");
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <App>
            <div className="flex flex-col h-full w-[95%] p-4 bg-[#181818]">
                {/* message container */}
                <div className="flex-1 overflow-y-auto p-2 mb-2 bg-[#181818] text-white rounded-lg space-y-2">
                    {messages.map((msg, index) => {
                        const isMe = msg.startsWith(`${username}:`);
                        const isJoinMessage = msg.includes('joined the chat');
                        const isLeftMessage = msg.includes('left the chat');

                        let messageStyle = "text-white";

                        if (isJoinMessage) {
                            messageStyle = "text-gray-500";
                        } else if (isLeftMessage) {
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

                {/* input field */}
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