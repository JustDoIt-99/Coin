import { useEffect, useRef } from "react";
import {
    Client,
    type IMessage,
    type IFrame,
    type StompSubscription,
} from "@stomp/stompjs";
import { subscribeTrade } from "@api/api.ts";

export interface UpBitTrade {
    code: string;
    trade_price: number;
    trade_volume: number;
    ask_bid: "ASK" | "BID";
    trade_timestamp: number;
}

function useServerTradeSocket(
    marketCode: string,
    onMessage: (data: UpBitTrade) => void
) {
    const clientRef = useRef<Client | null>(null);
    const subscriptionRef = useRef<StompSubscription | null>(null);
    const onMessageRef = useRef(onMessage);
    const marketCodeRef = useRef(marketCode);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        marketCodeRef.current = marketCode;
    }, [marketCode]);

    const subscribeToMarket = async (code: string) => {
        const client = clientRef.current;
        if (!client || !client.connected || !code) return;

        try {
            await subscribeTrade(code);

            subscriptionRef.current?.unsubscribe();
            subscriptionRef.current = client.subscribe(
                `/topic/trade/${code}`,
                (message: IMessage) => {
                    try {
                        const data = JSON.parse(message.body) as UpBitTrade;
                        onMessageRef.current(data);
                    } catch (error) {
                        console.error("Spring trade message parse error", error);
                    }
                }
            );
        } catch (error) {
            console.error("trade subscribe request error", error);
        }
    };

    useEffect(() => {
        const client = new Client({
            brokerURL: "ws://localhost:8080/ws",
            reconnectDelay: 3000,

            onConnect: () => {
                void subscribeToMarket(marketCodeRef.current);
            },

            onStompError: (frame: IFrame) => {
                console.error(
                    "STOMP error",
                    frame.headers["message"],
                    frame.body
                );
            },

            onWebSocketError: (event: Event) => {
                console.error("Spring trade websocket error", event);
            },

            onWebSocketClose: (event: CloseEvent) => {
                console.log(
                    "Spring trade websocket closed",
                    event.code,
                    event.reason
                );
            },
        });

        clientRef.current = client;
        client.activate();

        return () => {
            subscriptionRef.current?.unsubscribe();
            subscriptionRef.current = null;
            client.deactivate();
            clientRef.current = null;
        };
    }, []);

    useEffect(() => {
        void subscribeToMarket(marketCode);

        return () => {
            subscriptionRef.current?.unsubscribe();
            subscriptionRef.current = null;
        };
    }, [marketCode]);
}

export default useServerTradeSocket;