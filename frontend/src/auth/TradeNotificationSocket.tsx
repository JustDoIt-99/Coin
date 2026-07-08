import {useEffect, useRef, useState} from "react";
import {Client, type IFrame, type IMessage} from "@stomp/stompjs";
import {useQueryClient} from "@tanstack/react-query";
import {useAuth} from "@auth/useAuth";

const WS_URL = import.meta.env.VITE_WS_URL;
const TOAST_DURATION_MS = 4500;

type TradeSide = "BUY" | "SELL";
type OrderType = "MARKET" | "LIMIT";

interface TradeExecutedMessage {
    type: "TRADE_EXECUTED";
    userId: number;
    tradeHistoryId: number;
    marketCode: string;
    tradeSide: TradeSide;
    orderType: OrderType;
    quantity: number;
    price: number;
    totalAmount: number;
}

interface TradeToast {
    id: number;
    message: string;
}

function TradeNotificationSocket() {
    const {isAuthenticated, user} = useAuth();
    const queryClient = useQueryClient();
    const clientRef = useRef<Client | null>(null);
    const timeoutsRef = useRef<number[]>([]);
    const [toasts, setToasts] = useState<TradeToast[]>([]);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            clientRef.current?.deactivate();
            clientRef.current = null;
            clearToastTimeouts();
            setToasts([]);
            return;
        }

        clearToastTimeouts();
        setToasts([]);

        const client = new Client({
            brokerURL: WS_URL,
            reconnectDelay: 3000,

            onConnect: () => {
                client.subscribe(`/topic/trades/${user.id}`, (message: IMessage) => {
                    try {
                        const data = JSON.parse(message.body) as TradeExecutedMessage;
                        if (data.type !== "TRADE_EXECUTED" || data.userId !== user.id) return;

                        void queryClient.invalidateQueries({queryKey: ["trade-histories"]});
                        showToast(toTradeToast(data));
                    } catch (error) {
                        console.error("trade notification message parse error", error);
                    }
                });
            },

            onStompError: (frame: IFrame) => {
                console.error(
                    "trade notification STOMP error",
                    frame.headers["message"],
                    frame.body
                );
            },

            onWebSocketError: (event: Event) => {
                console.error("trade notification websocket error", event);
            },
        });

        clientRef.current = client;
        client.activate();

        return () => {
            client.deactivate();
            if (clientRef.current === client) {
                clientRef.current = null;
            }
            clearToastTimeouts();
        };
    }, [isAuthenticated, queryClient, user?.id]);

    const showToast = (toast: TradeToast) => {
        setToasts((prev) => [...prev, toast]);
        const timeoutId = window.setTimeout(() => {
            setToasts((prev) => prev.filter((item) => item.id !== toast.id));
            timeoutsRef.current = timeoutsRef.current.filter((id) => id !== timeoutId);
        }, TOAST_DURATION_MS);

        timeoutsRef.current.push(timeoutId);
    };

    const clearToastTimeouts = () => {
        timeoutsRef.current.forEach(window.clearTimeout);
        timeoutsRef.current = [];
    };

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div style={containerStyle}>
            {toasts.map((toast) => (
                <div key={toast.id} style={toastStyle}>
                    {toast.message}
                </div>
            ))}
        </div>
    );
}

function toTradeToast(message: TradeExecutedMessage): TradeToast {
    const [, targetAssetCode = message.marketCode] = message.marketCode.split("-");
    const sideText = message.tradeSide === "BUY" ? "매수" : "매도";
    const orderTypeText = message.orderType === "MARKET" ? "시장가" : "지정가";
    const amount = Math.floor(message.totalAmount).toLocaleString();

    return {
        id: message.tradeHistoryId,
        message: `${targetAssetCode} ${orderTypeText} ${sideText} 체결 · ${amount} KRW`,
    };
}

const containerStyle = {
    position: "fixed",
    right: 24,
    bottom: 24,
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    maxWidth: 360,
} as const;

const toastStyle = {
    padding: "12px 14px",
    borderRadius: 6,
    background: "#1f2937",
    color: "#ffffff",
    fontSize: 14,
    lineHeight: 1.45,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.18)",
} as const;

export default TradeNotificationSocket;
