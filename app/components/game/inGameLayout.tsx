import { Button } from 'antd';
import Vote from '@/components/game/voting/vote';
import MySeat from '@/components/game/mySeat';
import OtherPlayerSeat from '@/components/game/otherPlayerSeat';
import ActionButton from '@/components/game/actionButton';
import { Badge } from 'antd';

interface InGameLayoutProps {
    roundModel: any;
    lobbyId: string;
    currentPlayer: any;
    otherPlayers: any[];
    showVoteOverlay: boolean;
    setShowVoteOverlay: (show: boolean) => void;
    handleExitGame: () => void;
    handleFold: () => void;
    handleCall: () => void;
    handleRaise: () => void;
    handleCheck: () => void;
}

const InGameLayout = ({
    roundModel,
    lobbyId,
    currentPlayer,
    otherPlayers,
    showVoteOverlay,
    setShowVoteOverlay,
    handleExitGame,
    handleFold,
    handleCall,
    handleRaise,
    handleCheck,
}: InGameLayoutProps) => {

    const isMyTurn = roundModel?.playersTurnId === currentPlayer?.userId;

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
                    {/* <Button
                        type="link"
                        className="!text-gray-500 !font-bold"
                        onClick={handleExitGame}
                    >
                        Exit
                    </Button> */}
                </div>
            </nav>

            <Vote
                isVisible={showVoteOverlay}
                onClose={() => setShowVoteOverlay(false)}
                lobbyId={lobbyId}
            />

            {/* Game area */}
            <div className="bg-[url('/images/poker-table.jpg')] bg-cover bg-center relative min-h-screen text-white">
                {/* left - Other players seats */}
                <div className="flex flex-row w-full pt-20 pb-8">
                    <div className="flex flex-col items-center w-[33.33%] space-y-8">
                        {/* index=0 player seat */}
                        {otherPlayers.length > 1 && otherPlayers[1] && (
                            <OtherPlayerSeat
                                key={1}
                                player={otherPlayers[1]}
                                positionLabel="Top Left"
                            />
                        )}
                        {/* index=2 player seat */}
                        {otherPlayers.length > 0 && otherPlayers[0] && (
                            <OtherPlayerSeat
                                key={0}
                                player={otherPlayers[0]}
                                positionLabel="Top Right"
                            />
                        )}
                    </div>

                    {/* Center Table */}
                    <div className="flex flex-col items-center justify-center w-[33.33%] text-center space-y-2">
                        <p className="text-sm mt-4">Pot: ${roundModel?.potSize}</p>
                    </div>

                    {/* right - Other players seats */}
                    <div className="flex flex-col items-center w-[33.33%] space-y-8">
                        {/* indext=1 player seat */}
                        {otherPlayers.length > 2 && otherPlayers[2] && (
                            <OtherPlayerSeat
                                key={2}
                                player={otherPlayers[2]}
                                positionLabel="Bottom Left"
                            />
                        )}


                        {/* indext=3 player seat */}
                        {otherPlayers.length > 3 && otherPlayers[3] && (
                            <OtherPlayerSeat
                                key={3}
                                player={otherPlayers[3]}
                                positionLabel="Bottom Right"
                            />
                        )}
                    </div>
                </div>

                {/* My turn notification */}
                <div className="absolute bottom-32 left-0 right-0 flex justify-center">
                    {isMyTurn ? (
                        <Badge.Ribbon text="My Turn" color="red">
                            <MySeat player={currentPlayer} username={currentPlayer?.username} />
                        </Badge.Ribbon>
                    ) : (
                        <MySeat player={currentPlayer} username={currentPlayer?.username} />
                    )}
                </div>

                {/* Action buttons */}
                <div className="absolute bottom-15 flex left-0 right-0 justify-evenly">
                    <ActionButton label="Fold" onClick={handleFold} disabled={!isMyTurn} />
                    <ActionButton label="Check" onClick={handleCheck} disabled={!isMyTurn} />
                    <ActionButton label="Call" onClick={handleCall} disabled={!isMyTurn} />
                    <ActionButton label="Raise" onClick={handleRaise} disabled={!isMyTurn} />
                </div>
            </div>
        </div>
    );
};

export default InGameLayout;