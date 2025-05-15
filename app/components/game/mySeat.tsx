import React from 'react';
import { Avatar } from 'antd';
import Card from './card';
import { RoundPlayer } from '@/types/round';

type Player = {
    name?: string;
    balance?: number;
    roundBet?: number;
    hand?: { suit: string; rank: string }[];
};

interface Props {
    player?: Player;
    username?: string;
    roundPlayer?: RoundPlayer;
}

const MySeat: React.FC<Props> = ({ player, username, roundPlayer }) => {
    // Use roundPlayer data if available, otherwise fall back to player data
    const displayName = roundPlayer?.name || player?.name || username || '';
    const balance = roundPlayer?.balance ?? player?.balance ?? 0;
    const roundBet = roundPlayer?.roundBet ?? player?.roundBet ?? 0;

    const avatarChar = displayName.trim().length > 0
        ? displayName.charAt(0).toUpperCase()
        : '?';

    return (
        <div className="bg-black bg-opacity-70 rounded-lg p-6 border-2 border-red-800 min-w-80">
            <div className="flex items-center">
                <Avatar style={{ backgroundColor: '#f56a00', marginRight: '8px' }} size="large">
                    {avatarChar}
                </Avatar>
                <div>
                    <div className="text-white font-bold text-xl">
                        {displayName || 'My Seat'}
                    </div>
                    <div className="text-red-700 text-sm">Me</div>
                    <div className="text-white text-sm mt-1">
                        Balance: {balance} | Bet: {roundBet}
                    </div>
                </div>
            </div>

            {/* Display cards from roundPlayer if available */}
            {roundPlayer?.hand && roundPlayer.hand.length > 0 && (
                <div className="mt-4 flex justify-center">
                    {roundPlayer.hand
                        .filter(card => card !== null)
                        .map((card, i) => (
                            <Card
                                key={i}
                                cardCode={card.cardCode}
                                className={i === 0 ? "mr-2" : ""}
                            />
                        ))}
                </div>
            )}

            {/* Fallback to player hand if roundPlayer not available */}
            {!roundPlayer?.hand && player?.hand && (
                <div className="mt-4 flex justify-center">
                    {player.hand.map((card, i) => (
                        <span key={i} className="text-white text-sm">
                            {card?.rank ?? ''}{card?.suit ?? ''}{' '}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MySeat;