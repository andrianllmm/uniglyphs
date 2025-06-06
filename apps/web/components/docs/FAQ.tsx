import { H1 } from "@workspace/ui/components/heading-with-anchor";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";

const faqs = [
  {
    question: "How does it style text?",
    answer:
      "It replaces each character with its styled Unicode equivalent using offsets. For example, 'A' can become 𝗔, 𝘈, or 𝒜 depending on the selected style.",
  },
  {
    question: "What is Unicode?",
    answer:
      "Unicode is a universal standard that assigns a unique number to every character and symbol used in writing systems worldwide.",
  },
  {
    question: "What are Unicode offsets?",
    answer:
      "Offsets are just numerical jumps used to calculate the styled version of a character. For example, normal A = 65, bold 𝐀 = 120572, so the offset is added to transform it.",
  },
  {
    question: "Are these styles just fonts?",
    answer:
      "No. These are actual characters that look like styled fonts. They work everywhere Unicode is supported, even in places where fonts can’t be changed.",
  },
  {
    question: "Where can I use styled text?",
    answer:
      "Anywhere you can type—social media posts, chat, comments, bios, and more. If the platform supports Unicode, your styled text will show up as expected.",
  },
  {
    question: "Will styled text break anything?",
    answer:
      "They usually work fine, but some old devices, websites, and fonts may misinterpret certain characters. They may also be harder for screen readers to interpret, so use it thoughtfully.",
  },
  {
    question: "Can I use it on mobile devices?",
    answer:
      "Currently, the browser extension is designed for desktop. But you can still use this website on your phone, apply styles in the editor, and copypaste.",
  },
];

export function FAQ() {
  return (
    <>
      <H1 anchor="faq">Frequently Asked Questions</H1>

      <Accordion type="single" collapsible defaultValue="item-0">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border-b-2 border-dotted"
          >
            <AccordionTrigger className="py-3 text-base hover:no-underline hover:bg-muted/50">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <br />
    </>
  );
}
