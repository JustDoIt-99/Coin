import {useEffect, useRef, useState} from "react";
import OrderBookPanel from "@pages/market/components/orderbook/OrderBookPanel";
import MarketInfoPanel from "@pages/market/components/orderbook/MarketInfoPanel";
import {
    ColumnHeader,
    MarketInfoWrapper,
    OrderBookContainer, OrderBookHeader,
    Section
} from "@pages/market/components/orderbook/OrderBook/OrderBook.styles";
import TradeListPanel from "@pages/market/components/orderbook/TradeListPanel";
import type {Ticker} from "@api/api";
import useOrderBookSocket, {type OrderbookMessage} from "@hooks/useOrderBookSocket";

const ORDER_BOOK_ROW_HEIGHT = 46;
const INITIAL_VISIBLE_ASK_ROW_COUNT = 7;

interface Props {
    marketCode: string;
    prevClosingPrice?: number;
    ticker?: Ticker;
    active: boolean;
    onSelectPrice?: (price: number) => void;
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

function OrderBook({marketCode, prevClosingPrice, ticker, active, onSelectPrice}: Props) {
    const [orderBook, setOrderBook] = useState<OrderbookMessage | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const hasInitializedScrollRef = useRef(false);

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

    const maxSize = Math.max(
        0,
        ...askRows.map((row) => row.size),
        ...bidRows.map((row) => row.size)
    );

    useEffect(() => {
        hasInitializedScrollRef.current = false;
        setOrderBook(null);
    }, [marketCode]);

    useEffect(() => {
        if (hasInitializedScrollRef.current || askRows.length === 0) {
            return;
        }

        hasInitializedScrollRef.current = true;

        requestAnimationFrame(() => {
            if (!containerRef.current) {
                return;
            }

            containerRef.current.scrollTop = Math.max(
                0,
                (askRows.length - INITIAL_VISIBLE_ASK_ROW_COUNT) * ORDER_BOOK_ROW_HEIGHT
            );
        });
    }, [marketCode, askRows.length]);

    return (
        <OrderBookContainer ref={containerRef} active={active}>
            <OrderBookHeader>
                <ColumnHeader>
                    <span>수량</span>
                    <span>가격</span>
                    <span>등락률</span>
                    <span>거래/체결</span>
                </ColumnHeader>
            </OrderBookHeader>
            <Section>
                <OrderBookPanel type={"ask"} rows={askRows} maxSize={maxSize} onSelectPrice={onSelectPrice}/>
                <MarketInfoWrapper>
                    <MarketInfoPanel ticker={ticker}/>
                </MarketInfoWrapper>
            </Section>
            <Section>
                <OrderBookPanel type={"bid"} rows={bidRows} maxSize={maxSize} onSelectPrice={onSelectPrice}/>
                <TradeListPanel marketCode={marketCode} ticker={ticker}/>
            </Section>
        </OrderBookContainer>
    )
}

export default OrderBook;
