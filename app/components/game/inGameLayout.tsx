"use client"
import React, { useState, useEffect } from 'react';
import { Button, InputNumber, Badge, notification, Tooltip } from 'antd';
import Vote from '@/components/game/voting/vote';
import MySeat from '@/components/game/mySeat';
import ActionButton from '@/components/game/actionButton';
import SpecialActionButton from './specialActionButton';
import { RoundModel, Card } from '@/types/round';
import { useActionHandlers } from '@/hooks/useActionHandlers';
import { WinningModel } from '@/types/winning';
import "@ant-design/v5-patch-for-react-19";
import { getApiDomain } from '@/utils/domain';
import MirageAction from './specialactions/Mirage';
import { useSpecialActions } from "@/hooks/useSpecialActions";
import HandRankingsDrawer from "@/components/game/inGame/HandRankingsDrawer";
import WinnerModal from "@/components/game/inGame/WinnerModal";
import OtherPlayerSection from "@/components/game/inGame/OtherPlayerSection";
import PokerTable from "@/components/game/inGame/PokerTable";
import SlipperyCardModal from './specialactions/SlipperyCardModal';
import WeatherIcon from "@/components/game/weatherIcon";

interface BluffModel {
    userId: number;
    bluffCard: Card;
}

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
    customRuleText: string | null;
    weatherType?: "SUNNY" | "RAINY" | "SNOWY" | "CLOUDY";
    bluffModel?: BluffModel | null;
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
    customRuleText,
    weatherType,
    bluffModel,
}: InGameLayoutProps) => {
    const isMyTurn = roundModel?.playersTurnId === currentPlayer?.userId;

    // Function to get the appropriate table image based on the weather type
    const getTableImage = () => {
        if (!weatherType) return "/images/tables/green-table.jpg"; // Default table

        switch (weatherType) {
            case "SUNNY":
                return "/images/tables/SUNNY.png";
            case "RAINY":
                return "/images/tables/RAINY.png";
            case "SNOWY":
                return "/images/tables/SNOWY.png";
            case "CLOUDY":
                return "/images/tables/CLOUDY.png";
            default:
                return "/images/tables/green-table.jpg";
        }
    };

    const weatherSpecialActions: Partial<Record<string, string>> = {
        "SUNNY": "Mirage",
        "RAINY": "Swap Card",
        // Add more weather types with special actions as needed
    };

    const allRoundBets = roundModel
        ? [...(roundModel.otherPlayers?.map(p => p.roundBet) ?? []), roundModel.player?.roundBet ?? 0]
        : [];
    const highestBet = allRoundBets.length > 0 ? Math.max(...allRoundBets) : 0;
    const callAmount = Math.max(0, highestBet - (roundModel?.player?.roundBet ?? 0));

    const [callInput, setCallInput] = useState(callAmount);
    const [raiseInput, setRaiseInput] = useState<number>(callAmount + 1);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showMiragePopup, setShowMiragePopup] = useState(false);
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [showSwapButton, setShowSwapButton] = useState(false);

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


    const rankImageMap: Record<string, string> = {
        HIGHCARD: "/images/handRank/HIGHCARD.png",
        ONEPAIR: "/images/handRank/ONEPAIR.png",
        TWOPAIR: "/images/handRank/TWOPAIR.png",
        THREEOFKIND: "/images/handRank/THREEOFKIND.png",
        STRAIGHT: "/images/handRank/STRAIGHT.png",
        FLUSH: "/images/handRank/FLUSH.png",
        FULLHOUSE: "/images/handRank/FULLHOUSE.png",
        FOUROFKIND: "/images/handRank/FOUROFKIND.png",
        STRAIGHTFLUSH: "/images/handRank/STRAIGHTFLUSH.png",
        ROYALFLUSH: "/images/handRank/ROYALFLUSH.png",
    };

    const lowerRule = customRuleText?.toLowerCase() || "";
    let handRankOrder: string[];

    if (lowerRule.includes("custom") && roundModel?.gameSettings?.order) {
        handRankOrder = roundModel.gameSettings.order;
    } else if (lowerRule.includes("reverse")) {
        handRankOrder = [...defaultOrder].reverse();
    } else {
        handRankOrder = defaultOrder;
    }

    const token = localStorage.getItem("token");

    const { handleSpecialAction,
        handleBluffCardSelected,
        canSwap,
        consumeSwap, } = useSpecialActions({
            lobbyId,
            currentUser,
            setError,
            weatherType,
            roundModel,
        });

    // For API calls that need authentication
    const userForAuth = currentUser && token ? {
        id: currentUser.id,
        token: token
    } : null;

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

    useEffect(() => {
        if (canSwap) {
            setShowSwapButton(true);
        }
    }, [canSwap]);

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
        currentUser: currentPlayer && token ? {
            id: currentPlayer.userId,
            token: token
        } : null,
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
    const handleSwapCardClick = () => {
        setShowSwapButton(false);
        setShowSwapModal(true);
        consumeSwap();
    };
    return (
        <div className="flex flex-col w-full h-auto">
            <nav className="flex flex-row h-14 justify-between items-center bg-[#181818] px-4">
                {/* Left: Logo */}
                <div className="text-sm text-gray-500">
                    <span className="text-lg font-bold">Glitch Poker</span>
                </div>

                {/* Right: Controls */}
                <div className="flex flex-row space-x-4">
                    {weatherType && <WeatherIcon weatherType={weatherType} />}
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
                        onClick={() => setIsDrawerOpen(true)}
                    >
                        Hand Rankings
                    </Button>
                </div>
            </nav>

            <Vote
                isVisible={showVoteOverlay}
                onClose={() => setShowVoteOverlay(false)}
                lobbyId={lobbyId}
            />

            <div className="bg-[url('/images/poker-table.jpg')] bg-cover bg-center relative min-h-screen text-white">
                <div className="flex flex-row w-full pt-20 pb-8">
                    {/* Left section */}
                    <div className="w-[33.33%] flex justify-center">
                        <OtherPlayerSection
                            side="left"
                            otherPlayers={otherPlayers}
                            roundModel={roundModel}
                            activeBluff={bluffModel}
                        />
                    </div>

                    {/* Center section */}
                    <div className="w-[33.33%] flex flex-col items-center  space-y-2 text-center">
                        <p className="!mb-20 !mt-10">{customRuleText}</p>

                        {/* Main container with relative positioning for overlay effect */}
                        <div className="relative w-full flex justify-center">
                            {/* 
      // Weather Window (currently not used)
      <div className="relative w-[600px] h-[300px] rounded-lg overflow-hidden border-4 border-[#8B4513] shadow-lg">
        <div className="absolute inset-0 border-8 border-[#6b4612] z-10 pointer-events-none">
          <div className="absolute top-0 bottom-0 left-1/2 w-3 bg-[#6b4612] transform -translate-x-1/2"></div>
          <div className="absolute left-0 right-0 top-1/2 h-3 bg-[#6b4612] transform -translate-y-1/2"></div>
        </div>
        
        <div className="w-full h-full">
          {weatherType && (
            <img 
              src={`/images/weather/${weatherType}.gif`} 
              alt={`${weatherType} weather`}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>
      */}

                            {/* Poker Table */}
                            <PokerTable
                                weatherType={weatherType}
                                communityCards={roundModel?.communityCards}
                                potSize={roundModel?.potSize}
                            />
                        </div>
                    </div>

                    {/* Right section */}
                    <div className="w-[33.33%] flex justify-center">
                        <OtherPlayerSection
                            side="right"
                            otherPlayers={otherPlayers}
                            roundModel={roundModel}
                            activeBluff={bluffModel}
                        />
                    </div>
                </div>



                {/* Player container */}
                <div className="absolute bottom-32 left-0 right-0 flex justify-center z-50">
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
                <div className="absolute bottom-10 w-full flex justify-evenly items-end z-50">
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

                    {weatherType && weatherSpecialActions[weatherType] && (
                        <div className="flex flex-col items-center w-28">
                            <div className="w-full">
                                <SpecialActionButton
                                    label={weatherSpecialActions[weatherType] || "Special Action"}
                                    onClick={() => {
                                        if (weatherType === "RAINY") {
                                            if (showSwapButton) {
                                                handleSwapCardClick();
                                            } else {
                                                notification.warning({
                                                    message: "Swap Unavailable",
                                                    description: "You have already used your swap this round.",
                                                    placement: "top",
                                                });
                                            }
                                        } else {
                                            handleSpecialAction(weatherType, () => setShowMiragePopup(true), () => handleSwapCardClick());
                                        }
                                    }}
                                    disabled={!isMyTurn || (weatherType === "RAINY" && !showSwapButton)}
                                    weatherType={weatherType}
                                />
                            </div>
                        </div>
                    )}

                </div>

                {/* Mirage Action Popup */}
                {
                    showMiragePopup && roundModel && currentUser && (
                        <MirageAction
                            isVisible={showMiragePopup}
                            onClose={() => setShowMiragePopup(false)}
                            onSelectCard={(card) => handleBluffCardSelected(card, () => setShowMiragePopup(false))}
                            handCards={roundModel.player?.hand || []}
                            playerId={currentUser.id}
                            sessionId={parseInt(lobbyId.toString(), 10)}
                            token={token || ''}
                        />
                    )
                }

                {/* Winner presentation modal */}
                <WinnerModal
                    isVisible={isModalVisible}
                    onClose={handleModalClose}
                    winningModel={winningModel ?? null}
                />
                <HandRankingsDrawer
                    open={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    handRankOrder={handRankOrder}
                    rankImageMap={rankImageMap}
                    lowerRule={lowerRule}
                />
                {/* RANIY - slippery card(swap hand cards) */}
                <SlipperyCardModal
                    isVisible={showSwapModal}
                    onClose={() => setShowSwapModal(false)}
                    handCards={roundModel?.player?.hand || []}
                    playerId={currentUser?.id || 0}
                    sessionId={parseInt(lobbyId, 10)}
                    token={token || ""}
                    onSwapped={(newHand) => {
                        setRoundModel(prev => prev ? ({ ...prev, player: { ...prev.player, hand: newHand } }) : null);
                    }}
                />
            </div>
        </div >
    );
};

export default InGameLayout;