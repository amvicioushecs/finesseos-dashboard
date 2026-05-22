import { createApp } from "../server/_core/index";

export default async function handler(req: any, res: any) {
  try {
    const { app } = await createApp();
    return app(req, res);
  } catch (error) {
    console.error("[Vercel Handler] Global error:", error);
    res.status(500).send(`Internal Server Error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
