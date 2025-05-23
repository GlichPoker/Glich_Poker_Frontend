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
            const winnerName = winner?.name || `Player ${userId}`;
            const winnerEvaluationResult = winner?.evaluationResult;
            return {winnerName, winnerEvaluationResult}
        });
    const secondResult = winners[0].winnerName != winningModel.player.name ? <><p className="text-base">
        My Hand: {winningModel.player.evaluationResult?.handRank ?? "Unknown"}
    </p>

    <div className="flex justify-center gap-2">
        {winningModel.player.evaluationResult.actualHand.filter((card) => card !== null)
            .map((card, i) => (
                <img
                    key={i}
                    src={`https://deckofcardsapi.com/static/img/${card.cardCode}.png`}
                    alt={card.cardCode}
                    className="h-20 w-auto rounded"
                />
            ))}
    </div></> : <></>;

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
                    {winners[0].winnerName == winningModel.player.name ? "You" : winners[0].winnerName} won the pot of
                    ${winningModel.potSize}!
                </p>

                <p className="text-base">
                    {winners[0].winnerName == winningModel.player.name ? "Your" : "Winning"} Hand: {winners[0].winnerEvaluationResult?.handRank ?? "Unknown"}
                </p>

                <div className="flex justify-center gap-2">
                    {typeof winners[0].winnerEvaluationResult !== "undefined" ? (
                        winners[0].winnerEvaluationResult?.actualHand
                            ?.filter((card) => card !== null)
                            .map((card, i) => (
                                <img
                                    key={i}
                                    src={`https://deckofcardsapi.com/static/img/${card.cardCode}.png`}
                                    alt={card.cardCode}
                                    className="h-20 w-auto rounded"
                                />
                            ))
                    ) : (
                        "Unknown"
                    )}
                </div>

                {secondResult}
            </div>
        </Modal>
    );
};

export default WinnerModal;