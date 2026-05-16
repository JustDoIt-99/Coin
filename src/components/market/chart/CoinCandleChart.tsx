import {useEffect, useRef} from "react";
import {
    type CandlestickData,
    CandlestickSeries,
    createChart,
    type IChartApi,
    type ISeriesApi, type LogicalRange, type Time
} from "lightweight-charts";
import {useQuery} from "@tanstack/react-query";
import {fetchMinuteCandlesPage, type MinuteCandle} from "@api/api.ts";
import {KST_OFFSET_SECONDS} from "@constants/chart.ts";

interface Props {
    marketCode: string;
    unit?: number;
    currentPrice?: number
}

const LOAD_MORE_THRESHOLD = 20;

function CoinCandleChart({marketCode, unit = 15, currentPrice}: Props) {
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const candleDataRef = useRef<CandlestickData<Time>[]>([]);
    const lastCandleRef = useRef<CandlestickData | null>(null);
    const oldestCandleRef = useRef<string>("");
    const requestedOlderRef = useRef(false);
    const isLoadingOlderRef = useRef<boolean>(false);

    const {data: candles} = useQuery({
        queryKey: ["candle-chart", marketCode, unit],
        queryFn: () => fetchMinuteCandlesPage(marketCode, unit,  3),
        enabled: !!marketCode,
        refetchInterval: 1000 * 60 * unit
    });

    const toChartData = (candles: MinuteCandle[]): CandlestickData<Time>[] => {
        return [...candles].reverse().map((candle) => ({
            time: Math.floor(candle.timestamp / 1000 + KST_OFFSET_SECONDS) as Time,
            open: candle.opening_price,
            high: candle.high_price,
            low: candle.low_price,
            close: candle.trade_price,
        }));
    };

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 420,
            layout: {
                background : { color: "#ffffff"},
                textColor: "#333",
                attributionLogo: false
            },
            grid: {
                vertLines: {color: "#f1f3f5"},
                horzLines: {color: "#f1f3f5"}
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false
            },
            rightPriceScale : {
                borderVisible: true
            }
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: "#d64348",
            downColor: "#126ee2",
            borderUpColor: "#d64348",
            borderDownColor: "#126ee2",
            wickUpColor: "#d64348",
            wickDownColor: "#126ee2",
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;

        const handleVisibleRangeChange = async (range: LogicalRange | null) => {
            if (!range) return;
            if (range.from >= LOAD_MORE_THRESHOLD) {
                requestedOlderRef.current = false;
                return;
            }

            if (requestedOlderRef.current) return;
            if (isLoadingOlderRef.current) return;
            if (!oldestCandleRef.current) return;
            if (!candleSeriesRef.current) return;

            requestedOlderRef.current = true;
            isLoadingOlderRef.current = true;

            const candleSeries = candleSeriesRef.current;

            try {
                const olderCandles = await fetchMinuteCandlesPage(
                    marketCode,
                    unit,
                    3,
                    oldestCandleRef.current
                );

                if (olderCandles.length === 0) return;

                const olderChartData = toChartData(olderCandles);
                candleDataRef.current = [
                    ...olderChartData,
                    ...candleDataRef.current,
                ];

                candleSeries.setData(candleDataRef.current);
                oldestCandleRef.current = olderCandles[olderCandles.length - 1].candle_date_time_utc;
            } catch (error) {
                console.error("과거 캔들 조회 실패", error);
            } finally {
                isLoadingOlderRef.current = false;
            }
        }

        chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

        const handleResize = () => {
            if (!chartContainerRef.current) return;

            chart.applyOptions({
                width: chartContainerRef.current.clientWidth
            });
        }

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
            chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
            chartRef.current = null;
            candleSeriesRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!candles || !candleSeriesRef.current || !chartRef.current) return;

        oldestCandleRef.current = candles[candles.length - 1].candle_date_time_utc;

        const chartData = toChartData(candles);
        candleDataRef.current = chartData;
        candleSeriesRef.current.setData(chartData);
        chartRef.current.timeScale().fitContent();

        lastCandleRef.current = chartData[chartData.length - 1];
    }, [candles]);

    useEffect(() => {
        if (currentPrice === undefined || !lastCandleRef.current || !candleSeriesRef.current) {
            return;
        }
        const lastCandle = lastCandleRef.current;

        const updatedCandle: CandlestickData = {
            ...lastCandle,
            close: currentPrice,
            high: Math.max(lastCandle.high, currentPrice),
            low: Math.min(lastCandle.low, currentPrice),
        }

        candleSeriesRef.current.update(updatedCandle);
        lastCandleRef.current = updatedCandle;
    }, [currentPrice]);

    return <div ref={chartContainerRef} style={{width: "100%", height: 420}}/>
}

export default CoinCandleChart;