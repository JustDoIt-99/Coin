import styled from "@emotion/styled";

export const Container = styled.div`
    width: 100%;
    background-color: #fff;
`;

export const PositionSummary = styled.section`
    border-top: 8px solid #eef1f6;
    min-height: 220px;
    padding: 24px 24px 28px;
    background: #fff;
`;

export const SummaryHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
    color: #222;
    font-size: 15px;
    font-weight: 700;
`;

export const SummaryMarket = styled.span`
    color: #8a94a6;
    font-size: 12px;
    font-weight: 700;
`;

export const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px 20px;
`;

export const SummaryItem = styled.div`
    min-width: 0;
`;

export const SummaryLabel = styled.div`
    margin-bottom: 4px;
    color: #8a94a6;
    font-size: 12px;
    font-weight: 700;
`;

export const SummaryValue = styled.div<{ tone?: "profit" | "loss" | "neutral" }>`
    color: ${({tone}) => {
        if (tone === "profit") return "#d64348";
        if (tone === "loss") return "#126ee2";
        return "#222";
    }};
    font-size: 14px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
`;
