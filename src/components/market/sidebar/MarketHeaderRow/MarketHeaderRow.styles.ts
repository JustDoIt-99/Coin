import styled from "@emotion/styled";

export const Header = styled.div`
    display: grid;
    grid-template-columns: 32px 2.5fr 1.7fr 1.5fr 1.8fr;
    align-items: center;
    height: 36px;
    padding: 0 16px;
    background: #f7f8fa;
    border-bottom: 1px solid #e5e8ec;
    border-right: 1px solid #e5e8ec;
    font-size: 12px;
    color: #666;
`;

export const Name = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 4px;
    font-weight: 500;
    
    &:hover {
        text-decoration: underline;
        cursor: pointer;
    }
`;
