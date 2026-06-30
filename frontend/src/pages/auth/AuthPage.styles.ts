import styled from "@emotion/styled";
import {Link} from "react-router-dom";

export const Page = styled.main`
    min-width: 1280px;
    min-height: calc(100vh - 56px);

    display: flex;
    align-items: center;
    justify-content: center;

    background: #f4f6fa;
`;

export const LoginCard = styled.section`
    width: 420px;
    padding: 44px 40px;

    background: #fff;
    border: 1px solid #dfe3ea;
    border-radius: 8px;

    box-sizing: border-box;
`;

export const Title = styled.h1`
    margin: 0;

    color: #172033;
    font-size: 30px;
    font-weight: 800;
    text-align: center;
`;

export const SubText = styled.p`
    margin: 14px 0 34px;

    color: #6b7280;
    font-size: 15px;
    text-align: center;
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 18px;
`;

export const Field = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const Label = styled.label`
    color: #344054;
    font-size: 14px;
    font-weight: 700;
`;

export const Input = styled.input`
    height: 46px;
    padding: 0 14px;

    border: 1px solid #d2d7df;
    border-radius: 4px;

    font-size: 15px;
    outline: none;

    &:focus {
        border-color: #0062df;
    }
`;

export const LoginButton = styled.button`
    height: 48px;
    margin-top: 8px;

    border: none;
    border-radius: 4px;

    background: #0062df;
    color: #fff;

    font-size: 16px;
    font-weight: 800;
    cursor: pointer;

    &:hover {
        background: #0056c7;
    }
`;

export const LinkRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    margin-top: 26px;

    color: #6b7280;
    font-size: 14px;

    button {
        border: none;
        background: transparent;
        color: #0062df;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
    }
`;

export const SignupLink = styled(Link)`
    color: #6d28d9;
    font-weight: 700;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;
