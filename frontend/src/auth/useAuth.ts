import { useAtom, useAtomValue } from "jotai";
import {
    accessTokenAtom,
    authLoadingAtom,
    isAuthenticatedAtom,
    userAtom,
    type User,
} from "./authAtom";

export function useAuth() {
    const [user, setUser] = useAtom(userAtom);
    const [accessToken, setAccessToken] = useAtom(accessTokenAtom);
    const [isLoading, setIsLoading] = useAtom(authLoadingAtom);
    const isAuthenticated = useAtomValue(isAuthenticatedAtom);

    const login = (accessToken: string, user: User) => {
        setAccessToken(accessToken);
        setUser(user);
    };

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    };

    return {
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        setIsLoading,
        login,
        logout,
    };
}