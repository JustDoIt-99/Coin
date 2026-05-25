import styled from "@emotion/styled";

export const SearchBar = styled.div`
    display: grid;
    grid-template-columns: 1fr 48px 48px;
    height: 52px;
    border-bottom: 1px solid #dfe3ea;
    border-top: 1px solid #dfe3ea;
    background: #fff;
`;

export const Input = styled.input`
    border: none;
    padding: 0 16px;
    font-size: 14px;
    color: #333;
    outline: none;

    &::placeholder {
        color: #9aa1ad;
    }
`;

export const SearchButton = styled.button`
    border: none;
    background: #fff;
    color: #0062df;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;

export const SettingButton = styled.button`
    border: none;
    border-left: 1px solid #dfe3ea;
    border-right: 1px solid #dfe3ea;
    background: #fff;
    color: #999;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;