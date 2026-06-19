import {useEffect, useRef} from "react";
import { useAuth } from "./useAuth";
import {API} from "@constants/api.ts";

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

            } finally {
                setIsLoading(false);
            }
        }

        void initializeAuth();
    }, [login,  setIsLoading]);

    return <>{children}</>;
}

export default AuthInitializer;
