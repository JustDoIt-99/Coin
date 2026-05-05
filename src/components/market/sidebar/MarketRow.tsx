import styled from "@emotion/styled";
import type {Market, Ticker} from "../../../api/api.ts";
import {Star} from "lucide-react";

interface Props {
    market: Market;
    ticker?: Ticker;
    btcPrice?: number;
    usdtPrice?: number;
    nameType?: string;
}

const Row = styled.div`
    display: grid;
    grid-template-columns: 32px 2.2fr 1.7fr 1.5fr 1.8fr;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #edf0f3;
    border-right: 1px solid #edf0f3;
    font-size: 13px;

    &:hover {
        background: #f5f7fa;
    }

    svg {
        width: 12px;
        height: 12px;
        stroke: #d0d4da
    }
`;

const NameBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 3px;
    
    strong {
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
    }

    small {
        color: #777;
        font-size: 12px;
    }
`;

const Price = styled.div<{ type: "up" | "down" | "flat" }>`
    text-align: right;
    font-weight: 600;
    color: ${(props) =>
            props.type === "up" ? "#e53935" : props.type === "down" ? "#1e88e5" : "#333"};
}
`;

const Change = styled.div<{ type: "up" | "down" | "flat" }>`
    text-align: right;
    color: ${(props) =>
            props.type === "up" ? "#e53935" : props.type === "down" ? "#1e88e5" : "#333"};
}
`;

const Volume = styled.div`
    text-align: right;
    color: #555;
`;

const PriceBox = styled.div`

    display: flex;
    flex-direction: column;
    align-items: flex-end;

    small {
        font-size: 11px;
        color: #999;
    }
`;

function formatPrice(price?: number, market?: string) {
    if (price == null) return "-";

    if (market?.startsWith("KRW-")) {
        return price.toLocaleString("ko-KR", {
            maximumFractionDigits: price >= 100 ? 0 : 2,
        });
    }

    if (market?.startsWith("BTC-")) {
        return price.toLocaleString("ko-KR", {
            minimumFractionDigits: 8,
            maximumFractionDigits: 8,
        });
    }

    if (market?.startsWith("USDT-")) {
        return price.toLocaleString("ko-KR", {
            maximumFractionDigits: price >= 1 ? 2 : 6,
        });
    }
}

function formatVolume(value?: number, market?: string) {

    if (value == null) return "-";
    const rounded = Number(value.toFixed(3));
    if (rounded === 0) return "0";

    if (market?.startsWith("KRW-")) {
        return `${(value / 1_000_000).toLocaleString("ko-KR", {
            maximumFractionDigits: 0,
        })}백만`;
    }

    if (market?.startsWith("BTC-")) {
        return `${value.toLocaleString("ko-KR", {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
        })}`;
    }

    if (market?.startsWith("USDT-")) {
        return `${value.toLocaleString("ko-KR", {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
        })}`;
    }
}

function convertToKRW(
    price?: number,
    market?: string,
    btcPrice?: number,
    usdtPrice?: number
) {
    if (!price || !market) return null;
    if (market.startsWith("BTC-") && btcPrice) {
        return price * btcPrice;
    }
    if (market.startsWith("USDT-") && usdtPrice) {
        return price * usdtPrice;
    }
    return null;
}

function MarketRow({market, ticker, btcPrice, usdtPrice, nameType}: Props) {

    const rate = ticker?.signed_change_rate ?? 0;
    const isUp = rate > 0;
    const isDown = rate < 0;

    const krwPrice = convertToKRW(
        ticker?.trade_price,
        market.market,
        btcPrice,
        usdtPrice
    );

    return (
        <Row>
            <Star/>
            <NameBox>
                <strong>{nameType === "korean" ? market.korean_name : market.english_name}</strong>
                <small>{market.market.replace("-", "/")}</small>
            </NameBox>

            <PriceBox>
                <Price type={isUp ? "up" : isDown ? "down" : "flat"}>
                    {formatPrice(ticker?.trade_price, market.market)}
                </Price>
                {krwPrice && (
                    <small>
                        {krwPrice.toLocaleString()}KRW
                    </small>
                )}
            </PriceBox>
            <Change type={isUp ? "up" : isDown ? "down" : "flat"}>
                {ticker ? `${rate > 0 ? "+" : ""}${(rate * 100).toFixed(2)}%` : "-"}
            </Change>

            <Volume>
                {formatVolume(ticker?.acc_trade_price_24h, market.market)}
            </Volume>
        </Row>
    )
}

export default MarketRow;