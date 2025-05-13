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
}

const OtherPlayerSection = ({
    side,
    otherPlayers,
    roundModel,
    activeBluff,
}: OtherPlayerSectionProps) => {
    const positions = side === 'left'
        ? [1, 0] // LEFT SIDE PLAYERS
        : [2, 3]; // RIGHT SIDE PLAYERS

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
                        positionLabel={`Side ${i}`}
                        activeBluff={activeBluff} // Pass activeBluff to OtherPlayerSeat
                    />
                ) : null;
            })}
        </div>
    );
};

export default OtherPlayerSection;