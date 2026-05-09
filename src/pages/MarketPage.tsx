import {useQuery} from "@tanstack/react-query";
import {fetchMarkets, type Market, type Ticker} from "@api/api.ts";
import Loading from "@components/Loading.tsx";
import MarketSidebar from "@components/market/sidebar/MarketSidebar";
import CoinDetail from "@components/market/coindetail";
import {ContentArea, PageBackground, PageLayout, SidebarArea} from "@pages/MarketPage.styles.ts";
import {useState} from "react";

export type MarketTab = "KRW" | "BTC" | "USDT";

function MarketPage() {

    const {
        isLoading,
        data: markets,
        isError,
    } = useQuery({
        queryKey: ["markets"],
        queryFn: fetchMarkets,
    });

    const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
    const [tickerMap, setTickerMap] = useState<Record<string,Ticker>>({});

    if (isLoading) return <Loading />;
    if (isError) return <div>데이터를 불러오지 못했습니다.</div>;

    return (
        <PageBackground>
            <PageLayout>
                <ContentArea>
                    <CoinDetail market={selectedMarket} ticker={ selectedMarket ? tickerMap[selectedMarket.market] : tickerMap["KRW-BTC"]}/>
                </ContentArea>
                <SidebarArea>
                    <MarketSidebar
                        markets={markets ?? []}
                        onSelectedMarket={(market) => setSelectedMarket(market)}
                        tickerMap={tickerMap}
                        setTickerMap={setTickerMap}
                    />
                </SidebarArea>
            </PageLayout>
        </PageBackground>
    );

}

export default MarketPage;