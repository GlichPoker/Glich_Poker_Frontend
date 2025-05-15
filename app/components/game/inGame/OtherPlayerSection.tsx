import React from "react";
import OtherPlayerSeat from "@/components/game/otherPlayerSeat";
import { RoundModel, Card as CardType } from "@/types/round"; // Ensure CardType is imported for BluffModel

interface BluffModel {
    userId: number;
    bluffCard: CardType;
}

interface OtherPlayerSectionProps {
    side: "left" | "right";
    otherPlayers: any[];
    roundModel?: RoundModel;
    activeBluff?: BluffModel | null;
    weatherType?: "SUNNY" | "RAINY" | "SNOWY" | "CLOUDY" | "DEFAULT";
}

const OtherPlayerSection = ({
    side,
    otherPlayers,
    roundModel,
    activeBluff,
    weatherType,
}: OtherPlayerSectionProps) => {
    const positions = side === 'left'
        ? [1, 0]
        : [2, 3];

    return (
        <div className="flex flex-col items-center space-y-8">
            {positions.map((i) => {
                const player = otherPlayers[i];
                const roundPlayer = roundModel?.otherPlayers?.[i];
                return player ? (
                    <OtherPlayerSeat
                        key={i}
                        player={player}
                        roundPlayer={roundPlayer}
                        activeBluff={activeBluff}
                        weatherType={weatherType}
                    />
                ) : null;
            })}
        </div>
    );
};

export default OtherPlayerSection;