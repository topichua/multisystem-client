import { Typography } from "antd";
import styled from "styled-components";

import { UserAvatar } from "@/components/user-avatar";

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

export const ProfileAvatar = styled(UserAvatar)`
  && {
    font-size: 18px;
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

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 24px;

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const CardsStack = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FormSectionTitle = styled(Typography.Title)`
  && {
    margin: 0 0 16px;
  }
`;

export const FormFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
`;

export const MobileProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`;
