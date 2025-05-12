import { useEffect, useState, useRef } from "react";
import { notification } from "antd";
import { Card, RoundModel } from "@/types/round";
import { useActionHandlers } from "@/hooks/useActionHandlers";

interface SpecialActionsProps {
    lobbyId: string;
    currentUser: { id: number; token: string } | null;
    setError: (msg: string) => void;
    weatherType?: "SUNNY" | "RAINY" | "SNOWY" | "CLOUDY";
    roundModel?: RoundModel;
}

export function useSpecialActions({
    lobbyId,
    currentUser,
    setError,
    weatherType,
    roundModel,
}: SpecialActionsProps) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const actionHandlers = useActionHandlers({
        lobbyId,
        currentUser,
        setError,
    });


    const [canSwap, setCanSwap] = useState(false);
    const prevCommunityLength = useRef(0);

    useEffect(() => {
        const currentLength = roundModel?.communityCards?.length ?? 0;

        if (weatherType === "RAINY" && currentLength > prevCommunityLength.current) {
            setCanSwap(true);
        }

        prevCommunityLength.current = currentLength;
    }, [weatherType, roundModel?.communityCards]);

    const consumeSwap = () => setCanSwap(false);

    const handleSpecialAction = (
        weatherType: string,
        openMiragePopup: () => void,
        openSwapPopup: () => void
    ) => {
        switch (weatherType) {
            case "SUNNY":
                openMiragePopup();
                break;
            case "RAINY":
                if (canSwap) {
                    openSwapPopup();
                } else {
                    notification.warning({
                        message: "Swap Unavailable",
                        description: "You have already used your swap this round.",
                        placement: "top",
                    });
                }
                break;
            default:
                console.warn(`Unhandled weather type: ${weatherType}`);
        }
    };

    const handleBluffCardSelected = async (
        selectedCard: Card,
        onComplete: () => void
    ) => {
        if (!actionHandlers.handleBluff || !token || !currentUser) {
            setError("Authentication error: Please refresh the page and try again");
            onComplete();
            return;
        }

        const cardToSend = {
            cardCode: selectedCard.cardCode,
            suit: selectedCard.suit,
            rank: selectedCard.rank,
        };

        onComplete();

        notification.info({
            message: "Processing Mirage...",
            description: "Sending your card to other players...",
            placement: "top",
            duration: 2,
        });

        try {
            await actionHandlers.handleBluff(cardToSend);
            notification.success({
                message: "Mirage Ability Used",
                description: "You've shown a card to the other players.",
                placement: "top",
            });
        } catch (error: any) {
            setError(`Failed to use Mirage ability: ${error.message || "Unknown error"}`);
        }
    };

    return {
        handleSpecialAction,
        handleBluffCardSelected,
        canSwap,
        consumeSwap,
    };
}