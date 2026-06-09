import { Avatar as AntdAvatar } from "antd";
import styled from "styled-components";

export const FormCard = styled.div`
  box-sizing: border-box;
  max-width: 960px;
  padding: 24px;
  border: 1px solid ${(props) => props.theme.colors.functional.border.cardBase};
  border-radius: ${(props) => props.theme.radius.semiLarge};
  background: ${(props) => props.theme.colors.functional.background.elevated};
  margin: 0 auto;
`;

export const ProfileRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const ProfileIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
`;

export const ProfileAvatar = styled(AntdAvatar)`
  && {
    flex: 0 0 auto;
    background: ${(props) => props.theme.colors.brandPalette[6]};
    color: ${(props) => props.theme.colors.base.white};
    font-size: 18px;
    font-weight: 700;
  }
`;

export const ProfileText = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ProfileName = styled.span`
  color: ${(props) => props.theme.colors.functional.text.heading};
  font-size: ${(props) => props.theme.fontSize.large};
  font-weight: 600;
  line-height: 1.3;
`;

export const ProfileSubtitle = styled.span`
  color: ${(props) => props.theme.colors.functional.text.subdued};
  font-size: ${(props) => props.theme.fontSize.small};
  line-height: 1.35;
`;

export const FormDivider = styled.hr`
  margin: 24px 0;
  border: 0;
  border-top: 1px solid
    ${(props) => props.theme.colors.functional.border.split};
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 24px;

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const FormFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
`;
