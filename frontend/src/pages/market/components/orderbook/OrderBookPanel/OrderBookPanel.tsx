import {OrderBookList, Panel} from "@pages/market/components/orderbook/OrderBookPanel/OrderBookPanel.styles";
import OrderBookRow from "@pages/market/components/orderbook/OrderBookRow";

interface Props {
    type: "ask" | "bid";
    rows: OrderBookRowData[];
    maxSize: number;
    onSelectPrice?: (price: number) => void;
}

export interface OrderBookRowData {
    price: number;
    size: number;
    rate: number;
}

const ORDERBOOK_DEPTH = 15;

function OrderBookPanel({type, rows, maxSize, onSelectPrice}: Props) {
    const visibleRows = rows.length > 0
        ? rows
        : Array.from({length: ORDERBOOK_DEPTH}, () => undefined);

    return (
        <Panel>
            <OrderBookList>
                {visibleRows.map((row, index) => {
                    const ratio = !row || maxSize === 0
                        ? 0
                        : (row.size / maxSize) * 100;
                    return (
                        <OrderBookRow
                            key={`${type}-${index}`}
                            type={type}
                            price={row?.price}
                            size={row?.size}
                            rate={row?.rate}
                            ratio={ratio}
                            onSelectPrice={onSelectPrice}
                        />
                    );
                })}
            </OrderBookList>
        </Panel>
    );
}

export default OrderBookPanel;
