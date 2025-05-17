import { useEffect, useRef } from "react";

export const useInactivityTimer = ({
    isMyTurn,
    timeoutMs = 30000,
    onTimeout,
    userId,
    sessionId,
    forceFoldUrl,
}: {
    isMyTurn: boolean;
    timeoutMs?: number;
    onTimeout: () => void;
    userId: number;
    sessionId: number;
    forceFoldUrl: string;
}) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const hiddenTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            onTimeout();
        }, timeoutMs);
    };

    const clearAllTimers = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (hiddenTimeoutRef.current) clearTimeout(hiddenTimeoutRef.current);
    };

    useEffect(() => {
        if (!isMyTurn) return;

        resetTimer();

        const events = ["mousemove", "mousedown", "keydown", "touchstart"];
        events.forEach((event) => window.addEventListener(event, resetTimer));

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                hiddenTimeoutRef.current = setTimeout(() => {
                    onTimeout();
                }, timeoutMs);
            } else {
                if (hiddenTimeoutRef.current) clearTimeout(hiddenTimeoutRef.current);
                resetTimer();
            }
        };

        const handleBeforeUnload = () => {
            const data = JSON.stringify({ userId, sessionId });

            console.log("[InactivityTimer] fetch triggered on beforeunload:", data);

            fetch(forceFoldUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
                },
                body: data,
                keepalive: true,
            });
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            clearAllTimers();
            events.forEach((event) =>
                window.removeEventListener(event, resetTimer)
            );
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isMyTurn, timeoutMs, userId, sessionId, forceFoldUrl]);
};