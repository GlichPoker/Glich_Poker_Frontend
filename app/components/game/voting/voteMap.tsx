"use client";

import { useEffect, useState } from "react";
import { Modal, Select, Typography, Button, message } from "antd";
import { webSocketService } from "@/utils/websocket";

const { Text, Paragraph } = Typography;
const { Option } = Select;

interface VoteMapProps {
    isVisible: boolean;
    onClose: () => void;
    lobbyId: string;
    currentUser: { id: number; token: string };
}

const weatherOptions = ["SUNNY", "RAINY", "SNOWY", "CLOUDY", "DEFAULT"];

const weatherDescriptions: Record<string, string> = {
    SUNNY: "☀️ A desert mirage plays tricks on the mind. Once every 5 rounds, you may bluff with a fake or real card. The big blind also increases by 5% every third round.",
    RAINY: "☔️ Slippery hands lead to mistakes. Once per round, you may exchange one card from your hand.",
    SNOWY: "❄️ A blanket keeps you warm. You receive 3 hand cards instead of the usual 2.",
    CLOUDY: "☁️ Fog of war obscures the field. Two community cards stay hidden until the showdown.",
    DEFAULT: "♠️♥️ Weather-based rules are not applied. Standard poker game rules are applied. ",
};

const VoteMap: React.FC<VoteMapProps> = ({ isVisible, onClose, lobbyId, currentUser }) => {
    const [selectedWeather, setSelectedWeather] = useState<string>("");
    const [isConnected, setIsConnected] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const connect = async () => {
            try {
                await webSocketService.connect("game", lobbyId, currentUser.token, String(currentUser.id));
                setIsConnected(true);
            } catch (error) {
                console.error("WebSocket connection error in VoteMap:", error);
                messageApi.error("Failed to connect to game WebSocket.");
            }
        };

        if (isVisible && !isConnected) {
            connect();
        }
    }, [isVisible, lobbyId, currentUser]);

    const handleVote = () => {
        if (!selectedWeather) {
            messageApi.error("Please select a weather type to vote.");
            return;
        }

        const socket = webSocketService.getSocket();
        if (!isConnected || !socket || socket.readyState !== WebSocket.OPEN) {
            messageApi.error("WebSocket is not connected. Please wait...");
            return;
        }

        const payload = {
            event: "WEATHER_VOTE",
            weather: selectedWeather,
            userId: currentUser.id,
            lobbyId,
            gameID: lobbyId,
        };

        webSocketService.sendMessage(JSON.stringify(payload));
        messageApi.success(`Vote submitted for ${selectedWeather}`);
        onClose();
    };

    return (
        <>
            {contextHolder}
            <Modal
                title="Vote to Change Weather"
                open={isVisible}
                onCancel={onClose}
                footer={null}
                centered
            >
                <div className="flex flex-col gap-4">
                    <Text>Select weather type:</Text>
                    <Select
                        value={selectedWeather}
                        onChange={setSelectedWeather}
                        placeholder="Choose a weather"
                        className="w-full"
                    >
                        {weatherOptions.map((weather) => (
                            <Option key={weather} value={weather}>
                                {weather.charAt(0) + weather.slice(1).toLowerCase()}
                            </Option>
                        ))}
                    </Select>

                    {selectedWeather && (
                        <Paragraph className="mt-2 text-gray-600 italic">
                            {weatherDescriptions[selectedWeather] || weatherDescriptions.DEFAULT}
                        </Paragraph>
                    )}

                    <div className="flex justify-end gap-2 mt-6">
                        <Button onClick={onClose}>Cancel</Button>
                        <Button type="primary" onClick={handleVote} disabled={!isConnected}>
                            Submit Vote
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default VoteMap;