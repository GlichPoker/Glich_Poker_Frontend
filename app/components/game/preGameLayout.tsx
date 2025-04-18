import { Button } from 'antd';
import Vote from '@/components/game/voting/vote';
import MySeat from '@/components/game/mySeat';
import OtherPlayerSeat from '@/components/game/otherPlayerSeat';

interface PreGameLayoutProps {
    lobbyId: string;
    isHost: boolean;
    currentPlayer: any;
    otherPlayers: any[];
    startGame: () => void;
    showVoteOverlay: boolean;
    setShowVoteOverlay: (show: boolean) => void;
    handleExitGame: () => void;
}

const PreGameLayout = ({
    lobbyId,
    isHost,
    currentPlayer,
    otherPlayers,
    startGame,
    showVoteOverlay,
    setShowVoteOverlay,
    handleExitGame,
}: PreGameLayoutProps) => {
    const handleStart = async () => {
        await startGame();
    };

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
                        onClick={handleExitGame}
                    >
                        Exit
                    </Button>
                </div>
            </nav>

            <Vote
                isVisible={showVoteOverlay}
                onClose={() => setShowVoteOverlay(false)}
                lobbyId={lobbyId}
            />

            {/* MAIN GAME VIEW */}
            <div className="bg-[url('/images/poker-table.jpg')] bg-cover bg-center relative min-h-screen">
                <div className="flex flex-row w-full pt-20 pb-8">
                    {/* Player Positions (Top Left & Bottom Left) */}
                    <div className="flex flex-col items-center w-[33.33%] space-y-8">
                        {otherPlayers[0] && (
                            <OtherPlayerSeat
                                key={0}
                                player={otherPlayers[0]}
                                positionLabel="Top Left"
                            />
                        )}
                        {otherPlayers[1] && (
                            <OtherPlayerSeat
                                key={1}
                                player={otherPlayers[1]}
                                positionLabel="Bottom Left"
                            />
                        )}
                    </div>

                    {/* Poker Table Details + Host Start Button */}
                    <div className="flex flex-col items-center justify-between w-[33.33%] text-white">
                        <div className="rounded-lg p-4 mb-4 text-center">
                            <h2 className="text-xl font-bold">Poker Table</h2>
                            <p>Lobby ID: {lobbyId}</p>
                            {isHost ? (
                                <Button
                                    type="primary"
                                    className="mt-4"
                                    onClick={handleStart} // 변경
                                >
                                    Start Game
                                </Button>
                            ) : (
                                <p className="text-sm text-gray-300 mt-2">Waiting for host to start the game...</p>
                            )}
                        </div>
                    </div>

                    {/* Player Positions (Top Right & Bottom Right) */}
                    <div className="flex flex-col items-center w-[33.33%] space-y-8">
                        {otherPlayers[2] && (
                            <OtherPlayerSeat
                                key={2}
                                player={otherPlayers[2]}
                                positionLabel="Top Right"
                            />
                        )}
                        {otherPlayers[3] && (
                            <OtherPlayerSeat
                                key={3}
                                player={otherPlayers[3]}
                                positionLabel="Bottom Right"
                            />
                        )}
                    </div>
                </div>

                {/* CURRENT USER */}
                <div className="absolute bottom-20 left-0 right-0 flex justify-center">
                    <MySeat
                        player={currentPlayer}
                        username={currentPlayer?.username}
                    />
                </div>
            </div>
        </div>
    );
};

export default PreGameLayout;