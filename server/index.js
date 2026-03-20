import express from 'express';
import cors from 'cors';
import { projectsRouter } from './routes/projects.js';
import { filesRouter } from './routes/files.js';
import { buildRouter } from './routes/build.js';
import { suggestionsRouter } from './routes/suggestions.js';
import { commentsRouter } from './routes/comments.js';
import { createCollaborationServer } from './collaboration.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve published static sites
app.use('/sites', express.static(path.join(__dirname, '..', 'projects')));

// API routes
app.use('/api/projects', projectsRouter);
app.use('/api/projects', filesRouter);
app.use('/api/projects', buildRouter);
app.use('/api/projects', suggestionsRouter);
app.use('/api/projects', commentsRouter);

app.listen(PORT, () => {
  console.log(`ADoc server running on http://localhost:${PORT}`);
});

// Start Hocuspocus collaboration WebSocket server on port 3002
const collabServer = createCollaborationServer();
collabServer.listen().then(() => {
  console.log(`ADoc collaboration server running on ws://localhost:3002`);
});
