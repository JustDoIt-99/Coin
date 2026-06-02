import type {PeriodType} from "frontend/src/pages/tradehistory/types.ts";

export const parseHistoryDate = (dateText: string) => {
    const [date, time] = dateText.split(" ");
    const [year, month, day] = date.split(".");
    const [hour, minute, second] = time.split(":");

    return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second)
    );
};

export const getStartDateByPeriod = (period: PeriodType, endDate: Date) => {
    const startDate = new Date(endDate);

    switch (period) {
        case "1주일":
            startDate.setDate(startDate.getDate() - 7);
            return startDate;
        case "1개월":
            startDate.setMonth(startDate.getMonth() - 1);
            return startDate;
        case "3개월":
            startDate.setMonth(startDate.getMonth() - 3);
            return startDate;
        case "6개월":
            startDate.setMonth(startDate.getMonth() - 6);
            return startDate;
        case "직접입력":
            return null;
    }
};

export const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}.${month}.${day}`;
};

export const toDateInputValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export const getEndOfDay = (dateValue: string) => {
    if (!dateValue) return null;
    return new Date(`${dateValue}T23:59:59`);
};