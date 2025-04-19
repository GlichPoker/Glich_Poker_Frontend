import { Avatar } from 'antd';
import type { Player } from '@/types/game';
import { RoundPlayer } from '@/types/round';
import Card from './card';

type Props = {
    player?: Player;
    positionLabel: string;
    roundPlayer?: RoundPlayer;
    isRoundOver?: boolean;
};

const OtherPlayerSeat = ({ player, positionLabel, roundPlayer, isRoundOver = false }: Props) => {
    // Use roundPlayer data if available, otherwise fall back to player data
    const playerData = roundPlayer || player;
    
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
                    <div className="text-xs mt-1">{playerData.online ? 'Online' : 'Offline'}</div>
                    
                    {/* Show actual cards if round is over and we have roundPlayer data */}
                    {roundPlayer?.hand && roundPlayer.hand.length > 0 && (
                        <div className="mt-2 flex justify-center">
                            {isRoundOver ? (
                                // Show actual cards when the round is over
                                roundPlayer.hand.map((card, i) => (
                                    <Card
                                        key={i}
                                        cardCode={card.cardCode}
                                        width={60}
                                        height={90}
                                        className={i === 0 ? "mr-1" : ""}
                                    />
                                ))
                            ) : (
                                // Show card backs during active gameplay
                                <>
                                    <Card
                                        cardCode=""
                                        width={60}
                                        height={90}
                                        className="mr-1"
                                    />
                                    <Card
                                        cardCode=""
                                        width={60}
                                        height={90}
                                    />
                                </>
                            )}
                        </div>
                    )}
                    
                    {/* Fallback to show card backs for regular player data */}
                    {!roundPlayer?.hand && player?.hand && player.hand.length > 0 && (
                        <div className="mt-2 flex justify-center">
                            <Card
                                cardCode=""
                                width={60}
                                height={90}
                                className="mr-1"
                            />
                            <Card
                                cardCode=""
                                width={60}
                                height={90}
                            />
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