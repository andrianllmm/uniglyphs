import { useHotkeys } from "react-hotkeys-hook";
import { getToolbarData } from "./toolsData";

export function registerHotkeys(
  toolbarData: ReturnType<typeof getToolbarData>,
  textBoxRef: React.RefObject<HTMLElement | null>,
) {
  for (const { tools } of Object.values(toolbarData)) {
    for (const { hotkey, func } of Object.values(tools)) {
      if (!hotkey) continue;
      useHotkeys(
        hotkey,
        () => {
          if (document.activeElement === textBoxRef.current) {
            func();
          }
        },
        {
          scopes: ["editor"],
          preventDefault: true,
          enableOnContentEditable: true,
          enableOnFormTags: true,
        },
      );
    }
  }
  return toolbarData;
}
