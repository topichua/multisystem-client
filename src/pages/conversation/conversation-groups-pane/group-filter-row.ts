import type { MouseEvent } from 'react';

export const isClickInsideAntCheckboxWrapper = (e: MouseEvent<HTMLDivElement>): boolean => {
  const wrap = e.currentTarget.querySelector('.ant-checkbox-wrapper');
  const { target } = e;
  return !!(wrap && target instanceof Node && wrap.contains(target));
};

export const toggleIdInNumberList = (ids: readonly number[], id: number): number[] =>
  ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
