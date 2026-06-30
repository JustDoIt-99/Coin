import styled from "@emotion/styled";

export const Page = styled.main`
    min-width: 1280px;
    min-height: calc(100vh - 56px);
    padding: 18px 28px;
    background: #eef1f6;
    box-sizing: border-box;
`;

export const Panel = styled.section`
    background: #fff;
    border: 1px solid #dfe3ea;
`;

export const Toolbar = styled.div`
    height: 58px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #e5e8ef;
`;

export const Title = styled.h1`
    margin: 0;
    color: #111827;
    font-size: 18px;
    font-weight: 800;
`;

export const RefreshButton = styled.button`
    height: 34px;
    padding: 0 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    background: #fff;
    color: #374151;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;

    &:disabled {
        color: #9ca3af;
        cursor: not-allowed;
    }
`;

export const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;

    th,
    td {
        height: 52px;
        padding: 0 12px;
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
        font-size: 13px;
        font-weight: 500;
    }
`;

export const EmptyArea = styled.div`
    height: 260px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    font-size: 14px;
    font-weight: 600;
`;

export const ActionGroup = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
`;

export const ApproveButton = styled.button`
    height: 30px;
    padding: 0 10px;
    border: none;
    border-radius: 4px;
    background: #0062df;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;

    &:disabled {
        background: #a8b6ca;
        cursor: not-allowed;
    }
`;

export const RejectButton = styled(ApproveButton)`
    background: #c92a2a;

    &:disabled {
        background: #d7a4a4;
    }
`;
