import { useAtom, useAtomValue } from "jotai";
import {
    accessTokenAtom,
    authLoadingAtom,
    isAuthenticatedAtom,
    userAtom,
    type User,
} from "@auth/authAtom";
import {API} from "@constants/api";
import {authFetch} from "@auth/authFetch";

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
            await authFetch(API.AUTH_LOGOUT, {
                method: "POST",
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
