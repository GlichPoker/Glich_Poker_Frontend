// components/game/actionButton.tsx

import { Button } from 'antd';

type Props = {
    label: string;
    disabled?: boolean;
    onClick?: () => void;
};

const ActionButton = ({ label, onClick, disabled }: Props) => {
    return (
        <Button
            type="primary"
            className="w-[120px] !font-bold"
            onClick={onClick}
            disabled={disabled}
        >
            {label}
        </Button>
    );
};

export default ActionButton;