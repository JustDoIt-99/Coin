import { useEffect } from "react";
import { useAuth } from "./useAuth";

function AuthInitializer({ children }: { children: React.ReactNode }) {
    const { login, setIsLoading } = useAuth();

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const response = await fetch("/api/auth/refresh", {
                    method: "POST",
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("인증 복구 실패");
                }

                const data = await response.json();
                login(data.accessToken, data.user);
            } catch {
                // 비로그인 상태
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    return <>{children}</>;
}

export default AuthInitializer;