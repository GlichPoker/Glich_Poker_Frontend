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
                let readableMessage = `Unexpected error (${response.status})`;
                try {
                    const errorJson = await response.json();
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

        } catch (err) {
            setError(`Something went wrong: ${err}`);
        }
    };

    return {
        handleFold: () => postAction('fold', 'fold'),
        handleCheck: () => postAction('check', 'check'),
        handleCall: (amount: number) => postAction('call', 'call', amount),
        handleRaise: (amount: number) => postAction('raise', 'raise', amount),
    };
};