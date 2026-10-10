import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Mock API chạy ở mọi môi trường (demo) — có backend thật thì tắt dòng này.
async function start() {
  try {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledFrame: "bypass" });
  } catch {
    /* MSW không khởi động được thì app vẫn chạy */
  }
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

start();
