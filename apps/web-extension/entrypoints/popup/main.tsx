import React from "react";
import ReactDOM from "react-dom/client";
import "@workspace/ui/globals.css";
import "./styles.css";
import { Providers } from "@/components/providers.tsx";
import App from "./App.tsx";
import { Header } from "@/components/Header.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <div className="container max-w-[640px] mx-auto flex flex-col">
        <Header />
        <div className="flex flex-col w-full min-h-screen">
          <main className="p-4 grow">
            <App />
          </main>
        </div>
      </div>
    </Providers>
  </React.StrictMode>
);
