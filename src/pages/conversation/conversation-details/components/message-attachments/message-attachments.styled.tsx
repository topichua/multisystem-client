import styled from 'styled-components';

export const Attachments = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
`;

export const Image = styled.img`
  display: block;
  max-width: 100%;
  max-height: 320px;
  border-radius: ${({ theme }) => theme.radius.large};
  object-fit: cover;
`;
