

export type Card = {
    cardCode: string;
    rank: number;
    suit: 'CLUBS' | 'DIAMONDS' | 'HEARTS' | 'SPADES';
};

export type RoundPlayer = {
    userId: number;
    name: string;
    balance: number;
    online: boolean;
    active: boolean;
    roundBet: number;
    hand?: Card[];
};

export type GameSettings = {
    smallBlind: number;
    bigBlind: number;
    initialBalance: number;
};

export interface RoundModel {
    event: 'roundModel';
    gameSettings: GameSettings;
    player: RoundPlayer;
    otherPlayers: RoundPlayer[];
    communityCards: Card[];
    potSize: number;
    roundBet: number;
    playersTurn: number;
    playersTurnId: number;
    startPlayer: number;
    startPlayerId: number;
}