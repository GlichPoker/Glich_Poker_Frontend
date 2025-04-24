export type Suit = 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';

export interface Card {
    cardCode: string;
    rank: number;
    suit: Suit;
}

export interface EvaluationResult {
    handRank: string;
    highCards: Card[];
}

export interface Player {
    userId: number;
    name: string;
    online: boolean;
    active: boolean;
    balance: number;
    roundBet: number;
    totalBet: number;
    hand: Card[];
    evaluationResult: EvaluationResult;
}

export interface GameSettings {
    initialBalance: number;
    smallBlind: number;
    bigBlind: number;
}

export interface WinningModel {
    event: 'WINNINGMODEL';
    communityCards: Card[];
    gameSettings: GameSettings;
    potSize: number;
    winnings: {
        [userId: number]: number;
    };
    player: Player;
    otherPlayers: Player[];
    playersTurn: number;
    playersTurnId: number;
    roundBet: number;
    startPlayer: number;
    startPlayerId: number;
}