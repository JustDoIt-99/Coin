import { useState, type ComponentProps } from "react";
import { Link } from "react-router-dom";
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
    LinkRow,
} from "../AuthPage.styles";

function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const handleSignup: ComponentProps<"form">["onSubmit"] = (e) => {
        e.preventDefault();

        if (password !== passwordConfirm) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        console.log(email);
        console.log(password);
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

                    <LoginButton type="submit">
                        회원가입
                    </LoginButton>
                </Form>

                <Divider>
                    <span>또는</span>
                </Divider>

                <SocialButton type="button" $provider="kakao">
                    카카오로 회원가입
                </SocialButton>

                <SocialButton type="button" $provider="google">
                    Google로 회원가입
                </SocialButton>

                <LinkRow>
                    <span>이미 계정이 있으신가요?</span>
                    <Link to="/login">로그인</Link>
                </LinkRow>
            </LoginCard>
        </Page>
    );
}

export default SignupPage;