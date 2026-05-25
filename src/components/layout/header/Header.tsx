import {
    HeaderContainer,
    LeftArea,
    LoginButton,
    Logo,
    Nav,
    NavItem,
    RightArea,
    SignupButton
} from "@components/layout/header/Header.styles.ts";

function Header() {
    return (
        <HeaderContainer>
            <LeftArea>
                <Logo>CoinCo</Logo>
                <Nav>
                    <NavItem
                        to="/"
                        className={({isActive}) => isActive ? "active" : ""}>거래소</NavItem>

                    <NavItem
                        to="/portfolio"
                        className={({isActive}) => isActive ? "active" : ""}>투자내역</NavItem>

                    <NavItem
                        to="/asset"
                        className={({isActive}) => isActive ? "active" : ""}>자산</NavItem>
                </Nav>
            </LeftArea>

            <RightArea>
                <LoginButton>로그인</LoginButton>
                <SignupButton>회원가입</SignupButton>
            </RightArea>
        </HeaderContainer>
    );
}

export default Header;