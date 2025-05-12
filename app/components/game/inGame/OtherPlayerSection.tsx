import React from "react";
import OtherPlayerSeat from "@/components/game/otherPlayerSeat";
import { RoundModel } from "@/types/round";

interface OtherPlayerSectionProps {
    side: "left" | "right";
    otherPlayers: any[];
    roundModel?: RoundModel;
}

const OtherPlayerSection = ({
    side,
    otherPlayers,
    roundModel,
}: {
    side: 'left' | 'right';
    otherPlayers: any[];
    roundModel?: RoundModel;
}) => {
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
                    />
                ) : null;
            })}
        </div>
    );
};

export default OtherPlayerSection;