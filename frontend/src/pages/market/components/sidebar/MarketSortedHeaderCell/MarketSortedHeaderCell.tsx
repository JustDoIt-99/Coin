import {ChevronDown, ChevronUp} from "lucide-react";
import {Cell, SortIcon} from "./MarketSortedHeaderCell.styles.ts";
import type {SortedKey, SortOrder} from "../type.ts";

interface Props {
    label: string;
    targetKey: SortedKey;
    sortKey?: SortedKey;
    sortOrder?: SortOrder;
    onSort: (key: SortedKey) => void;
}

function MarketSortedHeaderCell({
    label,
    targetKey,
    sortKey,
    sortOrder,
    onSort
}:Props) {
    const isActive = sortKey === targetKey;

    return (
        <Cell onClick={() => onSort(targetKey)}>
            {label}
            <SortIcon>
                <ChevronUp
                    size={12}
                    color={isActive && sortOrder === "asc" ? "#111" : "#ccc"}
                />
                <ChevronDown
                    size={12}
                    color={isActive && sortOrder === "desc" ? "#111" : "#ccc"}
                />
            </SortIcon>
        </Cell>
    )
}

export default MarketSortedHeaderCell;
