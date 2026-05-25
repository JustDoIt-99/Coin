import styled from "@emotion/styled";

export const AssetRow = styled.tr`
    &:hover {
        background: #fafbfc;
    }
`;

export const CoinInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
`;

export const CoinIcon = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid #e1e5eb;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #e53946;
    font-weight: 700;
`;

export const CoinName = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;

    strong {
        font-size: 16px;
    }

    span {
        font-size: 13px;
        color: #606977;
    }
`;

export const Muted = styled.span`
    color: #8b95a1;
    font-size: 13px;
`;

export const Profit = styled.div`
    color: #e53946;
    font-weight: 700;
`;

export const OrderButton = styled.button`
    height: 36px;
    padding: 0 16px;
    border: 1px solid #ccd2dc;
    background: #fff;
    border-radius: 3px;
    font-weight: 700;
    cursor: pointer;
`;