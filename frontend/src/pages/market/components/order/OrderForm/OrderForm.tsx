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
import {marketBuy, type Ticker} from "@api/api";
import OrderInputRow from "@pages/market/components/common/OrderInputRow/OrderInputRow";
import useOrderForm from "@hooks/useOrderForm";
import {useNavigate, useLocation} from "react-router-dom";
import {useAuth} from "@auth/useAuth";
import {removeComma} from "@utils/orderform/numberFormat";
import {type ComponentProps, useState} from "react";

interface OrderFormProps {
    marketCode: string;
    tradeType: TradeType;
    ticker?: Ticker;
}

const PERCENT = ["10%", "25%", "50%", "100%", "입력"] as const;

const ORDER_TYPES = [
    {key: "limit", label: "지정가"},
    {key: "market", label: "시장가"},
    {key: "reserve", label: "예약-지정가"},
] as const;

const DEFAULT_NOTICE = "최소주문: 5,000 KRW · 수수료(부가세 포함): 0.05%";

function OrderForm({marketCode, tradeType, ticker}: OrderFormProps) {
    const {state, flags, display, actions} = useOrderForm({ tradeType, ticker });
    const {isAuthenticated} = useAuth();
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

        if (!(flags.isBuy && flags.isMarket)) {
            setSubmitMessage("현재는 시장가 매수만 지원합니다.");
            return;
        }

        const amount = Number(removeComma(state.totalAmount));
        if (Number.isNaN(amount) || amount <= 0) {
            setSubmitMessage("주문총액을 입력해주세요.");
            return;
        }

        try {
            setIsSubmitting(true);
            setSubmitMessage("");

            const response = await marketBuy({
                marketCode,
                amount,
            });

            setSubmitMessage(
                `${response.executedAmount.toLocaleString()} ${marketCode.split("-")[0]} 체결 완료`
            );
            actions.handleReset();
        } catch (error) {
            console.error("시장가 매수 실패", error);
            setSubmitMessage("시장가 매수에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const priceLabel = flags.isBuy ? "매수가격" : "매도가격";

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
                    <OrderInputRow label={priceLabel} unit={"KRW"} value={state.orderPrice} onChange={actions.handleOrderPriceChange}/>
                    <OrderInputRow label={"주문수량"} unit={"BTC"} value={state.quantity} onChange={actions.handleQuantityChange}/>
                    {percentButtons}
                    <OrderInputRow label={"주문총액"} unit={"KRW"} value={state.totalAmount} onChange={actions.handleTotalAmountChange}/>
                </>
            )}
            {flags.isMarket && flags.isBuy && (
                <>
                    <OrderInputRow label="주문총액" unit="KRW" value={state.totalAmount} onChange={actions.handleTotalAmountChange}/>
                    <PercentButtons values={PERCENT} selected={state.selectedPercent} onClick={actions.handlePercentClick}/>
                </>
            )}
            {flags.isMarket && !flags.isBuy && (
                <>
                    <OrderInputRow label="주문수량" unit="BTC" value={state.quantity} onChange={actions.handleQuantityChange}/>
                    {percentButtons}
                    <OrderInputRow label="예상금액" unit="KRW" value={state.totalAmount}/>
                </>
            )}
            {flags.isReserve && (
                <>
                    <OrderInputRow label={"감시가격"} unit={"KRW"} value={state.triggerPrice} onChange={actions.handleTriggerPriceChange}/>
                    <OrderInputRow label={priceLabel} unit={"KRW"} value={state.orderPrice} onChange={actions.handleOrderPriceChange}/>
                    <OrderInputRow label={"주문수량"} unit={"BTC"} value={state.quantity} onChange={actions.handleQuantityChange}/>
                    {percentButtons}
                    <OrderInputRow label={"주문총액"} unit={"KRW"} value={state.totalAmount} onChange={actions.handleTotalAmountChange}/>
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
