import styled from "@emotion/styled";
import {Search, Settings} from "lucide-react";
import {useEffect, useState} from "react";

const SearchBar = styled.div`
    display: grid;
    grid-template-columns: 1fr 48px 48px;
    height: 52px;
    border-bottom: 1px solid #dfe3ea;
    border-top: 1px solid #dfe3ea;
    background: #fff;
`;

const Input = styled.input`
    border: none;
    padding: 0 16px;
    font-size: 14px;
    color: #333;
    outline: none;

    &::placeholder {
        color: #9aa1ad;
    }
`;

const SearchButton = styled.button`
    border: none;
    background: #fff;
    color: #0062df;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;

const SettingButton = styled.button`
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

interface Props {
    onSearch: (value: string) => void;
}

function MarketSearch({onSearch}: Props) {

    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        const timer =  setTimeout(() => {
            onSearch(inputValue);
        }, 250);

        return () => clearTimeout(timer);
    }, [inputValue,  onSearch]);

    return (
        <SearchBar>
            <Input
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.currentTarget.value);
                }}
                placeholder={"코인명/심볼검색"}
            />
            <SearchButton>
                <Search size={22}/>
            </SearchButton>

            <SettingButton>
                <Settings size={22}/>
            </SettingButton>
        </SearchBar>
    );
}

export default MarketSearch;