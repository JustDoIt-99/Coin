import {useEffect, useRef} from "react";
import {
    type BusinessDay,
    type CandlestickData,
    CandlestickSeries,
    createChart,
    type IChartApi,
    type ISeriesApi, type LogicalRange, type Time,
    TickMarkType
} from "lightweight-charts";
import {useQuery} from "@tanstack/react-query";
import {fetchCandlesPage, type CandleInterval, type MinuteCandle} from "@api/api";

interface Props {
    marketCode: string;
    interval: CandleInterval;
    currentPrice?: number,
    active?: boolean
}

const LOAD_MORE_THRESHOLD = 20;

function CoinCandleChart({marketCode, interval, currentPrice, active}: Props) {
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const candleDataRef = useRef<CandlestickData<Time>[]>([]);
    const lastCandleRef = useRef<CandlestickData | null>(null);
    const oldestCandleRef = useRef<string>("");
    const requestedOlderRef = useRef(false);
    const isLoadingOlderRef = useRef<boolean>(false);
    const isFirstLoadingChartRef = useRef<boolean>(true);

    const {data: candles} = useQuery({
        queryKey: ["candle-chart", marketCode, interval.type, interval.unit],
        queryFn: () => fetchCandlesPage(marketCode, interval,  3),
        enabled: !!marketCode,
        refetchInterval: getRefetchInterval(interval)
    });

    useEffect(() => {
        isFirstLoadingChartRef.current = true;
        candleDataRef.current = [];
        oldestCandleRef.current = "";
        lastCandleRef.current = null;
        requestedOlderRef.current = false;
        isLoadingOlderRef.current = false;
        candleSeriesRef.current?.setData([]);
    }, [marketCode, interval.type, interval.unit]);

    const toChartData = (candles: MinuteCandle[]): CandlestickData<Time>[] => {
        return [...candles].reverse().map((candle) => ({
            time: toChartTime(candle.candle_date_time_kst, interval),
            open: candle.opening_price,
            high: candle.high_price,
            low: candle.low_price,
            close: candle.trade_price,
        }));
    };

    const normalizeChartData = (
        data: CandlestickData<Time>[]
    ): CandlestickData<Time>[] => {
        const map = new Map<string, CandlestickData<Time>>();
        data.forEach((item) => {
            map.set(getTimeKey(item.time), item);
        });

        return Array.from(map.values())
            .sort((a, b) => getTimeValue(a.time) - getTimeValue(b.time));
    };

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 420,
            layout: {
                background : { color: "#ffffff"},
                textColor: "#333"
            },
            grid: {
                vertLines: {color: "#f1f3f5"},
                horzLines: {color: "#f1f3f5"}
            },
            timeScale: {
                timeVisible: interval.type === "minute",
                secondsVisible: false,
                tickMarkFormatter: (time: Time, tickMarkType: TickMarkType) => formatTickMark(time, tickMarkType)
            },
            rightPriceScale : {
                borderVisible: true
            },
            handleScroll: {
                mouseWheel: !!active,
                pressedMouseMove: !!active,
            },
            handleScale: {
                mouseWheel: !!active,
                pinch: !!active,
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
            console.log("visible range", range);
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
                const olderCandles = await fetchCandlesPage(
                    marketCode,
                    interval,
                    3,
                    oldestCandleRef.current
                );

                const visibleRange = chart.timeScale().getVisibleLogicalRange();

                if (olderCandles.length === 0) return;

                const beforeLength = candleDataRef.current.length;

                const olderChartData = toChartData(olderCandles);

                const mergedData = normalizeChartData([
                    ...olderChartData,
                    ...candleDataRef.current,
                ]);

                candleDataRef.current = mergedData;
                candleSeries.setData(mergedData);

                const addedCount = mergedData.length - beforeLength;

                if (visibleRange && addedCount > 0) {
                    chart.timeScale().setVisibleLogicalRange({
                        from: visibleRange.from + addedCount,
                        to: visibleRange.to + addedCount
                    });
                }

                oldestCandleRef.current = olderCandles[olderCandles.length - 1].candle_date_time_utc;
            } catch (error) {
                console.error("과거 캔들 조회 실패", error);
            } finally {
                isLoadingOlderRef.current = false;
                requestedOlderRef.current = false;
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
    }, [marketCode, interval.type, interval.unit]);

    useEffect(() => {
        if (!candles || !candleSeriesRef.current || !chartRef.current) return;

        if (!isFirstLoadingChartRef.current) return;

        oldestCandleRef.current = candles[candles.length - 1].candle_date_time_utc;
        const chartData = normalizeChartData(toChartData(candles));

        candleDataRef.current = chartData;
        candleSeriesRef.current.setData(chartData);
        chartRef.current.timeScale().fitContent();
        isFirstLoadingChartRef.current = false;
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

    useEffect(() => {
        if (!chartRef.current) return;
        chartRef.current.applyOptions({
            handleScroll: {
                mouseWheel: !!active,
                pressedMouseMove: !!active,
            },
            handleScale: {
                mouseWheel: !!active,
                pinch: !!active,
            },
        });
    }, [active]);

    return <div ref={chartContainerRef} style={{width: "100%", height: 420}}/>
}

function getRefetchInterval(interval: CandleInterval) {
    if (interval.type === "minute") {
        return 1000 * 60 * (interval.unit ?? 15);
    }

    return 1000 * 60 * 5;
}

function toChartTime(kstDateTime: string, interval: CandleInterval) {
    const parsedDate = parseKstDateTime(kstDateTime);

    if (interval.type !== "minute") {
        return {
            year: parsedDate.year,
            month: parsedDate.month,
            day: parsedDate.day,
        } as BusinessDay;
    }

    return Math.floor(
        Date.UTC(
            parsedDate.year,
            parsedDate.month - 1,
            parsedDate.day,
            parsedDate.hour,
            parsedDate.minute,
            parsedDate.second
        ) / 1000
    ) as Time;
}

function parseKstDateTime(kstDateTime: string) {
    const [datePart, timePart] = kstDateTime.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour = 0, minute = 0, second = 0] = (timePart ?? "00:00:00").split(":").map(Number);

    return {year, month, day, hour, minute, second};
}

function formatTickMark(time: Time, tickMarkType: TickMarkType) {
    const dateParts = getDateParts(time);

    switch (tickMarkType) {
        case TickMarkType.Year:
            return String(dateParts.year);
        case TickMarkType.Month:
            return `${dateParts.year}.${pad(dateParts.month)}`;
        case TickMarkType.DayOfMonth:
            return `${pad(dateParts.month)}/${pad(dateParts.day)}`;
        case TickMarkType.Time:
        default:
            return `${pad(dateParts.hour)}:${pad(dateParts.minute)}`;
    }
}

function getTimeKey(time: Time) {
    if (isBusinessDay(time)) {
        return `${time.year}-${pad(time.month)}-${pad(time.day)}`;
    }

    return String(time);
}

function getTimeValue(time: Time) {
    if (isBusinessDay(time)) {
        return Date.UTC(time.year, time.month - 1, time.day);
    }

    return Number(time) * 1000;
}

function isBusinessDay(time: Time): time is BusinessDay {
    return typeof time === "object";
}

function getDateParts(time: Time) {
    if (isBusinessDay(time)) {
        return {
            year: time.year,
            month: time.month,
            day: time.day,
            hour: 0,
            minute: 0,
        };
    }

    const date = new Date(Number(time) * 1000);

    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        hour: date.getUTCHours(),
        minute: date.getUTCMinutes(),
    };
}

function pad(value: number) {
    return String(value).padStart(2, "0");
}

export default CoinCandleChart;
