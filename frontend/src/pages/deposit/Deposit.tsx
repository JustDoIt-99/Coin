import {
    AmountInput,
    Container,
    DepositTable,
    EmptyArea,
    FormMessage,
    RequestButton,
    RequestForm,
    StatusBadge,
} from "./Deposit.styles";
import {type FormEventHandler, useEffect, useState} from "react";
import {
    fetchPendingAssetTransfers,
    requestCashDeposit,
    type AssetTransferStatus,
    type AssetTransferType,
    type PendingAssetTransferResponse
} from "@api/api";
import {removeComma} from "@utils/orderform/numberFormat";

const headers = [
    "신청 확인 시간",
    "코인",
    "거래종류",
    "주문수량",
    "거래ID",
    "상태",
];

const MAX_CASH_DEPOSIT_AMOUNT = 1_000_000_000;
const MAX_CASH_DEPOSIT_AMOUNT_LENGTH = String(MAX_CASH_DEPOSIT_AMOUNT).length;

function Deposit() {
    const [transfers, setTransfers] = useState<PendingAssetTransferResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [amountInput, setAmountInput] = useState("");
    const [message, setMessage] = useState("");
    const [formMessage, setFormMessage] = useState("");

    useEffect(() => {
        let ignore = false;

        const loadPendingTransfers = async () => {
            try {
                setIsLoading(true);
                setMessage("");

                const response = await fetchPendingAssetTransfers();
                if (!ignore) {
                    setTransfers(response);
                }
            } catch (error) {
                console.error("입출금 대기 내역 조회 실패", error);
                if (!ignore) {
                    setMessage("입출금 대기 내역을 불러오지 못했습니다.");
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        };

        void loadPendingTransfers();

        return () => {
            ignore = true;
        };
    }, []);

    const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();

        const amount = Number(removeComma(amountInput));
        if (!Number.isFinite(amount) || amount <= 0) {
            setFormMessage("요청 금액을 입력해주세요.");
            return;
        }

        if (amount > MAX_CASH_DEPOSIT_AMOUNT) {
            setFormMessage("현금 충전 요청 금액은 10억 원 이하로 입력해주세요.");
            return;
        }

        try {
            setIsSubmitting(true);
            setFormMessage("");

            const response = await requestCashDeposit({amount});
            setTransfers((currentTransfers) => [response, ...currentTransfers]);
            setAmountInput("");
            setFormMessage("현금 충전 요청이 등록되었습니다.");
        } catch (error) {
            console.error("현금 충전 요청 실패", error);
            setFormMessage("현금 충전 요청에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container>
            <RequestForm onSubmit={handleSubmit}>
                <FormMessage>{formMessage}</FormMessage>
                <AmountInput
                    inputMode="numeric"
                    placeholder="요청 금액"
                    value={amountInput}
                    onChange={(event) => setAmountInput(formatInputAmount(event.target.value))}
                />
                <RequestButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "요청중" : "현금 충전 요청"}
                </RequestButton>
            </RequestForm>
            {isLoading ? (
                <EmptyArea>입출금 대기 내역을 불러오는 중입니다.</EmptyArea>
            ) : message ? (
                <EmptyArea>{message}</EmptyArea>
            ) : transfers.length === 0 ? (
                <EmptyArea>입출금 대기 내역이 없습니다.</EmptyArea>
            ) : (
            <DepositTable>
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
                        <td>{transfer.assetCode}</td>
                        <td>{getTransferTypeLabel(transfer.type)}</td>
                        <td>{formatAmount(transfer.amount)}</td>
                        <td>{transfer.transactionId}</td>
                        <td>
                            <StatusBadge $status={transfer.status}>
                                {getStatusLabel(transfer.status)}
                            </StatusBadge>
                        </td>
                    </tr>
                ))}
                </tbody>
            </DepositTable>
            )}
        </Container>
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

function formatInputAmount(value: string) {
    const numericValue = removeComma(value)
        .replace(/[^\d]/g, "")
        .slice(0, MAX_CASH_DEPOSIT_AMOUNT_LENGTH);
    if (!numericValue) {
        return "";
    }

    return Number(numericValue).toLocaleString();
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

export default Deposit;
