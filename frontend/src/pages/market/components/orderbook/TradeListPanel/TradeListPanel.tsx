import {
    Container,
    Header, Price,
    StrengthRow,
    TradeList,
    TradeRow, Volume
} from "@pages/market/components/orderbook/TradeListPanel/TradeListPanel.styles";
import useTradeSocket, {type UpBitTrade} from "@hooks/useTradeSocket";
import {useState} from "react";
import type {Ticker} from "@api/api";

interface Props {
    marketCode: string;
    ticker?: Ticker;
}

function TradeListPanel({marketCode, ticker}: Props) {

    const [trades, setTrades] = useState<UpBitTrade[]>([]);

    useTradeSocket(marketCode, (trade) => {
        setTrades((prev) => [trade,  ...prev].slice(0, 20));
    });

    const strength = ticker?.acc_ask_volume ? (ticker.acc_bid_volume / ticker.acc_ask_volume) * 100 : 0;

    return (
        <Container>
            <StrengthRow>
                <span>체결강도</span>
                <strong>
                    {strength >= 100 ? "+" : ""}
                    {strength.toFixed(2)}%
                </strong>
            </StrengthRow>
            <Header>
                <span>체결가</span>
                <span>체결량</span>
            </Header>
            <TradeList>
                {trades.map((trade, index) => (
                    <TradeRow key={`${trade.trade_timestamp}-${index}`}>
                        <Price>{trade.trade_price.toLocaleString()}</Price>
                        <Volume side={trade.ask_bid === "ASK" ? "ask" : "bid"}>
                            {trade.trade_volume.toFixed(3)}
                        </Volume>
                    </TradeRow>
                ))}
            </TradeList>
        </Container>
    )
}

export default TradeListPanel;