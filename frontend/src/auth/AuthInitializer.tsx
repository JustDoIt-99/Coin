import {useEffect, useRef} from "react";
import { useAuth } from "@auth/useAuth";
import {API} from "@constants/endpoints.ts";
import AssetSyncSocket from "@auth/AssetSyncSocket";
import TradeNotificationSocket from "@auth/TradeNotificationSocket";

function AuthInitializer({ children }: { children: React.ReactNode }) {
    const { login, setIsLoading } = useAuth();
    const isInitialized = useRef(false);

    useEffect(() => {
        if (isInitialized.current) return;
        isInitialized.current = true;

        const initializeAuth = async () => {
            try {
                const response = await fetch(API.AUTH_REISSUE, {
                    method: "POST",
                    credentials: "include"
                });

                if (!response.ok) {
                    throw new Error("인증 복구 실패");
                }

                const data = await response.json();
                login(data.accessToken, data.user);
            } catch {
                // 인증 복구 실패 시 비로그인 상태로 초기화를 완료합니다.
            } finally {
                setIsLoading(false);
            }
        }

        void initializeAuth();
    }, [login,  setIsLoading]);

    return (
        <>
            <AssetSyncSocket />
            <TradeNotificationSocket />
            {children}
        </>
    );
}

export default AuthInitializer;
