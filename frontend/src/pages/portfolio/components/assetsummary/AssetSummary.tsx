import {
    SummarySection,
    SummaryLeft,
    SummaryRight,
    SummaryGrid,
    SummaryRow,
    SummaryValue,
    LegendItem,
    LegendList,
    ChartBox, DonutBox, ColorDot, CoinName, CoinWeight,
} from "./AssetSummary.styles";
import {useAuth} from "@auth/useAuth.ts";
import {useQuery} from "@tanstack/react-query";
import {getPortfolioAssetSummary} from "@api/api.ts";
import {useMemo, useState} from "react";
import {PieChart, Pie, ResponsiveContainer, Tooltip} from "recharts";
import useTickerSocket from "@hooks/useTickerSocket";

type Trend = "up" | "down";

type SummaryItem = {
    label: string;
    value: number;
    unit: "KRW" | "%";
    trend?: Trend;
};

function AssetSummary() {
    const {accessToken} = useAuth();

    const [tickerMap, setTickerMap] = useState<Record<string, number>>({});

    const {data, isLoading, error} = useQuery({
        queryKey: ["portfolio-summary"],
        queryFn: () => getPortfolioAssetSummary(accessToken!),
        enabled: !!accessToken,
    });

    const holdingMarketCodes = useMemo(() => {
        return new Set(
            data?.assets
                .filter((asset) => asset.assetCode !== "KRW")
                .map((asset) => `KRW-${asset.assetCode}`) ?? []
        );
    }, [data]);

    useTickerSocket((ticker) => {
        if (!holdingMarketCodes.has(ticker.code)) return;

        setTickerMap((prev) => {
            if (prev[ticker.code] === ticker.trade_price) return prev;

            return {
                ...prev,
                [ticker.code]: ticker.trade_price,
            };
        });
    });

    const summary = useMemo(() => {
        if (!data) return null;

        const coinAssets = data.assets.filter((asset) => asset.assetCode !== "KRW");

        const totalValuationAmount = coinAssets.reduce((sum, asset) => {
            const marketCode = `KRW-${asset.assetCode}`;
            const currentPrice = tickerMap[marketCode] ?? asset.currentPrice;
            return sum + asset.balance * currentPrice;
        }, 0);

        const totalBuyAmount = coinAssets.reduce((sum, asset) => {
            return sum + asset.balance * (asset.averageBuyPrice ?? 0);
        }, 0);

        const totalProfitAmount = totalValuationAmount - totalBuyAmount;
        const totalProfitRate =
            totalBuyAmount === 0 ? 0 : (totalProfitAmount / totalBuyAmount) * 100;

        return {
            ...data,
            totalValuationAmount,
            totalBuyAmount,
            totalProfitAmount,
            totalProfitRate,
            totalAssetAmount: data.cashBalance + totalValuationAmount,
        };
    }, [data, tickerMap]);

    const chartData = useMemo(() => {
        if (!data) return [];

        const coinAssets = data.assets.filter((asset) => asset.assetCode !== "KRW");

        const coinValues = coinAssets
            .map((asset) => {
                const marketCode = `KRW-${asset.assetCode}`;
                const currentPrice = tickerMap[marketCode] ?? asset.currentPrice;
                const valuationAmount = asset.balance * currentPrice;

                return {
                    name: asset.assetCode,
                    value: valuationAmount,
                    fill: "#f7931a",
                };
            })
            .filter((asset) => asset.value > 0);

        return coinValues;
    }, [data, tickerMap]);

    const totalCoinValuationAmount = useMemo(() => {
        return chartData.reduce((sum, item) => sum + item.value, 0);
    }, [chartData]);

    if (isLoading) return <div>불러오는 중...</div>;
    if (error) return <div>보유자산 조회 실패</div>;

    const formatSignedValue = (value: number, unit: "KRW" | "%") => {
        const absValue = Math.abs(value);
        const sign = value > 0 ? "+" : value < 0 ? "-" : "";

        const formattedValue =
            unit === "%"
                ? absValue.toFixed(2)
                : Math.round(absValue).toLocaleString();

        return `${sign}${formattedValue}`;
    };

    const formatCurrency = (value: number) => {
        return Math.round(value).toLocaleString();
    };

    const summaryItems: SummaryItem[] = [
        {label: "보유 KRW", value: summary?.cashBalance ?? 0, unit: "KRW"},
        {label: "총 보유자산", value: summary?.totalAssetAmount ?? 0, unit: "KRW"},
        {label: "총 매수", value: summary?.totalBuyAmount ?? 0, unit: "KRW"},
        {
            label: "총 평가손익",
            value: summary?.totalProfitAmount ?? 0,
            unit: "KRW",
            trend:
                (summary?.totalProfitAmount ?? 0) > 0
                    ? "up"
                    : (summary?.totalProfitAmount ?? 0) < 0
                        ? "down"
                        : undefined,
        },
        {label: "총 평가", value: summary?.totalValuationAmount ?? 0, unit: "KRW"},
        {
            label: "총 평가수익률",
            value: summary?.totalProfitRate ?? 0,
            unit: "%",
            trend:
                (summary?.totalProfitRate ?? 0) > 0
                    ? "up"
                    : (summary?.totalProfitRate ?? 0) < 0
                        ? "down"
                        : undefined,
        },
        {label: "주문가능", value: summary?.availableOrderAmount ?? 0, unit: "KRW"},
    ];

    return (
        <SummarySection>
            <SummaryLeft>
                <SummaryGrid>
                    {summaryItems.map((item) => (
                        <SummaryRow key={item.label}>
                            <span>{item.label}</span>
                            <SummaryValue $trend={item.trend}>
                                {(item.label === "총 평가손익" || item.label === "총 평가수익률")
                                    ? formatSignedValue(Number(item.value), item.unit)
                                    : formatCurrency(Number(item.value))}
                                <small>{item.unit}</small>
                            </SummaryValue>
                        </SummaryRow>
                    ))}
                </SummaryGrid>
            </SummaryLeft>
            <SummaryRight>
                {chartData.length > 0 ? (
                    <ChartBox>
                        <DonutBox>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={chartData.length > 1 ? 1 : 0}
                                    />
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </DonutBox>

                        <LegendList>
                            {chartData.map((item) => (
                                <LegendItem key={item.name}>
                                    <ColorDot $color={item.fill} />
                                    <CoinName>{item.name}</CoinName>
                                    <CoinWeight>
                                        {((item.value / totalCoinValuationAmount) * 100).toFixed(2)}%
                                    </CoinWeight>
                                </LegendItem>
                            ))}
                        </LegendList>
                    </ChartBox>
                ) : (
                    "보유자산 비중 그래프가 제공됩니다."
                )}
            </SummaryRight>
        </SummarySection>
    );
}

export default AssetSummary;