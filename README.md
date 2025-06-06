# 𝔘𝐧𝗂𝒢𝑙𝗒𝕡h𝚜

A browser extension to 𝒔𝒕𝒚𝒍𝒆 Unicode text anywhere using a floating toolbar.

#### Video Demo:&#x20;

## About

**UniGlyphs** is a browser extension that lets users style text using Unicode characters. It provides a floating formatting toolbar that works on websites like Facebook, along with a full-page editor and popup editor. The goal is to give users an expressive way to write posts, comments, and more, even on platforms that don’t allow custom fonts.

Styled text is generated using Unicode characters that resemble different font styles, such as 𝐛𝐨𝐥𝐝, 𝑖𝑡𝑎𝑙𝑖𝑐, and 𝔤𝔬𝔱𝔥𝔦𝔠.

This project was built as a final requirement for [CS50x](https://cs50.harvard.edu/x/). It demonstrates concepts from character encoding (Unicode) to web development using JavaScript.

---

## Features

* **Floating Toolbar**: Appears automatically on supported websites when users click into a text field. Enables styling without leaving the page.
* **Popup Editor**: Accessed by clicking the extension icon. Lets users type, style, and copy Unicode-styled text directly.
* **Web-Based Editor**: Available on the homepage for more extensive editing and formatting.
* **Style Variety**: Includes a selection of Unicode sets that mimic font styles, such as bold serif (𝐀), italic sans (𝘈), double-struck (𝔸), and more.
* **Keyboard Shortcuts**: Quickly toggle styles using key combinations. (e.g., `Ctrl+B` for bold, `Ctrl+I` for italic, etc.)
* **Persistent State**: Saves the last entered text and selected style settings using `localStorage`.

---

## Design Choices

* **WXT** for building the extension, offering a clean DX for manifest and HMR.
* **Next.js** for the web interface due to its performance and routing capabilities.
* **Unicode styling** ensures compatibility across sites where CSS/font styling isn't possible.
* **Monorepo (Turborepo)** allows code and component sharing across web and extension targets.
* **Client-side persistence** using `localStorage`, avoiding backend complexity.
* **Shadcn/UI** components for accessible and theme-friendly interfaces.

---

## Installation

Install from the [Chrome Web Store](https://chrome.google.com/webstore) (Not yet available). Once installed, the toolbar activates on supported text inputs.

---

## Usage

1. Visit a supported site (e.g., Facebook).
2. Click into any text input field to show the toolbar.
3. Or open the extension popup to use the editor.

### File Structure

* `apps/web/` – Web-based editor interface
* `apps/extension/` – Browser extension code
* `packages/ui/` – Shared UI components

---

## Development

### Tech Stack

* **Web**: React, Next.js
* **Extension**: WXT (Web eXtension Toolkit)
* **Styling**: Tailwind CSS, shadcn/ui
* **Monorepo**: Turborepo
* **Package Manager**: pnpm

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

---

### Examples
TODO: Add example image
