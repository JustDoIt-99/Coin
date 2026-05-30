import styled from "@emotion/styled";

export const HistoryContainer = styled.section`
    background: #fff;
    border-left: 1px solid #dfe3ea;
    border-right: 1px solid #dfe3ea;
    border-bottom: 1px solid #dfe3ea;
    min-height: calc(100vh - 150px);
`;

export const FilterSection = styled.div`
    height: 150px;
    display: grid;
    grid-template-columns: 1.1fr 1.1fr 1fr;
    gap: 52px;
    padding: 28px 34px;
    box-sizing: border-box;
    border-bottom: 1px solid #dfe3ea;
`;

export const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

export const FilterTitle = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: #344054;

    span {
        margin-left: 8px;
        color: #8b95a1;
        font-weight: 600;
    }
`;

export const PeriodButtonGroup = styled.div`
    display: flex;
`;

export const FilterButton = styled.button<{ $active?: boolean }>`
    width: 86px;
    height: 44px;
    padding: 0;

    box-sizing: border-box;
    position: relative;
    z-index: ${({ $active }) => ($active ? 2 : 1)};
    border: 1px solid ${({ $active }) => ($active ? "#0062df" : "#d2d7df")};
    background: #fff;

    color: ${({ $active }) => ($active ? "#0062df" : "#4b5563")};
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    outline: none;

    & + & {
        margin-left: -1px;
    }
`;

export const CoinSearchBox = styled.div`
    height: 44px;
    display: flex;
    border: 1px solid #d2d7df;
    border-radius: 4px;
    overflow: hidden;

    input {
        flex: 1;
        border: none;
        padding: 0 16px;
        font-size: 16px;
        outline: none;
    }

    button {
        width: 54px;
        border: none;
        background: #fff;
        color: #0062df;
        font-size: 24px;
        cursor: pointer;
    }
`;

export const HistoryTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    background: #fff;

    th,
    td {
        height: 46px;
        padding: 0 14px;
        border-bottom: 1px solid #e5e8ef;
        text-align: center;
        white-space: nowrap;
    }

    th {
        background: #f7f8fa;
        color: #555f70;
        font-size: 14px;
        font-weight: 700;
    }

    td {
        color: #222;
        font-size: 14px;
        font-weight: 500;
    }

    tbody tr:hover {
        background: #fafbfc;
    }

    th:nth-of-type(1),
    td:nth-of-type(1),
    th:nth-of-type(10),
    td:nth-of-type(10) {
        width: 13%;
    }

    th:nth-of-type(2),
    td:nth-of-type(2),
    th:nth-of-type(3),
    td:nth-of-type(3),
    th:nth-of-type(4),
    td:nth-of-type(4) {
        width: 8%;
    }

    th:nth-of-type(5),
    td:nth-of-type(5),
    th:nth-of-type(6),
    td:nth-of-type(6),
    th:nth-of-type(7),
    td:nth-of-type(7),
    th:nth-of-type(8),
    td:nth-of-type(8),
    th:nth-of-type(9),
    td:nth-of-type(9) {
        width: 10%;
    }
`;