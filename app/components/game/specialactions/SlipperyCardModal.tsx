import React, { useState } from "react";
import { Modal, Button, message } from "antd";
import { Card } from "@/types/round";
import { getApiDomain } from "@/utils/domain";

const baseURL = getApiDomain();

interface SlipperyCardModalProps {
    isVisible: boolean;
    onClose: () => void;
    handCards: Card[];
    playerId: number;
    sessionId: number;
    token: string;
    onSwapped: (newHand: Card[]) => void; // Callback with updated hand
}

export const rankToEnumName = (rank: number): string => {
    switch (rank) {
        case 2: return "TWO";
        case 3: return "THREE";
        case 4: return "FOUR";
        case 5: return "FIVE";
        case 6: return "SIX";
        case 7: return "SEVEN";
        case 8: return "EIGHT";
        case 9: return "NINE";
        case 10: return "TEN";
        case 11: return "JACK";
        case 12: return "QUEEN";
        case 13: return "KING";
        case 14: return "ACE";
        default: return "UNKNOWN";
    }
};

const SlipperyCardModal: React.FC<SlipperyCardModalProps> = ({
    isVisible,
    onClose,
    handCards,
    playerId,
    sessionId,
    token,
    onSwapped,
}) => {
    const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const handleSwap = async () => {
        if (selectedCardIndex === null) return;

        const selectedCard = handCards[selectedCardIndex];

        setLoading(true);

        // Convert rank from number to enum string
        const cardToSend = {
            rank: selectedCard.rank,
            suit: selectedCard.suit.toUpperCase(),
        };

        try {
            const response = await fetch(`${baseURL}/game/swap`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    sessionId,
                    userId: playerId,
                    card: cardToSend,
                }),

            });


            if (response.ok) {
                const newHand = await response.json();
                messageApi.success("Card successfully swapped."); // Success message
                onSwapped(newHand);
                onClose();
            } else {
                console.error("Failed to swap card - status:", response.status);
                const text = await response.text();
                console.error("Server response:", text);
                messageApi.error("Failed to swap card."); // Error message on bad status
            }
        } catch (error) {
            console.error("Swap card error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>{contextHolder}
            <Modal

                title="Slippery Cards - Swap One Card"
                open={isVisible}
                onCancel={onClose}
                footer={[
                    <Button key="cancel" onClick={onClose}>
                        Cancel
                    </Button>,
                    <Button
                        key="swap"
                        type="primary"
                        onClick={handleSwap}
                        disabled={selectedCardIndex === null}
                        loading={loading}
                    >
                        Swap Card
                    </Button>,
                ]}
            >
                <p>Select one card from your hand to swap:</p>
                <div className="flex justify-center gap-3 mt-4">
                    {handCards.map((card, index) => (
                        <div
                            key={index}
                            className={`cursor-pointer transition-all ${selectedCardIndex === index
                                ? "transform scale-110 ring-2 ring-blue-400"
                                : "hover:scale-105"
                                }`}
                            onClick={() => setSelectedCardIndex(index)}
                        >
                            <img
                                src={`https://deckofcardsapi.com/static/img/${card.cardCode}.png`}
                                alt={card.cardCode}
                                className="h-24 w-auto rounded !mt-3"
                            />
                        </div>
                    ))}
                </div>
                <div className="text-sm text-gray-600 italic !mt-3">
                    Slippery Cards lets you swap one card from your hand once per round. Use it to improve your hand or keep others guessing.
                </div>
            </Modal>
        </>
    );
};

export default SlipperyCardModal;