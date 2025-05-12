import React, { useState, useEffect } from 'react';
import { Modal, Button, Select, Radio, Space } from 'antd';
import { Card } from '@/types/round';
import { getApiDomain } from '@/utils/domain';

const baseURL = getApiDomain();

interface MirageActionProps {
    isVisible: boolean;
    onClose: () => void;
    onSelectCard: (selectedCard: Card) => void; // Send to /game/bluff endpoint
    handCards: Card[];
    playerId: number;
    sessionId: number;
    token: string;
}

const MirageAction: React.FC<MirageActionProps> = ({
    isVisible,
    onClose,
    onSelectCard,
    handCards,
    playerId,
    sessionId,
    token
}) => {
    const [bluffMode, setBluffMode] = useState<'real' | 'fake'>('real');
    const [selectedHandCardIndex, setSelectedHandCardIndex] = useState<number | null>(null);
    const [selectedFakeCard, setSelectedFakeCard] = useState<string | null>(null);
    const [possibleFakeCards, setPossibleFakeCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Fetch available cards for bluffing when the modal opens
    useEffect(() => {
        if (isVisible && bluffMode === 'fake') {
            fetchBluffCards();
        } else {
            // Reset selections when modal closes
            setSelectedHandCardIndex(null);
            setSelectedFakeCard(null);
        }
    }, [isVisible, bluffMode]);

    const fetchBluffCards = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${baseURL}/game/bluffCards?playerId=${playerId}&sessionId=${sessionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const cards = await response.json();
                setPossibleFakeCards(cards);
            } else {
                console.error('Failed to fetch bluff cards');
            }
        } catch (error) {
            console.error('Error fetching bluff cards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        console.log("[DEBUG] Mirage handleSubmit - Mode:", bluffMode);
        console.log("[DEBUG] Mirage handleSubmit - Selected hand card index:", selectedHandCardIndex);
        console.log("[DEBUG] Mirage handleSubmit - Selected fake card:", selectedFakeCard);

        // If showing a real card from hand
        if (bluffMode === 'real' && selectedHandCardIndex !== null) {
            const selectedCard = handCards[selectedHandCardIndex];
            console.log("[DEBUG] Mirage handleSubmit - Selected real card:", selectedCard);

            // Ensure we're passing a properly formatted card object
            const formattedCard = {
                cardCode: selectedCard.cardCode,
                suit: selectedCard.suit,
                rank: selectedCard.rank
            };
            console.log("[DEBUG] Mirage handleSubmit - Formatted real card:", formattedCard);

            onSelectCard(formattedCard);
            onClose();
        }
        // If showing a fake card
        else if (bluffMode === 'fake' && selectedFakeCard !== null) {
            const fakeCard = possibleFakeCards.find(card => card.cardCode === selectedFakeCard);
            console.log("[DEBUG] Mirage handleSubmit - Found fake card:", fakeCard);

            if (fakeCard) {
                // Ensure we're passing a properly formatted card object
                const formattedCard = {
                    cardCode: fakeCard.cardCode,
                    suit: fakeCard.suit,
                    rank: fakeCard.rank
                };
                console.log("[DEBUG] Mirage handleSubmit - Formatted fake card:", formattedCard);

                onSelectCard(formattedCard);
                onClose();
            } else {
                console.error("[DEBUG] Mirage handleSubmit - Could not find selected fake card");
            }
        } else {
            console.error("[DEBUG] Mirage handleSubmit - Invalid selection state");
        }
    };

    // This is explained in the SPECIALRULES.md file under the Mirage section
    return (
        <Modal
            title="Mirage Bluff"
            open={isVisible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleSubmit}
                    disabled={(bluffMode === 'real' && selectedHandCardIndex === null) ||
                        (bluffMode === 'fake' && selectedFakeCard === null) ||
                        loading}
                >
                    Bluff Card
                </Button>
            ]}
        >
            <div className="space-y-6">
                <div className="mb-4">
                    <h4 className="mb-2">Choose your bluff type:</h4>
                    <Radio.Group
                        value={bluffMode}
                        onChange={e => {
                            setBluffMode(e.target.value);
                            setSelectedHandCardIndex(null);
                            setSelectedFakeCard(null);
                        }}
                    >
                        <Space direction="vertical">
                            <Radio value="real">Show a real card from your hand</Radio>
                            <Radio value="fake">Show a fake card (bluff)</Radio>
                        </Space>
                    </Radio.Group>
                </div>

                {bluffMode === 'real' && (
                    <div>
                        <h4 className="mb-2">Select a card from your hand to show:</h4>
                        <div className="flex justify-center gap-2 flex-wrap">
                            {handCards.map((card, index) => (
                                <div
                                    key={index}
                                    className={`cursor-pointer transition-all duration-200 ${selectedHandCardIndex === index
                                            ? 'transform scale-110 ring-2 ring-yellow-500'
                                            : 'hover:transform hover:scale-105'
                                        }`}
                                    onClick={() => setSelectedHandCardIndex(index)}
                                >
                                    <img
                                        src={`https://deckofcardsapi.com/static/img/${card.cardCode}.png`}
                                        alt={card.cardCode}
                                        className="h-20 w-auto rounded"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {bluffMode === 'fake' && (
                    <div>
                        <h4 className="mb-2">Select a fake card to show:</h4>
                        <Select
                            placeholder="Select a card"
                            style={{ width: '100%' }}
                            onChange={(value) => setSelectedFakeCard(value)}
                            loading={loading}
                        >
                            {possibleFakeCards.map((card) => (
                                <Select.Option key={card.cardCode} value={card.cardCode}>
                                    {card.suit.charAt(0) + card.suit.slice(1).toLowerCase()} {card.rank}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                )}

                <div className="text-sm text-gray-600 italic !mt-3">
                    The Mirage ability lets you bluff by showing either a real card from your hand or a fake card to opponents. This is purely strategic and doesn't change any actual cards in play.
                </div>
            </div>
        </Modal>
    );
};

export default MirageAction;