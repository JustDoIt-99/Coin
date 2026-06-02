export const formatIntegerWithComma = (value: string) => {
    const onlyNumber = value.replaceAll(",", "").replace(/\D/g, "");
    if (!onlyNumber) return "";
    return Number(onlyNumber).toLocaleString();
};

export const formatDecimalWithComma = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const [integerPart, decimalPart] = cleaned.split(".");

    const formattedInteger = integerPart
        ? Number(integerPart).toLocaleString()
        : "";

    if (decimalPart !== undefined) {
        return `${formattedInteger}.${decimalPart}`;
    }

    return formattedInteger;
};

export const removeComma = (value: string) => {
    return value.replaceAll(",", "");
};