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
    const padding = (maxPrice - minPrice) * 0.2 || maxPrice * 0.001;

    return {
        minPrice,
        maxPrice,
        padding,
    };
};

export const makeSegments = (data: ChartPoint[], basePrice: number) => {
    const segments: { color: string; points: ChartPoint[] }[] = [];
    let currentColor = data[0].price >= basePrice ? "#d64348" : "#126ee2";
    let currentPoints: ChartPoint[] = [data[0]];

    for (let i = 1; i < data.length; i++) {
        const prev = data[i - 1];
        const curr = data[i];
        const prevColor = prev.price >= basePrice ? "#d64348" : "#126ee2";
        const currColor = curr.price >= basePrice ? "#d64348" : "#126ee2";

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