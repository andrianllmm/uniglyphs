"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  applyTextStyles,
  fontFamilies,
  FontFamily,
  TextDecoration,
  formatFontName,
} from "@workspace/ui/lib/textTools/textStyle/";
import { TextToolbarProvider, useTextToolbar } from "./ToolbarProvider";
import { TextboxElement } from "./textboxState";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";

function TextToolbarInner({ className }: { className?: string }) {
  const { style, toolbarData, styleSelection } = useTextToolbar();

  return (
    <div
      className={cn(
        "flex flex-wrap gap-0.5 items-center justify-center",
        className
      )}
    >
      <Select
        value={style.family}
        onValueChange={(value: FontFamily) => {
          styleSelection({ ...style, family: value });
        }}
      >
        <SelectTrigger
          className="p-0.5 !w-fit !h-fit border-transparent shadow-none hover:bg-muted"
          title="Font"
        >
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent className="border-input">
          {fontFamilies.map((fam) => (
            <SelectItem key={fam} value={fam} title={formatFontName(fam)}>
              {applyTextStyles(formatFontName(fam), { ...style, family: fam })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ToggleGroup
        type="multiple"
        value={[style.bold ? "bold" : "", style.italic ? "italic" : ""].filter(
          Boolean
        )}
        onValueChange={(value) => {
          styleSelection({
            ...style,
            bold: value.includes("bold"),
            italic: value.includes("italic"),
          });
        }}
      >
        {Object.entries(toolbarData.fontVariants?.tools || {}).map(
          ([value, { label, icon, hotkey, handler: onSelect }]) => (
            <ToggleGroupItem
              key={value}
              value={value}
              className="p-1 w-fit h-fit"
              title={`${label} (${hotkey})`}
              onSelect={onSelect}
            >
              {icon}
            </ToggleGroupItem>
          )
        )}
      </ToggleGroup>

      <ToggleGroup
        type="multiple"
        value={style.decorations}
        onValueChange={(value: TextDecoration[]) => {
          styleSelection({ ...style, decorations: value });
        }}
      >
        {Object.entries(toolbarData.textDecorations?.tools || {}).map(
          ([value, { label, icon, hotkey, handler: onSelect }]) => (
            <ToggleGroupItem
              key={value}
              value={value}
              className="p-1 w-fit h-fit"
              title={`${label} (${hotkey})`}
              onSelect={onSelect}
            >
              {icon}
            </ToggleGroupItem>
          )
        )}
      </ToggleGroup>

      {Object.entries(toolbarData.miscellaneous?.tools || {}).map(
        ([value, { label, icon, hotkey, handler: onClick }]) => (
          <Button
            key={value}
            variant="ghost"
            size="icon"
            className="p-1 w-fit h-fit"
            title={`${label} (${hotkey})`}
            onClick={onClick}
          >
            {icon}
          </Button>
        )
      )}
    </div>
  );
}

export function TextToolbar({
  textboxRef,
  className,
}: {
  textboxRef: React.RefObject<TextboxElement | null>;
  className?: string;
}) {
  return (
    <TextToolbarProvider textboxRef={textboxRef}>
      <TextToolbarInner className={className} />
    </TextToolbarProvider>
  );
}
