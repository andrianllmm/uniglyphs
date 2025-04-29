import { TextToolbarContextType } from "./ToolbarProvider";
import {
  BoldIcon,
  IndentDecreaseIcon,
  IndentIncreaseIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
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
  makeBlock: TextToolbarContextType["makeBlock"];
  indent: TextToolbarContextType["indent"];
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
    blockTypes: {
      type: "single",
      tools: {
        bullet: {
          label: "Bullet",
          icon: <ListIcon />,
          hotkey: "ctrl+9",
          handler: () => handlers.makeBlock("bullet"),
        },
        numbered: {
          label: "Numbered",
          icon: <ListOrderedIcon />,
          hotkey: "ctrl+8",
          handler: () => handlers.makeBlock("numbered"),
        },
      },
    },
    indentation: {
      type: "any",
      tools: {
        increase: {
          label: "Increase indent",
          icon: <IndentIncreaseIcon />,
          hotkey: "tab",
          handler: () => handlers.indent(true),
        },
        decrease: {
          label: "Decrease indent",
          icon: <IndentDecreaseIcon />,
          hotkey: "shift+tab",
          handler: () => handlers.indent(false),
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
