import styled from "@emotion/styled";

export const Container = styled.aside`
  width: 200px;
  padding: 0px 18px;
  background: #fff;
  font-size: 14px;
  color: #222;
`;

export const InfoGroup = styled.div`
  padding: 3px 0;
  border-bottom: 1px solid #e5e8ee;

  &:first-of-type {
    padding-top: 0;
  }

  &:last-of-type {
    border-bottom: none;
  }
`;

export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 30px;

  span {
    color: #666;
    font-weight: 600;
  }
`;

export const Value = styled.strong`
  color: #222;
  font-size: 15px;
  font-weight: 700;
  text-align: right;
`;

export const Unit = styled.small`
  margin-left: 4px;
  color: #999;
  font-size: 13px;
  font-weight: 600;
`;

export const DateText = styled.div`
    text-align: right;
    color: #999;
    font-size: 13px;
    line-height: 20px;

    &.red {
        color: #d64348;
    }

    &.blue {
        color: #126ee2;
    }
`;

export const RedValue = styled(Value)`
  color: #d64348;
`;

export const BlueValue = styled(Value)`
  color: #126ee2;
`;