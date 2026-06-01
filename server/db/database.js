import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { countries, schools, mentors, budgets, materials, stages } from '../data/seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDbPath = path.join(__dirname, 'navigator.sqlite');
const dbPath = process.env.DATABASE_PATH || defaultDbPath;
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
export const db = new Database(dbPath);

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS countries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      phd_duration TEXT,
      phd_requirements TEXT,
      scholarship TEXT,
      spouse_allowed TEXT,
      spouse_work TEXT,
      public_school TEXT,
      child_cost TEXT,
      healthcare TEXT,
      living_cost INTEGER,
      visa_difficulty TEXT,
      post_study_work TEXT,
      immigration TEXT,
      risks TEXT,
      official_links TEXT,
      updated_at TEXT,
      score_phd_feasibility INTEGER DEFAULT 0,
      score_scholarship INTEGER DEFAULT 0,
      score_spouse_work INTEGER DEFAULT 0,
      score_child_education INTEGER DEFAULT 0,
      score_living_cost INTEGER DEFAULT 0,
      score_immigration INTEGER DEFAULT 0,
      score_safety INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      country TEXT NOT NULL,
      name TEXT NOT NULL,
      discipline TEXT,
      phd_url TEXT,
      scholarship_url TEXT
    );

    CREATE TABLE IF NOT EXISTS mentors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school TEXT NOT NULL,
      name TEXT NOT NULL,
      research_area TEXT,
      email TEXT,
      fit_notes TEXT
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      country TEXT UNIQUE NOT NULL,
      tuition INTEGER DEFAULT 0,
      rent INTEGER DEFAULT 0,
      living INTEGER DEFAULT 0,
      insurance INTEGER DEFAULT 0,
      child_school INTEGER DEFAULT 0,
      visa INTEGER DEFAULT 0,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      owner TEXT,
      notes TEXT,
      required INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stage_order INTEGER NOT NULL,
      title TEXT NOT NULL,
      task TEXT,
      materials TEXT,
      completion TEXT,
      risks TEXT,
      next_step TEXT
    );
  `);
}

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) AS count FROM countries').get().count;
  if (count > 0) return;

  const insertCountry = db.prepare(`
    INSERT INTO countries (
      name, phd_duration, phd_requirements, scholarship, spouse_allowed, spouse_work, public_school,
      child_cost, healthcare, living_cost, visa_difficulty, post_study_work, immigration, risks,
      official_links, updated_at, score_phd_feasibility, score_scholarship, score_spouse_work,
      score_child_education, score_living_cost, score_immigration, score_safety
    ) VALUES (
      @name, @phd_duration, @phd_requirements, @scholarship, @spouse_allowed, @spouse_work, @public_school,
      @child_cost, @healthcare, @living_cost, @visa_difficulty, @post_study_work, @immigration, @risks,
      @official_links, @updated_at, @score_phd_feasibility, @score_scholarship, @score_spouse_work,
      @score_child_education, @score_living_cost, @score_immigration, @score_safety
    )
  `);

  const insertSchool = db.prepare('INSERT INTO schools (country, name, discipline, phd_url, scholarship_url) VALUES (@country, @name, @discipline, @phd_url, @scholarship_url)');
  const insertMentor = db.prepare('INSERT INTO mentors (school, name, research_area, email, fit_notes) VALUES (@school, @name, @research_area, @email, @fit_notes)');
  const insertBudget = db.prepare('INSERT INTO budgets (country, tuition, rent, living, insurance, child_school, visa, note) VALUES (@country, @tuition, @rent, @living, @insurance, @child_school, @visa, @note)');
  const insertMaterial = db.prepare('INSERT INTO materials (name, owner, notes, required) VALUES (@name, @owner, @notes, @required)');
  const insertStage = db.prepare('INSERT INTO stages (stage_order, title, task, materials, completion, risks, next_step) VALUES (@stage_order, @title, @task, @materials, @completion, @risks, @next_step)');

  const seed = db.transaction(() => {
    countries.forEach(country => insertCountry.run({
      ...country,
      score_phd_feasibility: country.scores.phd_feasibility,
      score_scholarship: country.scores.scholarship,
      score_spouse_work: country.scores.spouse_work,
      score_child_education: country.scores.child_education,
      score_living_cost: country.scores.living_cost,
      score_immigration: country.scores.immigration,
      score_safety: country.scores.safety
    }));
    schools.forEach(item => insertSchool.run(item));
    mentors.forEach(item => insertMentor.run(item));
    budgets.forEach(item => insertBudget.run(item));
    materials.forEach(item => insertMaterial.run(item));
    stages.forEach(item => insertStage.run(item));
  });

  seed();
}

export function initDb() {
  createTables();
  seedIfEmpty();
}
