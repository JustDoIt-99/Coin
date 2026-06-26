import styled from "@emotion/styled";

export const Container = styled.div`
    background: #fff;
    border: 1px solid #dfe3ea;
    border-top: none;
    min-height: 720px;
`;

export const FilterBar = styled.div`
    height: 72px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 20px;
    border-bottom: 1px solid #e5e8ef;
`;

export const CancelAllButton = styled.button`
    min-width: 88px;
    height: 36px;

    padding: 0 16px;

    border: 1px solid #d7dde5;
    border-radius: 4px;

    background: #fff;
    color: #555f70;

    font-size: 13px;
    font-weight: 600;

    cursor: pointer;

    transition: all 0.15s ease;

    &:hover:not(:disabled) {
        background: #f7f8fa;
        border-color: #c7cfda;
    }

    &:disabled {
        background: #f3f4f6;
        color: #b0b8c3;
        cursor: not-allowed;
    }
`;

export const PendingTable = styled.table`

    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    background: #fff;
    th,
    td {
        height: 52px;
        padding: 0 16px;
        text-align: center;
        border-bottom: 1px solid #e5e8ef;
        white-space: nowrap;
    }

    th {
        background: #f7f8fa;
        color: #555f70;
        font-size: 13px;
        font-weight: 700;
    }

    td {
        color: #222;
        font-size: 14px;
        font-weight: 500;
    }
`;
export const EmptyArea = styled.div`
    height: 520px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    gap: 16px;

    color: #8b95a1;
    font-size: 15px;
`;

export const EmptyIcon = styled.div`
    width: 36px;
    height: 36px;

    background: #eef1f6;
    border-radius: 4px;

    position: relative;

    &::after {
        content: "";
        position: absolute;
        right: 0;
        bottom: 0;

        width: 12px;
        height: 12px;

        background: #d8dde6;
        clip-path: polygon(100% 0, 0 100%, 100% 100%);
    }
`;

export const CancelButton = styled.button`
    width: 64px;
    height: 32px;
    border: 1px solid #dfe3ea;
    border-radius: 4px;
    background: white;
    color: #555;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;

    &:hover:not(:disabled) {
        background: #f7f8fa;
    }

    &:disabled {
        color: #a3acb8;
        background: #f3f4f6;
        cursor: not-allowed;
    }
`;

export const FilterButtonGroup = styled.div`
    display: flex;
`;

export const FilterButton = styled.button<{ $active?: boolean }>`
    height: 44px;
    min-width: 86px;
    padding: 0 20px;

    border: 1px solid ${({ $active }) => ($active ? "#0062df" : "#d2d7df")};
    background: #fff;
    color: ${({ $active }) => ($active ? "#0062df" : "#4b5563")};

    font-size: 16px;
    font-weight: 700;
    cursor: pointer;

    & + & {
        margin-left: -1px;
    }
`;
