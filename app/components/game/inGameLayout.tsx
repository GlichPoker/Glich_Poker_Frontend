// components/game/InGameLayout.tsx
import { Button } from 'antd';
import Vote from '@/components/game/voting/vote';
import MySeat from '@/components/game/mySeat';
import OtherPlayerSeat from '@/components/game/otherPlayerSeat';
import ActionButton from '@/components/game/actionButton';
import { GameModel, Player } from '@/types/games';

interface InGameLayoutProps {
    gameModel: GameModel | null;
    lobbyId: string;
    currentPlayer: any;
    otherPlayers: any[];
    showVoteOverlay: boolean;
    setShowVoteOverlay: (show: boolean) => void;
    handleExitGame: () => void;
}

const InGameLayout = ({
    gameModel,
    lobbyId,
    currentPlayer,
    otherPlayers,
    showVoteOverlay,
    setShowVoteOverlay,
    handleExitGame,
}: InGameLayoutProps) => {
    return (
        <div className="flex flex-col w-full h-auto">
            {/* Nav bar */}
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

            {/* Game area */}
            <div className="bg-[url('/images/poker-table.jpg')] bg-cover bg-center relative min-h-screen text-white">
                {/* Other players seats */}
                <div className="flex flex-row w-full pt-20 pb-8">
                    <div className="flex flex-col items-center w-[33.33%] space-y-8">
                        {[0, 1].map((i) => (
                            <OtherPlayerSeat
                                key={i}
                                player={otherPlayers[i]}
                                positionLabel={i === 0 ? 'Top Left' : 'Bottom Left'}
                            />
                        ))}
                    </div>

                    {/* Center Table */}
                    <div className="flex flex-col items-center justify-center w-[33.33%] text-center space-y-2">

                        <p className="text-sm mt-4">Pot: $0</p>
                    </div>

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

                {/* My seat */}
                <div className="absolute bottom-32 left-0 right-0 flex justify-center">
                    <MySeat player={currentPlayer} username={currentPlayer?.username} />
                </div>

                {/* Action buttons */}
                <div className="absolute bottom-15 flex left-0 right-0 justify-evenly">
                    <ActionButton label="Fold" onClick={() => console.log("Fold")} />
                    <ActionButton label="Check" onClick={() => console.log("Check")} />
                    <ActionButton label="Call" onClick={() => console.log("Call")} />
                    <ActionButton label="Bet" onClick={() => console.log("Bet")} />
                    <ActionButton label="Raise" onClick={() => console.log("Raise")} />

                </div>
            </div>
        </div>
    );
};

export default InGameLayout;