import styled from "@emotion/styled";

export const Container = styled.aside`
    width: 200px;
    background: #fff;
    font-size: 12px;
    padding: 0px 7px;
    color: #222;
`;

export const StrengthRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;

    height: 34px;
    padding: 0 12px;

    border-top: 1px solid #dfe3ea;
    border-bottom: 1px solid #eef1f5;

    span {
        color: #555;
        font-weight: 600;
    }

    strong {
        font-weight: 700;
        color: #222;
    }
`;

export const Header = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: 34px;

    background: #f8f9fb;
    border-bottom: 1px solid #eef1f5;

    span {
        display: flex;
        align-items: center;
        justify-content: center;

        color: #666;
        font-weight: 700;

        &:first-of-type {
            border-right: 1px solid #e1e5ec;
        }
    }
`;

export const TradeList = styled.div`
    display: flex;
    flex-direction: column;
`;

export const TradeRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;

    height: 24px;
    padding: 0 10px;
`;

export const Price = styled.span`
    display: flex;
    align-items: center;
    justify-content: flex-start;

    font-variant-numeric: tabular-nums;
`;

export const Volume = styled.span<{ side: "ask" | "bid" }>`
    display: flex;
    align-items: center;
    justify-content: flex-end;

    color: ${({side}) => (side === "ask" ? "#d64348" : "#126ee2")};
    font-variant-numeric: tabular-nums;
`;