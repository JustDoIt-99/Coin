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

export const SummaryValue = styled.strong<{ $danger?: boolean }>`
    font-size: 24px;
    color: ${({ $danger }) => ($danger ? "#e53946" : "#111827")};

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

export const AssetHeader = styled.div`
    height: 58px;
    background: #fff;
    border-left: 1px solid #dfe3ea;
    border-right: 1px solid #dfe3ea;
    display: flex;
    align-items: center;
    padding: 0 28px;

    h3 {
        margin: 0;
        font-size: 20px;
    }

    label {
        margin-left: auto;
        color: #5f6876;
        font-size: 14px;
    }
`;

export const AssetTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    background: #fff;

    th,
    td {
        padding: 0 18px;
    }

    th {
        height: 42px;
        background: #f7f8fa;
        color: #6b7280;
        font-size: 13px;
        font-weight: 600;
        border-bottom: 1px solid #e5e8ef;
        text-align: right;
    }

    td {
        height: 82px;
        text-align: right;
        border-bottom: 1px solid #edf0f5;
        font-size: 16px;
        color: #222;
    }

    th:first-of-type,
    td:first-of-type {
        text-align: center;
    }
`;