import { Avatar } from 'antd';
import type { Player } from '@/types/game';
import { RoundPlayer, Card as CardType } from '@/types/round';
import Card from './card';

interface BluffModel {
    userId: number;
    bluffCard: CardType;
}

type Props = {
    player?: Player;
    positionLabel?: string;
    roundPlayer?: RoundPlayer;
    isRoundOver?: boolean;
    activeBluff?: BluffModel | null;
    weatherType?: "SUNNY" | "RAINY" | "SNOWY" | "CLOUDY" | "DEFAULT";
};

const OtherPlayerSeat = ({ player, positionLabel, roundPlayer, isRoundOver = false, activeBluff, weatherType }: Props) => {
    const playerData = roundPlayer || player;

    const showSingleSpecialBluff = roundPlayer?.bluffCard !== undefined && roundPlayer?.bluffCard !== null;
    const isPlayerMirageBluffing = activeBluff && playerData && activeBluff.userId === playerData.userId;

    return (
        <div className="bg-black bg-opacity-70 rounded-lg p-4 border-2 border-gray-500 min-w-40 min-h-28 flex flex-col items-center text-white">
            <div className="font-bold text-sm mb-1">{positionLabel}</div>
            {playerData ? (
                <>
                    <Avatar
                        style={{ backgroundColor: playerData.active ? '#00cf48' : '#b6b8ba' }}
                        size="large"
                    >
                        {playerData.name?.charAt(0).toUpperCase() || 'P'}
                    </Avatar>
                    <div className="font-bold mt-2">{playerData.name}</div>
                    <div className="text-xs mt-1">
                        Balance: {playerData.balance ?? 0} | Bet: {playerData.roundBet ?? 0}
                    </div>

                    {/* Card display area */}
                    {isPlayerMirageBluffing && activeBluff ? (
                        // Player is using Mirage: show bluff card + one card back
                        <div className="mt-2 flex justify-center relative">
                            <div className="absolute -top-5 left-0 right-0 text-xs text-yellow-300 font-bold text-center">
                                Mirage
                            </div>
                            <Card
                                cardCode={activeBluff.bluffCard.cardCode}
                                width={60}
                                height={90}
                                className="mr-1"
                            />
                            <Card
                                cardCode="" // Card back
                                width={60}
                                height={90}
                            />
                        </div>
                    ) : showSingleSpecialBluff && roundPlayer?.bluffCard ? (
                        // Original display for a single special bluff card
                        <div className="mt-2 flex justify-center relative">
                            <div className="absolute -top-5 left-0 right-0 text-xs text-yellow-300 font-bold text-center">
                                Showing card
                            </div>
                            <Card
                                cardCode={roundPlayer.bluffCard.cardCode}
                                width={70}
                                height={100}
                            />
                        </div>
                    ) : (roundPlayer?.hand && roundPlayer.hand.length > 0) ? (
                        // Not Mirage, not singleSpecialBluff: Show normal two cards (actuals or backs)
                        <div className="mt-2 flex justify-center">
                            {isRoundOver ? (
                                roundPlayer.hand
                                    .slice(0, weatherType === "SNOWY" ? 3 : 2)
                                    .map((card, i) => (
                                        <Card
                                            key={i}
                                            cardCode={card.cardCode}
                                            width={60}
                                            height={90}
                                            className={i < 2 ? "mr-1" : ""}
                                        />
                                    ))
                            ) : (
                                <>
                                    <Card cardCode="" width={60} height={90} className="mr-1" />
                                    <Card cardCode="" width={60} height={90} />
                                </>
                            )}
                        </div>
                    ) : (!roundPlayer?.hand || roundPlayer.hand.length === 0) && (player?.hand && player.hand.length > 0) ? (
                        // Fallback: Not Mirage, not singleSpecialBluff, no roundPlayer.hand, but has player.hand: Show two card backs
                        <div className="mt-2 flex justify-center">
                            <Card cardCode="" width={60} height={90} className="mr-1" />
                            <Card cardCode="" width={60} height={90} />
                        </div>
                    ) : (
                        // Default if not Mirage, not singleSpecialBluff, and no hand data for this player: show two card backs
                        <div className="mt-2 flex justify-center">
                            <Card cardCode="" width={60} height={90} className="mr-1" />
                            <Card cardCode="" width={60} height={90} />
                        </div>
                    )}
                </>
            ) : (
                <>
                    <Avatar style={{ backgroundColor: '#ccc' }} size="large">
                        ?
                    </Avatar>
                    <div className="text-gray-400 mt-2">Empty Seat</div>
                </>
            )}
        </div>
    );
};

export default OtherPlayerSeat;