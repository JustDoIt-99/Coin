// @pages/deposit/Deposit.styles.ts
import styled from "@emotion/styled";

export const Container = styled.section`
    min-height: 720px;
    background: #fff;
    border: 1px solid #dfe3ea;
    border-top: none;
`;

export const DepositTable = styled.table`
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

export const StatusBadge = styled.span<{ $status: string }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-width: 96px;
    height: 28px;
    border-radius: 14px;

    font-size: 12px;
    font-weight: 700;

    color: ${({ $status }) =>
            $status === "처리중" ? "#f08c00" : "#0062df"};

    background: ${({ $status }) =>
            $status === "처리중" ? "#fff4e6" : "#e7f1ff"};
`;