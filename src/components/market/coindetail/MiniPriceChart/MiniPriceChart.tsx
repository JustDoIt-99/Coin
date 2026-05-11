import {Area, ComposedChart, Line, ResponsiveContainer, XAxis, YAxis} from "recharts";
import {useQuery} from "@tanstack/react-query";
import {fetchMinuteCandles} from "@api/api.ts";
import {memo, useMemo} from "react";
import {type ChartPoint, type ChartRange, getChartRange, makeSegments} from "@utils/chart/makeSegment.ts";

interface Props {
    marketCode: string;
    prevClosingPrice?: number;
}

function MiniPriceChart({ marketCode, prevClosingPrice }: Props) {

    const { data: candles } = useQuery({
        queryKey: ["mini-candles", marketCode],
        queryFn: () => fetchMinuteCandles(marketCode, 15, 100),
        enabled: !!marketCode,
        refetchInterval: 1000 * 60 * 15,
    });

    const priceHistory: ChartPoint[] = useMemo(() => {
        return candles
            ? [...candles].reverse().map((candle, index) => ({
                index,
                price: candle.trade_price,
            })):[];
    },[candles]);

    const chartRange = useMemo<ChartRange | undefined>(() => {

        if (priceHistory.length === 0) {
            return;
        }

        return getChartRange(priceHistory);
    }, [priceHistory]);

    const segments = useMemo(() => {
        if (priceHistory.length === 0 || prevClosingPrice === undefined) {
            return [];
        }

        return makeSegments(priceHistory, prevClosingPrice);
    },[priceHistory, prevClosingPrice]);

    if (priceHistory.length === 0 || prevClosingPrice == undefined || chartRange == null) {
        return null;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart>
                <XAxis
                    dataKey="index"
                    type="number"
                    domain={[0, priceHistory.length - 1]}
                    hide
                />
                <YAxis
                    dataKey="price"
                    domain={[
                        Math.min(chartRange.minPrice, prevClosingPrice) - chartRange.padding,
                        Math.max(chartRange.maxPrice, prevClosingPrice) + chartRange.padding,
                    ]}
                    hide
                />
                {segments.map((segment, index) => (
                    <Area
                        key={`area-${index}`}
                        data={segment.points}
                        type="monotone"
                        dataKey="price"
                        baseValue={prevClosingPrice}
                        stroke="none"
                        fill={segment.color}
                        fillOpacity={0.12}
                        dot={false}
                        activeDot={false}
                        isAnimationActive={false}
                    />
                ))}
                {segments.map((segment, index) => (
                    <Line
                        key={`line-${index}`}
                        data={segment.points}
                        type="monotone"
                        dataKey="price"
                        stroke={segment.color}
                        strokeWidth={1}
                        dot={false}
                        activeDot={false}
                        isAnimationActive={false}
                    />
                ))}
            </ComposedChart>
        </ResponsiveContainer>
    );
}

export default memo(MiniPriceChart);