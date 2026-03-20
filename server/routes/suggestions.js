import { Router } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECTS_DIR = path.join(__dirname, '..', '..', 'projects');

export const suggestionsRouter = Router();

function getSuggestionsFile(projectId) {
  return path.join(PROJECTS_DIR, projectId, '.adoc', 'suggestions.json');
}

async function readSuggestions(projectId) {
  const file = getSuggestionsFile(projectId);
  if (await fs.pathExists(file)) {
    return await fs.readJson(file);
  }
  return [];
}

async function writeSuggestions(projectId, suggestions) {
  const file = getSuggestionsFile(projectId);
  await fs.ensureDir(path.dirname(file));
  await fs.writeJson(file, suggestions, { spaces: 2 });
}

// GET /api/projects/:id/suggestions?path=xxx
suggestionsRouter.get('/:id/suggestions', async (req, res) => {
  try {
    const all = await readSuggestions(req.params.id);
    const filePath = req.query.path;
    if (filePath) {
      return res.json(all.filter((s) => s.filePath === filePath));
    }
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/suggestions
suggestionsRouter.post('/:id/suggestions', async (req, res) => {
  try {
    const { filePath, originalContent, suggestedContent, author, description } = req.body;
    if (!filePath || !suggestedContent) {
      return res.status(400).json({ error: 'filePath and suggestedContent are required' });
    }

    const suggestion = {
      id: crypto.randomUUID(),
      filePath,
      originalContent: originalContent || '',
      suggestedContent,
      author: author || 'ai',
      status: 'pending',
      createdAt: new Date().toISOString(),
      description: description || '',
    };

    const all = await readSuggestions(req.params.id);
    all.push(suggestion);
    await writeSuggestions(req.params.id, all);

    res.status(201).json(suggestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id/suggestions/:suggestionId
suggestionsRouter.patch('/:id/suggestions/:suggestionId', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const all = await readSuggestions(req.params.id);
    const idx = all.findIndex((s) => s.id === req.params.suggestionId);
    if (idx === -1) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    all[idx].status = status;
    await writeSuggestions(req.params.id, all);

    res.json(all[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
