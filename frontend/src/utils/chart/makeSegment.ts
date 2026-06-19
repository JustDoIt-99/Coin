import {CHART_COLORS, CHART_MIN_PADDING_RATIO, CHART_PADDING_RATIO} from "@constants/chart";

export interface ChartPoint {
    index: number;
    price: number;
}

export interface ChartRange {
    minPrice: number;
    maxPrice: number;
    padding: number;
}

export const getChartRange = (
    data: ChartPoint[]
): ChartRange => {

    const prices = data.map((item) => item.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const padding = (maxPrice - minPrice) * CHART_PADDING_RATIO || maxPrice * CHART_MIN_PADDING_RATIO;

    return {
        minPrice,
        maxPrice,
        padding,
    };
};

export const makeSegments = (data: ChartPoint[], basePrice: number) => {
    const segments: { color: string; points: ChartPoint[] }[] = [];
    let currentColor = data[0].price >= basePrice ? CHART_COLORS.UP : CHART_COLORS.DOWN;
    let currentPoints: ChartPoint[] = [data[0]];

    for (let i = 1; i < data.length; i++) {
        const prev = data[i - 1];
        const curr = data[i];
        const prevColor = prev.price >= basePrice ? CHART_COLORS.UP : CHART_COLORS.DOWN;
        const currColor = curr.price >= basePrice ? CHART_COLORS.UP : CHART_COLORS.DOWN;

        if (prevColor === currColor) {
            currentPoints.push(curr);
            continue;
        }

        const ratio =
            (basePrice - prev.price) / (curr.price - prev.price);
        const crossPoint = {
            index: prev.index + (curr.index - prev.index) * ratio,
            price: basePrice,
        };

        currentPoints.push(crossPoint);
        segments.push({
            color: currentColor,
            points: currentPoints,
        });
        currentColor = currColor;
        currentPoints = [crossPoint, curr];
    }

    segments.push({
        color: currentColor,
        points: currentPoints,
    });
    return segments;
};