"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  applyTextStyles,
  fontFamilies,
  FontFamily,
  TextDecoration,
  formatFontName,
} from "@workspace/ui/lib/textTools/textStyle/";
import { useToolbar } from "./ToolbarProvider";
import { useToolbarState } from "./ToolbarStateProvider";
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

export function Toolbar({
  portalContainer,
  className,
}: {
  portalContainer?: HTMLElement;
  className?: string;
}) {
  const { style, toolbarData, styleSelection } = useToolbar();
  const { hidden, sticky, setHidden, setSticky } = useToolbarState();

  return (
    <div
      className={cn(
        "flex flex-wrap gap-[2px] items-center justify-center text-[14px]",
        className,
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
              className="text-[14px] p-[2px] !w-fit !h-fit border-transparent shadow-none hover:bg-muted"
              title="Font"
            >
              <SelectValue className="text-[14px]" placeholder="Font" />
            </SelectTrigger>
            <SelectContent
              className="z-[999999999] text-[14px] gap-[4px]"
              portalContainer={portalContainer}
            >
              {fontFamilies.map((fam) => (
                <SelectItem
                  className="text-[14px]"
                  key={fam}
                  value={fam}
                  title={formatFontName(fam)}
                >
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
              ([value, { label, icon: Icon, hotkey, handler: onSelect }]) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  className="p-[4px] w-fit h-fit"
                  title={`${label} (${hotkey})`}
                  onSelect={onSelect}
                >
                  <Icon style={{ width: "16px", height: "16px" }} />
                </ToggleGroupItem>
              ),
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
              ([value, { label, icon: Icon, hotkey, handler: onSelect }]) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  className="p-[4px] w-fit h-fit"
                  title={`${label} (${hotkey})`}
                  onSelect={onSelect}
                >
                  <Icon style={{ width: "16px", height: "16px" }} />
                </ToggleGroupItem>
              ),
            )}
          </ToggleGroup>

          {/* Miscellaneous toolbar buttons (e.g., clear) */}
          {Object.entries(toolbarData.miscellaneous?.tools || {}).map(
            ([value, { label, icon: Icon, hotkey, handler: onClick }]) => (
              <Button
                key={value}
                variant="ghost"
                size="icon"
                className="p-[4px] w-fit h-fit"
                title={`${label} (${hotkey})`}
                onClick={onClick}
              >
                <Icon style={{ width: "16px", height: "16px" }} />
              </Button>
            ),
          )}

          {/* Toolbar options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="p-[4px] w-fit h-fit"
                title="Options"
              >
                <EllipsisVerticalIcon
                  style={{ width: "16px", height: "16px" }}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              portalContainer={portalContainer}
              className="z-[999999999] text-[14px] gap-[4px]"
            >
              <DropdownMenuItem
                className="text-[14px]"
                onSelect={() => setTimeout(() => setSticky(!sticky), 10)}
              >
                {sticky ? (
                  <>
                    <PinOffIcon style={{ width: "16px", height: "16px" }} />{" "}
                    Unstick
                  </>
                ) : (
                  <>
                    <PinIcon style={{ width: "16px", height: "16px" }} /> Stick
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-[14px]"
                onSelect={() => setTimeout(() => setHidden(true), 10)}
              >
                <EyeOffIcon style={{ width: "16px", height: "16px" }} /> Hide
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        // Button to show the toolbar
        <Button
          variant="ghost"
          size="icon"
          className="p-[16px] bg-popover text-popover-foreground text-[18px] font-bold rounded-full border-2 shadow-lg hover:text-[20px] hover:rotate-[21deg] transition-all"
          title="Show Uniglyphs Toolbar"
          onClick={() => setTimeout(() => setHidden(false), 10)}
        >
          𝔘
        </Button>
      )}
    </div>
  );
}
