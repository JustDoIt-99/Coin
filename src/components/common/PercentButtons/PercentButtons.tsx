import {PercentButton, PercentGrid} from "@components/common/PercentButtons/PercentButtons.styles.ts";

interface Props {
    values: readonly string[];
    selected?: string;
    onClick?: (value: string) => void;
}


function PercentButtons({values, selected, onClick,}: Props) {
    return (
        <PercentGrid>
            {values.map((value) => (
                <PercentButton
                    key={value}
                    active={selected === value}
                    onClick={() => onClick?.(value)}
                >
                    {value}
                </PercentButton>
            ))}
        </PercentGrid>
    );
}

export default PercentButtons;