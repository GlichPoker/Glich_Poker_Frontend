// components/game/actionButton.tsx

import { Button } from 'antd';

type Props = {
    label: string;
    onClick?: () => void;
};

const ActionButton = ({ label, onClick }: Props) => {
    return (
        <Button
            type="primary"
            className="w-[120px] !font-bold"
            onClick={onClick}
        >
            {label}
        </Button>
    );
};

export default ActionButton;