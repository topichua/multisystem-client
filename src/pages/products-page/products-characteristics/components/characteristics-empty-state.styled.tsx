import styled from "styled-components";

export const Root = styled.div`
  box-sizing: border-box;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 0;
  width: 100%;
  padding: 32px 24px;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 360px;
  text-align: center;
`;

export const IconBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-bottom: 20px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.brandPalette[1]};
  color: ${({ theme }) => theme.colors.brandPalette[6]};
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.functional.text.primary};
`;

export const Description = styled.p`
  margin: 8px 0 0;
  font-size: ${({ theme }) => theme.fontSize.regular};
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
`;
