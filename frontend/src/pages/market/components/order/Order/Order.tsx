import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import OrderTab from "@pages/market/components/order/OrderTab";
import OrderForm from "@pages/market/components/order/OrderForm";
import OrderHistory from "@pages/market/components/order/OrderHistory";
import {Container} from "@pages/market/components/order/Order/Order.styles";
import {fetchAssets, type Ticker} from "@api/api";
import {useAuth} from "@auth/useAuth";

interface Props {
    marketCode: string;
    ticker?: Ticker;
}

function Order({marketCode, ticker}: Props) {

    const [activeTab, setActiveTab] = useState<"buy" | "sell" | "history">("buy");
    const {isAuthenticated} = useAuth();
    const {data: assets = [], refetch: refetchAssets} = useQuery({
        queryKey: ["assets"],
        queryFn: fetchAssets,
        enabled: isAuthenticated,
    });
    const [baseAssetCode = "KRW", targetAssetCode = "BTC"] = marketCode.split("-");
    const availableBaseBalance = assets.find((asset) => asset.assetCode === baseAssetCode)?.balance ?? 0;
    const availableTargetBalance = assets.find((asset) => asset.assetCode === targetAssetCode)?.balance ?? 0;

    return (
        <Container>
            <OrderTab activeTab={activeTab} setActiveTab={setActiveTab}/>
            {activeTab !== "history" && (
                <OrderForm
                    marketCode={marketCode}
                    tradeType={activeTab}
                    isAuthenticated={isAuthenticated}
                    availableBaseBalance={availableBaseBalance}
                    availableTargetBalance={availableTargetBalance}
                    ticker={ticker}
                    onOrderCompleted={() => void refetchAssets()}
                />
            )}
            {activeTab === "history" && (<OrderHistory marketCode={marketCode}/>)}
        </Container>
    );
}

export default Order;
