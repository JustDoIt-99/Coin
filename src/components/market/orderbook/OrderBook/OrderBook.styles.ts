import styled from "@emotion/styled";

export const OrderBookContainer = styled.div`
    height: 700px;
    width: 500px;
    background-color: #fff;
    overflow-y: auto;
    overflow-x: hidden;
`;

export const Section = styled.div`
    display: grid;
    grid-template-columns: 290px 150px;
`;

export const MarketInfoWrapper = styled.div`
    align-self: end;
`;

export const OrderBookHeader = styled.div`
    position: sticky;
    top: 0;
    z-index: 10;
    background: #fff;
    border-bottom: 1px solid #e5e8ee;
`;

export const ColumnHeader = styled.div`
    display: grid;
    grid-template-columns: 85px 120px 65px 235px;
    height: 32px;
    background: #f8f9fb;

    span {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 600;
        color: #666;
    }
`;