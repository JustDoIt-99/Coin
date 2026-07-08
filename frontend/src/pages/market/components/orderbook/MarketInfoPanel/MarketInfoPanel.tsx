import {
    Container,
    InfoGroup,
    InfoRow,
    Value,
    Unit,
    DateText,
    RedValue,
    BlueValue,
} from "./MarketInfoPanel.styles";
import type {Ticker} from "@api/api";

interface Props {
    ticker?: Ticker;
}

function MarketInfoPanel({ticker}: Props) {
    if (!ticker) return null;

    const highRate = ((ticker.high_price - ticker.prev_closing_price) / ticker.prev_closing_price) * 100;
    const lowRate = ((ticker.low_price - ticker.prev_closing_price) / ticker.prev_closing_price) * 100;

    return (
        <Container>
            <InfoGroup>
                <InfoRow>
                    <span>거래량</span>
                    <Value>
                        {ticker.acc_trade_volume_24h.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                        })}{" "}
                        <Unit>{ticker.market.split('-')[1]}</Unit>
                    </Value>
                </InfoRow>
                <InfoRow>
                    <span>거래대금</span>
                    <Value>
                        {Math.round(ticker.acc_trade_price_24h / 1_000_000).toLocaleString()}{" "}
                        <Unit>백만원</Unit>
                    </Value>
                </InfoRow>
                <DateText>(최근24시간)</DateText>
            </InfoGroup>
            <InfoGroup>
                <InfoRow>
                    <span>52주 최고</span>
                    <RedValue>{ticker.highest_52_week_price.toLocaleString()}</RedValue>
                </InfoRow>
                <DateText>({ticker.highest_52_week_date})</DateText>
                <InfoRow>
                    <span>52주 최저</span>
                    <BlueValue>{ticker.lowest_52_week_price.toLocaleString()}</BlueValue>
                </InfoRow>
                <DateText>({ticker.lowest_52_week_date})</DateText>
            </InfoGroup>
            <InfoGroup>
                <InfoRow>
                    <span>전일종가</span>
                    <Value>{ticker.prev_closing_price.toLocaleString()}</Value>
                </InfoRow>
                <InfoRow>
                    <span>당일고가</span>
                    <RedValue>{ticker.high_price.toLocaleString()}</RedValue>
                </InfoRow>
                <DateText className="red">{highRate > 0 ? "+" : ""}{highRate.toFixed(2)}%</DateText>
                <InfoRow>
                    <span>당일저가</span>
                    <BlueValue>{ticker.low_price.toLocaleString()}</BlueValue>
                </InfoRow>
                <DateText className="blue">{lowRate > 0 ? "+" : ""}{lowRate.toFixed(2)}%</DateText>
            </InfoGroup>
        </Container>
    );
}

export default MarketInfoPanel;