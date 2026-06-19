import {
    HeaderContainer,
    LeftArea, LoginButton,
    Logo,
    Nav,
    NavItem,
    RightArea, SignupButton, LogoutButton
} from "./Header.styles.ts";
import {useAuth} from "@auth/useAuth.ts";

function Header() {

    const {isAuthenticated, user, logout} = useAuth();

    return (
        <HeaderContainer>
            <LeftArea>
                <Logo>CoinCo</Logo>
                <Nav>
                    <NavItem to="/">거래소</NavItem>
                    <NavItem to="/portfolio">투자내역</NavItem>
                </Nav>
            </LeftArea>

            <RightArea>
                {isAuthenticated ? (
                    <>
                        <span>{user?.nickname}</span>
                        <LogoutButton type="button" onClick={logout}>
                            로그아웃
                        </LogoutButton>
                    </>
                ) : (
                    <>
                        <LoginButton to="/login">로그인</LoginButton>
                        <SignupButton to="/signup">회원가입</SignupButton>
                    </>
                )}
            </RightArea>
        </HeaderContainer>
    );
}

export default Header;