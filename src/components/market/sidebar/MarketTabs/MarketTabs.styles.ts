import styled from "@emotion/styled";

export const Tabs = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    height: 48px;
    border-right: 1px solid #dfe3ea;
    border-bottom: 1px solid #dfe3ea;
`;

export const TabButton = styled.button<{ isActive: boolean }>`
    border: none;
    background: #fff;
    cursor: pointer;
    font-weight: 700;
    color: ${({isActive}) => (isActive ? "#0062df" : "#333")};
    border-bottom: ${({isActive}) =>
    isActive ? "3px solid #0062df" : "3px solid transparent"};
`;