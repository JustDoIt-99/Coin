import styled from "@emotion/styled";
import type {NameType, SortedKey, SortOrder} from "./MarketSidebar.tsx";
import {Languages} from "lucide-react";
import MarketSortedHeaderCell from "./MarketSortedHeaderCell.tsx";

const Header = styled.div`
    display: grid;
    grid-template-columns: 32px 2.5fr 1.7fr 1.5fr 1.8fr;
    align-items: center;
    height: 36px;
    padding: 0 16px;
    background: #f7f8fa;
    border-bottom: 1px solid #e5e8ec;
    font-size: 12px;
    color: #666;
`;

const Name = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 4px;
    font-weight: 500;
    
    &:hover {
        text-decoration: underline;
        cursor: pointer;
    }
`;

interface Props {
    nameType: NameType;
    setNameType: (nameType: NameType) => void;
    sortKey?: SortedKey;
    sortOrder?: SortOrder;
    handleSort: (key: SortedKey) => void;
}

const SORT_COLUMNS = [
    { label: "현재가", key: "price" },
    { label: "전일대비", key: "change" },
    { label: "거래대금", key: "volume" },
] as const;

function MarketHeaderRow({nameType, setNameType, sortKey, sortOrder, handleSort}: Props) {
    return (
        <Header>
            <div/>
            <Name onClick={() => setNameType(nameType == "korean" ? "english" : "korean")}>
                {nameType === "korean" ? "한글명" : "영문명"}<Languages size={12} color="#999"/>
            </Name>
            {SORT_COLUMNS.map((column) => (
                <MarketSortedHeaderCell
                    key={column.key}
                    label={column.label}
                    targetKey={column.key}
                    sortKey={sortKey}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                />
            ))}
        </Header>
    )
}

export default MarketHeaderRow;