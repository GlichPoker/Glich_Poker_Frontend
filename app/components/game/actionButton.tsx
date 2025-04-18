import React from 'react';
import { Button } from 'antd';

interface Props {
    label: string;
    onClick: () => void;
    disabled: boolean;
}

const ActionButton: React.FC<Props> = ({ label, onClick, disabled }) => {
    // disabled button stayle
    const disabledStyle: React.CSSProperties = {
        backgroundColor: '#4d4d4d',
        color: '#ffffff',
        borderColor: '#4d4d4d',
        cursor: 'not-allowed',
        width: '120px',
    };

    // button style
    const enabledStyle: React.CSSProperties = {
        backgroundColor: '#9f0712',
        color: '#ffffff',
        borderColor: '#9f0712',
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

export default ActionButton;