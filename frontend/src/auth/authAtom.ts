import { atom } from "jotai";

export interface User {
    id: number;
    email: string;
    nickname: string;
}

export const userAtom = atom<User | null>(null);
export const accessTokenAtom = atom<string | null>(null);
export const authLoadingAtom = atom(true);

export const isAuthenticatedAtom = atom((get) => {
    return !!get(accessTokenAtom);
});