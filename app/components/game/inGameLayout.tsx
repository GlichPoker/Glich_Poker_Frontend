"use client"
import React, { useState, useEffect } from 'react';
import { Button, InputNumber, Badge, notification } from 'antd';
import Vote from '@/components/game/voting/vote';
import MySeat from '@/components/game/mySeat';
import OtherPlayerSeat from '@/components/game/otherPlayerSeat';
import ActionButton from '@/components/game/actionButton';
import { RoundModel } from '@/types/round';
import { useActionHandlers } from '@/hooks/useActionHandlers';
import { Modal } from 'antd';
import { WinningModel } from '@/types/winning';
import "@ant-design/v5-patch-for-react-19";
import { getApiDomain } from '@/utils/domain';

const baseURL = getApiDomain();

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
    // handleExitGame: () => void;
    error: string | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    setWinningModel: React.Dispatch<React.SetStateAction<WinningModel | null>>;
    setRoundModel: React.Dispatch<React.SetStateAction<RoundModel | null>>;
    setPlayerCount?: (count: number) => void;
    winningModel?: WinningModel | null;
    currentUser: { id: number; username: string; token: string } | null;

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
    // handleExitGame,
    error,
    setError,
    setWinningModel,
    setRoundModel,
    setPlayerCount,
    winningModel,
    currentUser,
}: InGameLayoutProps) => {
    const isMyTurn = roundModel?.playersTurnId === currentPlayer?.userId;

    const allRoundBets = roundModel
        ? [...(roundModel.otherPlayers?.map(p => p.roundBet) ?? []), roundModel.player?.roundBet ?? 0]
        : [];
    const highestBet = allRoundBets.length > 0 ? Math.max(...allRoundBets) : 0;
    const callAmount = Math.max(0, highestBet - (roundModel?.player?.roundBet ?? 0));

    const [callInput, setCallInput] = useState(callAmount);
    const [raiseInput, setRaiseInput] = useState<number>(callAmount + 1);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const token = localStorage.getItem("token");

    // winner modal
    useEffect(() => {
        if (winningModel) {
            setIsModalVisible(true);
        }
    }, [winningModel]);

    // send the number of players to upper component
    useEffect(() => {
        if (setPlayerCount) {
            const totalPlayers = 1 + (otherPlayers?.length || 0);
            setPlayerCount(totalPlayers);
        }
    }, [currentPlayer, otherPlayers, setPlayerCount]);

    useEffect(() => {
        setCallInput(callAmount);
    }, [callAmount]);

    const handleCallInputChange = (value: number | null) => {
        setCallInput(value ?? 0);
    };

    const handleRaiseInputChange = (value: number | null) => {
        setRaiseInput(value ?? callAmount + 1);
    };

    const handleActionError = (message: string) => {
        setError(message);
    };

    const actionHandlers = useActionHandlers({
        lobbyId,
        currentUser: currentPlayer,
        setError: handleActionError
    });

    // Modal Handler
    const handleModalClose = async () => {
        setIsModalVisible(false);
        setWinningModel(null);
        setRoundModel(null);
        if (!currentUser) return;

        try {
            await fetch(`${baseURL}/game/readyForNextGame`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    sessionId: parseInt(lobbyId, 10),
                    userId: currentUser.id
                })
            });
        } catch (error) {
            console.error("Failed to notify server about next round readiness:", error);
        }
    };
    return (
        <div className="flex flex-col w-full h-auto">
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

            <div className="bg-[url('/images/poker-table.jpg')] bg-cover bg-center relative min-h-screen text-white">
                {/* Other players */}
                <div className="flex flex-row w-full pt-20 pb-8">
                    <div className="flex flex-col items-center w-[33.33%] space-y-8">
                        {otherPlayers.length > 1 && otherPlayers[1] && (
                            <OtherPlayerSeat
                                key={1}
                                player={otherPlayers[1]}
                                positionLabel="Top Left"
                                roundPlayer={roundModel?.otherPlayers?.[1]}
                            />
                        )}
                        {otherPlayers.length > 0 && otherPlayers[0] && (
                            <OtherPlayerSeat
                                key={0}
                                player={otherPlayers[0]}
                                positionLabel="Top Right"
                                roundPlayer={roundModel?.otherPlayers?.[0]}
                            />
                        )}
                    </div>

                    {/* Center */}
                    <div className="flex flex-col items-center justify-center w-[33.33%] text-center space-y-2">
                        <p className="text-2xl mt-4">Pot: ${roundModel?.potSize}</p>
                        {roundModel?.communityCards && roundModel.communityCards.length > 0 && (
                            <div className="flex justify-center !mt-6 gap-1">
                                {roundModel.communityCards.map((card, i) => (
                                    <img
                                        key={i}
                                        src={`https://deckofcardsapi.com/static/img/${card.cardCode}.png`}
                                        alt={card.cardCode}
                                        className="!h-32 w-auto rounded"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center w-[33.33%] space-y-8">
                        {otherPlayers.length > 2 && otherPlayers[2] && (
                            <OtherPlayerSeat
                                key={2}
                                player={otherPlayers[2]}
                                positionLabel="Bottom Left"
                                roundPlayer={roundModel?.otherPlayers?.[2]}
                            />
                        )}
                        {otherPlayers.length > 3 && otherPlayers[3] && (
                            <OtherPlayerSeat
                                key={3}
                                player={otherPlayers[3]}
                                positionLabel="Bottom Right"
                                roundPlayer={roundModel?.otherPlayers?.[3]}
                            />
                        )}
                    </div>
                </div>

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
                    <div className="flex flex-col items-center w-28">
                        <div className="w-full">
                            <ActionButton
                                label="Fold"
                                onClick={handleFold}
                                disabled={!isMyTurn}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center w-28">
                        <div className="w-full">
                            <ActionButton
                                label="Check"
                                onClick={handleCheck}
                                disabled={!isMyTurn}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center w-28">
                        <InputNumber
                            min={callAmount}
                            max={roundModel?.player?.balance ?? 0}
                            value={callInput}
                            onChange={handleCallInputChange}
                            disabled={!isMyTurn}
                            placeholder={`$${callAmount}`}
                            className="h-8 w-full text-center text-white bg-transparent border-2 border-white rounded-md mb-1"
                        />
                        <div className="w-full">
                            <ActionButton
                                label="Call"
                                onClick={() => handleCall(callInput)}
                                disabled={!isMyTurn || callInput <= 0}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center w-28">
                        <InputNumber
                            min={callAmount + 1}
                            onChange={handleRaiseInputChange}
                            disabled={!isMyTurn}
                            placeholder=""
                            className="h-8 w-full text-center text-white bg-transparent border-2 border-white rounded-md mb-1"
                        />
                        <div className="w-full">
                            <ActionButton
                                label="Raise"
                                onClick={() => {
                                    if (raiseInput < callAmount + 1) {
                                        notification.error({
                                            message: "Invalid Raise Amount",
                                            description: `Raise must be greater than $${callAmount}`,
                                            duration: 3,
                                        });
                                        return;
                                    }
                                    handleRaise(raiseInput);
                                }}
                                disabled={!isMyTurn || raiseInput < callAmount + 1}
                            />
                        </div>
                    </div>
                </div>

                {/* Winner presentation modal  */}
                <Modal
                    title="🏆 Round Result"
                    open={isModalVisible}
                    onCancel={handleModalClose}
                    footer={[
                        <Button key="ok" type="primary" onClick={handleModalClose}>
                            OK
                        </Button>
                    ]}
                    destroyOnClose={true}
                >
                    {winningModel && (
                        <div className="text-center space-y-4">
                            <p className="text-lg font-semibold">
                                {Object.entries(winningModel.winnings)
                                    .filter(([_, amount]) => amount > 0)
                                    .map(([userId]) => {
                                        const winner = [winningModel.player, ...winningModel.otherPlayers].find(p => p.userId === parseInt(userId));
                                        return winner?.name || `Player ${userId}`;
                                    })
                                    .join(", ")} won the pot of ${winningModel.potSize}!
                            </p>

                            <p className="text-base">
                                My Hand: {winningModel.player.evaluationResult?.handRank ?? "Unknown"}
                            </p>

                            <div className="flex justify-center gap-2">
                                {winningModel.player.hand
                                    .filter(card => card !== null)
                                    .map((card, i) => (
                                        <img
                                            key={i}
                                            src={`https://deckofcardsapi.com/static/img/${card.cardCode}.png`}
                                            alt={card.cardCode}
                                            className="h-20 w-auto rounded"
                                        />
                                    ))}
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default InGameLayout;