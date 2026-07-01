import {useEffect, useRef} from "react";
import {
    type CandlestickData,
    CandlestickSeries,
    createChart,
    type HistogramData,
    HistogramSeries,
    type IChartApi,
    type ISeriesApi,
    type LineData,
    LineStyle,
    LineSeries,
    type LogicalRange,
    type Time,
    TickMarkType
} from "lightweight-charts";
import {useQuery} from "@tanstack/react-query";
import {fetchCandlesPage, type CandleInterval, type MinuteCandle} from "@api/api";
import useTradeSocket from "@hooks/useTradeSocket";

interface Props {
    marketCode: string;
    interval: CandleInterval;
    movingAverages: MovingAverageLine[];
    currentPrice?: number,
    currentPriceTimestamp?: number,
    averageBuyPrice?: number,
    active?: boolean
}

export interface MovingAverageLine {
    period: number;
    color: string;
}

const LOAD_MORE_THRESHOLD = 20;
const CHART_HEIGHT = 500;
const KST_OFFSET_SECONDS = 9 * 60 * 60;
const RISE_COLOR = "#d64348";
const FALL_COLOR = "#126ee2";
const RISE_VOLUME_COLOR = RISE_COLOR;
const FALL_VOLUME_COLOR = FALL_COLOR;
const AVERAGE_BUY_PRICE_LINE_COLOR = "#f59f00";
const PINCH_ZOOM_SENSITIVITY = 0.004;
const MIN_VISIBLE_BARS = 8;

function CoinCandleChart({
    marketCode,
    interval,
    movingAverages,
    currentPrice,
    currentPriceTimestamp,
    averageBuyPrice,
    active
}: Props) {
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    const movingAverageSeriesRef = useRef<Record<number, ISeriesApi<"Line">>>({});
    const candleDataRef = useRef<CandlestickData<Time>[]>([]);
    const volumeDataRef = useRef<HistogramData<Time>[]>([]);
    const lastCandleRef = useRef<CandlestickData | null>(null);
    const oldestCandleRef = useRef<string>("");
    const requestedOlderRef = useRef(false);
    const isLoadingOlderRef = useRef<boolean>(false);
    const isFirstLoadingChartRef = useRef<boolean>(true);
    const activeRef = useRef<boolean>(!!active);

    const {data: candles} = useQuery({
        queryKey: ["candle-chart", marketCode, interval.type, interval.unit],
        queryFn: () => fetchCandlesPage(marketCode, interval,  3),
        enabled: !!marketCode,
        refetchInterval: getRefetchInterval(interval)
    });

    const toChartData = (candles: MinuteCandle[]): CandlestickData<Time>[] => {
        return [...candles].reverse().map((candle) => ({
            time: toChartTime(candle.timestamp, interval),
            open: candle.opening_price,
            high: candle.high_price,
            low: candle.low_price,
            close: candle.trade_price,
        }));
    };

    const toVolumeData = (candles: MinuteCandle[]): HistogramData<Time>[] => {
        return [...candles].reverse().map((candle) => ({
            time: toChartTime(candle.timestamp, interval),
            value: candle.candle_acc_trade_volume,
            color: candle.trade_price >= candle.opening_price ? RISE_VOLUME_COLOR : FALL_VOLUME_COLOR,
        }));
    };

    const toMovingAverageData = (
        candles: CandlestickData<Time>[],
        period: number
    ): LineData<Time>[] => {
        const result: LineData<Time>[] = [];
        let sum = 0;

        candles.forEach((candle, index) => {
            sum += candle.close;

            if (index >= period) {
                sum -= candles[index - period].close;
            }

            if (index >= period - 1) {
                result.push({
                    time: candle.time,
                    value: sum / period,
                });
            }
        });

        return result;
    };

    const setMovingAverageSeriesData = (candles: CandlestickData<Time>[]) => {
        Object.entries(movingAverageSeriesRef.current).forEach(([period, series]) => {
            series.setData(toMovingAverageData(candles, Number(period)));
        });
    };

    const createMovingAverageSeries = (chart: IChartApi, lines: MovingAverageLine[]) => {
        return lines.reduce<Record<number, ISeriesApi<"Line">>>(
            (seriesMap, {period, color}) => {
                seriesMap[period] = chart.addSeries(LineSeries, {
                    color,
                    lineWidth: 1,
                    priceLineVisible: false,
                    lastValueVisible: false,
                    crosshairMarkerVisible: false,
                }, 0);

                return seriesMap;
            },
            {}
        );
    };

    const updateRealtimeCandle = (price: number, timestamp?: number, volume = 0) => {
        if (!lastCandleRef.current || !candleSeriesRef.current) {
            return;
        }

        const lastCandle = lastCandleRef.current;
        const lastCandleIndex = candleDataRef.current.length - 1;
        if (lastCandleIndex < 0) {
            return;
        }

        const currentTime = interval.type === "minute" && timestamp
            ? toChartTime(timestamp, interval)
            : lastCandle.time;

        const isNextCandle = interval.type === "minute"
            && getTimeValue(currentTime) > getTimeValue(lastCandle.time);

        if (!isNextCandle && lastCandle.close === price && volume <= 0) {
            return;
        }

        const updatedCandle: CandlestickData<Time> = {
            time: isNextCandle ? currentTime : lastCandle.time,
            open: isNextCandle ? price : lastCandle.open,
            close: price,
            high: isNextCandle ? price : Math.max(lastCandle.high, price),
            low: isNextCandle ? price : Math.min(lastCandle.low, price),
        };

        if (isNextCandle) {
            candleDataRef.current.push(updatedCandle);
        } else {
            candleDataRef.current[lastCandleIndex] = updatedCandle;
        }

        updateRealtimeVolumeData(updatedCandle, volume, isNextCandle);
        lastCandleRef.current = updatedCandle;

        candleSeriesRef.current.update(updatedCandle);
        updateMovingAverageLastPoints();
    };

    const updateRealtimeVolumeData = (
        candle: CandlestickData<Time>,
        volume: number,
        isNextCandle: boolean
    ) => {
        const volumeColor = candle.close >= candle.open ? RISE_VOLUME_COLOR : FALL_VOLUME_COLOR;

        if (isNextCandle) {
            const nextVolume = {
                time: candle.time,
                value: volume,
                color: volumeColor,
            };

            volumeDataRef.current.push(nextVolume);
            volumeSeriesRef.current?.update(nextVolume);
            return;
        }

        const lastVolumeIndex = volumeDataRef.current.length - 1;
        const lastVolume = volumeDataRef.current[lastVolumeIndex];

        if (!lastVolume || getTimeKey(lastVolume.time) !== getTimeKey(candle.time)) {
            return;
        }

        const updatedVolume = {
            ...lastVolume,
            value: lastVolume.value + volume,
            color: volumeColor,
        };

        volumeDataRef.current[lastVolumeIndex] = updatedVolume;
        volumeSeriesRef.current?.update(updatedVolume);
    };

    const updateMovingAverageLastPoints = () => {
        const candles = candleDataRef.current;

        Object.entries(movingAverageSeriesRef.current).forEach(([periodValue, series]) => {
            const period = Number(periodValue);
            if (candles.length < period) {
                return;
            }

            let sum = 0;
            for (let index = candles.length - period; index < candles.length; index += 1) {
                sum += candles[index].close;
            }

            series.update({
                time: candles[candles.length - 1].time,
                value: sum / period,
            });
        });
    };

    useTradeSocket(marketCode, (trade) => {
        updateRealtimeCandle(trade.trade_price, trade.trade_timestamp, trade.trade_volume);
    });

    useEffect(() => {
        isFirstLoadingChartRef.current = true;
        candleDataRef.current = [];
        volumeDataRef.current = [];
        oldestCandleRef.current = "";
        lastCandleRef.current = null;
        requestedOlderRef.current = false;
        isLoadingOlderRef.current = false;
        candleSeriesRef.current?.setData([]);
        volumeSeriesRef.current?.setData([]);
        setMovingAverageSeriesData([]);
    }, [marketCode, interval.type, interval.unit]);

    const normalizeChartData = <T extends { time: Time }>(data: T[]): T[] => {
        const map = new Map<string, T>();
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
            height: CHART_HEIGHT,
            layout: {
                background : { color: "#ffffff"},
                textColor: "#333"
            },
            grid: {
                vertLines: {color: "#f1f3f5"},
                horzLines: {color: "#f1f3f5"}
            },
            timeScale: {
                barSpacing: 10,
                minBarSpacing: 0.1,
                maxBarSpacing: 80,
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
            upColor: RISE_COLOR,
            downColor: FALL_COLOR,
            borderUpColor: RISE_COLOR,
            borderDownColor: FALL_COLOR,
            wickUpColor: RISE_COLOR,
            wickDownColor: FALL_COLOR,
        }, 0);

        movingAverageSeriesRef.current = createMovingAverageSeries(chart, movingAverages);

        const volumeSeries = chart.addSeries(HistogramSeries, {
            priceFormat: {
                type: "volume",
            },
            priceLineVisible: false,
            lastValueVisible: false,
        }, 1);

        const [pricePane, volumePane] = chart.panes();
        pricePane?.setStretchFactor(2);
        volumePane?.setStretchFactor(1);

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;
        volumeSeriesRef.current = volumeSeries;

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
            if (!volumeSeriesRef.current) return;

            requestedOlderRef.current = true;
            isLoadingOlderRef.current = true;

            const candleSeries = candleSeriesRef.current;
            const volumeSeries = volumeSeriesRef.current;

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
                const olderVolumeData = toVolumeData(olderCandles);

                const mergedData = normalizeChartData([
                    ...olderChartData,
                    ...candleDataRef.current,
                ]);
                const mergedVolumeData = normalizeChartData([
                    ...olderVolumeData,
                    ...volumeDataRef.current,
                ]);

                candleDataRef.current = mergedData;
                volumeDataRef.current = mergedVolumeData;
                candleSeries.setData(mergedData);
                setMovingAverageSeriesData(mergedData);
                volumeSeries.setData(mergedVolumeData);

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

        const handlePinchWheel = (event: WheelEvent) => {
            if (!activeRef.current) return;
            if (!event.ctrlKey) return;

            const visibleRange = chart.timeScale().getVisibleLogicalRange();
            if (!visibleRange) return;

            event.preventDefault();

            const rangeWidth = visibleRange.to - visibleRange.from;
            if (rangeWidth <= 0) return;

            const containerRect = chartContainerRef.current?.getBoundingClientRect();
            const pointerRatio = containerRect
                ? Math.min(Math.max((event.clientX - containerRect.left) / containerRect.width, 0), 1)
                : 0.5;
            const pointerPosition = visibleRange.from + rangeWidth * pointerRatio;
            const scale = Math.exp(event.deltaY * PINCH_ZOOM_SENSITIVITY);
            const nextWidth = Math.max(rangeWidth * scale, MIN_VISIBLE_BARS);
            const nextScale = nextWidth / rangeWidth;

            chart.timeScale().setVisibleLogicalRange({
                from: pointerPosition - (pointerPosition - visibleRange.from) * nextScale,
                to: pointerPosition + (visibleRange.to - pointerPosition) * nextScale,
            });
        };

        const handleResize = () => {
            if (!chartContainerRef.current) return;

            chart.applyOptions({
                width: chartContainerRef.current.clientWidth
            });
        }

        chartContainerRef.current.addEventListener("wheel", handlePinchWheel, {passive: false});
        window.addEventListener("resize", handleResize);

        return () => {
            chartContainerRef.current?.removeEventListener("wheel", handlePinchWheel);
            window.removeEventListener("resize", handleResize);
            chart.remove();
            chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
            chartRef.current = null;
            candleSeriesRef.current = null;
            volumeSeriesRef.current = null;
            movingAverageSeriesRef.current = {};
        }
    }, [marketCode, interval.type, interval.unit]);

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        Object.values(movingAverageSeriesRef.current).forEach((series) => {
            chart.removeSeries(series);
        });

        movingAverageSeriesRef.current = createMovingAverageSeries(chart, movingAverages);

        setMovingAverageSeriesData(candleDataRef.current);
    }, [movingAverages]);

    useEffect(() => {
        const candleSeries = candleSeriesRef.current;
        if (!candleSeries) return;

        if (!averageBuyPrice || averageBuyPrice <= 0) {
            return;
        }

        const averageBuyPriceLine = candleSeries.createPriceLine({
            price: averageBuyPrice,
            color: AVERAGE_BUY_PRICE_LINE_COLOR,
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: "평균매수가",
        });

        return () => {
            candleSeries.removePriceLine(averageBuyPriceLine);
        };
    }, [marketCode, interval.type, interval.unit, averageBuyPrice]);

    useEffect(() => {
        if (!candles || !candleSeriesRef.current || !volumeSeriesRef.current || !chartRef.current) return;

        if (!isFirstLoadingChartRef.current) return;

        oldestCandleRef.current = candles[candles.length - 1].candle_date_time_utc;
        const chartData = normalizeChartData(toChartData(candles));
        const volumeData = normalizeChartData(toVolumeData(candles));

        candleDataRef.current = chartData;
        volumeDataRef.current = volumeData;
        candleSeriesRef.current.setData(chartData);
        setMovingAverageSeriesData(chartData);
        volumeSeriesRef.current.setData(volumeData);
        chartRef.current.timeScale().fitContent();
        isFirstLoadingChartRef.current = false;
        lastCandleRef.current = chartData[chartData.length - 1];
    }, [candles]);

    useEffect(() => {
        if (currentPrice === undefined || !lastCandleRef.current || !candleSeriesRef.current) {
            return;
        }
        updateRealtimeCandle(currentPrice, currentPriceTimestamp);
    }, [currentPrice, currentPriceTimestamp, interval.type, interval.unit]);

    useEffect(() => {
        activeRef.current = !!active;

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

    return <div ref={chartContainerRef} style={{width: "100%", height: CHART_HEIGHT}}/>
}

function getRefetchInterval(interval: CandleInterval) {
    if (interval.type === "minute") {
        return 1000 * 60 * (interval.unit ?? 15);
    }

    return 1000 * 60 * 5;
}

function toChartTime(timestamp: number, interval: CandleInterval) {
    const kstTimestampSeconds = Math.floor(timestamp / 1000) + KST_OFFSET_SECONDS;

    if (interval.type === "minute") {
        const unitSeconds = (interval.unit ?? 15) * 60;
        return (Math.floor(kstTimestampSeconds / unitSeconds) * unitSeconds) as Time;
    }

    return kstTimestampSeconds as Time;
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
    return String(time);
}

function getTimeValue(time: Time) {
    return Number(time) * 1000;
}

function getDateParts(time: Time) {
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
