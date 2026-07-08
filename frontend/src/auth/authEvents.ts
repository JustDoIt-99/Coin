export const AUTH_EXPIRED_EVENT = "auth-expired";

export function dispatchAuthExpiredEvent() {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}
