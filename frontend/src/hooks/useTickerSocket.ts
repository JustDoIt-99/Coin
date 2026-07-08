import { useEffect, useRef } from "react";
import {
    Client,
    type IMessage,
    type IFrame,
} from "@stomp/stompjs";
import type {TickerMessage} from "@pages/market/components/sidebar/MarketSidebar/MarketSidebar";

const WS_URL = import.meta.env.VITE_WS_URL;

type RawTickerMessage = Partial<TickerMessage> & {
    market?: string;
    tradePrice?: number;
    signedChangeRate?: number;
    signedChangePrice?: number;
    highPrice?: number;
    lowPrice?: number;
    accTradeVolume24h?: number;
    accTradePrice24h?: number;
    prevClosingPrice?: number;
    highest52WeekPrice?: number;
    highest52WeekDate?: string;
    lowest52WeekPrice?: number;
    lowest52WeekDate?: string;
    accBidVolume?: number;
    accAskVolume?: number;
};

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
                        const data = normalizeTickerMessage(JSON.parse(message.body) as RawTickerMessage);
                        if (!data) return;
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

function normalizeTickerMessage(data: RawTickerMessage): TickerMessage | null {
    const code = data.code ?? data.market;
    const tradePrice = data.trade_price ?? data.tradePrice;

    if (!code || tradePrice === undefined) {
        return null;
    }

    return {
        code,
        trade_price: tradePrice,
        signed_change_rate: data.signed_change_rate ?? data.signedChangeRate ?? 0,
        signed_change_price: data.signed_change_price ?? data.signedChangePrice ?? 0,
        high_price: data.high_price ?? data.highPrice ?? 0,
        low_price: data.low_price ?? data.lowPrice ?? 0,
        acc_trade_volume_24h: data.acc_trade_volume_24h ?? data.accTradeVolume24h ?? 0,
        acc_trade_price_24h: data.acc_trade_price_24h ?? data.accTradePrice24h ?? 0,
        prev_closing_price: data.prev_closing_price ?? data.prevClosingPrice ?? 0,
        highest_52_week_price: data.highest_52_week_price ?? data.highest52WeekPrice ?? 0,
        highest_52_week_date: data.highest_52_week_date ?? data.highest52WeekDate ?? "",
        lowest_52_week_price: data.lowest_52_week_price ?? data.lowest52WeekPrice ?? 0,
        lowest_52_week_date: data.lowest_52_week_date ?? data.lowest52WeekDate ?? "",
        acc_bid_volume: data.acc_bid_volume ?? data.accBidVolume ?? 0,
        acc_ask_volume: data.acc_ask_volume ?? data.accAskVolume ?? 0,
        timestamp: data.timestamp,
    };
}

export default useTickerSocket;
