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

const STATUS_THEME = {
    PENDING: { color: "#0062df", background: "#e7f1ff" },
    PROCESSING: { color: "#f08c00", background: "#fff4e6" },
} as const;


export const StatusBadge = styled.span<{ $status: keyof typeof STATUS_THEME }>(({ $status }) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "96px",
    height: "28px",
    borderRadius: "14px",
    fontSize: "12px",
    fontWeight: 700,
    color: STATUS_THEME[$status].color,
    background: STATUS_THEME[$status].background,
}));