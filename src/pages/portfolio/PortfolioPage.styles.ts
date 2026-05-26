import styled from "@emotion/styled";

export const Page = styled.main`
    min-width: 1280px;
    min-height: calc(100vh - 56px);
    background: #eef1f6;
    padding: 18px 28px;
    box-sizing: border-box;
`;

export const TabBar = styled.div`
    height: 58px;
    background: #fff;
    border: 1px solid #dfe3ea;
    border-top: none;
    display: flex;
`;

export const TabItem = styled.button<{ $active?: boolean }>`
    flex: 1;

    border: none;
    background: #fff;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    color: ${({ $active }) => ($active ? "#0062df" : "#222")};
    border-bottom: ${({ $active }) => ($active ? "3px solid #0062df" : "3px solid transparent")};
`;