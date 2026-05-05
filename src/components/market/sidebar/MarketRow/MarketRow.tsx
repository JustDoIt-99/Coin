import type {Market, Ticker} from "@api/api.ts";
import {Star} from "lucide-react";
import {Change, NameBox, Price, PriceBox, Row, Volume} from "./MarketRow.styles.ts";

interface Props {
    market: Market;
    ticker?: Ticker;
    btcPrice?: number;
    usdtPrice?: number;
    nameType?: string;
    flashKey?: number;
}

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