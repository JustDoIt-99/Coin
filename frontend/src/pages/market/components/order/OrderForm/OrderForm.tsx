import {
    ButtonRow,
    Divider,
    Form,
    Label,
    Notice,
    OrderTypeButton,
    OrderTypeTabs,
    ResetButton,
    RightText,
    Row,
    SubmitButton,
    type TradeType
} from "@pages/market/components/order/OrderForm/OrderForm.styles";
import PercentButtons from "@pages/market/components/common/PercentButtons/PercentButtons";
import {limitBuy, limitSell, marketBuy, marketSell, type Ticker} from "@api/api";
import OrderInputRow from "@pages/market/components/common/OrderInputRow/OrderInputRow";
import useOrderForm from "@hooks/useOrderForm";
import {useNavigate, useLocation} from "react-router-dom";
import {removeComma} from "@utils/orderform/numberFormat";
import {type ComponentProps, useState} from "react";

interface OrderFormProps {
    marketCode: string;
    tradeType: TradeType;
    isAuthenticated: boolean;
    availableBaseBalance: number;
    availableTargetBalance: number;
    ticker?: Ticker;
    onOrderCompleted?: () => void;
}

const PERCENT = ["10%", "25%", "50%", "100%", "입력"] as const;

const ORDER_TYPES = [
    {key: "limit", label: "지정가"},
    {key: "market", label: "시장가"},
    {key: "reserve", label: "예약-지정가"},
] as const;

const DEFAULT_NOTICE = "최소주문: 5,000 KRW · 수수료(부가세 포함): 0.05%";

function OrderForm({
    marketCode,
    tradeType,
    isAuthenticated,
    availableBaseBalance,
    availableTargetBalance,
    ticker,
    onOrderCompleted,
}: OrderFormProps) {
    const {state, flags, display, actions} = useOrderForm({
        tradeType,
        isAuthenticated,
        availableBaseBalance,
        availableTargetBalance,
        ticker
    });
    const navigate = useNavigate();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");

    const percentButtons = (
        <PercentButtons
            values={PERCENT}
            selected={state.selectedPercent}
            onClick={actions.handlePercentClick}
        />
    );

    const handleSubmit: ComponentProps<"form">["onSubmit"] = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            alert("로그인이 필요한 서비스 입니다.");
            navigate("/login", {state: {from: location}});
            return;
        }

        if (flags.isReserve) {
            setSubmitMessage("현재는 예약 주문을 지원하지 않습니다.");
            return;
        }

        try {
            setIsSubmitting(true);
            setSubmitMessage("");

            const isSubmitted = flags.isLimit
                ? flags.isBuy
                    ? await submitLimitBuy()
                    : await submitLimitSell()
                : flags.isBuy
                    ? await submitMarketBuy()
                    : await submitMarketSell();

            if (isSubmitted) {
                onOrderCompleted?.();
                actions.handleReset();
            }
        } catch (error) {
            console.error("주문 실패", error);
            setSubmitMessage("주문에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const submitLimitBuy = async () => {
        const quantity = Number(removeComma(state.quantity));
        const limitPrice = Number(removeComma(state.orderPrice));
        if (Number.isNaN(quantity) || quantity <= 0) {
            setSubmitMessage("주문수량을 입력해주세요.");
            return false;
        }
        if (Number.isNaN(limitPrice) || limitPrice <= 0) {
            setSubmitMessage("매수가격을 입력해주세요.");
            return false;
        }

        const response = await limitBuy({
            marketCode,
            quantity,
            limitPrice,
        });

        setSubmitMessage(
            `${response.lockedAmount.toLocaleString()} ${marketCode.split("-")[0]} 지정가 매수 대기`
        );
        return true;
    };

    const submitLimitSell = async () => {
        const quantity = Number(removeComma(state.quantity));
        const limitPrice = Number(removeComma(state.orderPrice));
        if (Number.isNaN(quantity) || quantity <= 0) {
            setSubmitMessage("주문수량을 입력해주세요.");
            return false;
        }
        if (Number.isNaN(limitPrice) || limitPrice <= 0) {
            setSubmitMessage("매도가격을 입력해주세요.");
            return false;
        }

        const response = await limitSell({
            marketCode,
            quantity,
            limitPrice,
        });

        setSubmitMessage(
            `${response.lockedAmount.toLocaleString()} ${marketCode.split("-")[1]} 지정가 매도 대기`
        );
        return true;
    };

    const submitMarketBuy = async () => {
        const amount = Number(removeComma(state.totalAmount));
        if (Number.isNaN(amount) || amount <= 0) {
            setSubmitMessage("주문총액을 입력해주세요.");
            return false;
        }

        const response = await marketBuy({
            marketCode,
            amount,
        });

        setSubmitMessage(
            `${response.executedAmount.toLocaleString()} ${marketCode.split("-")[0]} 매수 완료`
        );
        return true;
    };

    const submitMarketSell = async () => {
        const quantity = Number(removeComma(state.quantity));
        if (Number.isNaN(quantity) || quantity <= 0) {
            setSubmitMessage("주문수량을 입력해주세요.");
            return false;
        }

        const response = await marketSell({
            marketCode,
            quantity,
        });

        setSubmitMessage(
            `${response.executedAmount.toLocaleString()} ${marketCode.split("-")[0]} 매도 완료`
        );
        return true;
    };

    const priceLabel = flags.isBuy ? "매수가격" : "매도가격";
    const [baseAssetCode, targetAssetCode] = marketCode.split("-");

    return (
        <Form onSubmit={handleSubmit}>
            <Row>
                <Label>주문유형</Label>
                <OrderTypeTabs>
                    {ORDER_TYPES.map((type) => (
                        <OrderTypeButton
                            type="button"
                            key={type.key}
                            active={state.orderType === type.key}
                            onClick={() => actions.handleOrderTypeChange(type.key)}
                        >
                            {type.label}
                        </OrderTypeButton>
                    ))}
                </OrderTypeTabs>
            </Row>
            <Row>
                <Label>주문가능</Label>
                <RightText>
                    {display.availableAsset}
                </RightText>
            </Row>
            {flags.isLimit && (
                <>
                    <OrderInputRow label={priceLabel} unit={baseAssetCode} value={state.orderPrice} onChange={actions.handleOrderPriceChange}/>
                    <OrderInputRow label={"주문수량"} unit={targetAssetCode} value={state.quantity} onChange={actions.handleQuantityChange}/>
                    {percentButtons}
                    <OrderInputRow label={"주문총액"} unit={baseAssetCode} value={state.totalAmount} onChange={actions.handleTotalAmountChange}/>
                </>
            )}
            {flags.isMarket && flags.isBuy && (
                <>
                    <OrderInputRow label="주문총액" unit={baseAssetCode} value={state.totalAmount} onChange={actions.handleTotalAmountChange}/>
                    <PercentButtons values={PERCENT} selected={state.selectedPercent} onClick={actions.handlePercentClick}/>
                </>
            )}
            {flags.isMarket && !flags.isBuy && (
                <>
                    <OrderInputRow label="주문수량" unit={targetAssetCode} value={state.quantity} onChange={actions.handleQuantityChange}/>
                    {percentButtons}
                    <OrderInputRow label="예상금액" unit={baseAssetCode} value={state.totalAmount}/>
                </>
            )}
            {flags.isReserve && (
                <>
                    <OrderInputRow label={"감시가격"} unit={baseAssetCode} value={state.triggerPrice} onChange={actions.handleTriggerPriceChange}/>
                    <OrderInputRow label={priceLabel} unit={baseAssetCode} value={state.orderPrice} onChange={actions.handleOrderPriceChange}/>
                    <OrderInputRow label={"주문수량"} unit={targetAssetCode} value={state.quantity} onChange={actions.handleQuantityChange}/>
                    {percentButtons}
                    <OrderInputRow label={"주문총액"} unit={baseAssetCode} value={state.totalAmount} onChange={actions.handleTotalAmountChange}/>
                </>
            )}
            <Divider/>
            <Notice>{submitMessage || display.validationMessage || DEFAULT_NOTICE}</Notice>
            <ButtonRow>
                <ResetButton type="button" onClick={actions.handleReset}>초기화</ResetButton>
                <SubmitButton
                    type="submit"
                    tradeType={tradeType}
                    disabled={isSubmitting || !!display.validationMessage}
                >
                    {isSubmitting ? "주문 중" : display.submitLabel}
                </SubmitButton>
            </ButtonRow>

        </Form>
    );
}

export default OrderForm;
