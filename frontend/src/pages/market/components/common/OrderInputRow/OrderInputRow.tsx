import {InputBox, Label, Row} from "@pages/market/components/order/OrderForm/OrderForm.styles.ts";

interface Props {
    label: string,
    unit: string,
    value: string,
    onChange?: (value: string) => void
}

function OrderInputRow({label, unit, value, onChange}: Props) {

    return (
        <Row>
            <Label>
                {label} <span>({unit})</span>
            </Label>
            <InputBox
                value={value}
                readOnly={!onChange}
                onChange={(e) => {
                    onChange?.(e.target.value);
                }}
            />
        </Row>
    );
}

export default OrderInputRow;