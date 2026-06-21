const SERVER_URL = import.meta.env.VITE_API_BASE_URL;

export const API = {
    MARKETS: `${SERVER_URL}/markets`,
    TICKERS: `${SERVER_URL}/tickers`,
    CANDLES: `${SERVER_URL}/candles`,
    ASSETS: `${SERVER_URL}/assets`,
    ORDERBOOK_SUBSCRIPTION: `${SERVER_URL}/orderbooks/subscribe`,
    TRADE_SUBSCRIPTION: `${SERVER_URL}/trades/subscribe`,
    MARKET_BUY: `${SERVER_URL}/orders/market-buy`,
    MARKET_SELL: `${SERVER_URL}/orders/market-sell`,
    TRADE_HISTORIES: `${SERVER_URL}/orders/trade-histories`,
}
