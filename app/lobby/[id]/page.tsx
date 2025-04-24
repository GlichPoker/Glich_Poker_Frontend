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
import { RoundModel } from '@/types/round';
import "@ant-design/v5-patch-for-react-19";

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
        setGameState
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
            const response = await fetch(`${baseURL}/game/quit`, {
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
                throw new Error('Failed to leave the game room');
            }

            console.log('Successfully left the game room');
            router.push('/main');
        } catch (error) {
            console.error('Error leaving the game room:', error);
            alert('Failed to leave the game room');
        }
    };

    const startGameAndSetState = async () => {
        await startGame();

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
                        currentPlayer={currentPlayer}
                        otherPlayers={otherPlayers}
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