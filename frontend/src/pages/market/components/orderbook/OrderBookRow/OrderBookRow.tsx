import {
    Row,
    SizeCell,
    SizeBar,
    PriceCell,
    RateCell,
} from "./OrderBookRow.styles";

interface Props {
    type: "ask" | "bid";
    price?: number;
    size?: number;
    rate?: number;
    ratio: number;
    onSelectPrice?: (price: number) => void;
}

function OrderBookRow({ type, price, size, rate, ratio, onSelectPrice }: Props) {
    const rateDirection = rate == null ? "flat" : rate > 0 ? "up" : rate < 0 ? "down" : "flat";

    const sizeCell = (
        <SizeCell type={type}>
            <SizeBar type={type} ratio={ratio} />
            <span>{size == null ? "-" : size.toFixed(3)}</span>
        </SizeCell>
    );

    const priceCell = (
        <PriceCell direction={rateDirection}>{price == null ? "-" : price.toLocaleString()}</PriceCell>
    );

    const rateCell = (
        <RateCell direction={rateDirection}>
            {rate == null ? "-" : `${rate > 0 ? "+" : ""}${rate.toFixed(2)}%`}
        </RateCell>
    );

    return (
        <Row
            type="button"
            side={type}
            disabled={price == null}
            onClick={() => {
                if (price != null) {
                    onSelectPrice?.(price);
                }
            }}
        >
            {sizeCell}
            {priceCell}
            {rateCell}
        </Row>
    );
}

export default OrderBookRow;
