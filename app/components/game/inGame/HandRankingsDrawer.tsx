import React from "react";
import { Drawer } from "antd";

interface HandRankingsDrawerProps {
    open: boolean;
    onClose: () => void;
    handRankOrder: string[];
    rankImageMap: Record<string, string>;
    lowerRule: string;
}

const HandRankingsDrawer: React.FC<HandRankingsDrawerProps> = ({
    open,
    onClose,
    handRankOrder,
    rankImageMap,
    lowerRule,
}) => {
    return (
        <Drawer
            title="Poker Hand Rankings"
            placement="right"
            width={360}
            onClose={onClose}
            open={open}
        >
            <div className="flex flex-col items-center space-y-4">
                {handRankOrder.map((rank) => (
                    <div key={rank} className="w-full text-center">
                        <img
                            src={rankImageMap[rank]}
                            alt={rank}
                            className="w-full max-w-[300px] mx-auto rounded shadow"
                        />
                    </div>
                ))}
                <p className="mt-4 text-gray-500 text-sm italic">
                    {lowerRule.includes("custom")
                        ? "Custom rule applied"
                        : lowerRule.includes("reverse")
                            ? "Reverse rule applied: High Card is strongest"
                            : "Standard rule applied: Royal Flush is strongest"}
                </p>
            </div>
        </Drawer>
    );
};

export default HandRankingsDrawer;