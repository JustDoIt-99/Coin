import {useState} from "react";
import {
    ButtonRow,
    Divider,
    Form,
    InputBox,
    Label,
    Notice,
    OrderTypeButton,
    OrderTypeTabs,
    ResetButton,
    RightText,
    Row,
    SubmitButton,
    type TradeType
} from "@components/market/order/OrderForm/OrderForm.styles.ts";
import PercentButtons from "@components/common/PercentButtons/PercentButtons.tsx";

interface OrderFormProps {
    tradeType: TradeType;
}

type OrderType = "limit" | "market" | "reserve";

const PERCENT = ["10%", "25%", "50%", "100%", "입력"] as const;

const ORDER_TYPES = [
    {key: "limit", label: "지정가"},
    {key: "market", label: "시장가"},
    {key: "reserve", label: "예약-지정가"},
] as const;


function OrderForm({tradeType}: OrderFormProps) {

    const [orderType, setOrderType] = useState<OrderType>("limit");
    const [selectedPercent, setSelectedPercent] = useState<string | undefined>();

    const isBuy = tradeType === "buy";

    const isLimit = orderType === "limit";
    const isMarket = orderType === "market";
    const isReserve = orderType === "reserve";

    const submitLabel = isReserve
        ? isBuy ? "예약 매수" : "예약 매도"
        : isBuy ? "매수" : "매도";

    const renderPercentButtons = () =>
        (<PercentButtons values={PERCENT}
                         selected={selectedPercent}
                         onClick={setSelectedPercent}/>);

    const renderInputRow = (label: string, unit: string, value: string) =>
        (<Row>
            <Label>
                {label} <span>({unit})</span>
            </Label>
            <InputBox>{value}</InputBox>
        </Row>);

    return (
        <Form>

            <Row>
                <Label>주문유형</Label>

                <OrderTypeTabs>
                    {ORDER_TYPES.map((type) => (
                        <OrderTypeButton
                            key={type.key}
                            active={orderType === type.key}
                            onClick={() => setOrderType(type.key)}
                        >
                            {type.label}
                        </OrderTypeButton>
                    ))}
                </OrderTypeTabs>
            </Row>

            <Row>
                <Label>주문가능</Label>

                <RightText>
                    {isBuy ? "0 KRW" : "0 BTC"}
                </RightText>
            </Row>

            {isLimit && (
                <>
                    {renderInputRow(isBuy ? "매수가격" : "매도가격", "KRW", "113,441,000")}
                    {renderInputRow("주문수량", "BTC", "0")}
                    {renderPercentButtons()}
                    {renderInputRow("주문총액", "KRW", "0")}
                </>
            )}
            {isMarket && (
                <>
                    {renderInputRow("주문총액", "KRW", "0")}
                    {renderPercentButtons()}
                </>
            )}
            {isReserve && (
                <>
                    {renderInputRow("감시가격", "KRW", "112,169,000")}
                    {renderInputRow(isBuy ? "매수가격" : "매도가격", "KRW", "112,169,000")}
                    {renderInputRow("주문수량", "BTC", "0")}
                    {renderPercentButtons()}
                    {renderInputRow("주문총액", "KRW", "0")}
                </>
            )}
            <Divider/>
            <Notice>최소주문: 5,000 KRW · 수수료(부가세 포함): 0.05%</Notice>
            <ButtonRow>
                <ResetButton>초기화</ResetButton>
                <SubmitButton tradeType={tradeType}>
                    {submitLabel}
                </SubmitButton>
            </ButtonRow>

        </Form>
    );
}

export default OrderForm;