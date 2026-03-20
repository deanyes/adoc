import { Router } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECTS_DIR = path.join(__dirname, '..', '..', 'projects');

const router = Router();

function commentsFile(projectId) {
  return path.join(PROJECTS_DIR, projectId, '.adoc', 'comments.json');
}

async function readComments(projectId) {
  const file = commentsFile(projectId);
  if (await fs.pathExists(file)) {
    return await fs.readJson(file);
  }
  return [];
}

async function writeComments(projectId, comments) {
  const file = commentsFile(projectId);
  await fs.ensureDir(path.dirname(file));
  await fs.writeJson(file, comments, { spaces: 2 });
}

// GET /api/projects/:id/comments?path=xxx
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = req.query.path;
    const comments = await readComments(id);
    const filtered = filePath
      ? comments.filter((c) => c.filePath === filePath)
      : comments;
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/comments
router.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { filePath, content, author, authorType, selection } = req.body;

    const comment = {
      id: crypto.randomUUID(),
      filePath,
      content,
      author: author || '匿名',
      authorType: authorType || 'human', // 'human' | 'agent'
      selection: selection || null, // { from, to, text }
      resolved: false,
      replies: [],
      createdAt: new Date().toISOString(),
    };

    const comments = await readComments(id);
    comments.push(comment);
    await writeComments(id, comments);
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/comments/:commentId/replies
router.post('/:id/comments/:commentId/replies', async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { content, author, authorType } = req.body;

    const comments = await readComments(id);
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const reply = {
      id: crypto.randomUUID(),
      content,
      author: author || '匿名',
      authorType: authorType || 'human',
      createdAt: new Date().toISOString(),
    };

    comment.replies.push(reply);
    await writeComments(id, comments);
    res.json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id/comments/:commentId/resolve
router.patch('/:id/comments/:commentId/resolve', async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const comments = await readComments(id);
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    comment.resolved = true;
    comment.resolvedAt = new Date().toISOString();
    await writeComments(id, comments);
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/projects/:id/comments/:commentId
router.delete('/:id/comments/:commentId', async (req, res) => {
  try {
    const { id, commentId } = req.params;
    let comments = await readComments(id);
    comments = comments.filter((c) => c.id !== commentId);
    await writeComments(id, comments);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export const commentsRouter = router;
