import { useEffect, useRef } from "react";
import {
    Client,
    type IMessage,
    type IFrame,
    type StompSubscription,
} from "@stomp/stompjs";
import { subscribeOrderBook } from "@api/api";

export interface OrderBookUnitMessage {
    ask_price: number;
    bid_price: number;
    ask_size: number;
    bid_size: number;
}

export interface OrderbookMessage {
    code: string;
    timestamp: number;
    total_ask_size: number;
    total_bid_size: number;
    orderbook_units: OrderBookUnitMessage[];
}

const WS_URL = import.meta.env.VITE_WS_URL;

function useServerOrderBookSocket(
    marketCode: string,
    onMessage: (data: OrderbookMessage) => void
) {
    const clientRef = useRef<Client | null>(null);
    const subscriptionRef = useRef<StompSubscription | null>(null);
    const onMessageRef = useRef(onMessage);
    const marketCodeRef = useRef(marketCode);
    const requestIdRef = useRef(0);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        marketCodeRef.current = marketCode;
    }, [marketCode]);

    const subscribeToMarket = async (code: string) => {
        const client = clientRef.current;
        if (!client || !client.connected || !code) return;

        const requestId = ++requestIdRef.current;

        try {
            await subscribeOrderBook(code);

            if (requestIdRef.current !== requestId) {
                return;
            }

            if (clientRef.current !== client || !client.connected) {
                return;
            }

            if (marketCodeRef.current !== code) {
                return;
            }

            subscriptionRef.current?.unsubscribe();
            subscriptionRef.current = client.subscribe(
                `/topic/orderbook/${code}`,
                (message: IMessage) => {
                    try {
                        const data = JSON.parse(message.body) as OrderbookMessage;
                        onMessageRef.current(data);
                    } catch (error) {
                        console.error("Spring orderbook message parse error", error);
                    }
                }
            );
        } catch (error) {
            if (requestIdRef.current !== requestId) {
                return;
            }
            console.error("orderbook subscribe request error", error);
        }
    };

    useEffect(() => {
        const client = new Client({
            brokerURL: WS_URL,
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
                console.error("Spring orderbook websocket error", event);
            },

            onWebSocketClose: (event: CloseEvent) => {
                console.log(
                    "Spring orderbook websocket closed",
                    event.code,
                    event.reason
                );
            },
        });

        clientRef.current = client;
        client.activate();

        return () => {
            requestIdRef.current += 1;
            subscriptionRef.current?.unsubscribe();
            subscriptionRef.current = null;
            client.deactivate();
            clientRef.current = null;
        };
    }, []);

    useEffect(() => {
        void subscribeToMarket(marketCode);

        return () => {
            requestIdRef.current += 1;
            subscriptionRef.current?.unsubscribe();
            subscriptionRef.current = null;
        };
    }, [marketCode]);
}

export default useServerOrderBookSocket;
