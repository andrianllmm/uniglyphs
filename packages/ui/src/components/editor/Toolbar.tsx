"use client";

import { HotkeysProvider } from "react-hotkeys-hook";
import {
  applyTextStyles,
  fontFamilies,
  FontFamily,
  TextDecoration,
  formatFontName,
} from "@workspace/ui/lib/textTools/textStyle/";
import { BlockType } from "@workspace/ui/lib/textTools/textBlock";
import {
  EmojiPicker,
  EmojiPickerSearch,
  EmojiPickerContent,
  EmojiPickerFooter,
} from "@workspace/ui/components/emoji-picker";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { ButtonGroup } from "@workspace/ui/components/button-group";
import { Button } from "@workspace/ui/components/button";
import { SmileIcon } from "lucide-react";
import { TextToolbarProvider, useTextToolbar } from "./ToolbarProvider";

function TextToolbarInner() {
  const { style, block, toolbarData, insertText, styleSelection, makeBlock } =
    useTextToolbar();

  return (
    <div className="flex gap-0.5 items-center justify-center">
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
        {Object.entries(toolbarData.fontVariants.tools).map(
          ([value, { label, icon, hotkey, func: onSelect }]) => (
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
        {Object.entries(toolbarData.textDecorations.tools).map(
          ([value, { label, icon, hotkey, func: onSelect }]) => (
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
        type="single"
        value={block ?? undefined}
        onValueChange={(value: BlockType) => {
          makeBlock(value);
        }}
      >
        {Object.entries(toolbarData.blockTypes.tools).map(
          ([value, { label, icon, hotkey, func: onClick }]) => (
            <ToggleGroupItem
              key={value}
              value={value}
              className="p-1 w-fit h-fit"
              title={`${label} (${hotkey})`}
              onClick={onClick}
            >
              {icon}
            </ToggleGroupItem>
          )
        )}
      </ToggleGroup>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="p-1 w-fit h-fit"
            title="Emoji"
          >
            <SmileIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-0">
          <EmojiPicker
            className="h-[300px]"
            onEmojiSelect={({ emoji }) => insertText(emoji)}
          >
            <EmojiPickerSearch />
            <EmojiPickerContent />
            <EmojiPickerFooter />
          </EmojiPicker>
        </PopoverContent>
      </Popover>

      <ButtonGroup>
        {Object.entries(toolbarData.indentation.tools).map(
          ([value, { label, icon, hotkey, func: onClick }]) => (
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
      </ButtonGroup>

      {Object.entries(toolbarData.miscellaneous.tools).map(
        ([value, { label, icon, hotkey, func: onClick }]) => (
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
  textBoxRef,
}: {
  textBoxRef: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>;
}) {
  return (
    <HotkeysProvider initiallyActiveScopes={["editor"]}>
      <TextToolbarProvider textBoxRef={textBoxRef}>
        <TextToolbarInner />
      </TextToolbarProvider>
    </HotkeysProvider>
  );
}
