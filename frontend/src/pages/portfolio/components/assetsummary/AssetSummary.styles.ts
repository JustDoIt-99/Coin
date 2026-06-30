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

export const DetailSection = styled.section`
    margin-top: 18px;
    min-height: 360px;
    background: #fff;
    border: 1px solid #dfe3ea;
`;

export const DetailHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 52px;
    padding: 0 24px;
    border-bottom: 1px solid #edf0f4;
`;

export const DetailTitle = styled.h3`
    margin: 0;
    color: #111827;
    font-size: 16px;
    font-weight: 800;
`;

export const DetailCount = styled.span`
    color: #8b95a1;
    font-size: 13px;
    font-weight: 700;
`;

export const AssetTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;

    th,
    td {
        height: 48px;
        padding: 0 14px;
        border-bottom: 1px solid #edf0f4;
        text-align: right;
        font-size: 14px;
        white-space: nowrap;
    }

    th {
        color: #6b7280;
        background: #fafbfc;
        font-weight: 800;
    }

    td {
        color: #1f2937;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
    }

    th:first-of-type,
    td:first-of-type {
        text-align: left;
        padding-left: 24px;
    }

    tr:last-of-type td {
        border-bottom: none;
    }
`;

export const AssetCodeCell = styled.div`
    display: flex;
    flex-direction: column;
    gap: 3px;
`;

export const AssetCode = styled.strong`
    color: #111827;
    font-size: 14px;
    font-weight: 800;
`;

export const AssetMarket = styled.span`
    color: #8b95a1;
    font-size: 12px;
    font-weight: 700;
`;

export const TrendText = styled.span<{ $trend?: "up" | "down" }>`
    color: ${({$trend}) => {
        if ($trend === "up") return "#e53946";
        if ($trend === "down") return "#126ee2";
        return "#1f2937";
    }};
`;

export const EmptyDetail = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 307px;
    color: #8b95a1;
    font-size: 14px;
    font-weight: 700;
`;
