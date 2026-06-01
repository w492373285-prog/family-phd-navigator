import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDb } from './db/database.js';
import { crudRouter } from './routes/crud.js';
import { planRouter } from './routes/plan.js';

initDb();

const app = express();
const port = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../client/dist');

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'family-phd-navigator' }));
app.use('/api/countries', crudRouter('countries'));
app.use('/api/schools', crudRouter('schools'));
app.use('/api/mentors', crudRouter('mentors'));
app.use('/api/budgets', crudRouter('budgets'));
app.use('/api/materials', crudRouter('materials'));
app.use('/api/stages', crudRouter('stages'));
app.use('/api', planRouter);

if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('*', (_req, res) => {
    res.status(404).send('Frontend is not built yet. Run npm run build --prefix client first.');
  });
}

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
