import styled from "@emotion/styled";

export type TradeType = "buy" | "sell";

const tradeColor = {
    buy: "#e53935",
    sell: "#1976d2",
};

export const Form = styled.div`
    width: 100%;
    padding: 20px 20px;
    box-sizing: border-box;
`;

export const Row = styled.div`
    display: grid;
    grid-template-columns: 100px minmax(0, 1fr);
    align-items: center;
    gap: 14px;
    margin-bottom: 12px;
`;

export const Label = styled.div`
    font-size: 15px;
    font-weight: 500;
    color: #4b5563;

    span {
        font-size: 12px;
        color: #9ca3af;
    }
`;

export const OrderTypeTabs = styled.div`
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    height: 36px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    overflow: hidden;
`;

export const OrderTypeButton = styled.button<{ active?: boolean }>`
    border: none;
    border-right: 1px solid #d1d5db;
    background: ${({ active }) =>
    active ? "#eef5ff" : "#fff"};
    color: ${({ active }) =>
    active ? "#0062df" : "#4b5563"};
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    &:last-of-type {
        border-right: none;
    }
`;

export const InputBox = styled.div`
    width: 100%;
    height: 42px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 12px;
    box-sizing: border-box;
    font-size: 15px;
    font-weight: 500;
`;

export const PercentGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
`;

export const PercentRow = styled.div`
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr);
  gap: 12px;
  margin-bottom: 12px;
`;

export const PercentButton = styled.button`
    height: 30px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #fff;
    font-size: 13px;
    font-weight: 500;
`;

export const Divider = styled.div`
    height: 1px;
    background: #e5e7eb;
    margin: 16px 0 10px;
`;

export const Notice = styled.div`
    text-align: right;
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
    margin-bottom: 12px;
`;

export const ButtonRow = styled.div`
    width: 100%;
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: 10px;
`;

export const ResetButton = styled.button`
    height: 44px;
    border: none;
    border-radius: 6px;
    background: #5b6472;
    color: white;
    font-size: 15px;
    font-weight: 500;
`;

export const SubmitButton = styled.button<{ tradeType: TradeType }>`
    height: 44px;
    border: none;
    border-radius: 6px;
    background: ${({tradeType}) => tradeColor[tradeType]};
    color: white;
    font-size: 16px;
    font-weight: 500;
`;

export const RightText = styled.div`
    width: 100%;
    text-align: right;
    font-size: 15px;
    font-weight: 700;
    color: #111827;
`;