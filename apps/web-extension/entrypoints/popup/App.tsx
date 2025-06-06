import { Editor } from "@workspace/ui/components/editor/Editor";

function App() {
  return (
    <Editor
      className="w-full h-full"
      textAreaProps={{
        className: "h-[calc(100vh-10rem)] resize-none",
        autoFocus: true,
      }}
      defaultFontSize={18}
      toolbarOffset={12}
    />
  );
}

export default App;
