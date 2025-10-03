// This file is no longer used for the main interview flow and can be deleted or repurposed.
// The client now connects directly to the Google GenAI service.
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(404).json({ message: 'This endpoint is not in active use.' });
}
