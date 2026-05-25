import {
    Page,
    TabBar,
    TabItem,
    SummarySection,
    SummaryLeft,
    SummaryRight,
    SummaryGrid,
    SummaryRow,
    SummaryValue,
    AssetHeader,
    AssetTable
} from "./PortfolioPage.styles";
import AssetTableRow from "@pages/portfolio/components/assettable/AssetTableRow.tsx";
import type {Asset} from "@pages/portfolio/types.ts";


const tabs = ["보유자산", "투자손익", "거래내역", "미체결", "입출금대기", "자동주문"];

const summaryItems = [
    { label: "보유 KRW", value: "0", unit: "KRW" },
    { label: "총 보유자산", value: "0", unit: "KRW" },
    { label: "총 매수", value: "1", unit: "KRW" },
    { label: "총 평가손익", value: "0", unit: "KRW", danger: true },
    { label: "총 평가", value: "0", unit: "KRW" },
    { label: "총 평가수익률", value: "+317.56", unit: "%", danger: true },
    { label: "주문가능", value: "0", unit: "KRW" },
];

const assets: Asset[] = [
    {
        icon: "△",
        name: "트론",
        symbol: "TRX",
        quantity: "0.00000061",
        avgPrice: "131.0",
        buyAmount: "1",
        valuation: "0",
        profitRate: "+317.56 %",
        profitAmount: "+0 KRW",
    },
    {
        icon: "◎",
        name: "APENFT",
        symbol: "APENFT",
        quantity: "0.00002704",
        avgPrice: "-",
        buyAmount: "-",
        valuation: "-",
        profitRate: "-",
        profitAmount: "",
    },
];

const tableHeaders = [
    "보유자산",
    "보유수량",
    "매수평균가",
    "매수금액",
    "평가금액",
    "평가손익(%)",
    "",
];

function PortfolioPage() {
    return (
        <Page>
            <TabBar>
                {tabs.map((tab) => (
                    <TabItem key={tab} $active={tab === "보유자산"}>
                        {tab}
                    </TabItem>
                ))}
            </TabBar>

            <SummarySection>
                <SummaryLeft>
                    <SummaryGrid>
                        {summaryItems.map((item) => (
                            <SummaryRow key={item.label}>
                                <span>{item.label}</span>
                                <SummaryValue $danger={item.danger}>
                                    {item.value} <small>{item.unit}</small>
                                </SummaryValue>
                            </SummaryRow>
                        ))}
                    </SummaryGrid>
                </SummaryLeft>

                <SummaryRight>
                    보유자산 비중 그래프가 제공됩니다.
                </SummaryRight>
            </SummarySection>
            <AssetHeader>
                <h3>보유자산 목록</h3>
                <label>
                    <input type="checkbox" />
                    거래미지원/소액 자산 숨기기
                </label>
            </AssetHeader>

            <AssetTable>
                <thead>
                <tr>
                    {tableHeaders.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
                </thead>

                <tbody>
                {assets.map((asset) => (
                    <AssetTableRow key={asset.symbol} asset={asset} />
                ))}
                </tbody>
            </AssetTable>
        </Page>
    );
}

export default PortfolioPage;