import type { TagProps as AntdTagProps } from "antd";

import * as S from "./tag.styled";

export type AppTagProps = AntdTagProps;

export const Tag = (props: AppTagProps) => <S.TagRoot {...props} />;
