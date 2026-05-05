import {Search, Settings} from "lucide-react";
import {useEffect, useState} from "react";
import {Input, SearchBar, SearchButton, SettingButton} from "./MarketSearch.styles.ts";

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