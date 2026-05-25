import styled from "@emotion/styled";

export const Container = styled.section`
    min-width: 800px;
    height: 160px;
    background: #fff;
    border-bottom: 1px solid #dfe3ea;
`;

export const Header = styled.div`
    height: 52px;
    display: grid;
    grid-template-columns: 1.15fr 1.4fr 48px;
    align-items: center;
    border-bottom: 1px solid #dfe3ea;
`;

export const CoinTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 18px;

    strong {
        font-size: 20px;
        font-weight: 700;
    }

    span {
        font-size: 13px;
        color: #555;
    }

    svg {
        color: #555;
    }
`;

export const CoinIcon = styled.div`
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #f7931a;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
`;

export const Content = styled.div`
    height: 100px;
    display: grid;
    grid-template-columns: 1fr 180px 220px 220px;
    align-items: center;
    column-gap: 24px;
    padding: 0 18px;
`;

export const MainPrice = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

export const Price = styled.div<{ color: string }>`
    font-size: 34px;
    font-weight: 700;
    color: ${({ color }) => color};
    letter-spacing: -1px;

    span {
        font-size: 14px;
        font-weight: 500;
        margin-left: 4px;
    }
`;

export const Change = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: #d64348;
`;

export const MiniChartBox = styled.div`
    width: 170px;
    height: 62px;
    background: #fafbfc;
`;

export const StatGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

export const StatRow = styled.div`
    display: grid;
    grid-template-columns: 80px 1fr;
    align-items: center;
    height: 38px;
    border-bottom: 1px solid #e3e6eb;

    span {
        font-size: 13px;
        color: #222;
    }

    strong {
        text-align: right;
        font-size: 14px;
        font-weight: 700;
    }

    small {
        margin-left: 3px;
        font-size: 12px;
        color: #999;
        font-weight: 500;
    }
`;

export const Red = styled.strong`
    color: #d64348;
`;

export const Blue = styled.strong`
    color: #126ee2;
`;