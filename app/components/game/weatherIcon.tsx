type WeatherIconProps = {
    weatherType: "SUNNY" | "RAINY" | "SNOWY" | "CLOUDY";
};

export default function WeatherIcon({ weatherType }: WeatherIconProps) {
    const iconMap: Record<WeatherIconProps["weatherType"], string> = {
        SUNNY: "☀️",
        RAINY: "☔",
        SNOWY: "❄️",
        CLOUDY: "☁️",
    };

    return (
        <div>
            <span className="text-3xl">{iconMap[weatherType]}</span>
        </div>
    );
}