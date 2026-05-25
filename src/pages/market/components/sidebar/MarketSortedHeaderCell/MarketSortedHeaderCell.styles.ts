import styled from "@emotion/styled";

export const Cell = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

export const SortIcon = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 0;

  svg {
    width: 12px;
    height: 12px;
  }

  svg:first-of-type {
    margin-bottom: -5px;
  }
`;