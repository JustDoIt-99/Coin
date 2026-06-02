import styled from "@emotion/styled";
import {keyframes} from "@emotion/react";

export const Row = styled.div`
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

export const NameBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 3px;

    strong {
        font-size: 14px;
        font-weight: 600;
        white-space: normal;
        overflow: hidden;
    }

    small {
        color: #777;
        font-size: 12px;
    }
`;

export const PriceBox = styled.div<{ flashKey?: number }>`
    width: 100%;
    min-height: 44px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;

    animation: ${({flashKey}) =>
    flashKey ? flashBorder : "none"} 0.3s ease-out;

    small {
        font-size: 11px;
        color: #999;
    }
`;

export const Price = styled.div<{ type: "up" | "down" | "flat" }>`
    text-align: right;
    font-weight: 600;
    color: ${(props) =>
    props.type === "up" ? "#e53935" : props.type === "down" ? "#1e88e5" : "#333"};
`;

export const Change = styled.div<{ type: "up" | "down" | "flat" }>`
    text-align: right;
    color: ${(props) =>
    props.type === "up" ? "#e53935" : props.type === "down" ? "#1e88e5" : "#333"};
`;

export const Volume = styled.div`
    text-align: right;
    color: #555;
`;

const flashBorder = keyframes`
    0% {
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 1);
        background: transparent;
    }

    100% {
        box-shadow: inset 0 0 0 0 rgba(0, 0, 0, 0);
        background: transparent;
    }
`;