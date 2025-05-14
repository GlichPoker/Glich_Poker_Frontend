"use client";

import { useEffect, useState } from "react";
import { Button, message } from "antd";
import { webSocketService } from "@/utils/websocket";

interface StartVoteProps {
    lobbyId: string;
    currentUser: { id: number; username: string; token: string };
}

const StartVoteButton: React.FC<StartVoteProps> = ({ lobbyId, currentUser }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const connect = async () => {
            if (!currentUser || !currentUser.token) return;
            try {
                await webSocketService.connect("game", lobbyId, currentUser.token, String(currentUser.id));
                setIsConnected(true);
            } catch (error) {
                console.error("WebSocket connection error in StartVote:", error);
                messageApi.error("Failed to connect to game WebSocket.");
            }
        };

        connect();
    }, [lobbyId, currentUser]);

    const handleStartVote = () => {
        if (!isConnected) {
            messageApi.error("WebSocket is not connected. Please wait...");
            return;
        }

        const payload = {
            event: "START_WEATHER_VOTE",
            gameID: lobbyId,
            userID: currentUser.id,
        };

        webSocketService.sendMessage(JSON.stringify(payload));
        messageApi.success("Weather vote started.");
    };

    return (
        <>
            {contextHolder}
            <Button
                type="default"
                className="!mt-5"
                onClick={handleStartVote}
                disabled={!isConnected}
            >
                Vote to Change Map
            </Button>
        </>
    );
};

export default StartVoteButton;