import React, { useState } from 'react';
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

    // 1번 플레이어(다른 플레이어 중 첫번째)의 roundBet
    const previousPlayerRoundBet = otherPlayers.length > 0 ? otherPlayers[0].roundBet : 0;

    // Call = other player's bet - my bet
    const callAmount = Math.max(0, previousPlayerRoundBet - (roundModel?.player?.roundBet ?? 0));

    // min Raise = previous highest bet + min raise (by Big Blind)
    const highestBet = otherPlayers.reduce((max, p) => Math.max(max, p.roundBet), 0);
    const minRaiseAmount = highestBet + (roundModel?.gameSettings?.bigBlind ?? 20);

    // 상태 관리
    const [callInput, setCallInput] = useState(callAmount);
    const [raiseInput, setRaiseInput] = useState(minRaiseAmount);

    // onChange에서 null을 처리하는 함수
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

                {/* Action buttons - 가로 배치 */}
                <div className="absolute bottom-10 w-full flex justify-evenly items-end">
                    {/* Fold */}
                    <div className="flex flex-col items-center w-28">
                        <ActionButton
                            label="Fold"
                            onClick={handleFold}
                            disabled={!isMyTurn}

                        />
                    </div>

                    {/* Check */}
                    <div className="flex flex-col items-center w-28">
                        <ActionButton
                            label="Check"
                            onClick={handleCheck}
                            disabled={!isMyTurn}

                        />
                    </div>

                    {/* Call */}
                    <div className="flex flex-col items-center w-28">
                        <InputNumber
                            min={callAmount}
                            max={roundModel?.player?.balance ?? 0}
                            value={callInput}
                            onChange={handleCallInputChange}
                            disabled={!isMyTurn}
                            className="h-8 w-full text-center text-white bg-transparent border-2 border-white rounded-md"
                        />
                        <ActionButton
                            label="Call"
                            onClick={() => handleCall(callInput)}
                            disabled={!isMyTurn || callInput <= 0}

                        />
                    </div>

                    {/* Raise */}
                    <div className="flex flex-col items-center w-28">
                        <InputNumber
                            min={minRaiseAmount}
                            value={raiseInput}
                            onChange={handleRaiseInputChange}
                            disabled={!isMyTurn}
                            className="h-8 w-full text-center text-white bg-transparent border-2 border-white rounded-md"
                        />
                        <ActionButton
                            label="Raise"
                            onClick={() => handleRaise(raiseInput)}
                            disabled={!isMyTurn || raiseInput < minRaiseAmount}

                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InGameLayout;