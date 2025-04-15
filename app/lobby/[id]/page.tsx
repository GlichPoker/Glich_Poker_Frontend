'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from 'antd';
import { webSocketService } from '@/utils/websocket';
import Vote from '@/components/game/voting/vote';
import MySeat from "@/components/game/mySeat";
import OtherPlayerSeat from "@/components/game/otherPlayerSeat";
import ActionButton from "@/components/game/actionButton";
import type { GameModel, Player } from '@/types/games';
import { getApiDomain } from "@/utils/domain";

const baseURL = getApiDomain();

type GameWebSocketMessage = {
    event: string;
    players?: Player[];
    data?: GameModel;
    [key: string]: any;
};

const LobbyPage = () => {
    const { id: lobbyId } = useParams();
    const router = useRouter();

    const [showVoteOverlay, setShowVoteOverlay] = useState(false);
    const [gameModel, setGameModel] = useState<GameModel | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);

    const [currentUser, setCurrentUser] = useState<{
        id: number;
        username: string;
        token: string;
    } | null>(null);

    // fetch user data from localStorage
    const fetchUserFromLocalStorage = () => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setCurrentUser({ id: parsedUser.id, username: parsedUser.username, token: parsedUser.token });
                console.log('User data from localStorage:', parsedUser);
            } else {
                console.log('User data not found in localStorage');
            }
        } catch (err) {
            console.log('Error retrieving user data:', err);
        }
    };

    // Fetch user info from localStorage when component mounts
    useEffect(() => {
        fetchUserFromLocalStorage();
    }, []);  // This will run only once on component mount

    // make POST request to join the game
    const joinGame = async () => {
        if (!lobbyId || !currentUser) {
            console.log("Lobby ID or currentUser is missing.");
            return;
        }

        console.log("currentUser:", currentUser);

        try {
            const response = await fetch(`${baseURL}/game/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({
                    sessionId: lobbyId,
                    userId: currentUser.id,
                }),
            });

            const responseText = await response.text();

            if (!response.ok) {
                console.error("Join game failed response:", response.status, response.statusText, responseText);
                throw new Error("Failed to join game");
            }

            const data = JSON.parse(responseText);
            console.log("Successfully joined game:", data);
            return data;
        } catch (error) {
            console.error("Error joining game:", error);
            alert("Failed to join the game");
            throw error;
        }
    };

    // send request for game model to server
    const requestGameModel = () => {
        if (!lobbyId || !currentUser) {
            console.log("Lobby ID or currentUser is missing.");
            return;
        }

        const message = {
            event: "gameModel",
            gameID: lobbyId,
            userID: currentUser.id,
            token: currentUser.token,
        };

        console.log("Requesting game model with:", message);
        webSocketService.sendMessage(JSON.stringify(message));

        // check after a few seconds to debug
        setTimeout(() => {
            if (!gameModel) {
                console.log("No game model received after 5 seconds, requesting again...");
                webSocketService.sendMessage(JSON.stringify(message));
            }
        }, 5000);
    };

    // join the game and setup WebSocket after currentUser and lobbyId are ready
    useEffect(() => {
        if (!currentUser || !lobbyId) return;

        const listener = (data: unknown) => {
            console.log("[WebSocket Message RAW]", data);

            try {
                const message = typeof data === 'string' ? JSON.parse(data) : data as GameWebSocketMessage;
                console.log("[WebSocket Message Parsed]", message);

                if (message?.event === 'gameModel') {

                    if (message.data) {
                        console.log("Game model data received:", message.data);
                        setGameModel(message.data);

                        if (message.data.players && Array.isArray(message.data.players)) {
                            console.log("Players received from data:", message.data.players);
                            setPlayers(message.data.players);
                        }
                    } else {

                        console.log("Direct game model received:", message);
                        setGameModel(message as unknown as GameModel);

                        if (message.players && Array.isArray(message.players)) {
                            console.log("Players received directly:", message.players);
                            setPlayers(message.players);
                        } else {
                            console.warn("Received gamemodel without players array");
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to process WebSocket message", err);
            }
        };

        const setupGame = async () => {
            try {

                await joinGame();
                console.log("Game joined successfully, now connecting websocket");

                await webSocketService.connect(
                    'game',
                    lobbyId as string,
                    currentUser.token,
                    String(currentUser.id)
                );

                webSocketService.addListener(listener);
                console.log("WebSocket connected successfully, requesting game model");


                requestGameModel();
            } catch (error) {
                console.error("Error in game setup:", error);
            }
        };

        setupGame();

        return () => {
            webSocketService.removeListener(listener);
        };
    }, [lobbyId, currentUser]);  // Runs when either lobbyId or currentUser changes

    // Memoizing current player and other players
    const currentPlayer = useMemo(() => {
        if (!currentUser || !players) return undefined;
        return players.find(p => Number(p.userId) === Number(currentUser.id));
    }, [players, currentUser]);

    console.log("Current player:", currentPlayer);

    const otherPlayers = useMemo(() => {
        if (!currentUser || !players) return [];
        return players.filter(p => Number(p.userId) !== Number(currentUser.id));
    }, [players, currentUser]);
    console.log("Other players:", otherPlayers);

    const handleExitGame = async () => {
        if (!lobbyId || !currentUser) return;

        try {
            const response = await fetch(`${baseURL}/game/quit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({
                    sessionId: lobbyId,
                    userId: currentUser.id,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to leave the game room");
            }

            console.log("Successfully left the game room");

            webSocketService.disconnect();
        } catch (error) {
            console.error("Error leaving the game:", error);
            alert("Failed to leave the game");
        } finally {
            router.push('/main');
        }
    };

    const isHost = useMemo(() => {
        return currentUser && gameModel?.ownerId === currentUser.id;
    }, [gameModel, currentUser]);

    return (
        <div className="flex flex-col w-full h-auto">
            {/* NAVBAR */}
            <nav className="flex flex-row h-14 justify-between items-center bg-[#181818]">
                <div className="flex flex-row justify-end w-[95%] h-[40px]">
                    <Button
                        type="link"
                        className="!text-gray-500 !font-bold"
                        onClick={() => setShowVoteOverlay(true)}
                    >
                        Vote
                    </Button>
                    <Button
                        type="link"
                        className="!text-gray-500 !font-bold"
                        onClick={() => handleExitGame()}
                    >
                        Exit
                    </Button>
                </div>
            </nav>

            <Vote
                isVisible={showVoteOverlay}
                onClose={() => setShowVoteOverlay(false)}
                lobbyId={lobbyId as string}
            />

            {/* MAIN GAME VIEW */}
            <div className="bg-[url('/images/poker-table.jpg')] bg-cover bg-center relative min-h-screen">
                <div className="flex flex-row w-full pt-20 pb-8">
                    {/* Player Positions (Top Left & Bottom Left) */}
                    <div className="flex flex-col items-center w-[33.33%] space-y-8">
                        {[0, 1].map((i) => (
                            <OtherPlayerSeat
                                key={i}
                                player={otherPlayers[i]}
                                positionLabel={i === 0 ? 'Top Left' : 'Bottom Left'}
                            />
                        ))}
                    </div>

                    {/* Poker Table Details */}
                    <div className="flex flex-col items-center justify-between w-[33.33%] text-white">
                        <div className="rounded-lg p-4 mb-4 text-center">
                            <h2 className="text-xl font-bold">Poker Table</h2>
                            <p>Lobby ID: {lobbyId}</p>
                        </div>

                        {currentUser && gameModel && (
                            <div className="mt-4">
                                {currentUser.id === gameModel.ownerId ? (
                                    <Button
                                        type="primary"
                                        className="text-xl px-10 py-4 bg-green-600 hover:bg-green-700"
                                        onClick={() => {
                                            webSocketService.sendMessage(JSON.stringify({
                                                event: 'startGame',
                                                gameID: lobbyId,
                                                userID: currentUser.id,
                                                token: currentUser.token
                                            }));
                                        }}
                                    >
                                        Start Game
                                    </Button>
                                ) : (
                                    <p className="text-white text-lg font-semibold">Waiting for host to start the game...</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Player Positions (Top Right & Bottom Right) */}
                    <div className="flex flex-col items-center w-[33.33%] space-y-8">
                        {[2, 3].map((i) => (
                            <OtherPlayerSeat
                                key={i}
                                player={otherPlayers[i]}
                                positionLabel={i === 2 ? 'Top Right' : 'Bottom Right'}
                            />
                        ))}
                    </div>
                </div>

                {/* CURRENT USER */}
                <div className="absolute bottom-20 left-0 right-0 flex justify-center">
                    <MySeat
                        player={currentPlayer}
                        username={currentUser?.username}
                    />
                </div>

                {/* ACTION BUTTONS */}
                <div className="absolute bottom-4 left-0 right-0">
                    <div className="flex flex-row w-full justify-evenly">
                        {['Check', 'Bet', 'Call', 'Raise', 'Fold'].map((action) => (
                            <ActionButton key={action} label={action} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LobbyPage;