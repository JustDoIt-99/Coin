import {
    Page,
    LoginCard,
    Title,
    SubText,
    Form,
    Field,
    Label,
    Input,
    LoginButton,
    Divider,
    SocialButton,
    LinkRow, SignupLink,
} from "@pages/auth/AuthPage.styles";
import {useState} from "react";
import * as React from "react";
import {useAuth} from "@auth/useAuth";
import {useLocation, useNavigate} from "react-router-dom";
import {API} from "@constants/api";
import type {LoginResponse} from "@Type/User";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname ?? "/";

    const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch(API.AUTH_LOGIN, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    email,
                    password
                })
            });

            if (!response.ok) {
                throw new Error("로그인 실패");
            }

            const data: LoginResponse = await response.json();

            login(data.accessToken, data.user);
            navigate(from, {replace: true});
        } catch {
            alert("이메일 또는 비밀번호를 확인해주세요.");
        }
    };

    return (
        <Page>
            <LoginCard>
                <Title>로그인</Title>
                <SubText>CoinCo 계정으로 모의투자를 시작해보세요.</SubText>

                <Form onSubmit={handleLogin}>
                    <Field>
                        <Label>이메일</Label>
                        <Input
                            type="email"
                            placeholder="이메일을 입력하세요"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Field>

                    <Field>
                        <Label>비밀번호</Label>
                        <Input
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Field>

                    <LoginButton type="submit">
                        로그인
                    </LoginButton>
                </Form>

                <Divider>
                    <span>또는</span>
                </Divider>

                <SocialButton type="button" $provider="kakao">
                    카카오로 로그인
                </SocialButton>

                <SocialButton type="button" $provider="google">
                    Google로 로그인
                </SocialButton>

                <LinkRow>
                    <span>아직 회원이 아니신가요?</span>
                    <SignupLink to="/signup">회원가입</SignupLink>
                </LinkRow>
            </LoginCard>
        </Page>
    );
}

export default LoginPage;
