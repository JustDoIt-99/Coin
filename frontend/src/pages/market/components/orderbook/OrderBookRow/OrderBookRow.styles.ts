import styled from "@emotion/styled";

export const Row = styled.div<{ type: "ask" | "bid" }>`
    display: grid;
    grid-template-columns: 80px 130px 70px;
    height: 46px;

    background: ${({ type }) =>
            type === "ask"
                    ? "#eef5ff"
                    : "#fff3f3"};
    border-bottom: 1px solid #ffffff;
`;

export const SizeCell = styled.div<{ type: "ask" | "bid" }>`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 10px;
    overflow: hidden;
    font-size: 15px;
    font-weight: 500;
    color: #222;

    span {
        position: relative;
        z-index: 1;
    }
`;

export const SizeBar = styled.div<{
    type: "ask" | "bid";
    ratio: number;
}>`
    position: absolute;
    top: 10px;
    right: 0;
    bottom: 10px;
    width: ${({ ratio }) => `${Math.min(ratio, 100)}%`};
    background: ${({ type }) =>
    type === "ask"
        ? "rgba(18, 110, 226, 0.14)"
        : "rgba(214, 67, 72, 0.14)"};
`;

export const PriceCell = styled.div<{ direction: "up" | "down" | "flat" }>`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    font-weight: 700;
    color: ${({ direction }) =>
            direction === "up"
                    ? "#d64348"
                    : direction === "down"
                            ? "#126ee2"
                            : "#666"};
`;

export const RateCell = styled.div<{ direction: "up" | "down" | "flat" }>`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 8px;
    font-size: 15px;
    font-weight: 500;

    color: ${({ direction }) =>
            direction === "up"
                    ? "#d64348"
                    : direction === "down"
                            ? "#126ee2"
                            : "#666"};
`;
