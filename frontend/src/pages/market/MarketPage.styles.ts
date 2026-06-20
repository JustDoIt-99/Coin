import styled from "@emotion/styled";


export const PageBackground = styled.main`
    width: 100%;
    min-height: 100vh;
    box-sizing: border-box;
    background: #eef1f6;
    overflow: hidden;
    margin-top: 15px;
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

export const ChartToolbar = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 36px;
    padding: 4px 10px;
    border-bottom: 1px solid #e5e8ee;
    box-sizing: border-box;
`;

export const ChartIntervalSelect = styled.select`
    height: 28px;
    min-width: 96px;
    padding: 0 28px 0 10px;
    border: 1px solid #d9dee8;
    background: #fff;
    color: #333;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    outline: none;

    &:focus {
        border-color: #126ee2;
    }
`;

export const MovingAverageControls = styled.div`
    position: relative;
    display: inline-flex;
    align-items: center;
`;

export const MovingAverageTrigger = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 28px;
    min-width: 108px;
    padding: 0 8px 0 10px;
    border: 1px solid #d9dee8;
    background: #fff;
    color: #333;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        border-color: #126ee2;
        color: #126ee2;
    }
`;

export const MovingAverageDropdown = styled.div`
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    z-index: 20;
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 156px;
    padding: 8px;
    border: 1px solid #d9dee8;
    background: #fff;
    box-shadow: 0 8px 20px rgba(17, 24, 39, 0.12);
    box-sizing: border-box;
`;

export const MovingAverageChip = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 26px;
    width: 100%;
    padding: 0 4px 0 8px;
    border: 1px solid #d9dee8;
    background: #fff;
    color: #333;
    font-size: 12px;
    font-weight: 600;
    box-sizing: border-box;
`;

export const MovingAverageColor = styled.span<{ color: string }>`
    width: 8px;
    height: 8px;
    background: ${({ color }) => color};
`;

export const MovingAverageForm = styled.form`
    display: grid;
    grid-template-columns: minmax(0, 1fr) 26px;
    gap: 6px;
    padding-top: 2px;
`;

export const MovingAverageRemoveButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: 0;
    background: transparent;
    color: #6b7280;
    cursor: pointer;
    padding: 0;
    margin-left: auto;

    &:hover {
        color: #111827;
    }
`;

export const MovingAverageInput = styled.input`
    width: 54px;
    height: 26px;
    border: 1px solid #d9dee8;
    padding: 0 6px;
    font-size: 12px;
    font-weight: 600;
    color: #333;
    outline: none;
    box-sizing: border-box;

    &:focus {
        border-color: #126ee2;
    }
`;

export const MovingAverageButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: 1px solid #d9dee8;
    background: #fff;
    color: #333;
    cursor: pointer;
    padding: 0;

    &:hover {
        border-color: #126ee2;
        color: #126ee2;
    }
`;
