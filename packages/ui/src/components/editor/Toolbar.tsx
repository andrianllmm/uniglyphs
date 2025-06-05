"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  applyTextStyles,
  fontFamilies,
  FontFamily,
  TextDecoration,
  formatFontName,
} from "@workspace/ui/lib/textTools/textStyle/";
import { useTextToolbar } from "./ToolbarProvider";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  EllipsisVerticalIcon,
  EyeOffIcon,
  PinIcon,
  PinOffIcon,
} from "lucide-react";

export function TextToolbar({
  portalContainer,
  className,
}: {
  portalContainer?: HTMLElement;
  className?: string;
}) {
  const {
    style,
    toolbarData,
    styleSelection,
    hidden,
    setHidden,
    sticky,
    setSticky,
  } = useTextToolbar();

  return (
    <div
      className={cn(
        "flex flex-wrap gap-0.5 items-center justify-center",
        className
      )}
    >
      {!hidden ? (
        <>
          {/* Font family dropdown */}
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
            <SelectContent
              className="z-[9999]"
              portalContainer={portalContainer}
            >
              {fontFamilies.map((fam) => (
                <SelectItem key={fam} value={fam} title={formatFontName(fam)}>
                  {applyTextStyles(formatFontName(fam), {
                    ...style,
                    family: fam,
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Toggle buttons for bold and italic */}
          <ToggleGroup
            type="multiple"
            value={[
              style.bold ? "bold" : "",
              style.italic ? "italic" : "",
            ].filter(Boolean)}
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

          {/* Toggle buttons for text decorations */}
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

          {/* Miscellaneous toolbar buttons (e.g., clear) */}
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

          {/* Toolbar options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="p-1 w-fit h-fit"
                title="Options"
              >
                <EllipsisVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              portalContainer={portalContainer}
              className="z-[9999] text-xs"
            >
              <DropdownMenuItem
                onSelect={() => setTimeout(() => setSticky(!sticky), 10)}
              >
                {sticky ? (
                  <>
                    <PinOffIcon /> Unstick
                  </>
                ) : (
                  <>
                    <PinIcon /> Stick
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setTimeout(() => setHidden(true), 10)}
              >
                <EyeOffIcon /> Hide
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        // Button to show the toolbar
        <Button
          variant="ghost"
          size="icon"
          className="p-1 text-lg hover:text-xl hover:rotate-[21deg] font-bold rounded-full transition-all"
          title="Show Uniglyphs Toolbar"
          onClick={() => setTimeout(() => setHidden(false), 10)}
        >
          𝔘
        </Button>
      )}
    </div>
  );
}
