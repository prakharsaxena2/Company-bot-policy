import { readFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const filePath = path.join(process.cwd(), 'Frontend', 'index.html');
      const content = await readFile(filePath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(content);
    } catch (error) {
      res.status(500).json({ error: 'Failed to load page' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}