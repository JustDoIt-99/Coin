import styled from "@emotion/styled";

export const SummarySection = styled.section`
    height: 300px;
    background: #fff;
    border-left: 1px solid #dfe3ea;
    border-right: 1px solid #dfe3ea;
    display: grid;
    grid-template-columns: 3fr 2fr;
`;

export const SummaryLeft = styled.div`
    padding: 38px 42px;
    border-right: 1px solid #e5e8ef;
`;

export const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    row-gap: 22px;
    column-gap: 70px;
`;

export const SummaryRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #3b4350;
    font-size: 17px;
`;

export const SummaryValue = styled.strong<{ $trend?: "up" | "down" }>`
    font-size: 24px;
    color: ${({ $trend }) => {
        if ($trend === "up") return "#e53946";
        if ($trend === "down") return "#126ee2";
        return "#111827";
    }};

    small {
        font-size: 12px;
        color: #8b95a1;
        margin-left: 4px;
    }
`;

export const SummaryRight = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8b8f98;
    font-size: 18px;
`;

export const ChartBox = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 32px;
    width: 100%;
`;

export const DonutBox = styled.div`
    width: 180px;
    height: 180px;
    flex-shrink: 0;
`;

export const LegendList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-top: 32px;
`;

export const ColorDot = styled.div<{ $color: string }>`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    flex-shrink: 0;
`;

export const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const CoinName = styled.span`
    font-size: 15px;
    font-weight: 500;
    color: #6b7280;
`;

export const CoinWeight = styled.span`
    font-size: 15px;
    font-weight: 700;
    color: #111827;
`;