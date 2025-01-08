import type { Request, Response } from 'express';

export async function langflowHandler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const LANGFLOW_ID = "396deb1c-aadd-4f18-bd9e-a350c13098df";
  const FLOW_ID = "bca2b923-d854-4755-86a8-0b51c350c42b";

  try {
    const response = await fetch(
      `https://api.langflow.astra.datastax.com/lf/${LANGFLOW_ID}/api/v1/run/${FLOW_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_LANGFLOW_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Langflow API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 