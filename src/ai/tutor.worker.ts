import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

// The handler owns a real MLCEngine in this worker; inference stays off the UI thread.
const handler = new WebWorkerMLCEngineHandler();
const workerScope = globalThis as unknown as {
  onmessage: (event: MessageEvent) => void;
};
workerScope.onmessage = (event) => handler.onmessage(event);
