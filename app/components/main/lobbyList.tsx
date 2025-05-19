"use client";

import React, { useEffect, useState } from "react";
import { Card, Button, Spin, message, Tag, Modal, Input } from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getApiDomain } from "@/utils/domain";
import { ReloadOutlined } from "@ant-design/icons";

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

    // Fetch lobbies function
    const fetchLobbies = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${baseURL}/game/allGames`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setLobbies(response.data);
            console.log(response.data)
        } catch (error) {
            console.error("Failed to fetch lobbies:", error);
            setErrorMessage("Failed to load lobbies");
        } finally {
            setLoading(false);
        }
    };

    const disabledStyle: React.CSSProperties = {
        backgroundColor: '#4d4d4d',
        color: '#ffffff',
        borderColor: '#4d4d4d',
        cursor: 'not-allowed',
        width: '120px',
    };

    const enabledStyle: React.CSSProperties = {
        backgroundColor: '#9f0712',
        color: '#ffffff',
        borderColor: '#9f0712',
        cursor: 'pointer',
        width: '120px',
    };

    // Fetch lobbies on mount
    useEffect(() => {
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
            <div className="flex flex-col justify-center items-center min-h-[300px] bg-[#181818]">
                <Spin size="large" />
                <p className="mt-3 text-white">Loading lobbies...</p>
            </div>
        );
    }

    return (
        <div className="w-full min-h-full bg-[#181818] p-4">
            {contextHolder}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Available Lobbies</h2>
                <Button
                    type="text"
                    icon={<ReloadOutlined className="text-white" />}
                    onClick={fetchLobbies}
                    className="text-white hover:text-white"
                    style={{ color: 'white' }}
                    title="Refresh"
                />
            </div>
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

                        try {
                            const updateUserResponse = await fetch(`${baseURL}/users/${user.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${user.token}`,
                                },
                                body: JSON.stringify({
                                    userLobbyStatus: 'IN_LOBBY',
                                    currentLobbyId: selectedLobby.sessionId,
                                }),
                            });
                            if (!updateUserResponse.ok) {
                                console.error("Failed to update user lobby status after joining lobby:", await updateUserResponse.text());
                            } else {
                                console.log("User lobby status updated to IN_LOBBY for lobby:", selectedLobby.sessionId);
                            }
                        } catch (statusUpdateError) {
                            console.error("Error updating user lobby status:", statusUpdateError);
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
                <p style={{ marginTop: '8px', fontSize: '12px', color: 'gray' }}>
                    Note: If you were invited or have joined this lobby before, you might not need to enter the password.
                </p>
            </Modal>
            {lobbies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 bg-[#2e2e2e] rounded-lg text-white">
                    <p className="text-lg mb-2">No lobbies are currently available</p>
                    <p className="text-sm text-gray-400 mb-4">Try refreshing or create a new lobby</p>
                    <Button
                        type="primary"
                        onClick={() => router.push('/main/create-lobby')}
                    >
                        Create New Lobby
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-[#181818] overflow-y-auto max-h-[calc(100vh-150px)]">
                    {lobbies.map((lobby) => (

                        <Card
                            key={lobby.sessionId}
                            className="w-full overflow-hidden rounded-lg bg-[#2e2e2e] text-white shadow-md"
                            styles={{ body: { padding: '14px' } }}
                            actions={[
                                <div key="join" className="w-full flex justify-center bg-[#181818]">
                                    <Button
                                        type="primary"
                                        size="middle"
                                        disabled={lobby.roundRunning}
                                        style={lobby.roundRunning ? disabledStyle : enabledStyle}
                                        onClick={() => {
                                            if (!lobby.public) {
                                                setSelectedLobby(lobby);
                                                setIsPasswordModalOpen(true);
                                            } else {
                                                const joinPublicLobby = async () => {
                                                    try {
                                                        const user = JSON.parse(localStorage.getItem('user') || '{}');
                                                        const updateUserResponse = await fetch(`${baseURL}/users/${user.id}`, {
                                                            method: 'PUT',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                Authorization: `Bearer ${user.token}`,
                                                            },
                                                            body: JSON.stringify({
                                                                userLobbyStatus: 'IN_LOBBY',
                                                                currentLobbyId: lobby.sessionId,
                                                            }),
                                                        });
                                                        if (!updateUserResponse.ok) {
                                                            console.error("Failed to update user lobby status for public lobby:", await updateUserResponse.text());
                                                        } else {
                                                            console.log("User lobby status updated to IN_LOBBY for public lobby:", lobby.sessionId);
                                                        }
                                                        router.push(`/lobby/${lobby.sessionId}`);
                                                    } catch (error) {
                                                        console.error("Error joining public lobby or updating status:", error);
                                                        messageApi.error("Failed to join public lobby.");
                                                    }
                                                };
                                                joinPublicLobby();
                                            }
                                        }}
                                    >
                                        Join
                                    </Button>
                                </div>,
                            ]}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-base">Room {lobby.sessionId}</span>
                                {lobby.public ? (
                                    <Tag color="green" className="text-xs px-2 py-0.5">Public</Tag>
                                ) : (
                                    <Tag color="red" className="text-xs px-2 py-0.5">Private</Tag>
                                )}
                            </div>
                            <div className="text-sm text-gray-300 flex flex-col space-y-2">
                                <div className="flex justify-between">
                                    <span>Owner:</span>
                                    <span className="font-medium">{lobby.username ?? ""}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span className={`font-medium ${lobby.roundRunning ? 'text-yellow-400' : 'text-green-400'}`}>
                                        {lobby.roundRunning ? "Round Running" : "Waiting for Players"}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LobbyList;