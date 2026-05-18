import {
    Container,
    Header, Price,
    StrengthRow,
    TradeList,
    TradeRow, Volume
} from "@components/market/orderbook/TradeListPanel/TradeListPanel.styles.ts";
import useTradeSocket, {type UpBitTrade} from "@hooks/useTradeSocket.ts";
import {useState} from "react";

interface Props {
    marketCode: string;
}

function TradeListPanel({marketCode}: Props) {

    const [trades, setTrades] = useState<UpBitTrade[]>([]);

    useTradeSocket(marketCode, (trade) => {
        setTrades((prev) => [trade,  ...prev].slice(0, 20));
    })

    return (
        <Container>
            <StrengthRow>
                <span>체결강도</span>
                <strong>+136.49%</strong>
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