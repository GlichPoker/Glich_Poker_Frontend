//useActionHandlers.ts
import { getApiDomain } from '@/utils/domain';
import { notification } from 'antd';

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

    // Debug the current user object to ensure it has the correct token
    // console.log("[DEBUG] useActionHandlers - currentUser:", {
    //     id: currentUser.id,
    //     hasToken: !!currentUser.token,
    //     tokenLength: currentUser.token?.length || 0
    // });

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

            // Debug log for all requests
            // console.log(`[DEBUG] ${endpoint} request:`, {
            //     url: `${baseURL}/game/${endpoint}`,
            //     method: 'POST',
            //     headers: { ...commonHeaders, Authorization: 'Bearer ***' }, // Don't log actual token
            //     body: JSON.stringify(requestBody)
            // });

            const response = await fetch(`${baseURL}/game/${endpoint}`, {
                method: 'POST',
                headers: commonHeaders,
                body: JSON.stringify(requestBody),
            });

            // console.log(`[DEBUG] ${endpoint} response status:`, response.status);

            if (!response.ok) {
                let readableMessage = `Unexpected error (${response.status})`;
                try {
                    const errorJson = await response.json();
                    // console.log(`[DEBUG] ${endpoint} error response:`, errorJson);
                    readableMessage = errorJson.message || readableMessage;
                } catch (parseError) {
                    console.warn('Failed to parse error response:', parseError);
                }
                notification.error({
                    message: 'Action Error',
                    description: readableMessage,
                    placement: 'top',
                });
                console.error(`Error in ${endpoint}:`, readableMessage);
                setError(`Action failed: ${readableMessage}`);

                throw new Error(readableMessage);
            }

            // Try to parse response as JSON if available
            try {
                const data = await response.json();
                // console.log(`[DEBUG] ${endpoint} success response:`, data);
                return data;
            } catch (e) {
                // console.log(`[DEBUG] ${endpoint} success (no response body)`);
                return true;
            }

        } catch (err: any) {
            console.error(`Error in ${endpoint}:`, err);
            setError(`Something went wrong: ${err.message || err}`);
            throw err; // Re-throw to allow caller to handle
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