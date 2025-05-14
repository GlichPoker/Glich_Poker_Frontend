//lobby/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getApiDomain } from '@/utils/domain';
import { useGameSocket } from '@/hooks/useGameSocket';
import { useActionHandlers } from '@/hooks/useActionHandlers';
import { GameState } from '@/types/gameState';
import PreGameLayout from '@/components/game/preGameLayout';
import InGameLayout from '@/components/game/inGameLayout';
import { WinningModel } from '@/types/winning';
import { RoundModel, Card } from '@/types/round'; // Ensure Card is imported if BluffModel uses it directly
import "@ant-design/v5-patch-for-react-19";

// Define BluffModel interface if not already defined globally or imported
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
    const [currentUser, setCurrentUser] = useState<{
        id: number;
        username: string;
        token: string;
    } | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [winningModel, setWinningModel] = useState<WinningModel | null>(null);
    const [roundModel, setRoundModel] = useState<RoundModel | null>(null);
    const [gameState, setGameState] = useState<GameState>(GameState.PRE_GAME);
    const [customRuleText, setCustomRuleText] = useState<string | null>(null);
    const [weatherType, setWeatherType] = useState<string | null>(null);
    const [bluffModel, setBluffModel] = useState<BluffModel | null>(null); // Add state for bluff model
    const allowedWeatherTypes = ["SUNNY", "RAINY", "SNOWY", "CLOUDY"] as const;
    type WeatherLiteral = typeof allowedWeatherTypes[number];

    function isValidWeatherType(value: any): value is WeatherLiteral {
        return allowedWeatherTypes.includes(value);
    }

    const safeWeatherType = isValidWeatherType(weatherType) ? weatherType : undefined;


    useEffect(() => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setCurrentUser({
                    id: parsedUser.id,
                    username: parsedUser.username,
                    token: parsedUser.token,
                });
            } else {
                console.warn('User data not found in localStorage');
            }
        } catch (err) {
            console.error('Error retrieving user data:', err);
        }
    }, []);

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

                const currentGame = games.find(
                    (game: any) => String(game.sessionId) === String(lobbyId)
                );

                if (!currentGame?.settings?.order) {
                    setCustomRuleText("Rule: Unknown");
                    return;
                }

                const defaultOrder = [
                    "ROYALFLUSH",
                    "STRAIGHTFLUSH",
                    "FOUROFKIND",
                    "FULLHOUSE",
                    "FLUSH",
                    "STRAIGHT",
                    "THREEOFKIND",
                    "TWOPAIR",
                    "ONEPAIR",
                    "HIGHCARD",
                ];

                const reverseOrder = [...defaultOrder].reverse();
                const currentOrder = currentGame.settings.order;
                setWeatherType(currentGame.settings.weatherType);

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
        requestGameModel
    } = useGameSocket({
        currentUser,
        lobbyId: lobbyId as string,
        roundModel,
        setRoundModel,
        winningModel,
        setWinningModel,
        setGameState,
        setBluffModel // Pass setBluffModel to the hook
    });

    // if currentUser and lobbyId exist,
    const actionHandlers = currentUser && lobbyId ? useActionHandlers({
        currentUser,
        lobbyId: lobbyId as string,
        setError,
    }) : { // if not,
        handleFold: () => console.warn('You cannot do this yet'),
        handleCall: () => console.warn('You cannot do this yet'),
        handleRaise: () => console.warn('You cannot do this yet'),
        handleCheck: () => console.warn('You cannot do this yet'),
    };

    const { handleFold, handleCall, handleRaise, handleCheck } = actionHandlers;


    const handleExitGame = async () => {
        if (!lobbyId || !currentUser) return;

        try {
            //request to quit endpoint
            const quitResponse = await fetch(`${baseURL}/game/leave`, {
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

            // if (!quitResponse.ok) {
            //     throw new Error('Failed to leave the game room');
            // }
            if (!quitResponse.ok) {
                const errorText = await quitResponse.text(); // 여기서 에러 메시지 확인
                console.error('Failed to leave the game room:', quitResponse.status, errorText);
                throw new Error('Failed to leave the game room');
            }


            // request to delete endpoint
            setTimeout(async () => {
                if (playerCount <= 1 && isHost && gameState === GameState.PRE_GAME) {
                    const deleteResponse = await fetch(`${baseURL}/game/delete?sessionId=${lobbyId}&userId=${currentUser.id}`, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${currentUser.token}`,
                        },
                    });

                    if (!deleteResponse.ok) {
                        const errorText = await deleteResponse.text();
                        console.warn('Failed to delete the lobby:', deleteResponse.status, errorText);
                    } else {
                        console.log('Lobby deleted');
                    }
                }

                router.push('/main');
            }, 500);
        } catch (error) {
            console.error('Error leaving the game room:', error);
            alert('Failed to leave the game room');
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
                    sessionId: lobbyId,
                    userId: inviteeUserId,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Invite failed:", response.status, errorText);
                throw new Error('Failed to invite player');
            }

            alert('Player invited successfully');
        } catch (err) {
            console.error(err);
            alert('Failed to invite player');
        }
    };

    const renderLayout = () => {
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
                        currentPlayer={currentUser}
                        otherPlayers={otherPlayers}
                        customRuleText={customRuleText}
                        weatherType={safeWeatherType}
                        handleInvitePlayer={handleInvitePlayer}
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
                        // handleExitGame={handleExitGame}
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
                        bluffModel={bluffModel} // Pass bluffModel here
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div>
            {renderLayout()}
        </div>
    );
};

export default LobbyPage;