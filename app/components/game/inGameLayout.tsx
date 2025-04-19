import React, { useState, useMemo } from 'react';
import { Button, InputNumber } from 'antd';
import Vote from '@/components/game/voting/vote';
import MySeat from '@/components/game/mySeat';
import OtherPlayerSeat from '@/components/game/otherPlayerSeat';
import ActionButton from '@/components/game/actionButton';
import { Badge } from 'antd';
import { RoundModel } from '@/types/round';

interface InGameLayoutProps {
    roundModel?: RoundModel;
    lobbyId: string;
    currentPlayer: any;
    otherPlayers: any[];
    showVoteOverlay: boolean;
    setShowVoteOverlay: (show: boolean) => void;
    handleFold: () => void;
    handleCall: (amount: number) => void;
    handleRaise: (amount: number) => void;
    handleCheck: () => void;
}

const InGameLayout = ({
    roundModel,
    lobbyId,
    currentPlayer,
    otherPlayers,
    showVoteOverlay,
    setShowVoteOverlay,
    handleFold,
    handleCall,
    handleRaise,
    handleCheck,
}: InGameLayoutProps) => {

    // check player's turn
    const isMyTurn = roundModel?.playersTurnId === currentPlayer?.userId;

    // Determine if the round is over (same logic as in useGameSocket.shouldCompleteRound)
    const isRoundOver = useMemo(() => {
        if (!roundModel) return false;
        
        const allPlayers = [roundModel.player, ...roundModel.otherPlayers];
        const activePlayers = allPlayers.filter(p => p.active);
        
        // Round is over if only one player remains active
        if (activePlayers.length === 1) return true;
        
        // Round is over if all active players have the same bet amount and no turn is ongoing
        const allSameBet = activePlayers.every(p => p.roundBet === activePlayers[0].roundBet);
        const isTurnOngoing = roundModel.playersTurnId !== null && roundModel.playersTurnId !== undefined;
        
        return allSameBet && !isTurnOngoing;
    }, [roundModel]);

    const previousPlayerRoundBet = otherPlayers.length > 0 ? otherPlayers[0].roundBet : 0;

    // Call = other player's bet - my bet
    const callAmount = Math.max(0, previousPlayerRoundBet - (roundModel?.player?.roundBet ?? 0));

    // min Raise = previous highest bet + min raise (by Big Blind)
    const highestBet = otherPlayers.reduce((max, p) => Math.max(max, p.roundBet), 0);
    const minRaiseAmount = highestBet + (roundModel?.gameSettings?.bigBlind ?? 20);

    const [callInput, setCallInput] = useState(callAmount);
    const [raiseInput, setRaiseInput] = useState(minRaiseAmount);

    const handleCallInputChange = (value: number | null) => {
        setCallInput(value ?? 0);
    };

    const handleRaiseInputChange = (value: number | null) => {
        setRaiseInput(value ?? minRaiseAmount);
    };

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
                </div>
            </nav>

            <Vote
                isVisible={showVoteOverlay}
                onClose={() => setShowVoteOverlay(false)}
                lobbyId={lobbyId}
            />

            {/* Game area */}
            <div className="bg-[url('/images/poker-table.jpg')] bg-cover bg-center relative min-h-screen text-white">
                {/* Round status indicator */}
                {isRoundOver && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 px-4 py-2 rounded-lg z-10">
                        <span className="text-yellow-400 font-bold">Round Complete - Showing All Cards</span>
                    </div>
                )}
                
                {/* left - Other players seats */}
                <div className="flex flex-row w-full pt-20 pb-8">
                    <div className="flex flex-col items-center w-[33.33%] space-y-8">
                        {/* index=0 player seat */}
                        {otherPlayers.length > 1 && otherPlayers[1] && (
                            <OtherPlayerSeat
                                key={1}
                                player={otherPlayers[1]}
                                positionLabel="Top Left"
                                roundPlayer={roundModel?.otherPlayers?.[1]}
                                isRoundOver={isRoundOver}
                            />
                        )}
                        {/* index=2 player seat */}
                        {otherPlayers.length > 0 && otherPlayers[0] && (
                            <OtherPlayerSeat
                                key={0}
                                player={otherPlayers[0]}
                                positionLabel="Top Right"
                                roundPlayer={roundModel?.otherPlayers?.[0]}
                                isRoundOver={isRoundOver}
                            />
                        )}
                    </div>

                    {/* Center Table */}
                    <div className="flex flex-col items-center justify-center w-[33.33%] text-center space-y-2">
                        <p className="text-sm mt-4">Pot: ${roundModel?.potSize}</p>
                        
                        {/* Community Cards */}
                        {roundModel?.communityCards && roundModel.communityCards.length > 0 && (
                            <div className="flex justify-center mt-4 gap-1">
                                {roundModel.communityCards.map((card, i) => (
                                    <img 
                                        key={i} 
                                        src={`https://deckofcardsapi.com/static/img/${card.cardCode}.png`}
                                        alt={card.cardCode}
                                        className="h-16 w-auto rounded"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* right - Other players seats */}
                    <div className="flex flex-col items-center w-[33.33%] space-y-8">
                        {/* indext=1 player seat */}
                        {otherPlayers.length > 2 && otherPlayers[2] && (
                            <OtherPlayerSeat
                                key={2}
                                player={otherPlayers[2]}
                                positionLabel="Bottom Left"
                                roundPlayer={roundModel?.otherPlayers?.[2]}
                                isRoundOver={isRoundOver}
                            />
                        )}

                        {/* indext=3 player seat */}
                        {otherPlayers.length > 3 && otherPlayers[3] && (
                            <OtherPlayerSeat
                                key={3}
                                player={otherPlayers[3]}
                                positionLabel="Bottom Right"
                                roundPlayer={roundModel?.otherPlayers?.[3]}
                                isRoundOver={isRoundOver}
                            />
                        )}
                    </div>
                </div>

                {/* My turn notification */}
                <div className="absolute bottom-32 left-0 right-0 flex justify-center">
                    {isMyTurn ? (
                        <Badge.Ribbon text="My Turn" color="red">
                            <MySeat
                                player={currentPlayer}
                                username={currentPlayer?.username}
                                roundPlayer={roundModel?.player}
                            />
                        </Badge.Ribbon>
                    ) : (
                        <MySeat
                            player={currentPlayer}
                            username={currentPlayer?.username}
                            roundPlayer={roundModel?.player}
                        />
                    )}
                </div>

                {/* Action buttons */}
                <div className="absolute bottom-10 w-full flex justify-evenly items-end">
                    {/* Action buttons are disabled when the round is over */}
                    {/* Fold */}
                    <div className="flex flex-col items-center w-28">
                        <div className="w-full">
                            <ActionButton
                                label="Fold"
                                onClick={handleFold}
                                disabled={!isMyTurn || isRoundOver}
                            />
                        </div>
                    </div>

                    {/* Check */}
                    <div className="flex flex-col items-center w-28">
                        <div className="w-full">
                            <ActionButton
                                label="Check"
                                onClick={handleCheck}
                                disabled={!isMyTurn || isRoundOver}
                            />
                        </div>
                    </div>

                    {/* Call */}
                    <div className="flex flex-col items-center w-28">
                        <InputNumber
                            min={callAmount}
                            max={roundModel?.player?.balance ?? 0}
                            value={callInput}
                            onChange={handleCallInputChange}
                            disabled={!isMyTurn || isRoundOver}
                            placeholder={`$${callAmount}`}
                            className="h-8 w-full text-center text-white bg-transparent border-2 border-white rounded-md mb-1"
                        />
                        <div className="w-full">
                            <ActionButton
                                label="Call"
                                onClick={() => handleCall(callInput)}
                                disabled={!isMyTurn || callInput <= 0 || isRoundOver}
                            />
                        </div>
                    </div>

                    {/* Raise */}
                    <div className="flex flex-col items-center w-28">
                        <InputNumber
                            min={minRaiseAmount}
                            value={raiseInput}
                            onChange={handleRaiseInputChange}
                            disabled={!isMyTurn || isRoundOver}
                            placeholder={`min $${minRaiseAmount}`}
                            className="h-8 w-full text-center text-white bg-transparent border-2 border-white rounded-md mb-1"
                        />
                        <div className="w-full">
                            <ActionButton
                                label="Raise"
                                onClick={() => handleRaise(raiseInput)}
                                disabled={!isMyTurn || raiseInput < minRaiseAmount || isRoundOver}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InGameLayout;