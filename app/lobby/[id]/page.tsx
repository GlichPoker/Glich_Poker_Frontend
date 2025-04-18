'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getApiDomain } from '@/utils/domain';
import { useGameSocket } from '@/hooks/useGameSocket';
import { useActionHandlers } from '@/hooks/useActionHandlers';
import { GameState } from '@/types/gameState';
import PreGameLayout from '@/components/game/preGameLayout';
import InGameLayout from '@/components/game/inGameLayout';

const baseURL = getApiDomain();

const LobbyPage = () => {
    const { id: lobbyId } = useParams();
    const router = useRouter();

    const [showVoteOverlay, setShowVoteOverlay] = useState(false);
    const [currentUser, setCurrentUser] = useState<{
        id: number;
        username: string;
        token: string;
    } | null>(null);

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
        roundModel,
        players,
        currentPlayer,
        otherPlayers,
        isHost,
        startGame,
        gameState,
    } = useGameSocket({
        currentUser: currentUser,
        lobbyId: lobbyId as string,
    });

    // if currentUser and lobbyId exist,
    const actionHandlers = currentUser && lobbyId ? useActionHandlers({
        currentUser,
        lobbyId: lobbyId as string,
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
                return (
                    <InGameLayout
                        roundModel={roundModel}
                        currentPlayer={currentPlayer}
                        otherPlayers={otherPlayers}
                        lobbyId={lobbyId as string}
                        showVoteOverlay={showVoteOverlay}
                        setShowVoteOverlay={setShowVoteOverlay}
                        handleExitGame={handleExitGame}
                        handleFold={handleFold}
                        handleCall={handleCall}
                        handleRaise={handleRaise}
                        handleCheck={handleCheck}
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