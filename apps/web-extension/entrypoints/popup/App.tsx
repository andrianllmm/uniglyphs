import { Editor } from "@workspace/ui/components/editor/Editor";

function App() {
  return (
    <Editor
      className="w-full h-full"
      textAreaProps={{ className: "h-[calc(100vh-10rem)] resize-none" }}
      defaultFontSize={20}
      toolbarOffset={12}
    />
  );
}

export default App;
