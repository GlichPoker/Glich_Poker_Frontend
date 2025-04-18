export interface Player {
    userId: number;
    name: string;
    balance: number;
    hand: { suit: string; rank: string }[];
    roundBet: number;
    active: boolean;
    online: boolean;
}

export interface GameModel {
    event: 'GAMEMODEL';
    sessionId: number;
    players: Player[];
    round: {
        players: Player[];
        playersTurn: number;
        startPlayer: number;
        gameSettings: {
            initialBalance: number;
            smallBlind: number;
            bigBlind: number;
        };
    };
    settings: {
        initialBalance: number;
        smallBlind: number;
        bigBlind: number;
    };
    ownerId: number;
    currentRoundStartPlayer: number;
}