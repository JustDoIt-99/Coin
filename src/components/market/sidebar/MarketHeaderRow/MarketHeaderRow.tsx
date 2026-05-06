import {Languages} from "lucide-react";
import MarketSortedHeaderCell from "@components/market/sidebar/MarketSortedHeaderCell";
import {Header, Name} from "./MarketHeaderRow.styles.ts";
import type {NameType, SortedKey, SortOrder} from "@components/market/sidebar/type.ts";

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