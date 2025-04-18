import { getApiDomain } from '@/utils/domain';

const baseURL = getApiDomain();

type ActionHandlerParams = {
    lobbyId: string | string[] | undefined;
    currentUser: { id: number; token: string } | null;
};

export const useActionHandlers = ({ lobbyId, currentUser }: ActionHandlerParams) => {
    if (!lobbyId || !currentUser) {
        throw new Error("useActionHandlers: Missing lobbyId or currentUser");
    }

    const commonHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentUser.token}`,
    };


    const postAction = async (endpoint: string, event: string, amount?: number) => {
        try {
            const requestBody: any = {
                sessionId: lobbyId,
                userId: currentUser.id,
            };

            if (amount !== undefined) {
                requestBody.amount = amount;
            }

            const response = await fetch(`${baseURL}/game/${endpoint}`, {
                method: 'POST',
                headers: commonHeaders,
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Action failed: ${response.statusText} - ${errorText}`);
            }

        } catch (err) {
            console.error(`Error in ${endpoint}:`, err);
        }
    };

    return {
        handleFold: () => postAction('fold', 'fold'),
        handleCheck: () => postAction('check', 'check'),
        handleCall: (amount: number) => postAction('call', 'call', amount),
        handleRaise: (amount: number) => postAction('raise', 'raise', amount),
    };
};