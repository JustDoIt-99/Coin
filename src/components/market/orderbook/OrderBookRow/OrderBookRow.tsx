import {
    Row,
    SizeCell,
    SizeBar,
    PriceCell,
    RateCell,
} from "./OrderBookRow.styles.ts";

interface Props {
    type: "ask" | "bid";
    price: number;
    size: number;
    rate: number;
    ratio: number;
}

function OrderBookRow({ type, price, size, rate, ratio }: Props) {

    const sizeCell = (
        <SizeCell type={type}>
            <SizeBar type={type} ratio={ratio} />
            <span>{size.toFixed(3)}</span>
        </SizeCell>
    );

    const priceCell = (
        <PriceCell type={type}>{price.toLocaleString()}</PriceCell>
    );

    const rateCell = (
        <RateCell type={type}>
            {rate > 0 ? "+" : ""}
            {rate.toFixed(2)}%
        </RateCell>
    );

    return (
        <Row type={type}>
            {sizeCell}
            {priceCell}
            {rateCell}
        </Row>
    );
}

export default OrderBookRow;