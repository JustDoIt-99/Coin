import styled from "@emotion/styled";


export const PageBackground = styled.main`
    width: 100%;
    min-height: 100vh;
    box-sizing: border-box;
    background: #eef1f6;
    padding: 16px 70px 0;
    overflow: hidden;
`;

export const PageLayout = styled.div`
    height: calc(100vh - 16px);
    display: grid;
    grid-template-columns: minmax(0, 1fr) 420px;
    gap: 12px;
`;

export const ContentArea = styled.section`
    min-width: 0;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
        display: none;
    }
`;

export const SidebarArea = styled.aside`
    height: 100%;
    background: #fff;
    overflow: hidden;
`;

export const TradingOrderPanel = styled.div`
    display: flex;
    margin-top: 10px;
    padding: 3px;
`;

export const TradingPanel = styled.div`
    display: flex;
    flex-direction: column;
`;

export const OrderPanel = styled.div`
    display: flex;
    flex-direction: column;
`;