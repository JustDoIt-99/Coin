import {useEffect, useRef} from "react";
import {Client, type IFrame, type IMessage} from "@stomp/stompjs";
import {useQueryClient} from "@tanstack/react-query";
import {useAuth} from "@auth/useAuth";

const WS_URL = import.meta.env.VITE_WS_URL;

export interface AssetUpdatedMessage {
    type: "ASSET_UPDATED";
    userId: number;
    assetCodes: string[];
    reason: string;
}

function useAssetSyncSocket() {
    const {isAuthenticated, user} = useAuth();
    const queryClient = useQueryClient();
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            clientRef.current?.deactivate();
            clientRef.current = null;
            return;
        }

        const client = new Client({
            brokerURL: WS_URL,
            reconnectDelay: 3000,

            onConnect: () => {
                client.subscribe(`/topic/assets/${user.id}`, (message: IMessage) => {
                    try {
                        const data = JSON.parse(message.body) as AssetUpdatedMessage;
                        if (data.type !== "ASSET_UPDATED" || data.userId !== user.id) return;

                        void queryClient.invalidateQueries({queryKey: ["assets"]});
                        void queryClient.invalidateQueries({queryKey: ["portfolio-summary"]});
                        void queryClient.refetchQueries({queryKey: ["assets"], type: "active"});
                        void queryClient.refetchQueries({queryKey: ["portfolio-summary"], type: "active"});
                    } catch (error) {
                        console.error("asset sync message parse error", error);
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
                console.error("asset sync websocket error", event);
            },

            onWebSocketClose: (event: CloseEvent) => {
                console.log(
                    "asset sync websocket closed",
                    event.code,
                    event.reason
                );
            },
        });

        clientRef.current = client;
        client.activate();

        return () => {
            client.deactivate();
            if (clientRef.current === client) {
                clientRef.current = null;
            }
        };
    }, [isAuthenticated, queryClient, user?.id]);
}

export default useAssetSyncSocket;
