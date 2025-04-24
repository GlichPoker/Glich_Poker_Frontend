import { useEffect, useState, useMemo } from 'react';
import { webSocketService } from '@/utils/websocket';
import { GameModel, Player } from '@/types/game';
import { GameState } from '@/types/gameState';
import { RoundModel } from '@/types/round';
import { WinningModel } from '@/types/winning';
import { getApiDomain } from '@/utils/domain';

const baseURL = getApiDomain();

type GameWebSocketMessage = {
    event: string;
    players?: Player[];
    data?: GameModel;
    state?: GameState;
    [key: string]: any;
};

interface UseGameSocketParams {
    lobbyId: string;
    currentUser: { id: number; username: string; token: string } | null;
    roundModel: RoundModel | null;
    setRoundModel: (round: RoundModel | null) => void;
    winningModel: WinningModel | null;
    setWinningModel: (winner: WinningModel | null) => void;
    setGameState: (state: GameState) => void;
}

export const useGameSocket = ({
    lobbyId,
    currentUser,
    roundModel,
    setRoundModel,
    winningModel,
    setWinningModel,
    setGameState
}: UseGameSocketParams) => {
    const [gameModel, setGameModel] = useState<GameModel | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);

    // Join Game API
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

    // WebSocket listener
    useEffect(() => {
        if (!lobbyId || !currentUser) return;

        const listener = (data: unknown) => {
            try {
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

                    case 'GAMESTATECHANGED': {
                        if (message.state) {
                            console.log('Game state changed to:', message.state);
                            setGameState(message.state as GameState);

                            if (message.state === GameState.PRE_GAME) {
                                setWinningModel(null);
                                setRoundModel(null);
                            }
                        }
                        break;
                    }

                    case 'ROUNDMODEL': {
                        setRoundModel(message);
                        break;
                    }

                    case 'WINNINGMODEL': {
                        const model = message as WinningModel;
                        setWinningModel(model);
                        console.log("Received WINNINGMODEL:", model);
                        break;
                    }

                    default:
                        console.warn("Unknown WebSocket event:", message.event);
                }
            } catch (err) {
                console.error('WebSocket parse error:', err);
            }
        };

        const setup = async () => {
            try {
                await joinGame();
                await webSocketService.connect(
                    'game',
                    lobbyId,
                    currentUser.token,
                    String(currentUser.id),
                );

                webSocketService.addListener(listener);
            } catch (err) {
                console.error('WebSocket setup failed:', err);
            }
        };

        setup();

        return () => {
            webSocketService.removeListener(listener);
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

        setWinningModel(null); // reset for new round
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