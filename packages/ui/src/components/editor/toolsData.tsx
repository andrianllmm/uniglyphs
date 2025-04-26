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

export function getToolbarData(handlers: {
  styleSelection: TextToolbarContextType["styleSelection"];
  toggleVariant: TextToolbarContextType["toggleVariant"];
  toggleDecoration: TextToolbarContextType["toggleDecoration"];
  makeBlock: TextToolbarContextType["makeBlock"];
  indent: TextToolbarContextType["indent"];
}) {
  return {
    fontVariants: {
      type: "multiple",
      tools: {
        bold: {
          label: "Bold",
          icon: <BoldIcon />,
          hotkey: "ctrl+b",
          func: () => handlers.toggleVariant("bold"),
        },
        italic: {
          label: "Italic",
          icon: <ItalicIcon />,
          hotkey: "ctrl+i",
          func: () => handlers.toggleVariant("italic"),
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
          func: () => handlers.toggleDecoration("underline"),
        },
        strikethrough: {
          label: "Strikethrough",
          icon: <StrikethroughIcon />,
          hotkey: "ctrl+s",
          func: () => handlers.toggleDecoration("strikethrough"),
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
          func: () => handlers.makeBlock("bullet"),
        },
        numbered: {
          label: "Numbered",
          icon: <ListOrderedIcon />,
          hotkey: "ctrl+8",
          func: () => handlers.makeBlock("numbered"),
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
          func: () => handlers.indent(true),
        },
        decrease: {
          label: "Decrease indent",
          icon: <IndentDecreaseIcon />,
          hotkey: "shift+tab",
          func: () => handlers.indent(false),
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
          func: () =>
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
