import { TextToolbarContextType } from "./ToolbarProvider";
import {
  BoldIcon,
  ItalicIcon,
  RemoveFormattingIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";

export type ToolbarData = {
  [group: string]: {
    type: string;
    tools: {
      [toolName: string]: {
        label: string;
        icon: React.ReactNode;
        hotkey: string;
        handler: () => void;
      };
    };
  };
};

export function getToolbarData(handlers: {
  styleSelection: TextToolbarContextType["styleSelection"];
  toggleVariant: TextToolbarContextType["toggleVariant"];
  toggleDecoration: TextToolbarContextType["toggleDecoration"];
}): ToolbarData {
  return {
    fontVariants: {
      type: "multiple",
      tools: {
        bold: {
          label: "Bold",
          icon: <BoldIcon />,
          hotkey: "ctrl+b",
          handler: () => handlers.toggleVariant("bold"),
        },
        italic: {
          label: "Italic",
          icon: <ItalicIcon />,
          hotkey: "ctrl+i",
          handler: () => handlers.toggleVariant("italic"),
        },
      },
    },
    textDecorations: {
      type: "multiple",
      tools: {
        underline: {
          label: "Underline",
          icon: <UnderlineIcon />,
          hotkey: "ctrl+u",
          handler: () => handlers.toggleDecoration("underline"),
        },
        strikethrough: {
          label: "Strikethrough",
          icon: <StrikethroughIcon />,
          hotkey: "ctrl+s",
          handler: () => handlers.toggleDecoration("strikethrough"),
        },
      },
    },
    miscellaneous: {
      type: "any",
      tools: {
        clearFormatting: {
          label: "Clear formatting",
          icon: <RemoveFormattingIcon />,
          hotkey: "ctrl+/",
          handler: () =>
            handlers.styleSelection({
              family: "serif",
              bold: false,
              italic: false,
              decorations: [],
            }),
        },
      },
    },
  };
}
