import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    
    // Get the audio file
    const file = Array.isArray(files.audio) ? files.audio[0] : null;
    
    if (!file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Read the file
    const fileData = fs.readFileSync(file.filepath);
    
    // Create a buffer from the file data
    const buffer = Buffer.from(fileData);
    
    // Create a blob from the buffer
    const blob = new Blob([buffer], { type: file.mimetype || 'audio/wav' });
    
    // Transcribe the audio using Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: blob,
      model: 'whisper-1',
      language: 'en',
    });

    // Clean up the temporary file
    fs.unlinkSync(file.filepath);

    // Return the transcription
    return res.status(200).json({
      text: transcription.text,
      success: true,
    });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return res.status(500).json({ error: 'Failed to transcribe audio', success: false });
  }
}
