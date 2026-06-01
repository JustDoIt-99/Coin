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
} from "./LoginPage.styles";
import {useState} from "react";
import * as React from "react";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        console.log(email);
        console.log(password);
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