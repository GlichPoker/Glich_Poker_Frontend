import { Tooltip } from "antd";
import React from "react";

type WeatherType = "SUNNY" | "RAINY" | "SNOWY" | "CLOUDY" | "DEFAULT";

type WeatherIconProps = {
    weatherType: WeatherType;
};

export default function WeatherIcon({ weatherType }: WeatherIconProps) {
    const iconMap: Record<WeatherType, string> = {
        SUNNY: "☀️",
        RAINY: "☔",
        SNOWY: "❄️",
        CLOUDY: "☁️",
        DEFAULT: "♠️",
    };

    const descriptionMap: Record<WeatherType, string> = {
        SUNNY: "A desert mirage plays tricks on the mind. Once every 5 rounds, you may bluff with a fake or real card. The big blind also increases by 5% every third round.",
        RAINY: "Slippery hands lead to mistakes. Once per round, you may exchange one card from your hand.",
        SNOWY: "A blanket keeps you warm. You receive 3 hand cards instead of the usual 2.",
        CLOUDY: "Fog of war obscures the field. Two community cards stay hidden until the showdown.",
        DEFAULT: "Weathet-based rules are not applied"
    };

    return (
        <Tooltip placement="bottom" title={descriptionMap[weatherType]} color="gray">
            <div>
                <span className="text-3xl">{iconMap[weatherType]}</span>
            </div>
        </Tooltip>
    );
}