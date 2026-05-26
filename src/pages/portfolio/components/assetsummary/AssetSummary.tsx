import {
    SummarySection,
    SummaryLeft,
    SummaryRight,
    SummaryGrid,
    SummaryRow,
    SummaryValue,
} from "./AssetSummary.styles";

const summaryItems = [
    { label: "보유 KRW", value: "0", unit: "KRW" },
    { label: "총 보유자산", value: "0", unit: "KRW" },
    { label: "총 매수", value: "1", unit: "KRW" },
    { label: "총 평가손익", value: "0", unit: "KRW", danger: true },
    { label: "총 평가", value: "0", unit: "KRW" },
    { label: "총 평가수익률", value: "+317.56", unit: "%", danger: true },
    { label: "주문가능", value: "0", unit: "KRW" },
];

function AssetSummary() {
    return (
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
    );
}

export default AssetSummary;