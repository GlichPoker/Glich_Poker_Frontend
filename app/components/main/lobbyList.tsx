"use client";

import React, { useEffect, useState } from "react";
import { Card, Button, Spin, message, Tag } from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getApiDomain } from "@/utils/domain";

const baseURL = getApiDomain();
const { Meta } = Card;

const LobbyList = () => {
    const router = useRouter();
    const [lobbies, setLobbies] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [messageApi, contextHolder] = message.useMessage();

    // Fetch lobbies on mount
    useEffect(() => {
        const fetchLobbies = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${baseURL}/game/allGames`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setLobbies(response.data);
            } catch (error) {
                console.error("Failed to fetch lobbies:", error);
                setErrorMessage("Failed to load lobbies");
            } finally {
                setLoading(false);
            }
        };

        fetchLobbies();
    }, []);

    // Show error message in a safe way (React 18 + AntD v5 compliant)
    useEffect(() => {
        if (errorMessage) {
            messageApi.open({
                type: "error",
                content: errorMessage,
            });
            setErrorMessage(null);
        }
    }, [errorMessage, messageApi]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#181818]">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="w-full min-h-full bg-[#181818] p-4">
            {contextHolder}
            <div className="flex flex-wrap gap-4 bg-[#181818]">
                {lobbies.map((lobby) => (
                    <Card
                        key={lobby.sessionId}
                        className="w-[300px] overflow-hidden rounded-lg bg-[#2e2e2e] text-white"
                        actions={[
                            <div key="join" className="w-full flex justify-center bg-[#181818]">
                                <Button
                                    type="primary"
                                    onClick={() => router.push(`/lobby/${lobby.sessionId}`)}
                                >
                                    Join
                                </Button>
                            </div>,
                        ]}
                    >
                        <Meta
                            title={<span>Game Room {lobby.sessionId}</span>}
                            description={
                                <div className="text-sm text-white">
                                    <div>
                                        <div>{lobby.public ? (
                                            <Tag color="green" >Public</Tag>
                                        ) : (
                                            <Tag color="red">Private</Tag>
                                        )}</div>
                                        <strong>Owner:</strong> {lobby.owner?.username ?? ""}

                                    </div>
                                    <div>
                                        <strong>Status:</strong>{" "}
                                        {lobby.roundRunning ? "Round Running" : "Waiting for Players"}
                                    </div>
                                </div>
                            }
                        />
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default LobbyList;