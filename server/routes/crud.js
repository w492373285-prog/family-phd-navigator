import { Router } from 'express';
import { db } from '../db/database.js';

const TABLES = {
  countries: ['name', 'phd_duration', 'phd_requirements', 'scholarship', 'spouse_allowed', 'spouse_work', 'public_school', 'child_cost', 'healthcare', 'living_cost', 'visa_difficulty', 'post_study_work', 'immigration', 'risks', 'official_links', 'updated_at', 'score_phd_feasibility', 'score_scholarship', 'score_spouse_work', 'score_child_education', 'score_living_cost', 'score_immigration', 'score_safety'],
  schools: ['country', 'name', 'discipline', 'phd_url', 'scholarship_url'],
  mentors: ['school', 'name', 'research_area', 'email', 'fit_notes'],
  budgets: ['country', 'tuition', 'rent', 'living', 'insurance', 'child_school', 'visa', 'note'],
  materials: ['name', 'owner', 'notes', 'required'],
  stages: ['stage_order', 'title', 'task', 'materials', 'completion', 'risks', 'next_step']
};

function cleanBody(table, body) {
  const fields = TABLES[table];
  return Object.fromEntries(fields.map(field => [field, body[field] ?? '']));
}

export function crudRouter(table) {
  const router = Router();
  const fields = TABLES[table];
  const order = table === 'stages' ? ' ORDER BY stage_order' : table === 'countries' ? ' ORDER BY name' : ' ORDER BY id';

  router.get('/', (_req, res) => {
    res.json(db.prepare(`SELECT * FROM ${table}${order}`).all());
  });

  router.post('/', (req, res) => {
    const data = cleanBody(table, req.body);
    const columns = fields.join(', ');
    const placeholders = fields.map(field => `@${field}`).join(', ');
    const info = db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`).run(data);
    res.status(201).json(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(info.lastInsertRowid));
  });

  router.put('/:id', (req, res) => {
    const data = { ...cleanBody(table, req.body), id: req.params.id };
    const assignments = fields.map(field => `${field} = @${field}`).join(', ');
    db.prepare(`UPDATE ${table} SET ${assignments} WHERE id = @id`).run(data);
    res.json(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id));
  });

  router.delete('/:id', (req, res) => {
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
    res.json({ ok: true });
  });

  return router;
}
