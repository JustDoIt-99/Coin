import { useEffect, useRef } from "react";
import {
    Client,
    type IMessage,
    type IFrame,
} from "@stomp/stompjs";
import type {TickerMessage} from "@pages/market/components/sidebar/MarketSidebar/MarketSidebar.tsx";

const WS_URL = import.meta.env.VITE_WS_URL;

function useTickerSocket(
    onMessage: (data: TickerMessage) => void
) {
    const clientRef = useRef<Client | null>(null);
    const onMessageRef = useRef(onMessage);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        const client = new Client({
            brokerURL: WS_URL,
            reconnectDelay: 3000,

            onConnect: () => {
                client.subscribe("/topic/ticker", (message: IMessage) => {
                    try {
                        const data = JSON.parse(message.body) as TickerMessage;
                        onMessageRef.current(data);
                    } catch (error) {
                        console.error("Spring ticker message parse error", error);
                    }
                });
            },

            onStompError: (frame: IFrame) => {
                console.error(
                    "STOMP error",
                    frame.headers["message"],
                    frame.body
                );
            },

            onWebSocketError: (event: Event) => {
                console.error("Spring ticker websocket error", event);
            },

            onWebSocketClose: (event: CloseEvent) => {
                console.log(
                    "Spring ticker websocket closed",
                    event.code,
                    event.reason
                );
            },
        });

        clientRef.current = client;
        client.activate();

        return () => {
            client.deactivate();
            clientRef.current = null;
        };
    }, []);
}

export default useTickerSocket;