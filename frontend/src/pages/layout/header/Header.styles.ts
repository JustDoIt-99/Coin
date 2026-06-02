import styled from "@emotion/styled";
import {Link, NavLink} from "react-router-dom";

export const HeaderContainer = styled.header`
    position: sticky;
    top: 0;
    z-index: 1000;

    min-width: 1280px;

    height: 56px;
    background: #063f9e;
    color: white;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 60px;
    box-sizing: border-box;

    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

export const LeftArea = styled.div`
    display: flex;
    align-items: center;
    gap: 36px;
`;

export const Logo = styled.div`
    font-size: 22px;
    font-weight: 800;
`;

export const Nav = styled.nav`
    display: flex;
    align-items: center;
    gap: 28px;
`;

export const NavItem = styled(NavLink)`
    border: none;
    background: transparent;
    color: white;
    text-decoration: none;
    cursor: pointer;

    font-size: 15px;
    font-weight: 700;

    opacity: 0.6;

    &:hover {
        opacity: 1;
    }

    &.active {
        opacity: 1;
    }
`;

export const RightArea = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

export const LoginButton = styled(Link)`
    height: 32px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: center;

    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 4px;
    background: white;
    color: #1f2937;
    text-decoration: none;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
`;

export const SignupButton = styled(Link)`
    height: 32px;
    padding: 0 14px;

    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    
    border: none;
    border-radius: 4px;

    background: #0b6dfd;
    color: white;

    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
`;