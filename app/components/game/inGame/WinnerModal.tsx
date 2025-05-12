import React from "react";
import { Modal, Button } from "antd";
import { WinningModel } from "@/types/winning";

interface WinnerModalProps {
    isVisible: boolean;
    onClose: () => void;
    winningModel: WinningModel | null;
}

const WinnerModal: React.FC<WinnerModalProps> = ({
    isVisible,
    onClose,
    winningModel,
}) => {
    if (!winningModel) return null;

    const winners = Object.entries(winningModel.winnings)
        .filter(([_, amount]) => amount > 0)
        .map(([userId]) => {
            const winner = [winningModel.player, ...winningModel.otherPlayers].find(
                (p) => p.userId === parseInt(userId)
            );
            return winner?.name || `Player ${userId}`;
        })
        .join(", ");

    return (
        <Modal
            title="🏆 Round Result"
            open={isVisible}
            onCancel={onClose}
            footer={[
                <Button key="ok" type="primary" onClick={onClose}>
                    OK
                </Button>,
            ]}
            destroyOnClose
        >
            <div className="text-center space-y-4">
                <p className="text-lg font-semibold">
                    {winners} won the pot of ${winningModel.potSize}!
                </p>

                <p className="text-base">
                    My Hand: {winningModel.player.evaluationResult?.handRank ?? "Unknown"}
                </p>

                <div className="flex justify-center gap-2">
                    {winningModel.player.hand
                        .filter((card) => card !== null)
                        .map((card, i) => (
                            <img
                                key={i}
                                src={`https://deckofcardsapi.com/static/img/${card.cardCode}.png`}
                                alt={card.cardCode}
                                className="h-20 w-auto rounded"
                            />
                        ))}
                </div>
            </div>
        </Modal>
    );
};

export default WinnerModal;