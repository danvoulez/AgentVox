import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import { processCommand, transcribeAudio, searchMemories, createMemory, updateEvolution } from '../services/voxService';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// Process voice commands
router.post('/agent', authenticateUser, async (req, res) => {
  try {
    const { command } = req.body;
    const userId = req.user?.id;

    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Command is required' });
    }

    const result = await processCommand(command, userId);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error processing command:', error);
    res.status(500).json({ error: 'Failed to process command', details: error.message });
  }
});

// Transcribe audio
router.post('/transcribe', async (req, res) => {
  const form = formidable({});
  
  try {
    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.audio) ? files.audio[0] : null;
    
    if (!file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const fileData = fs.readFileSync(file.filepath);
    const transcription = await transcribeAudio(fileData);
    
    // Clean up the temporary file
    fs.unlinkSync(file.filepath);
    
    res.status(200).json({ text: transcription, success: true });
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: 'Failed to transcribe audio', details: error.message });
  }
});

// Search memories
router.post('/memory/search', authenticateUser, async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user?.id;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    const memories = await searchMemories(query, userId);
    res.status(200).json({ memories, success: true });
  } catch (error: any) {
    console.error('Error searching memories:', error);
    res.status(500).json({ error: 'Failed to search memories', details: error.message });
  }
});

// Create memory
router.post('/memory', authenticateUser, async (req, res) => {
  try {
    const { memoryType, content, importance } = req.body;
    const userId = req.user?.id;

    if (!memoryType || !content) {
      return res.status(400).json({ error: 'Memory type and content are required' });
    }

    const memoryId = await createMemory(memoryType, content, importance || 1, userId);
    res.status(201).json({ id: memoryId, success: true });
  } catch (error: any) {
    console.error('Error creating memory:', error);
    res.status(500).json({ error: 'Failed to create memory', details: error.message });
  }
});

// Update evolution
router.post('/evolution/update', authenticateUser, async (req, res) => {
  try {
    const { updates } = req.body;
    const userId = req.user?.id;

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Updates object is required' });
    }

    const success = await updateEvolution(updates, userId);
    res.status(200).json({ success });
  } catch (error: any) {
    console.error('Error updating evolution:', error);
    res.status(500).json({ error: 'Failed to update evolution', details: error.message });
  }
});

export default router;
