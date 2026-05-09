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
} from "@components/market/coindetail/CoinDetail.styles.ts";
import type {Market} from "@api/api.ts";

interface Props {
    market:Market | null;
}

function CoinDetail({market} : Props) {

    console.log(market);

    return (
        <Container>
            <Header>
                <CoinTitle>
                    <CoinIcon>
                        <Bitcoin />
                    </CoinIcon>
                    <strong>비트코인</strong>
                    <span>BTC/KRW</span>
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
                    <Price>
                        118,423,000<span>KRW</span>
                    </Price>
                    <Change>+0.23% ▲ 273,000</Change>
                </MainPrice>

                <MiniChartBox />

                <StatGroup>
                    <StatRow>
                        <span>고가</span>
                        <Red>118,750,000</Red>
                    </StatRow>
                    <StatRow>
                        <span>저가</span>
                        <Blue>118,106,000</Blue>
                    </StatRow>
                </StatGroup>

                <StatGroup>
                    <StatRow>
                        <span>거래량(24H)</span>
                        <strong>
                            908.135<small>BTC</small>
                        </strong>
                    </StatRow>
                    <StatRow>
                        <span>거래대금(24H)</span>
                        <strong>
                            107,377,789,197<small>KRW</small>
                        </strong>
                    </StatRow>
                </StatGroup>
            </Content>
        </Container>
    );
}

export default CoinDetail;