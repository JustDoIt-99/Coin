import {keyframes} from "@emotion/react";
import styled from "@emotion/styled";

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const LoadingContainer = styled.div`
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #eee;
  border-top: 4px solid #0fbcf9;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export default function Loading() {
    return (
      <LoadingContainer>
          <Spinner/>
      </LoadingContainer>
    );
}