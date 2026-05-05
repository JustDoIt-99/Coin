import {useQuery} from "@tanstack/react-query";
import {fetchMarkets} from "@api/api.ts";
import Loading from "@components/Loading.tsx";
import MarketSidebar from "@components/market/sidebar/MarketSidebar";

export type MarketTab = "KRW"|"BTC"|"USDT";

function MarketPage() {

    const {isLoading, data:markets, isError} = useQuery({
        queryKey:["markets"],
        queryFn:fetchMarkets
    });

    if (isLoading) return <Loading/>;
    if (isError) return <div>데이터를 불러오지 못했습니다.</div>

    return (
        <>
            <MarketSidebar
                markets={markets ?? []}
            />
        </>
    )
}

export default MarketPage;