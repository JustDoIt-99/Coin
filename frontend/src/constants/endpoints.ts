const SERVER_URL = import.meta.env.VITE_API_BASE_URL;

export const API = {
    AUTH_SIGNUP: `${SERVER_URL}/auth/signup`,
    AUTH_LOGIN: `${SERVER_URL}/auth/login`,
    AUTH_REISSUE: `${SERVER_URL}/auth/reissue`,
    AUTH_LOGOUT: `${SERVER_URL}/auth/logout`,
    MARKETS: `${SERVER_URL}/markets`,
    TICKERS: `${SERVER_URL}/tickers`,
    CANDLES: `${SERVER_URL}/candles`,
    ASSETS: `${SERVER_URL}/assets`,
    ORDERBOOK_SUBSCRIPTION: `${SERVER_URL}/orderbooks/subscribe`,
    TRADE_SUBSCRIPTION: `${SERVER_URL}/trades/subscribe`,
    MARKET_BUY: `${SERVER_URL}/orders/market-buy`,
    MARKET_SELL: `${SERVER_URL}/orders/market-sell`,
    LIMIT_BUY: `${SERVER_URL}/orders/limit-buy`,
    LIMIT_SELL: `${SERVER_URL}/orders/limit-sell`,
    PENDING_LIMIT_ORDERS: `${SERVER_URL}/orders/limit/pending`,
    LIMIT_ORDER: `${SERVER_URL}/orders/limit`,
    TRADE_HISTORIES: `${SERVER_URL}/orders/trade-histories`,
    PORTFOLIO_SUMMARY: `${SERVER_URL}/assets/summary`,
}
