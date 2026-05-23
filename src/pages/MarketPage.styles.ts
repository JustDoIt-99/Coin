import styled from "@emotion/styled";


export const PageBackground = styled.main`
    width: 100%;
    min-height: 100vh;
    box-sizing: border-box;
    background: #eef1f6;
    overflow: hidden;
`;

export const PageLayout = styled.div`
    width: min(100%, 1400px);
    height: calc(100vh - 16px);

    margin: 0 auto;
    
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
    width: 100%;
    display: grid;
    gap: 10px;
    grid-template-columns: 500px 465px;
    margin-top: 12px;
`;

export const TradingPanel = styled.div`
    display: flex;
    flex-direction: column;
`;

export const OrderPanel = styled.div`
    width: 100%;
    min-width: 360px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

export const ChartArea = styled.div`
    width: 100%;
    min-width: 930px;
    background: #fff;
`;