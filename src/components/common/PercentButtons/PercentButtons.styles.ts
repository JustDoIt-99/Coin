import styled from "@emotion/styled";

export const PercentGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
`;

export const PercentButton = styled.button<{ active?: boolean }>`
    width: 55px;
    height: 28px;
    background: ${({ active }) =>
            active ? "#e8f1ff" : "#fff"};
    border: 1px solid
    ${({ active }) =>
            active ? "#0062df" : "#d1d5db"};
    color: ${({ active }) =>
            active ? "#0062df" : "#111"};
    border-radius: 6px;
    background: #fff;
    font-size: 13px;
    font-weight: 500;
`;
