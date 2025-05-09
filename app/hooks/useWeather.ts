import { useEffect, useState } from "react";

export default function useWeather(
    coords?: { latitude: number; longitude: number }
) {
    const [location, setLocation] = useState(coords ?? null);
    const [weather, setWeather] = useState<{
        temperature: number;
        precipitation: number;
        cloudCover: number;
        rain: number;
        snowfall: number;
    } | null>(null);

    const [weatherType, setWeatherType] = useState<string | null>(null);
    const [emoji, setEmoji] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const weatherEmojiMap: Record<string, string> = {
        SUNNY: "☀️",
        RAINY: "☔",
        SNOWY: "❄️",
        CLOUDY: "☁️",
    };

    useEffect(() => {
        if (!coords && typeof window !== "undefined" && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (err) => {
                    console.error("Geolocation error:", err);
                    setError(err.message);
                }
            );
        }
    }, [coords]);

    useEffect(() => {
        const fetchWeather = async () => {
            if (!location) return;

            const params = new URLSearchParams({
                latitude: location.latitude.toString(),
                longitude: location.longitude.toString(),
                hourly: "temperature_2m",
                current:
                    "is_day,temperature_2m,precipitation,weather_code,cloud_cover,rain,showers,snowfall",
                forecast_days: "1",
            });

            const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

            try {
                const res = await fetch(url);
                const data = await res.json();

                const current = {
                    temperature: data.current.temperature_2m,
                    precipitation: data.current.precipitation,
                    cloudCover: data.current.cloud_cover,
                    rain: data.current.rain,
                    snowfall: data.current.snowfall,
                };
                console.log("current weather", current)
                setWeather(current);

                const type = getWeatherType(current);
                setWeatherType(type);
                setEmoji(weatherEmojiMap[type]);
            } catch (err) {
                console.error("Failed to fetch weather data:", err);
            }
        };

        fetchWeather();
    }, [location]);

    function getWeatherType({
        rain,
        snowfall,
        cloudCover,
    }: {
        rain: number;
        snowfall: number;
        cloudCover: number;
    }): string {
        if (rain >= 1) return "RAINY";
        if (snowfall >= 1) return "SNOWY";
        if (cloudCover >= 50) return "CLOUDY";
        return "SUNNY";
    }

    return {
        weather,
        weatherType,
        emoji,
        loading: !weather && !!location,
        error,
    };
}