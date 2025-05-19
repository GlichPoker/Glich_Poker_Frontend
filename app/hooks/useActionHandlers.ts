import { getApiDomain } from '@/utils/domain';

const baseURL = getApiDomain();

type ActionHandlerParams = {
    lobbyId: string | string[] | undefined;
    currentUser: { id: number; token: string } | null;
    setError: (message: string) => void;
};

export const useActionHandlers = ({ lobbyId, currentUser, setError }: ActionHandlerParams) => {
    if (!lobbyId || !currentUser) {
        throw new Error("useActionHandlers: Missing lobbyId or currentUser");
    }

    const commonHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentUser.token}`,
    };

    const postAction = async (endpoint: string, event: string, amount?: number, card?: any) => {
        try {
            const requestBody: any = {
                sessionId: lobbyId,
                userId: currentUser.id,
            };

            if (amount !== undefined) {
                requestBody.amount = amount;
            }

            if (card !== undefined) {
                requestBody.card = card;
            }

            const response = await fetch(`${baseURL}/game/${endpoint}`, {
                method: 'POST',
                headers: commonHeaders,
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                let readableMessage = `Unexpected error (${response.status})`;
                try {
                    const errorJson = await response.json();
                    readableMessage = errorJson.message || readableMessage;
                } catch (parseError) {
                    console.warn('Failed to parse error response:', parseError);
                }

                // console.error(`Error in ${endpoint}:`, readableMessage);
                setError(readableMessage);

                return null;
            }

            try {
                const data = await response.json();
                return data;
            } catch (e) {
                return true;
            }

        } catch (err: any) {
            const fallbackMessage = err?.message || "Unknown error occurred.";
            // console.error(`Error in ${endpoint}:`, err);
            setError(fallbackMessage);
            return null;
        }
    };

    return {
        handleFold: () => postAction('fold', 'fold'),
        handleCheck: () => postAction('check', 'check'),
        handleCall: (amount: number) => postAction('call', 'call', amount),
        handleRaise: (amount: number) => postAction('raise', 'raise', amount),
        handleBluff: (card: any) => postAction('bluff', 'bluff', undefined, card),
    };
};