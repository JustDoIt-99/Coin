import {getDefaultStore} from "jotai";
import {accessTokenAtom, userAtom} from "@auth/authAtom";
import type {LoginResponse} from "@Type/User";
import {API} from "@constants/api.ts";

const store = getDefaultStore();
let reissuePromise: Promise<LoginResponse | null> | null = null;

type AuthFetchInit = RequestInit & {
    skipAuthRetry?: boolean;
};

export async function authFetch(input: RequestInfo | URL, init: AuthFetchInit = {}) {
    const {skipAuthRetry = false, headers, ...requestInit} = init;
    const accessToken = store.get(accessTokenAtom);
    const response = await fetch(input, {
        ...requestInit,
        credentials: requestInit.credentials ?? "include",
        headers: createHeaders(headers, accessToken),
    });

    if (response.status !== 401 || skipAuthRetry) {
        return response;
    }

    const data = await reissueAccessToken();
    if (!data) {
        store.set(accessTokenAtom, null);
        store.set(userAtom, null);
        return response;
    }

    return fetch(input, {
        ...requestInit,
        credentials: requestInit.credentials ?? "include",
        headers: createHeaders(headers, data.accessToken),
    });
}

async function reissueAccessToken() {
    reissuePromise ??= fetch(API.AUTH_REISSUE, {
        method: "POST",
        credentials: "include",
    })
        .then(async (response) => {
            if (!response.ok) {
                return null;
            }

            const data: LoginResponse = await response.json();
            store.set(accessTokenAtom, data.accessToken);
            store.set(userAtom, data.user);
            return data;
        })
        .finally(() => {
            reissuePromise = null;
        });

    return reissuePromise;
}

function createHeaders(headers: HeadersInit | undefined, accessToken: string | null) {
    const nextHeaders = new Headers(headers);

    if (accessToken) {
        nextHeaders.set("Authorization", `Bearer ${accessToken}`);
    }

    return nextHeaders;
}
