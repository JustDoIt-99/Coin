import {useEffect, useRef} from "react";

const URL = "wss://api.upbit.com/websocket/v1";

export interface UpBitTrade {
    code: string;
    trade_price: number;
    trade_volume: number;
    ask_bid: "ASK" | "BID";
    trade_timestamp: number;
}

function useTradeSocket(
    marketCode: string,
    onMessage: (DataTransfer: UpBitTrade) => void
) {

    const socketRef = useRef<WebSocket | null>(null);
    const onMessageRef = useRef(onMessage);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        const socket = new WebSocket(URL);
        socketRef.current = socket;

        socket.onmessage = async (event) => {
            try {
                const text = typeof event.data === "string" ? event.data : await event.data.text();
                const data = JSON.parse(text);
                onMessageRef.current(data);
            } catch (error) {
                console.log("Trade WebSocket parse error", error);
            }
        };

        return () => {
            socket.close();
            socketRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!marketCode) return;

        const socket = socketRef.current;
        if (!socket) return;

        const subscribe = () => {
            socket.send(
                JSON.stringify([
                    {ticket: "trade"},
                    {
                        type: "trade",
                        codes: [marketCode]
                    },
                ])
            );
        };

        if (socket.readyState === WebSocket.OPEN) {
            subscribe();
            return;
        }

        socket.addEventListener("open", subscribe, {once: true});

        return () => {
            socket.removeEventListener("open", subscribe);
        }

    },[marketCode]);
}

export default useTradeSocket;