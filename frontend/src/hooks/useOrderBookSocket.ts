import {useEffect, useRef} from "react";
import type {UpBitOrderBook} from "frontend/src/pages/market/components/orderbook/OrderBook/OrderBook.tsx";

const URL = "wss://api.upbit.com/websocket/v1";

function useOrderBookSocket(marketCode: string,  onMessage:(data:UpBitOrderBook) => void) {
    const socketRef = useRef<WebSocket | null>(null);
    const onMessageRef = useRef(onMessage);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        const socket = new WebSocket(URL);
        socketRef.current = socket;

        socket.onmessage = async (event)  => {
            try {
                const text = typeof event.data === "string"
                    ? event.data
                    : await event.data.text();

                const data = JSON.parse(text);
                onMessageRef.current(data);
            } catch (error) {
                console.error("WebSocket Message parse error", error);
            }
        }

        socket.onerror = (error) => {
            console.error("WebSocket error", error);
        };

        socket.onclose = (event) => {
            console.log("WebSocket closed", event.code, event.reason);
        };

        return () => {
            socket.close();
            socketRef.current = null;
        }

    },[]);

    useEffect(() => {
        if (!marketCode) return;

        const socket = socketRef.current;
        if (!socket) return;

        const subscribe = () => {
            socket.send(
                JSON.stringify([
                    {ticket: "orderbook"},
                    {
                        type: "orderbook",
                        codes: [marketCode]
                    }
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

    }, [marketCode]);
}

export default useOrderBookSocket;