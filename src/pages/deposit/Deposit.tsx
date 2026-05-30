import {
    Container,
    DepositTable,
    StatusBadge,
} from "./Deposit.styles";

const headers = [
    "신청 확인 시간",
    "코인",
    "거래종류",
    "주문수량",
    "거래ID",
    "상태",
];

const deposits = [
    {
        id: 1,
        requestTime: "2026.05.30 14:12:03",
        coin: "KRW",
        type: "입금",
        amount: "10,000,000",
        transactionId: "REQ-10001",
        status: "관리자승인대기",
    },
    {
        id: 2,
        requestTime: "2026.05.29 18:22:55",
        coin: "KRW",
        type: "출금",
        amount: "2,500,000",
        transactionId: "REQ-10002",
        status: "처리중",
    },
];

function Deposit() {
    return (
        <Container>
            <DepositTable>
                <thead>
                <tr>
                    {headers.map((header) => (
                        <th key={header}>{header}</th>
                    ))}
                </tr>
                </thead>

                <tbody>
                {deposits.map((deposit) => (
                    <tr key={deposit.id}>
                        <td>{deposit.requestTime}</td>
                        <td>{deposit.coin}</td>
                        <td>{deposit.type}</td>
                        <td>{deposit.amount}</td>
                        <td>{deposit.transactionId}</td>
                        <td>
                            <StatusBadge $status={deposit.status}>
                                {deposit.status}
                            </StatusBadge>
                        </td>
                    </tr>
                ))}
                </tbody>
            </DepositTable>
        </Container>
    );
}

export default Deposit;