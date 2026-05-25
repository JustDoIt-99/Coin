import {useState} from "react";
import useOrderBookSocket from "@hooks/useOrderBookSocket.ts";
import OrderBookPanel from "@pages/market/components/orderbook/OrderBookPanel";
import MarketInfoPanel from "@pages/market/components/orderbook/MarketInfoPanel";
import {
    ColumnHeader,
    MarketInfoWrapper,
    OrderBookContainer, OrderBookHeader,
    Section
} from "@pages/market/components/orderbook/OrderBook/OrderBook.styles.ts";
import TradeListPanel from "@pages/market/components/orderbook/TradeListPanel";
import type {Ticker} from "@api/api.ts";

interface Props {
    marketCode: string;
    prevClosingPrice?: number;
    ticker?: Ticker;
    active: boolean;
}

export interface OrderBookUnit {
    ask_price: number;
    bid_price: number;
    ask_size: number;
    bid_size: number;
}

export interface UpBitOrderBook {
    code: string;
    timestamp: number;
    total_ask_size: number;
    total_bid_size: number;
    orderbook_units: OrderBookUnit[];
}

function OrderBook({marketCode, prevClosingPrice, ticker, active}: Props) {
    const [orderBook, setOrderBook] = useState<UpBitOrderBook | null>(null);

    useOrderBookSocket(marketCode, setOrderBook);

    const units = orderBook?.orderbook_units ?? [];

    const askRows = units.map((unit: OrderBookUnit ) => ({
        price: unit.ask_price,
        size: unit.ask_size,
        rate: prevClosingPrice ? ((unit.ask_price - prevClosingPrice) / prevClosingPrice * 100) : 0
    }))
        .sort((a, b) => b.price - a.price);

    const bidRows = units.map((unit: OrderBookUnit) => ({
        price: unit.bid_price,
        size: unit.bid_size,
        rate: prevClosingPrice ? ((unit.bid_price - prevClosingPrice) / prevClosingPrice * 100) : 0
    }));

    return (
        <OrderBookContainer active={active}>
            <OrderBookHeader>
                <ColumnHeader>
                    <span>수량</span>
                    <span>가격</span>
                    <span>등락률</span>
                    <span>거래/체결</span>
                </ColumnHeader>
            </OrderBookHeader>
            <Section>
                <OrderBookPanel type={"ask"} rows={askRows}/>
                <MarketInfoWrapper>
                    <MarketInfoPanel ticker={ticker}/>
                </MarketInfoWrapper>
            </Section>
            <Section>
                <OrderBookPanel type={"bid"} rows={bidRows}/>
                <TradeListPanel marketCode={marketCode} ticker={ticker}/>
            </Section>
        </OrderBookContainer>
    )
}

export default OrderBook;