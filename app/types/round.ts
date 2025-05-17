

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
    totalBet: number;
    hand?: Card[];
    bluffCard?: Card; // Card shown for Mirage ability
};

export type GameSettings = {
    smallBlind: number;
    bigBlind: number;
    initialBalance: number;
    descending: boolean;
    order?: string[];
    password?:string;
    weatherType?:string;
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