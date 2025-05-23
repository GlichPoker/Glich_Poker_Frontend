'use client';
import { message } from "antd";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getApiDomain } from '@/utils/domain';
import { useGameSocket } from '@/hooks/useGameSocket';
import { useActionHandlers } from '@/hooks/useActionHandlers';
import { GameState } from '@/types/gameState';
import PreGameLayout from '@/components/game/preGameLayout';
import InGameLayout from '@/components/game/inGameLayout';
import { WinningModel } from '@/types/winning';
import { RoundModel, Card, GameSettings } from '@/types/round';
import "@ant-design/v5-patch-for-react-19";

// Define BluffModel interface
interface BluffModel {
    userId: number;
    bluffCard: Card;
}

const baseURL = getApiDomain();

const LobbyPage = () => {
    const { id: lobbyId } = useParams();
    const router = useRouter();

    const [showVoteOverlay, setShowVoteOverlay] = useState(false);
    const [playerCount, setPlayerCount] = useState(0);
    const [currentUser, setCurrentUser] = useState<{ id: number; username: string; token: string; } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [winningModel, setWinningModel] = useState<WinningModel | null>(null);
    const [roundModel, setRoundModel] = useState<RoundModel | null>(null);
    const [settings, setSettings] = useState<GameSettings>();
    const [gameState, setGameState] = useState<GameState>(GameState.PRE_GAME);
    const [weatherType, setWeatherType] = useState<"SUNNY" | "RAINY" | "SNOWY" | "CLOUDY" | undefined>();
    const [customRuleText, setCustomRuleText] = useState<string>("");
    const [bluffModel, setBluffModel] = useState<BluffModel | null>(null);
    const [specialRuleText, setSpecialRuleText] = useState<string>("");
    const [showVoteMapButton, setShowVoteMapButton] = useState(false);
    const [pendingWeatherType, setPendingWeatherType] = useState<"SUNNY" | "RAINY" | "SNOWY" | "CLOUDY" | null>(null);
    const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    const allowedWeatherTypes = ["SUNNY", "RAINY", "SNOWY", "CLOUDY"] as const;
    type WeatherLiteral = typeof allowedWeatherTypes[number];

    function isValidWeatherType(value: any): value is WeatherLiteral {
        return allowedWeatherTypes.includes(value);
    }

    const safeWeatherType = isValidWeatherType(weatherType) ? weatherType : undefined;

    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const localStorageToken = localStorage.getItem("token");

        if (!localStorageToken) {
            messageApi.error("Please login first");
            router.replace("/");
            return;
        }

        const userDataString = localStorage.getItem("user");
        if (userDataString) {
            try {
                const userData = JSON.parse(userDataString);
                setCurrentUser(userData);
            } catch (error) {
                console.error("Failed to parse user data:", error);
                messageApi.error("Error loading user data");
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                router.replace("/");
                return;
            }
        }

        setAuthChecked(true);
    }, [router, messageApi]);

    useEffect(() => {
        if (specialRuleText) {
            messageApi.warning({
                content: specialRuleText,
                key: "specialRule",
                duration: 3,
            });
        }
    }, [specialRuleText]);

    useEffect(() => {
        if (specialRuleText) {
            setShowVoteMapButton(false);
        }
    }, [specialRuleText]);

    useEffect(() => {
        const fetchGameSettings = async () => {
            if (!lobbyId || !currentUser) return;

            try {
                const response = await fetch(`${baseURL}/game/allGames`, {
                    headers: {
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch game list');

                const games = await response.json();
                const currentGame = games.find((game: any) => String(game.sessionId) === String(lobbyId));

                if (!currentGame?.settings?.order) {
                    setCustomRuleText("Rule: Unknown");
                    return;
                }

                const defaultOrder = [
                    "ROYALFLUSH", "STRAIGHTFLUSH", "FOUROFKIND", "FULLHOUSE", "FLUSH",
                    "STRAIGHT", "THREEOFKIND", "TWOPAIR", "ONEPAIR", "HIGHCARD"
                ];

                const reverseOrder = [...defaultOrder].reverse();
                const currentOrder = currentGame.settings.order;
                setWeatherType(currentGame.settings.weatherType);
                setSettings(currentGame.settings);

                if (JSON.stringify(currentOrder) === JSON.stringify(defaultOrder)) {
                    setCustomRuleText("Rule: Standard Hand Rankings");
                } else if (JSON.stringify(currentOrder) === JSON.stringify(reverseOrder)) {
                    setCustomRuleText("Rule: Reverse Hand Rankings");
                } else {
                    setCustomRuleText("Rule: Custom Hand Rankings");
                }
            } catch (err) {
                console.error("Error fetching game data:", err);
            }
        };

        fetchGameSettings();
    }, [lobbyId, currentUser]);

    const {
        players,
        currentPlayer,
        otherPlayers,
        isHost,
        startGame,
    } = useGameSocket({
        currentUser,
        lobbyId: lobbyId as string,
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
        setIsWeatherModalOpen,
    });

    const actionHandlers = useActionHandlers({
        currentUser,
        lobbyId: lobbyId as string,
        setError,
    });

    const { handleFold, handleCall, handleRaise, handleCheck } = actionHandlers;

    const handleExitGame = async () => {
        if (!lobbyId || !currentUser) return;

        try {
            const quitResponse = await fetch(`${baseURL}/game/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.token}`,
                },
                body: JSON.stringify({ sessionId: lobbyId, userId: currentUser.id }),
            });

            if (!quitResponse.ok) {
                const errorText = await quitResponse.text();
                console.error('Failed to leave the game room:', quitResponse.status, errorText);
                throw new Error('Failed to leave the game room');
            }

            router.push('/main');
        } catch (error) {
            console.error('Error leaving the game room:', error);
            messageApi.error('Failed to leave the game room');
        }
    };

    const handleDeleteLobby = async () => {
        if (!lobbyId || !currentUser) return;

        try {
            const deleteResponse = await fetch(`${baseURL}/game/delete?sessionId=${lobbyId}&userId=${currentUser.id}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${currentUser.token}`,
                },
            });

            if (!deleteResponse.ok) {
                const errorText = await deleteResponse.text();
                console.warn('Failed to delete the lobby:', deleteResponse.status, errorText);
                messageApi.error('Failed to delete the lobby');
            } else {
                console.log('Lobby deleted');
                router.push('/main');
            }
        } catch (error) {
            console.error('Error deleting the lobby:', error);
            messageApi.error('Error deleting the lobby');
        }
    };

    const startGameAndSetState = async () => {
        await startGame();
    };

    const handleInvitePlayer = async (inviteeUserId: number) => {
        if (!currentUser || !lobbyId) return;

        try {
            const response = await fetch(`${baseURL}/game/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.token}`,
                },
                body: JSON.stringify({
                    userId: inviteeUserId,
                    senderId: currentUser.id,
                    sessionId: lobbyId,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Invite failed:", response.status, errorText);
                throw new Error('Failed to invite player');
            }

            messageApi.success('Player invited successfully');
        } catch (err) {
            console.error(err);
            messageApi.error('Failed to invite player');
        }
    };

    const triggerVoteMapButton = () => setShowVoteMapButton(true);

    const renderLayout = () => {
        if (!authChecked) return null;

        switch (gameState) {
            case GameState.PRE_GAME:
                return (
                    <PreGameLayout
                        isHost={isHost}
                        startGame={startGameAndSetState}
                        showVoteOverlay={showVoteOverlay}
                        setShowVoteOverlay={setShowVoteOverlay}
                        lobbyId={lobbyId as string}
                        handleExitGame={handleExitGame}
                        currentUser={currentUser}
                        currentPlayer={currentPlayer}
                        otherPlayers={otherPlayers}
                        customRuleText={customRuleText}
                        weatherType={safeWeatherType}
                        handleInvitePlayer={handleInvitePlayer}
                        specialRuleText={specialRuleText}
                        showVoteMapButton={showVoteMapButton}
                        triggerVoteMapButton={triggerVoteMapButton}
                        pendingWeatherType={pendingWeatherType}
                        isWeatherModalOpen={isWeatherModalOpen}
                        setIsWeatherModalOpen={setIsWeatherModalOpen}
                        gameSettings={settings}
                        handleDeleteLobby={handleDeleteLobby}
                    />
                );
            case GameState.IN_GAME:
                if (!roundModel) return null;
                return (
                    <InGameLayout
                        roundModel={roundModel}
                        currentPlayer={currentPlayer}
                        otherPlayers={otherPlayers}
                        lobbyId={lobbyId as string}
                        showVoteOverlay={showVoteOverlay}
                        setShowVoteOverlay={setShowVoteOverlay}
                        handleFold={handleFold}
                        handleCall={handleCall}
                        handleRaise={handleRaise}
                        handleCheck={handleCheck}
                        error={error}
                        setError={setError}
                        setWinningModel={setWinningModel}
                        setRoundModel={setRoundModel}
                        setPlayerCount={setPlayerCount}
                        winningModel={winningModel}
                        currentUser={currentUser}
                        customRuleText={customRuleText}
                        weatherType={safeWeatherType}
                        bluffModel={bluffModel}
                        isInGame={gameState === GameState.IN_GAME}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div>
            {contextHolder}
            {renderLayout()}
        </div>
    );
};

export default LobbyPage;