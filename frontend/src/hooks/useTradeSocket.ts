import { useEffect, useRef } from "react";
import {
    Client,
    type IMessage,
    type IFrame,
    type StompSubscription,
} from "@stomp/stompjs";
import { subscribeTrade } from "@api/api";

const WS_URL = import.meta.env.VITE_WS_URL;

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
            await subscribeTrade(code);

            if (requestIdRef.current !== requestId) {
                return;
            }

            if (clientRef.current !== client || !client.connected) {
                return;
            }

            if(marketCodeRef.current !== code) {
                return;
            }

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

export default useServerTradeSocket;
