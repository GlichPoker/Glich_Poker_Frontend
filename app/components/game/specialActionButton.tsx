import React from 'react';
import { Button } from 'antd';

interface Props {
    label: string;
    onClick: () => void;
    disabled: boolean;
    weatherType?: "SUNNY" | "RAINY" | "SNOWY" | "CLOUDY";
}

const SpecialActionButton: React.FC<Props> = ({ label, onClick, disabled, weatherType }) => {
    // disabled button style
    const disabledStyle: React.CSSProperties = {
        backgroundColor: '#4d4d4d',
        color: '#ffffff',
        borderColor: '#4d4d4d',
        cursor: 'not-allowed',
        width: '120px',
    };

    // Get the background color based on weather type
    const getWeatherColor = (): string => {
        switch (weatherType) {
            case "SUNNY":
                return '#ffd700'; // gold
            case "RAINY":
                return '#0077be'; // blue
            case "SNOWY":
                return '#f5f5f5'; // white
            case "CLOUDY":
                return '#708090'; // slate gray
            default:
                return '#9f0712'; // default red
        }
    };

    // button style
    const enabledStyle: React.CSSProperties = {
        backgroundColor: getWeatherColor(),
        color: weatherType === "SNOWY" ? '#333333' : '#ffffff', // darker text for white background
        borderColor: getWeatherColor(),
        cursor: 'pointer',
        width: '120px',
    };

    return (
        <Button
            onClick={onClick}
            disabled={disabled}
            style={disabled ? disabledStyle : enabledStyle}
            type="primary"
        >
            {label}
        </Button>
    );
};

export default SpecialActionButton;