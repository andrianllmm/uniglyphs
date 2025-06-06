import { H1, P } from "@workspace/ui/components/heading-with-anchor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  BoldIcon,
  EyeOffIcon,
  ItalicIcon,
  PinIcon,
  RemoveFormattingIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";

const toolsInfo = [
  {
    name: "Font",
    icon: null,
    description: "Select the font family",
    hotkey: "",
  },
  {
    name: "Bold",
    icon: <BoldIcon />,
    description: "Apply bold",
    hotkey: "Ctrl+B",
  },
  {
    name: "Italic",
    icon: <ItalicIcon />,
    description: "Apply italic",
    hotkey: "Ctrl+I",
  },
  {
    name: "Underline",
    icon: <UnderlineIcon />,
    description: "Apply underline",
    hotkey: "Ctrl+U",
  },
  {
    name: "Strikethrough",
    icon: <StrikethroughIcon />,
    description: "Apply strikethrough",
    hotkey: "Ctrl+S",
  },
  {
    name: "Clear formatting",
    icon: <RemoveFormattingIcon />,
    description: "Clear all applied formatting",
    hotkey: "Ctrl+/",
  },
  {
    name: "Sticky",
    icon: <PinIcon />,
    description: "Pin the toolbar to the center-bottom of the page",
    hotkey: "",
  },
  {
    name: "Hide",
    icon: <EyeOffIcon />,
    description: "Hide the toolbar in the corner",
    hotkey: "",
  },
];

export function FeaturesSection() {
  return (
    <>
      <H1 anchor="features">Tools in the Bar</H1>

      <P>
        You can use the toolbar with the following tools. You can also use
        keyboard shortcuts to access them.
      </P>
      <br />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold w-fit"></TableHead>
            <TableHead className="font-bold">Description</TableHead>
            <TableHead className="font-bold">Hotkey</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {toolsInfo.map((tool) => (
            <TableRow key={tool.name}>
              <TableCell className="w-12" title={tool.name}>
                {tool.icon}
              </TableCell>
              <TableCell>{tool.description}</TableCell>
              <TableCell>
                <code>{tool.hotkey}</code>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <br />
    </>
  );
}
