"use client";

import React, { useEffect, useState } from "react";
import { Card, Button, Spin, message, Tag, Modal, Input } from "antd";
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
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [selectedLobby, setSelectedLobby] = useState<any>(null);

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
            <Modal
                open={isPasswordModalOpen}
                title="Enter Password"
                onCancel={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordInput('');
                }}
                onOk={async () => {
                    if (!selectedLobby) return;

                    try {
                        const user = JSON.parse(localStorage.getItem('user') || '{}');

                        const response = await fetch(`${baseURL}/game/join`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${user.token}`,
                            },
                            body: JSON.stringify({
                                sessionId: selectedLobby.sessionId,
                                userId: user.id,
                                password: passwordInput,
                            }),
                        });

                        if (!response.ok) {
                            const errorText = await response.text();

                            if (errorText.includes("password does not match")) {
                                messageApi.error("Invalid password");
                            } else {
                                messageApi.error("Failed to join lobby");
                            }

                            return;
                        }

                        router.push(`/lobby/${selectedLobby.sessionId}`);
                    } catch (err) {
                        messageApi.error("Something went wrong");
                    } finally {
                        setIsPasswordModalOpen(false);
                        setPasswordInput('');
                    }
                }}
                okText="Join"
            >
                <Input.Password
                    placeholder="Enter lobby password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                />
            </Modal>
            <div className="flex flex-wrap gap-4 bg-[#181818]">
                {lobbies.map((lobby) => (
                    <Card
                        key={lobby.sessionId}
                        className="w-[300px] overflow-hidden rounded-lg bg-[#2e2e2e] text-white"
                        actions={[
                            <div key="join" className="w-full flex justify-center bg-[#181818]">
                                <Button
                                    type="primary"
                                    onClick={() => {
                                        if (!lobby.public) {
                                            setSelectedLobby(lobby);
                                            setIsPasswordModalOpen(true);
                                        } else {
                                            router.push(`/lobby/${lobby.sessionId}`);
                                        }
                                    }}
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
                                        <strong>Owner:</strong> {lobby.username ?? ""}

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