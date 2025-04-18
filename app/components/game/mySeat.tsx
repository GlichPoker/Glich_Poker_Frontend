

import React from 'react';
import { Avatar } from 'antd';

type Card = {
    rank: string;
    suit: string;
};

type Player = {
    name?: string;
    balance?: number;
    roundBet?: number;
    hand?: Card[];
};

interface Props {
    player?: Player;
    username?: string;
}

const MySeat: React.FC<Props> = ({ player, username }) => {
    return (
        <div className="bg-black bg-opacity-70 rounded-lg p-6 border-2 border-red-800 min-w-60">
            <div className="flex items-center">
                <Avatar style={{ backgroundColor: '#f56a00', marginRight: '8px' }} size="large">
                    {username?.charAt(0).toUpperCase() || '?'}
                </Avatar>
                <div>
                    <div className="text-white font-bold text-xl">
                        {player?.name || username || 'My Seat'}
                    </div>
                    <div className="text-red-700 text-sm">Me</div>
                    {player && (
                        <div className="text-white text-sm mt-1">
                            Balance: {player.balance ?? 0} | Bet: {player.roundBet ?? 0}
                        </div>
                    )}
                </div>
            </div>
            {player?.hand && (
                <div className="mt-2 text-white text-sm">
                    Hand: {player.hand.map((card, i) => (
                        <span key={i}>{card?.rank ?? '?'}{card?.suit ?? '?'}{' '} </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MySeat;