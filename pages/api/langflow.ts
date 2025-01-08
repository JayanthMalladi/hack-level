import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await fetch(
      `https://api.langflow.astra.datastax.com/lf/${process.env.LANGFLOW_ID}/api/v1/run/${process.env.FLOW_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VITE_LANGFLOW_ACCESS_TOKEN}`,
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