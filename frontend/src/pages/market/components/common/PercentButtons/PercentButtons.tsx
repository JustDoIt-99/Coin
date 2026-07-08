import {PercentButton, PercentGrid, PercentRow} from "@pages/market/components/common/PercentButtons/PercentButtons.styles";
import {useState} from "react";
import {PercentInput} from "@pages/market/components/order/OrderForm/OrderForm.styles";

interface Props {
    values: readonly string[];
    selected?: string;
    onClick?: (value: string) => void;
}

function PercentButtons({values, selected, onClick}: Props) {
    const [isInputMode, setIsInputMode] = useState(false);
    const [customValue, setCustomValue] = useState("");

    const handleClick = (value: string) => {
        if (value === "입력") {
            setIsInputMode(true);
            setCustomValue("");
            return;
        }
        setIsInputMode(false);
        setCustomValue("");
        onClick?.(value);
    };

    const handleCustomChange = (value: string) => {
        const onlyNumber = value.replace(/\D/g, "");
        setCustomValue(onlyNumber);
        if (!onlyNumber) {
            onClick?.("");
            setIsInputMode(false);
            return;
        }
        onClick?.(`${onlyNumber}%`);
    };

    return (

        <PercentRow>
            <div/>
            <PercentGrid>
                {values.map((value) => {
                    if (value === "입력" && isInputMode) {
                        return (
                            <PercentInput
                                key={value}
                                value={customValue}
                                autoFocus
                                placeholder="%"
                                onChange={(e) => handleCustomChange(e.target.value)}
                                onBlur={() => {
                                    if (!customValue) {
                                        setIsInputMode(false);
                                    }
                                }}
                            />
                        );
                    }

                    return (
                        <PercentButton
                            type="button"
                            key={value}
                            active={selected === value}
                            onClick={() => handleClick(value)}
                        >
                            {value}
                        </PercentButton>
                    );
                })}
            </PercentGrid>
        </PercentRow>
    );
}

export default PercentButtons;