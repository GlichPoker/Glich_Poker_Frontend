"use client";

import { useState, useEffect } from "react";
import { webSocketService } from "@/utils/websocket";
import { Button, Input, message as antdMessage } from "antd";

export default function Chat() {
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [username, setUsername] = useState("");

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
        webSocketService.connect("chat-room");

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

        // Send "username joined the chat." message to the server when the component mounts
        if (username) {
            webSocketService.sendMessage(`${username} joined the chat.`);
        }

        return () => {
            webSocketService.removeListener(handleMessage);
        };
    }, [username]);

    const sendMessage = () => {
        if (input.trim()) {
            if (!username) {
                antdMessage.error("User information is missing. Please log in again.");
                return;
            }

            // send message to server
            webSocketService.sendMessage(`${username}: ${input}`);
            setInput("");
        } else {
            antdMessage.warning("Please enter a message.");
        }
    };

    return (
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
                    placeholder="Enter a message"
                    className="flex-1"
                />
                <Button type="primary" onClick={sendMessage}>
                    Send
                </Button>
            </div>
        </div>
    );
}