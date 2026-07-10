import { PlusIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useRef } from "react";
import { Button, Popover } from "antd";

import { useIsMobileViewport } from "@/utils/use-media-query";

import type { CatalogProductSearchPickerProps } from "./catalog-product-search-picker";
import { CatalogProductSearchPicker } from "./catalog-product-search-picker";
import * as S from "./catalog-product-search.styled";

type CatalogProductSearchPopoverProps = Omit<
  CatalogProductSearchPickerProps,
  "autoFocus" | "showAddLabel"
> & {
  autoFocus?: boolean;
  block?: boolean;
  buttonIcon?: ReactNode;
  buttonLabel: string;
  contentWidth?: number;
  disabled?: boolean;
  loading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CatalogProductSearchPopover({
  autoFocus = true,
  block,
  buttonIcon = <PlusIcon size={16} />,
  buttonLabel,
  contentWidth,
  disabled,
  loading,
  open,
  onOpenChange,
  ...pickerProps
}: CatalogProductSearchPopoverProps) {
  const isMobileViewport = useIsMobileViewport();
  const contentRef = useRef<HTMLDivElement>(null);
  const resolvedWidth = contentWidth ?? (isMobileViewport ? undefined : 400);

  return (
    <Popover
      open={open}
      trigger="click"
      placement={isMobileViewport ? "bottom" : "bottomRight"}
      arrow={false}
      destroyOnHidden
      content={
        <S.PopoverContent
          ref={contentRef}
          $width={resolvedWidth}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <CatalogProductSearchPicker
            autoFocus={autoFocus}
            dropdownOpen={open}
            getPopupContainer={() => contentRef.current ?? document.body}
            {...pickerProps}
          />
        </S.PopoverContent>
      }
      onOpenChange={onOpenChange}
    >
      <Button
        block={block ?? isMobileViewport}
        disabled={disabled}
        icon={buttonIcon}
        loading={loading}
      >
        {buttonLabel}
      </Button>
    </Popover>
  );
}
