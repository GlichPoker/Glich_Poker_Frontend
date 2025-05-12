// components/game/inGame/PokerTable.tsx

import React from "react";
import { Card } from "@/types/round";

interface PokerTableProps {
    weatherType?: "SUNNY" | "RAINY" | "SNOWY" | "CLOUDY";
    communityCards?: Card[];
    potSize?: number;
}

const getTableImage = (weatherType?: string) => {
    if (!weatherType) return "/images/tables/green-table.jpg";

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

const PokerTable: React.FC<PokerTableProps> = ({ weatherType, communityCards, potSize }) => {
    return (
        <div className="relative">
            <div className="absolute top-[40px] left-1/2 transform -translate-x-1/2 w-[900px] h-[400px] z-30">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className="relative w-full h-full flex items-center justify-center"
                        style={{
                            clipPath: "ellipse(50% 50% at 50% 50%)",
                            background: "#8B4513",
                        }}
                    >
                        <div
                            className="w-[calc(100%-16px)] h-[calc(100%-16px)]"
                            style={{
                                clipPath: "ellipse(50% 50% at 50% 50%)",
                                overflow: "hidden",
                            }}
                        >
                            <img
                                src={getTableImage(weatherType)}
                                alt="Poker Table"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {communityCards && communityCards.length > 0 && (
                    <div className="absolute top-[170px] left-1/2 transform -translate-x-1/2 -translate-y-[120%] z-20 flex justify-center gap-1">
                        {communityCards.map((card, i) => (
                            <img
                                key={i}
                                src={`https://deckofcardsapi.com/static/img/${card.cardCode}.png`}
                                alt={card.cardCode}
                                className="!h-24 w-auto rounded shadow-lg"
                            />
                        ))}
                    </div>
                )}

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <p className="text-2xl font-bold text-white drop-shadow-lg">Pot: ${potSize}</p>
                </div>
            </div>
        </div>
    );
};

export default PokerTable;