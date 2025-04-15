'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from 'antd';
import { getApiDomain } from '@/utils/domain';
import { useGameSocket } from '@/hooks/useGameSocket';
import { GameState } from '@/types/gameState';
import PreGameLayout from '@/components/game/preGameLayout';


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
        gameModel,
        players,
        currentPlayer,
        otherPlayers,
        isHost,
        startGame,
    } = useGameSocket({
        currentUser: currentUser,
        lobbyId: lobbyId as string,
    });

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
            console.error('Error leaving the game:', error);
            alert('Failed to leave the game');
        }
    };

    //according to game state, render different layout
    const renderLayout = () => {
        switch (gameState) {
            case GameState.PRE_GAME:
                return (
                    <PreGameLayout
                        isHost={isHost}
                        startGame={startGame}
                        showVoteOverlay={showVoteOverlay}
                        setShowVoteOverlay={setShowVoteOverlay}
                        lobbyId={lobbyId as string}
                        handleExitGame={handleExitGame}
                        currentPlayer={currentPlayer}
                        otherPlayers={otherPlayers}
                    />
                );
            // case GameState.IN_GAME:
            //     return (
            //         <InGameLayout
            //             gameModel={gameModel}
            //             currentPlayer={currentPlayer}
            //             otherPlayers={otherPlayers}
            //         />
            //     );
            // case GameState.POST_GAME:
            //     return <PostGameLayout gameModel={gameModel} />;
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