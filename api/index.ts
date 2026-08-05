import { createApp } from "../server/_core/index";

let appInstance: any = null;

export default async function handler(req: any, res: any) {
  try {
    if (!appInstance) {
      const { app } = await createApp();
      appInstance = app;
    }
    return appInstance(req, res);
  } catch (error) {
    console.error("[Vercel Handler] Global error:", error);
    res.status(500).send(`Internal Server Error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
