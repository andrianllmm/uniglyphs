import React from "react";
import ReactDOM from "react-dom/client";
import "@workspace/ui/globals.css";
import "./styles.css";
import { Providers } from "@/components/providers.tsx";
import App from "./App.tsx";
import { Header } from "@/components/Header.tsx";
import { Footer } from "@/components/Footer.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <div className="container min-w-[320px] max-w-[480px] min-[480px] max-[600px] w-full h-full mx-auto flex flex-col">
        <Header />
        <div className="flex flex-col w-full h-full">
          <main className="p-3 grow">
            <App />
          </main>
          <Footer />
        </div>
      </div>
    </Providers>
  </React.StrictMode>
);
