import type {SortedKey, SortOrder} from "./MarketSidebar.tsx";
import styled from "@emotion/styled";
import {ChevronDown, ChevronUp} from "lucide-react";
import {Cell, SortIcon} from "./MarketSortedHeaderCell.styles.ts";

interface Props {
    label: string;
    targetKey: SortedKey;
    sortKey?: SortedKey;
    sortOrder?: SortOrder;
    onSort: (key: SortedKey) => void;
}

const Cell = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

const SortIcon = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 0;

  svg {
    width: 12px;
    height: 12px;
  }

  svg:first-of-type {
    margin-bottom: -5px;
  }
`;

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