import { Avatar } from 'antd';
import type { Player } from '@/types/game';

type Props = {
    player?: Player;
    positionLabel: string;
};

const OtherPlayerSeat = ({ player, positionLabel }: Props) => {
    return (
        <div className="bg-black bg-opacity-70 rounded-lg p-4 border-2 border-gray-500 min-w-40 min-h-28 flex flex-col items-center text-white">
            <div className="font-bold text-sm mb-1">{positionLabel}</div>
            {player ? (
                <>
                    <Avatar
                        style={{ backgroundColor: player.active ? '#00cf48' : '#b6b8ba' }}
                        size="large"
                    >
                        {player.name?.charAt(0).toUpperCase() || 'P'}
                    </Avatar>
                    <div className="font-bold mt-2">{player.name}</div>
                    <div className="text-xs mt-1">
                        Balance: {player.balance ?? 0} | Bet: {player.roundBet ?? 0}
                    </div>
                    <div className="text-xs mt-1">{player.online ? 'Online' : 'Offline'}</div>
                    <div className="text-xs mt-1">
                        {player.hand?.map((card, idx) => (
                            <span key={idx}>
                                {card?.rank ?? '?'}{card?.suit ?? '?'}{' '}
                            </span>
                        ))}
                    </div>
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