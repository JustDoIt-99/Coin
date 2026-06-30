import { useState, type ComponentProps } from "react";
import {Link, useNavigate} from "react-router-dom";
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
    LinkRow,
} from "@pages/auth/AuthPage.styles";
import {API} from "@constants/endpoints.ts";
import {useAuth} from "@auth/useAuth";
import type {LoginResponse} from "@Type/User";

function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [nickname, setNickname] = useState("");
    const {login} = useAuth();
    const navigate = useNavigate();

    const handleSignup: ComponentProps<"form">["onSubmit"] = async (e) => {
        e.preventDefault();

        if (password !== passwordConfirm) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const response = await fetch(API.AUTH_SIGNUP, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    email,
                    password,
                    nickname
                }),
            });

            if (!response.ok) {
                throw new Error("회원가입 실패");
            }

            const data: LoginResponse = await response.json();
            login(data.accessToken, data.user);
            navigate("/");
            alert("회원가입이 완료되었습니다.");
        } catch (e) {
            alert("회원가입 중 오류가 발생했습니다.");
        }
    };

    return (
        <Page>
            <LoginCard>
                <Title>회원가입</Title>
                <SubText>CoinCo 계정으로 모의투자를 시작해보세요.</SubText>

                <Form onSubmit={handleSignup}>
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

                    <Field>
                        <Label>비밀번호 확인</Label>
                        <Input
                            type="password"
                            placeholder="비밀번호를 다시 입력하세요"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                        />
                    </Field>

                    <Field>
                        <Label>닉네임</Label>
                        <Input
                            type="text"
                            placeholder="닉네임을 입력하세요"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                        />
                    </Field>

                    <LoginButton type="submit">
                        회원가입
                    </LoginButton>
                </Form>

                <LinkRow>
                    <span>이미 계정이 있으신가요?</span>
                    <Link to="/login">로그인</Link>
                </LinkRow>
            </LoginCard>
        </Page>
    );
}

export default SignupPage;
