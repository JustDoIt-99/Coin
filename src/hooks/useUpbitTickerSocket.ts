import {useEffect, useRef} from "react";

const URL = "wss://api.upbit.com/websocket/v1";

function useUpBitTickerSocket(
    marketCodes: string[],
    onMessage: (data: any) => void

) {
    const socketRef = useRef<WebSocket | null>(null);
    const onMessageRef = useRef(onMessage);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        const socket = new WebSocket(URL);
        socketRef.current = socket;

        socket.addEventListener("open", () => {
            console.log("socket open");
        });

        socket.onmessage = async (event) => {
            try {
                const text =
                    typeof event.data === "string"?
                        event.data : await event.data.text()

                const data = JSON.parse(text);
                onMessageRef.current(data);
            } catch (error) {
                console.log("WebSocket message parse error", error);
            }
        }

        socket.onerror = (error) => {
            console.error("WebSocket error", error);
        }

        socket.onclose = (event) => {
            console.log("WebSocket closed", event.code, event.reason);
        }

        return () => {
            socket.close();
            socketRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (marketCodes.length === 0) return;

        const socket = socketRef.current;
        if (!socket) return;

        const subscribe = () => {
            socket.send(
                JSON.stringify([
                    { ticket: "market-sidebar" },
                    {
                        type: "ticker",
                        codes: marketCodes,
                    },
                ])
            );
        };

        if (socket.readyState === WebSocket.OPEN) {
            subscribe();
            return;
        }

        socket.addEventListener("open", subscribe, { once: true });

        return () => {
            socket.removeEventListener("open", subscribe);
        };

    },[marketCodes.join('')]);
}

export default useUpBitTickerSocket;