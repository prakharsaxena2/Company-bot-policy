import { indexTheDocument } from "../prepare.js";
import formidable from 'formidable';
import { promises as fs } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB
    });

    const [fields, files] = await form.parse(req);

    if (!files.document || files.document.length === 0) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = files.document[0];
    const filePath = file.filepath;

    await indexTheDocument(filePath);

    // Clean up the uploaded file
    await fs.unlink(filePath);

    res.status(200).json({ message: "Document indexed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Upload error" });
  }
}