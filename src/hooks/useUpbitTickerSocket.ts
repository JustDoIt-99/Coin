import {useEffect, useRef} from "react";

const URL = "wss://api.upbit.com/websocket/v1";

function useUpBitTickerSocket(
    marketCodes: string[],
    onMessage: (data: any) => void

) {

    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (marketCodes.length === 0) return;
        const socket = new WebSocket(URL);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket opened");
            socket?.send(
                JSON.stringify([
                    { ticket: "market-sidebar" },
                    {
                        type: "ticker",
                        codes: marketCodes,
                    },
                ])
            );
        };

        socket.onmessage = async (event) => {
            const text =  typeof event.data === "string"  ? event.data  : await event.data.text();
            const data = JSON.parse(text);
            onMessage(data);
        };

        socket.onerror = (error) => {
            console.error("WebSocket error", error);
        };

        socket.onclose = (event) => {
            console.log("WebSocket closed", event.code, event.reason);
        };

        return () => {
            socket?.close();
            socketRef.current = null;
        };
    }, [marketCodes.join(","), onMessage]);
}

export default useUpBitTickerSocket;