# 𝔘𝐧𝗂𝒢𝑙𝗒𝕡h𝚜

**A browser extension to 𝒔𝒕𝒚𝒍𝒆 Unicode text anywhere using a floating toolbar.**

**[Video Demo](https://www.youtube.com/watch?v=dQw4w9WgXcQ)**

## About

**UniGlyphs** is a browser extension that lets users style text using Unicode characters. It provides a floating formatting toolbar that works on websites like Facebook, along with a full-page editor and popup editor. The goal is to give users an expressive way to write posts, comments, and more, even on platforms that don’t allow custom fonts.

Styled text is generated using Unicode characters that resemble different font styles, such as 𝐛𝐨𝐥𝐝, 𝑖𝑡𝑎𝑙𝑖𝑐, and 𝔤𝔬𝔱𝔥𝔦𝔠.

This project was built as a final requirement for [CS50x](https://cs50.harvard.edu/x/). It demonstrates concepts from character encoding (Unicode) to web development using JavaScript.


## Features

- **Floating Toolbar**: Appears automatically on supported websites when users click into a text field. Enables styling without leaving the page.
- **Popup Editor**: Accessed by clicking the extension icon. Lets users type, style, and copy Unicode-styled text directly.
- **Web-Based Editor**: Available on the homepage for more extensive editing and formatting.
- **Style Variety**: Includes a selection of Unicode sets that mimic font styles, such as bold serif (𝐀), italic sans (𝘈), double-struck (𝔸), and more.
- **Keyboard Shortcuts**: Quickly toggle styles using key combinations. (e.g., `Ctrl+B` for bold, `Ctrl+I` for italic, etc.)
- **Persistent State**: Saves the last entered text and selected style settings using `localStorage`.


## Design Choices

- **WXT vs WebExtension APIs**: chose WXT for its improved developer experience, faster build setup, and built-in support for modern tooling, while still outputting standard WebExtension-compatible code.
- **Next.js vs React**: chose Next.js  for its built-in routing and server-side rendering, enabling faster development and better performance out of the box.
- **Use of Unicode for styling**: chose Unicode styling to maintain consistent text appearance across platforms that restrict CSS or font customization.
- **Use of Monorepo (Turborepo)**: chose a monorepo to streamline development by enabling shared code, components, and configurations across both web and extension targets.
- **Client-side vs server-side persistence**: chose 1localStorage1 for simple, backend-free data persistence, reducing infrastructure needs and complexity.
- **TypeScript vs JavaScript**: chose TypeScript for improved type safety and better developer experience.
- **Tailwind vs Plain CSS**: chose Tailwind for its inline styling and utility-first approach, while still allowing for customization and flexibility.
- **npm vs pnpm**: chose pnpm for its faster installation and dependency management, ideal for a monorepo.


## Usage

1. Install from the [Chrome Web Store](https://chrome.google.com/webstore) (Not yet available). Once installed, the toolbar activates on supported text inputs.
2. Visit a supported site with a text box (e.g., Facebook).
3. Click into any text input field to show the toolbar.
4. Or open the extension popup to use the editor.
5. Or visit the [homepage](#) to use the web-based editor.


## Examples
Add example images


## File Structure

- `apps/web/` – Main web app
   - `pages/` – Pages representing each route
   - `components/` – Reusable UI components used across pages
      - `docs/` – Components for displaying documentation content
- `apps/extension/` – Browser extension
   - `entrypoints/` – Main entry points for different extension contexts.
      - `content/` – Content scripts injected into web pages (e.g., toolbar)
      - `popup/` – Scripts and components for the extension popup UI
    - `components/` – Reusable UI components for the extension
- `packages/ui/` – Shared package for reusable UI logic and styling across both targets
   - `src/components/` – Common UI elements (e.g., buttons, inputs)
   - `src/components/editor/` – Specialized components for the text editor (e.g., textbox, toolbar)
   - `src/lib/textTools/` – Utility functions for handling Unicode text formatting
   - `src/lib/caretPosition/` – Functions to track and manage the caret position for the floating toolbar
   - `src/styles/` – Shared Tailwind CSS configuration and global styles


## Development

### Tech Stack

- **Web**: React, Next.js
- **Extension**: WXT (Web eXtension Toolkit)
- **Styling**: Tailwind CSS, shadcn/ui
- **Monorepo**: Turborepo
- **Package manager**: pnpm

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/uniglyphs.git
   cd uniglyphs
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm dev
   ```

4. Load the extension in Chrome via `chrome://extensions`.

### Testing

No testing yet.