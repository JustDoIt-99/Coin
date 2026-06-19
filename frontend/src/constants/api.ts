const SERVER_URL = import.meta.env.VITE_API_BASE_URL;

export const API = {
    AUTH_SIGNUP: `${SERVER_URL}/auth/signup`,
    AUTH_LOGIN: `${SERVER_URL}/auth/login`,
    AUTH_REISSUE: `${SERVER_URL}/auth/reissue`,
    AUTH_LOGOUT: `${SERVER_URL}/auth/logout`,
    MARKETS: `${SERVER_URL}/markets`,
    TICKERS: `${SERVER_URL}/tickers`,
    CANDLES: `${SERVER_URL}/candles`,
};
