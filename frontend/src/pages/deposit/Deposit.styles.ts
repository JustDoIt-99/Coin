// @pages/deposit/Deposit.styles.ts
import styled from "@emotion/styled";

export const Container = styled.section`
    min-height: 720px;
    background: #fff;
    border: 1px solid #dfe3ea;
    border-top: none;
`;

export const RequestForm = styled.form`
    height: 72px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    border-bottom: 1px solid #e5e8ef;
    background: #fff;
`;

export const AmountInput = styled.input`
    width: 180px;
    height: 38px;
    padding: 0 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    color: #111827;
    font-size: 14px;
    text-align: right;
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: #0062df;
    }
`;

export const RequestButton = styled.button`
    height: 38px;
    padding: 0 14px;
    border: none;
    border-radius: 4px;
    background: #0062df;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;

    &:disabled {
        background: #a8b6ca;
        cursor: not-allowed;
    }
`;

export const FormMessage = styled.span`
    min-width: 180px;
    color: #6b7280;
    font-size: 13px;
    font-weight: 600;
    text-align: right;
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
    COMPLETED: { color: "#2b8a3e", background: "#ebfbee" },
    REJECTED: { color: "#c92a2a", background: "#fff5f5" },
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

export const EmptyArea = styled.div`
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    font-size: 14px;
    font-weight: 600;
`;
