import {
    AssetRow,
    CoinIcon,
    CoinInfo,
    CoinName,
    Muted, OrderButton,
    Profit
} from "@pages/portfolio/components/assettable/AssetTableRow.styles.ts";
import type {Asset} from "@pages/portfolio/types.ts";

interface Props {
    asset: Asset;
}

function AssetTableRow({ asset }: Props) {
    return (
        <AssetRow>
            <td>
                <CoinInfo>
                    <CoinIcon>{asset.icon}</CoinIcon>
                    <CoinName>
                        <strong>{asset.name}</strong>
                        <span>{asset.symbol}</span>
                    </CoinName>
                </CoinInfo>
            </td>
            <td>{asset.quantity} <Muted>{asset.symbol}</Muted></td>
            <td>{asset.avgPrice}</td>
            <td>{asset.buyAmount}</td>
            <td>{asset.valuation}</td>
            <td>
                <Profit>{asset.profitRate}</Profit>
                {asset.profitAmount && <Muted>{asset.profitAmount}</Muted>}
            </td>
            <td>
                <OrderButton>주문 ▾</OrderButton>
            </td>
        </AssetRow>
    );
}

export default AssetTableRow;