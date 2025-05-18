import React from 'react';
import { Button } from 'antd';

interface Props {
    label: string;
    onClick: () => void;
    disabled: boolean;
}

const ActionButton: React.FC<Props> = ({ label, onClick, disabled }) => {
    // disabled button style
    const disabledStyle: React.CSSProperties = {
        backgroundColor: '#4d4d4d',
        color: '#ffffff',
        borderColor: '#4d4d4d',
        cursor: 'not-allowed',
        width: '120px',
    };

    // enabled button style
    const enabledStyle: React.CSSProperties = {
        backgroundColor: '#9f0712',
        color: '#ffffff',
        borderColor: '#9f0712',
        cursor: 'pointer',
        width: '120px',
    };

    return (
        <Button
            onClick={(e) => {
                if (disabled) {
                    e.preventDefault();
                    return;
                }
                onClick();
            }}
            disabled={disabled}
            style={disabled ? disabledStyle : enabledStyle}
            type="primary"
        >
            {label}
        </Button>
    );
};

export default ActionButton;