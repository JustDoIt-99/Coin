import {useEffect, useState} from "react";
import {
    ActionGroup,
    ApproveButton,
    EmptyArea,
    Page,
    Panel,
    RefreshButton,
    RejectButton,
    Table,
    Title,
    Toolbar
} from "@pages/admin/AdminPage.styles";
import {
    approveAssetTransfer,
    fetchAdminPendingAssetTransfers,
    rejectAssetTransfer,
    type AdminAssetTransferResponse,
    type AssetTransferStatus,
    type AssetTransferType
} from "@api/api";

const headers = [
    "신청시간",
    "사용자",
    "자산",
    "거래종류",
    "요청금액",
    "거래ID",
    "상태",
    "처리",
];

function AdminPage() {
    const [transfers, setTransfers] = useState<AdminAssetTransferResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [message, setMessage] = useState("");

    const loadTransfers = async () => {
        try {
            setIsLoading(true);
            setMessage("");

            const response = await fetchAdminPendingAssetTransfers();
            setTransfers(response);
        } catch (error) {
            console.error("관리자 입출금 대기 내역 조회 실패", error);
            setMessage("입출금 대기 내역을 불러오지 못했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timerId = setTimeout(() => {
            void loadTransfers();
        }, 0);

        return () => {
            clearTimeout(timerId);
        };
    }, []);

    const handleApprove = async (transferId: number) => {
        try {
            setProcessingId(transferId);
            await approveAssetTransfer(transferId);
            setTransfers((current) => current.filter((transfer) => transfer.id !== transferId));
        } catch (error) {
            console.error("현금 충전 요청 승인 실패", error);
            alert("현금 충전 요청 승인에 실패했습니다.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (transferId: number) => {
        try {
            setProcessingId(transferId);
            await rejectAssetTransfer(transferId);
            setTransfers((current) => current.filter((transfer) => transfer.id !== transferId));
        } catch (error) {
            console.error("현금 충전 요청 거절 실패", error);
            alert("현금 충전 요청 거절에 실패했습니다.");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <Page>
            <Panel>
                <Toolbar>
                    <Title>입출금 요청 관리</Title>
                    <RefreshButton type="button" disabled={isLoading} onClick={() => void loadTransfers()}>
                        새로고침
                    </RefreshButton>
                </Toolbar>

                {isLoading ? (
                    <EmptyArea>입출금 요청을 불러오는 중입니다.</EmptyArea>
                ) : message ? (
                    <EmptyArea>{message}</EmptyArea>
                ) : transfers.length === 0 ? (
                    <EmptyArea>처리할 입출금 요청이 없습니다.</EmptyArea>
                ) : (
                    <Table>
                        <thead>
                        <tr>
                            {headers.map((header) => (
                                <th key={header}>{header}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {transfers.map((transfer) => (
                            <tr key={transfer.id}>
                                <td>{formatTime(transfer.requestedAt)}</td>
                                <td>{transfer.userNickname}<br />{transfer.userEmail}</td>
                                <td>{transfer.assetCode}</td>
                                <td>{getTransferTypeLabel(transfer.type)}</td>
                                <td>{formatAmount(transfer.amount)}</td>
                                <td>{transfer.transactionId}</td>
                                <td>{getStatusLabel(transfer.status)}</td>
                                <td>
                                    <ActionGroup>
                                        <ApproveButton
                                            type="button"
                                            disabled={processingId !== null}
                                            onClick={() => void handleApprove(transfer.id)}
                                        >
                                            승인
                                        </ApproveButton>
                                        <RejectButton
                                            type="button"
                                            disabled={processingId !== null}
                                            onClick={() => void handleReject(transfer.id)}
                                        >
                                            거절
                                        </RejectButton>
                                    </ActionGroup>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                )}
            </Panel>
        </Page>
    );
}

function getTransferTypeLabel(type: AssetTransferType) {
    return type === "DEPOSIT" ? "입금" : "출금";
}

function getStatusLabel(status: AssetTransferStatus) {
    switch (status) {
        case "PENDING":
            return "승인대기";
        case "PROCESSING":
            return "처리중";
        case "COMPLETED":
            return "완료";
        case "REJECTED":
            return "거절";
    }
}

function formatAmount(value: number) {
    return value.toLocaleString(undefined, {
        maximumFractionDigits: 8,
    });
}

function formatTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
}

export default AdminPage;
