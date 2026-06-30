import {useEffect, useState} from "react";
import type {TradeType} from "@pages/market/components/order/OrderForm/OrderForm.styles";
import {formatDecimalWithComma, formatIntegerWithComma, removeComma} from "@utils/orderform/numberFormat";
import type {Ticker} from "@api/api";

const MIN_ORDER_KRW = 5000;

export type OrderType = "limit" | "market";

interface Props {
    tradeType: TradeType,
    isAuthenticated: boolean,
    availableBaseBalance: number,
    availableTargetBalance: number,
    ticker?: Ticker
}

function useOrderForm({
    tradeType,
    isAuthenticated,
    availableBaseBalance,
    availableTargetBalance,
    ticker
} : Props) {
    const [orderType, setOrderType] = useState<OrderType>("limit");
    const [orderPrice, setOrderPrice] = useState("");
    const [selectedPercent, setSelectedPercent] = useState<string | undefined>();
    const [quantity, setQuantity] = useState("");
    const [totalAmount, setTotalAmount] = useState("");

    const isBuy = tradeType === "buy";
    const isLimit = orderType === "limit";
    const isMarket = orderType === "market";

    const coinSymbol = ticker?.market?.split("-")[1] ?? "";
    const availableAsset = !isAuthenticated
        ? "로그인 필요"
        : isBuy
            ? `${formatKrw(availableBaseBalance)} KRW`
            : `${formatCoin(availableTargetBalance)} ${coinSymbol}`;

    const submitLabel = isBuy ? "매수" : "매도";

    const applyBuyPercent = (percent: number) => {
        const total = availableBaseBalance * (percent / 100);

        setTotalAmount(Math.floor(total).toLocaleString());

        const price = Number(removeComma(orderPrice));
        if (!price) {
            setTotalAmount("");
            return;
        }

        setQuantity(
            formatDecimalWithComma((total / price).toFixed(8))
        );
    };

    const applySellPercent = (percent: number) => {
        const qty = availableTargetBalance * (percent / 100);

        setQuantity(formatDecimalWithComma(qty.toFixed(8)));

        const price = Number(removeComma(orderPrice));
        if (!price) return;

        const total = qty * price;
        setTotalAmount(Math.floor(total).toLocaleString());
    };

    const handleOrderTypeChange = (value: OrderType) => {
        setOrderType(value);
        setSelectedPercent(undefined);
        setQuantity("");
        setTotalAmount("");
    };

    const handleOrderPriceChange = (value: string) => {
        const formattedPrice = formatIntegerWithComma(value);
        setOrderPrice(formattedPrice);
        const price = Number(removeComma(formattedPrice));
        const qty = Number(removeComma(quantity));
        if (!price || !qty) {
            setTotalAmount("");
            return;
        }
        setTotalAmount(Math.floor(price * qty).toLocaleString());
    };

    const handleQuantityChange = (value: string) => {
        const formattedQuantity = formatDecimalWithComma(value);
        setQuantity(formattedQuantity);

        const price = Number(removeComma(orderPrice));
        const quantity = Number(removeComma(formattedQuantity));

        if (!price || !quantity) {
            setTotalAmount("");
            return;
        }

        setTotalAmount(
            Math.floor(price * quantity).toLocaleString()
        );
    };

    const handleTotalAmountChange = (value: string) => {
        const formattedTotal = formatIntegerWithComma(value);
        setTotalAmount(formattedTotal);

        const price = Number(removeComma(orderPrice));
        const total = Number(removeComma(formattedTotal));

        if (!price || !total) {
            setQuantity("");
            return;
        }

        setQuantity(
            formatDecimalWithComma((total / price).toFixed(8))
        );
    };

    const handleReset = () => {
        setQuantity("");
        setTotalAmount("");
        setSelectedPercent(undefined);

        if (!ticker?.trade_price) {
            setOrderPrice("");
            return;
        }

        const price = ticker.trade_price.toLocaleString();
        setOrderPrice(price);
    };

    const handlePercentClick = (value: string) => {
        if (!value) {
            setSelectedPercent(undefined);
            setQuantity("");
            setTotalAmount("");
            return;
        }

        setSelectedPercent(value);

        const percent = Number(value.replace("%", ""));
        if (!percent) return;

        if (isBuy) {
            applyBuyPercent(percent);
        } else {
            applySellPercent(percent);
        }
    };

    const orderTotalNumber = Number(removeComma(totalAmount));
    const quantityNumber = Number(removeComma(quantity));

    const getOrderValidationMessage = () => {
        if (!quantityNumber && !(isMarket && isBuy)) {
            return "주문수량을 입력해주세요.";
        }
        if (!orderTotalNumber && !(isMarket && !isBuy)) {
            return "주문총액을 입력해주세요.";
        }
        if (orderTotalNumber < MIN_ORDER_KRW) {
            return "최소 주문금액은 5,000 KRW입니다.";
        }
        if (isAuthenticated && isBuy && orderTotalNumber > availableBaseBalance) {
            return "주문가능 금액을 초과했습니다.";
        }
        if (isAuthenticated && !isBuy && quantityNumber > availableTargetBalance) {
            return "보유 수량을 초과했습니다.";
        }
        return "";
    };

    const validationMessage = getOrderValidationMessage();

    useEffect(() => {
        if (!ticker?.trade_price) return;
        const price = ticker.trade_price.toLocaleString();
        setOrderPrice(price);
    },[ticker?.market, orderType]);

    return {
        state: {
            orderType,
            selectedPercent,
            orderPrice,
            quantity,
            totalAmount,
        },
        flags: {
            isBuy,
            isLimit,
            isMarket,
        },
        display: {
            availableAsset,
            submitLabel,
            validationMessage,
        },
        actions: {
            handleOrderTypeChange,
            handleOrderPriceChange,
            handleQuantityChange,
            handleTotalAmountChange,
            handleReset,
            handlePercentClick,
        }
    };
}

function formatKrw(value: number) {
    return Math.floor(value).toLocaleString();
}

function formatCoin(value: number) {
    return formatDecimalWithComma(value.toFixed(8));
}

export default useOrderForm;
