import { useEffect, useState, useMemo, useRef } from 'react';
import { webSocketService } from '@/utils/websocket';
import { GameModel, Player } from '@/types/game';
import { GameState } from '@/types/gameState';
import { RoundModel, Card } from '@/types/round';
import { WinningModel } from '@/types/winning';
import { getApiDomain } from '@/utils/domain';
import {  useRouter } from 'next/navigation';


const baseURL = getApiDomain();

type GameWebSocketMessage = {
    event: string;
    players?: Player[];
    data?: GameModel;
    state?: GameState;
    bluffCard?: Card;
    userId?: number;
    weatherType?: "SUNNY" | "RAINY" | "SNOWY" | "CLOUDY";
    [key: string]: any;
};

interface BluffModel {
    userId: number;
    bluffCard: Card;
}

interface UseGameSocketParams {
    lobbyId: string;
    currentUser: { id: number; username: string; token: string } | null;
    roundModel: RoundModel | null;
    setRoundModel: (round: RoundModel | null) => void;
    winningModel: WinningModel | null;
    setWinningModel: (winner: WinningModel | null) => void;
    setGameState: (state: GameState) => void;
    setBluffModel: (bluff: BluffModel | null) => void;
    setWeatherType: (weather: "SUNNY" | "RAINY" | "SNOWY" | "CLOUDY") => void;
    setSpecialRuleText: (text: string) => void;
    setShowVoteMapButton?: (show: boolean) => void;
    setPendingWeatherType?: (weather: "SUNNY" | "RAINY" | "SNOWY" | "CLOUDY") => void;
    setIsWeatherModalOpen?: (open: boolean) => void;
}

export const useGameSocket = ({
    lobbyId,
    currentUser,
    roundModel,
    setRoundModel,
    winningModel,
    setWinningModel,
    setGameState,
    setBluffModel,
    setWeatherType,
    setSpecialRuleText,
    setShowVoteMapButton,
    setPendingWeatherType,
    setIsWeatherModalOpen
}: UseGameSocketParams) => {
    const [gameModel, setGameModel] = useState<GameModel | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const router = useRouter();

    const listenerRef = useRef<((data: unknown) => void) | null>(null);


    const joinGame = async () => {
        if (!lobbyId || !currentUser) return;

        try {
            const response = await fetch(`${baseURL}/game/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.token}`,
                },
                body: JSON.stringify({
                    sessionId: lobbyId,
                    userId: currentUser.id,
                }),
            });

            const res = await response.json();
            if (response.status !== 200) {
                throw new Error(`Join game failed: ${response.statusText}`);
            }

            setGameModel(res);
            if (res.players && Array.isArray(res.players)) {
                setPlayers(res.players);
            }
        } catch (error) {
            console.error('Failed to join game:', error);
            throw error;
        }
    };

    const requestGameModel = () => {
        if (!lobbyId || !currentUser) return;

        const message = {
            event: 'GAMEMODEL',
            gameID: lobbyId,
            userID: currentUser.id,
            token: currentUser.token,
        };

        webSocketService.sendMessage(JSON.stringify(message));

        setTimeout(() => {
            if (!gameModel) {
                console.log('No game model received after 5s, retrying...');
                webSocketService.sendMessage(JSON.stringify(message));
            }
        }, 5000);
    };

    useEffect(() => {
        listenerRef.current = (data: unknown) => {
            try {
                const raw = typeof data === 'string' ? data : JSON.stringify(data);

                const message = typeof data === 'string' ? JSON.parse(data) : (data as GameWebSocketMessage);

                switch (message.event) {
                    case 'GAMEMODEL': {
                        const model = message.data || (message as GameModel);
                        setGameModel(model);
                        if (model.players && Array.isArray(model.players)) {
                            setPlayers(model.players);
                        }
                        break;
                    }

                    case 'GAMESTATECHANGED':
                        if (message.state) {
                            setGameState(message.state);
                            if (message.state === GameState.PRE_GAME) {
                                setWinningModel(null);
                                setRoundModel(null);
                            }
                        }
                        break;

                    case 'ROUNDMODEL':
                        setRoundModel(message);
                        break;

                    case 'WINNINGMODEL':
                        setWinningModel(message as WinningModel);
                        break;

                    case 'BLUFFMODEL':
                        if (message.bluffCard && message.userId) {
                            setBluffModel({ userId: message.userId, bluffCard: message.bluffCard });
                        }
                        break;

                    case "SHOW_VOTE_MAP_BUTTON":
                        if (setShowVoteMapButton) {
                            setShowVoteMapButton(true);
                        }
                        break;

                    case "WEATHER_VOTE_RESULT":
                        if (setPendingWeatherType && setIsWeatherModalOpen) {
                            setPendingWeatherType(message.weatherType);
                            setIsWeatherModalOpen(true);
                        }
                        break;
                    case "LEAVE":
                        router.push('/main');
                        break;

                    case "WEATHER_UPDATED":
                        if (message.weatherType) {
                            setWeatherType(message.weatherType);
                            setSpecialRuleText(`The map has been changed to ${message.weatherType}.`);
                        } else {
                            console.warn("Received WEATHER_UPDATED event without valid weatherType");
                        }
                        break;


                    default:
                        console.warn("Unknown WebSocket event:", message.event);
                }
            } catch (err) {
                console.error('WebSocket parse error:', err);
            }
        };
    }, [currentUser, lobbyId, gameModel]);

    useEffect(() => {
        if (!lobbyId || !currentUser) return;

        const setup = async () => {
            try {
                await joinGame();

                await webSocketService.connect(
                    'game',
                    lobbyId,
                    currentUser.token,
                    String(currentUser.id)
                );

                if (listenerRef.current) {
                    webSocketService.addListener(listenerRef.current);
                } else {
                    console.warn("⚠️ listenerRef.current is null — listener not registered");
                }
            } catch (error) {
                console.error("[WebSocket Setup Error]", error);
            }
        };

        setup();

        return () => {
            if (listenerRef.current) {
                webSocketService.removeListener(listenerRef.current);
            }
        };
    }, [lobbyId, currentUser]);

    const currentPlayer = useMemo(() => {
        if (!currentUser || !players) return undefined;
        return players.find((p) => p.userId === currentUser.id);
    }, [players, currentUser]);

    const otherPlayers = useMemo(() => {
        if (!currentUser || !players) return [];
        return players.filter((p) => p.userId !== currentUser.id);
    }, [players, currentUser]);

    const isHost = useMemo(() => {
        return currentUser?.id === gameModel?.ownerId;
    }, [currentPlayer, gameModel]);

    const startGame = async () => {
        if (!gameModel || !currentUser) return;

        setWinningModel(null);
        try {
            const response = await fetch(`${baseURL}/game/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.token}`,
                },
                body: JSON.stringify({
                    sessionId: lobbyId,
                    userId: currentUser.id,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to start game: ${response.statusText}`);
            }

            const gameData = await response.json();
            console.log('Game started:', gameData);
        } catch (error) {
            console.error('Error starting game:', error);
        }
    };

    return {
        gameModel,
        players,
        currentPlayer,
        otherPlayers,
        isHost,
        startGame,
        requestGameModel,
    };
};