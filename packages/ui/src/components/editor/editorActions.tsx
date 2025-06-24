import {
  ClipboardIcon,
  CopyIcon,
  MinusIcon,
  PlusIcon,
  RedoIcon,
  UndoIcon,
} from "lucide-react";

export type EditorActions = {
  [action: string]: {
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    handler: () => void;
    hotkey: string;
  };
};

export function getEditorActions(
  copy: () => void,
  paste: () => void,
  undo: () => void,
  redo: () => void,
  decreaseFontSize: () => void,
  increaseFontSize: () => void,
): EditorActions {
  return {
    copy: {
      label: "Copy",
      icon: CopyIcon,
      handler: copy,
      hotkey: "",
    },
    paste: {
      label: "Paste",
      icon: ClipboardIcon,
      handler: paste,
      hotkey: "",
    },
    undo: {
      label: "Undo",
      icon: UndoIcon,
      handler: undo,
      hotkey: "ctrl+z",
    },
    redo: {
      label: "Redo",
      icon: RedoIcon,
      handler: redo,
      hotkey: "ctrl+y",
    },
    decreaseFontSize: {
      label: "Decrease font size",
      icon: MinusIcon,
      handler: decreaseFontSize,
      hotkey: "ctrl+-",
    },
    increaseFontSize: {
      label: "Increase font size",
      icon: PlusIcon,
      handler: increaseFontSize,
      hotkey: "ctrl+=",
    },
  };
}
