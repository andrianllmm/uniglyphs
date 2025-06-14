import "@workspace/ui/styles/globals.css";
import "./styles.css";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { CONTENT_SCRIPT_MATCHES } from "../../utils/matches";

export default defineContentScript({
  matches: CONTENT_SCRIPT_MATCHES,
  cssInjectionMode: "ui",

  async main(ctx) {
    const url = window.location.href;
    const mySite = import.meta.env.WXT_UNIGLYPHS_WEBSITE_URL + "/";
    if (url.startsWith(mySite)) return;

    const ui = await createShadowRootUi(ctx, {
      name: "floating-toolbar",
      position: "inline",
      anchor: "body",
      append: "first",
      onMount: (container) => {
        const wrapper = document.createElement("div");
        container.append(wrapper);
        const root = ReactDOM.createRoot(wrapper);
        root.render(<App portalContainer={container} />);
        return { root, wrapper };
      },
      onRemove: (elements) => {
        elements?.root.unmount();
        elements?.wrapper.remove();
      },
    });

    ui.mount();
  },
});
