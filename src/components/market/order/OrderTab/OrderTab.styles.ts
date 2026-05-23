import styled from "@emotion/styled";

export const TabContainer = styled.div`
    display: grid;
    width: 100%;
    grid-template-columns: repeat(3, 1fr);
    border-bottom: 1px solid #dcdfe4;
    background: #fff;
`;

export const TabButton = styled.button<TabButtonProps>`
    height: 50px;
    border: none;
    background: #fff;
    font-size: 17px;
    font-weight: 700;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
    color: ${({active, tabType}) => getActiveColor(active, tabType)};

    &::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 2px;
        background: ${({active, tabType}) =>
    active ? getActiveColor(true, tabType) : "transparent"};
    }
`;

export const getActiveColor = (
    active: boolean,
    type: TabButtonProps["tabType"]
) => {
    if (!active) return "#333";
    switch (type) {
        case "buy":
            return "#e53935";
        case "sell":
            return "#1976d2";
        default:
            return "#111";
    }
};

interface TabButtonProps {
    active: boolean;
    tabType: "buy" | "sell" | "history";
}
