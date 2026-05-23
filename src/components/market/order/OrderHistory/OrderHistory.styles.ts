import styled from "@emotion/styled";

export const Container = styled.div<{ history?: boolean }>`
    width: 355px;
    height: 650px;
    background: #fff;
`;

export const FilterBar = styled.div`
    flex-shrink: 0;
    height: 46px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #e5e7eb;

`;

export const TableScroll = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 999px;
    }
`;

export const Table = styled.div`
    width: 100%;
    Height: 100%;
`;

export const Header = styled.div`
    display: grid;
    grid-template-columns: 82px 82px 1fr 86px;
    position: sticky;
    top: 0;
    z-index: 1;
    border-bottom: 1px solid #e5e7eb;
    background: #fafafa;
    color: #666;
    font-size: 11px;
    font-weight: 700;
`;

export const HeaderCell = styled.div`
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid #e5e7eb;

    &:last-of-type {
        border-right: none;
    }

`;

export const Row = styled.div`
    display: grid;
    grid-template-columns: 82px 82px 1fr 86px;
    min-height: 58px;
    border-bottom: 1px solid #e5e7eb;
`;

export const Cell = styled.div`
    min-width: 0;
    padding: 8px 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid #e5e7eb;
    box-sizing: border-box;

    &:last-of-type {
        border-right: none;
    }
`;

export const DateCell = styled(Cell)`
    flex-direction: column;
    align-items: flex-start;
    font-size: 11px;
    line-height: 1.45;
`;

export const MarketCell = styled(Cell)`
    flex-direction: column;
    gap: 2px;
    font-size: 12px;
    font-weight: 800;
`;

export const SideText = styled.span<{ side: Side }>`
    color: ${({side}) => (side === "buy" ? "#e53935" : "#1976d2")};
    font-size: 12px;
    font-weight: 800;
`;

export const PriceCell = styled(Cell)`
    flex-direction: column;
    align-items: flex-end;
    font-size: 11px;
    line-height: 1.45;
`;

export const QuantityCell = styled(Cell)`
    justify-content: flex-end;
    font-size: 11px;
`;

export const RadioGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 13px;
  font-weight: 700;
  color: #374151;

  label {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }

  input {
    width: 14px;
    height: 14px;
    cursor: pointer;
  }

`;

export const Period = styled.button`
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  cursor: pointer;
`;

export type Side = "buy" | "sell";