import {Bitcoin, ChevronDown, Settings} from "lucide-react";
import {
    Blue,
    Change,
    CoinIcon,
    CoinTitle, Container, Content,
    Header, MainPrice, MiniChartBox, Price, Red,
    SettingButton, StatGroup, StatRow,
    Tab,
    Tabs
} from "./CoinDetail.styles.ts";
import type {Market, Ticker} from "@api/api.ts";

interface Props {
    market:Market | null;
    ticker?: Ticker
}

function CoinDetail({market, ticker} : Props) {

    const marketCode = market?.market ?? "KRW-BTC";
    const coinName = market?.korean_name ?? "비트코인";
    const [baseMarket, symbol] = marketCode.split("-");

    const changeRate = ticker?.signed_change_rate ?? 0;
    const isPositive = changeRate > 0;
    const isNegative = changeRate < 0;

    const changeColor = changeRate > 0 ? "#d64348" : changeRate < 0 ? "#126ee2" : "#222";

    return (
        <Container>
            <Header>
                <CoinTitle>
                    <CoinIcon>
                        <Bitcoin />
                    </CoinIcon>
                    <strong>{coinName}</strong>
                    <span>
            {symbol}/{baseMarket}
          </span>
                    <ChevronDown size={18} />
                </CoinTitle>
                <Tabs>
                    <Tab active>시세</Tab>
                    <Tab>정보</Tab>
                    <Tab>마켓 인사이트</Tab>
                </Tabs>
                <SettingButton>
                    <Settings size={22} />
                </SettingButton>
            </Header>
            <Content>
                <MainPrice>
                    <Price color={changeColor}>
                        {ticker?.trade_price?.toLocaleString() ?? "-"}
                        <span>{baseMarket}</span>
                    </Price>
                    <Change
                        style={{
                            color: isPositive ? "#d64348" : isNegative ? "#126ee2" : "#222",
                        }}
                    >
                        {ticker
                            ? `${(ticker.signed_change_rate * 100).toFixed(2)}% ${
                                isPositive ? "▲" : isNegative ? "▼" : ""
                            } ${ticker.signed_change_price.toLocaleString()}`
                            : "-"}
                    </Change>
                </MainPrice>
                <MiniChartBox />
                <StatGroup>
                    <StatRow>
                        <span>고가</span>
                        <Red>{ticker?.high_price?.toLocaleString() ?? "-"}</Red>
                    </StatRow>
                    <StatRow>
                        <span>저가</span>
                        <Blue>{ticker?.low_price?.toLocaleString() ?? "-"}</Blue>
                    </StatRow>
                </StatGroup>
                <StatGroup>
                    <StatRow>
                        <span>거래량(24H)</span>
                        <strong>
                            {ticker?.acc_trade_volume_24h?.toLocaleString(undefined, {
                                maximumFractionDigits: 3,
                            }) ?? "-"}
                            <small>{symbol}</small>
                        </strong>
                    </StatRow>
                    <StatRow>
                        <span>거래대금(24H)</span>
                        <strong>
                            {ticker?.acc_trade_price_24h?.toLocaleString() ?? "-"}
                            <small>{baseMarket}</small>
                        </strong>
                    </StatRow>
                </StatGroup>
            </Content>
        </Container>
    );
}

export default CoinDetail;