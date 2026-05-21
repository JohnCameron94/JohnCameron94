#!/usr/bin/env node
'use strict';

/**
 * generate-resume.js
 * ─────────────────────────────────────────────────────────
 * Reads all EXPERIENCE_*.md files + README.md from the repo
 * root, builds TWO resume versions and renders to PDF using
 * Puppeteer.
 *
 * Outputs:
 *   resume-generator/public/public_resume.html (styled)
 *   resume-generator/public/public_resume.pdf (styled)
 *   resume-generator/public/ats_resume.html (ATS-friendly)
 *   resume-generator/public/ats_resume.pdf (ATS-friendly)
 *
 * Usage:
 *   cd resume-generator && node scripts/generate-resume.js
 * ─────────────────────────────────────────────────────────
 */

const fs   = require('fs');
const path = require('path');

// ── Paths ──────────────────────────────────────────────────────────────────────
const REPO_ROOT  = path.resolve(__dirname, '..', '..');
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

// ── Helpers ────────────────────────────────────────────────────────────────────

function stripEmoji(str) {
  return str
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[\u2600-\u27BF]/gu, '')
    .replace(/\uFE0F/gu, '')
    .replace(/\u200D/gu, '')
    .trim();
}

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function boldify(str = '') {
  return str
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*/g, '');
}

/** Returns true for markdown table separator rows like |---|---| or |:---|:---|  */
function isTableSeparator(str) {
  return /^[-|:\s]+$/.test(str);
}

// ── MD Parsers ─────────────────────────────────────────────────────────────────

function parseExperience(filepath) {
  const raw   = fs.readFileSync(filepath, 'utf8');
  const lines = raw.split('\n');

  let company      = '';
  let role         = '';
  let location     = '';
  let period       = '';
  const techTags   = [];
  const contributions = [];

  let section     = '';
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code-fence toggle
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    // H1 → Company
    if (!company && !inCodeBlock && line.startsWith('# ')) {
      let c = stripEmoji(line.replace(/^#\s*/, ''));
      c = c.replace(/\s*[—–]\s*Contract Engagement\s*/i, '').trim();
      company = c;
      continue;
    }

    // H3 → Role + period-or-location
    if (!role && !inCodeBlock && line.startsWith('### ')) {
      const h3 = stripEmoji(line.replace(/^###\s*/, '')).trim();
      const pi = h3.indexOf('|');
      if (pi > -1) {
        role = h3.substring(0, pi).trim();
        const after = h3.substring(pi + 1).trim();
        if (/\d{4}/.test(after)) period = after;
        else location = after;
      } else {
        role = h3.trim();
      }
      continue;
    }

    // Bold date → period fallback
    if (!period && !inCodeBlock) {
      const m = line.match(
        /\*\*([A-Z][a-z]+\s+\d{4}\s*[–\-]\s*(?:[A-Z][a-z]+\s+\d{4}|Present))\*\*/
      );
      if (m) period = m[1];
    }

    // ## Section heading
    if (!inCodeBlock && line.startsWith('## ')) {
      const lo = line.toLowerCase();
      if      (lo.includes('technology stack') || lo.includes('tech stack')) section = 'tech';
      else if (lo.includes('key contributions'))                              section = 'contrib';
      else if (lo.includes('overall accomplishments'))                        section = 'contrib';
      else if (lo.includes('key achievements'))                               section = 'achievements';
      else                                                                    section = '';
      continue;
    }

    // Tech stack table (2-col)
    if (section === 'tech' && !inCodeBlock) {
      const twoCol = line.match(/^\|\s*\*\*[^|]+\*\*\s*\|\s*([^|]+)\s*\|$/);
      if (twoCol) {
        twoCol[1]
          .split(/[,/]/)
          .map(s => s.replace(/\*\*/g, '').replace(/\([^)]+\)/g, '').trim())
          .filter(s => s && s.length > 1 && !isTableSeparator(s))
          .forEach(v => { if (!techTags.includes(v)) techTags.push(v); });
        continue;
      }
      // 3-col (WebMarketers): | **Tech** | Role | Reason |
      const threeCol = line.match(/^\|\s*\*\*([^|*]+)\*\*\s*\|[^|]+\|[^|]+\|/);
      if (threeCol) {
        const tech = threeCol[1].trim();
        if (tech && tech !== 'Technology' && !techTags.includes(tech)) techTags.push(tech);
        continue;
      }
    }

    // Contributions — regular bullets (max 7)
    if (section === 'contrib' && !inCodeBlock && contributions.length < 7) {
      const bullet = line.match(/^-\s+(.+)/);
      if (bullet) {
        const text = bullet[1]
          .replace(/\*\*(.+?)\*\*/g, '$1')
          .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
          .replace(/[\u2600-\u27BF]/gu, '')
          .trim();
        if (text) contributions.push(text);
      }
    }

    // Contributions — code-block lines (WebMarketers, max 7)
    if (section === 'contrib' && inCodeBlock && contributions.length < 7) {
      const text = line
        .replace(/^[\u{1F300}-\u{1FAFF}]|[\u2600-\u27BF]/gu, '')
        .trim();
      if (text) contributions.push(text);
    }

    // Key Achievements table — Impact column (RodeoReady, max 7)
    if (section === 'achievements' && !inCodeBlock && contributions.length < 7) {
      const row = line.match(/^\|\s*[^|]+\|\s*([^|]+)\s*\|/);
      if (row) {
        const val = row[1]
          .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
          .replace(/[\u2600-\u27BF]/gu, '')
          .replace(/\*\*/g, '')
          .trim();
        // Skip header row, separator rows, and empty values
        if (val && val !== 'Impact' && !isTableSeparator(val)) {
          contributions.push(val);
        }
      }
    }
  }

  return { company, role, location, period, techTags: techTags.slice(0, 8), contributions };
}

function parseReadme(filepath) {
  const raw = fs.readFileSync(filepath, 'utf8');

  // Summary
  let summary = '';
  const sm = raw.match(/(?:I(?:'m| am) a|With \*\*[\d+])[^\n]+(?:\n(?![#\n]).+)*/);
  if (sm) {
    summary = sm[0].replace(/\*\*/g, '').replace(/\n/g, ' ').trim();
    if (summary.length > 300) summary = summary.substring(0, 297) + '…';
  }

  // Certifications — extract emoji + name directly from table cells (fully generic)
  const certs = [];
  const cs = raw.match(/## 🏆 Achievements[\s\S]+?(?=\n---)/);
  if (cs) {
    for (const line of cs[0].split('\n')) {
      if (!line.startsWith('|')) continue;
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length < 2) continue;
      const col1 = cells[0];
      const boldMatch = col1.match(/\*\*([^*]+)\*\*/);
      if (!boldMatch) continue;
      // Skip separator rows
      if (/^[-|:\s]+$/.test(col1)) continue;
      // Extract any leading emoji (everything before the first **)
      const beforeBold = col1.substring(0, col1.indexOf('**'));
      const emoji = [...beforeBold].filter(ch => /\p{Emoji}/u.test(ch) && ch !== '*').join('');
      certs.push({ emoji, name: boldMatch[1].trim() });
    }
  }

  // Education
  let education = null;
  const em = raw.match(/\*\*Algonquin College\*\*[^\n]*\n>\s*\*\*([^*]+)\*\*\s*\n>\s*([^\n]+)/);
  if (em) education = { school: 'Algonquin College', program: em[1].trim(), meta: em[2].trim() };

  return { summary, certs, education };
}

// ── HTML Builder ───────────────────────────────────────────────────────────────

const TYPE_BADGE = {
  WEBMARKETERS: { label: 'Contract · Healthcare', cls: 'type-contract' },
  RODEOREADY:   { label: 'Startup',               cls: 'type-startup'  },
  CBSA:         { label: 'Government',             cls: 'type-gov'      },
};

function filenameKey(fp) {
  return path.basename(fp, '.md').replace('EXPERIENCE_', '').toUpperCase();
}

function buildHTML({ jobs, readme }) {

  // Experience HTML
  const expParts = jobs.map((job, idx) => {
    const badge   = TYPE_BADGE[job._key] || { label: 'Contract', cls: 'type-contract' };
    const tags    = job.techTags.map(t => `<span class="tag">${esc(t)}</span>`).join('');
    const bullets = job.contributions.map(b => `<li>${boldify(esc(b))}</li>`).join('');
    const divider = idx < jobs.length - 1 ? '<hr class="divider"/>' : '';
    return `
        <div class="job">
          <div class="job-header">
            <div class="job-title">${esc(job.role)}</div>
            <div class="job-period">${esc(job.period)}</div>
          </div>
          <div class="job-company">${esc(job.company)}${job.location ? ` <span class="job-loc">· ${esc(job.location)}</span>` : ''}</div>
          <span class="job-type ${badge.cls}">${badge.label}</span>
          <div class="job-tags">${tags}</div>
          <ul>${bullets}</ul>
        </div>${divider}`;
  }).join('');

  // Skills (4 groups to save space)
  const SKILLS = [
    { group: 'Languages',          tags: ['TypeScript', 'JavaScript', 'Java', 'Kotlin', 'Python', 'Swift', 'Obj-C', 'C'] },
    { group: 'Mobile',             tags: ['Ionic + Angular', 'Capacitor', 'Jetpack Compose', 'CoreData/Room', 'APNS/FCM'] },
    { group: 'Frontend / Backend', tags: ['React', 'Angular', 'Node.js', 'Spring Boot', 'GraphQL', 'Express'] },
    { group: 'Cloud & Databases',  tags: ['AWS Lambda', 'AWS CDK', 'AppSync', 'DynamoDB', 'SQS/SNS', 'MySQL'] },
  ];

  const skillsHTML = SKILLS.map(s => `
          <div class="skill-group">
            <div class="skill-group-name">${esc(s.group)}</div>
            <div class="skill-tags">${s.tags.map(t => `<span class="skill-tag">${esc(t)}</span>`).join('')}</div>
          </div>`).join('');

  // Certifications — clean left-bordered list, fully driven by README table content
  const certsHTML = readme.certs.map(c =>
    `<div class="cert-item">${c.emoji ? c.emoji + '&nbsp;' : ''}${esc(c.name)}</div>`
  ).join('');

  // Education
  const edu = readme.education;
  const eduHTML = edu ? `
          <div class="edu-school">${esc(edu.school)}</div>
          <div class="edu-program">${esc(edu.program)}</div>
          <div class="edu-meta">${esc(edu.meta)}</div>` : '';

  return /* html */`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Johnathon Cameron — Resume</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --accent:  #0ea5e9;
      --accent2: #6366f1;
      --dark:    #0f172a;
      --mid:     #334155;
      --light:   #64748b;
      --border:  #e2e8f0;
      --tag-bg:  #e0f2fe;
      --tag-fg:  #0369a1;
    }

    html, body {
      width: 210mm;
      height: 297mm;
      overflow: hidden;
    }

    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 10px;
      line-height: 1.5;
      color: var(--dark);
      background: #fff;
      display: flex;
      flex-direction: column;
    }

    .page { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

    /* Header */
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
      color: #fff;
      padding: 18px 32px 14px;
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
    }
    .header::before {
      content: ''; position: absolute; top: -30px; right: -30px;
      width: 150px; height: 150px; border-radius: 50%;
      background: rgba(14,165,233,0.12);
    }
    .header-inner { position: relative; z-index: 1; }
    .name         { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 2px; }
    .name span    { color: var(--accent); }
    .title-line   { font-size: 9.5px; font-weight: 500; color: #94a3b8; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 9px; }
    .header-tags  { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 9px; }
    .htag {
      background: rgba(14,165,233,0.18); border: 1px solid rgba(14,165,233,0.35);
      color: #bae6fd; border-radius: 20px; padding: 1px 8px; font-size: 8.5px; font-weight: 500;
    }
    .links { display: flex; gap: 14px; font-size: 9px; color: #7dd3fc; }

    /* Body layout */
    .body    { display: grid; grid-template-columns: 1fr 200px; flex: 1; overflow: hidden; }
    .main    { padding: 16px 22px 14px 32px; border-right: 1px solid var(--border); overflow: hidden; }
    .sidebar { padding: 16px 16px 14px 14px; background: #f8fafc; overflow: hidden; }

    /* Sections */
    .section { margin-bottom: 14px; }
    .section-title {
      font-size: 8.5px; font-weight: 800; letter-spacing: 1.5px;
      text-transform: uppercase; color: var(--accent);
      border-bottom: 1.5px solid var(--border);
      padding-bottom: 3px; margin-bottom: 9px;
    }

    /* Summary */
    .summary {
      font-size: 9.5px; color: var(--mid); line-height: 1.6;
      border-left: 3px solid var(--accent); padding-left: 10px; font-style: italic;
    }

    /* Jobs */
    .job           { margin-bottom: 12px; }
    .job:last-child { margin-bottom: 0; }
    .job-header    { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1px; }
    .job-title     { font-size: 11px; font-weight: 700; color: var(--dark); }
    .job-period    { font-size: 8.5px; color: var(--light); white-space: nowrap; margin-left: 6px; padding-top: 2px; }
    .job-company   { font-size: 9.5px; font-weight: 600; color: var(--accent2); margin-bottom: 4px; }
    .job-loc       { font-weight: 400; color: var(--light); }
    .job-type      { display: inline-block; font-size: 8px; font-weight: 600; padding: 1px 6px; border-radius: 20px; margin-bottom: 5px; }
    .type-contract { background: #fef3c7; color: #92400e; }
    .type-startup  { background: #fce7f3; color: #9d174d; }
    .type-gov      { background: #dcfce7; color: #14532d; }
    .job-tags      { display: flex; flex-wrap: wrap; gap: 3px; margin-bottom: 5px; }
    .tag           { background: var(--tag-bg); color: var(--tag-fg); border-radius: 3px; padding: 1px 5px; font-size: 8.5px; font-weight: 600; }
    .job ul        { list-style: none; padding: 0; }
    .job ul li     { font-size: 9.5px; color: var(--mid); padding-left: 11px; position: relative; margin-bottom: 2px; line-height: 1.45; }
    .job ul li::before { content: '▸'; position: absolute; left: 0; color: var(--accent); font-size: 8px; top: 1px; }
    .divider       { border: none; border-top: 1px dashed var(--border); margin: 10px 0; }

    /* Sidebar */
    .sidebar .section-title { font-size: 7.5px; }
    .skill-group      { margin-bottom: 8px; }
    .skill-group-name { font-size: 7.5px; font-weight: 700; color: var(--mid); margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px; }
    .skill-tags       { display: flex; flex-wrap: wrap; gap: 3px; }
    .skill-tag        { background: var(--border); color: var(--mid); border-radius: 3px; padding: 1px 5px; font-size: 8.5px; font-weight: 500; }

    .cert-item {
      font-size: 8.5px; color: var(--dark); line-height: 1.3;
      padding: 3px 0 3px 7px;
      border-left: 2px solid var(--accent);
      margin-bottom: 4px;
    }

    .edu-school  { font-size: 10px; font-weight: 700; color: var(--dark); }
    .edu-program { font-size: 9px; color: var(--mid); }
    .edu-meta    { font-size: 8px; color: var(--light); margin-top: 1px; }

    .placeholder-box {
      background: #fef9c3; border: 1px dashed #f59e0b;
      border-radius: 5px; padding: 6px 8px;
      font-size: 8.5px; color: #78350f; margin-bottom: 12px; line-height: 1.6;
    }
    .placeholder-box .ph-label {
      font-size: 7px; font-weight: 800; text-transform: uppercase;
      letter-spacing: 1px; color: #b45309; display: block; margin-bottom: 2px;
    }

    .fun-fact {
      background: linear-gradient(135deg, #eff6ff, #faf5ff);
      border: 1px solid #ddd6fe; border-radius: 6px;
      padding: 7px 9px; font-size: 9px; color: var(--mid);
      line-height: 1.45; margin-top: 8px;
    }
    .fun-fact strong { color: var(--accent2); }

    /* Footer */
    .footer {
      background: #0f172a; color: #64748b;
      text-align: center; padding: 7px 32px;
      font-size: 8px; flex-shrink: 0;
    }
    .footer span { color: #94a3b8; }

    @media print {
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { margin: 0; size: A4 portrait; }
    }
  </style>
</head>
<body>
<div class="page">

  <header class="header">
    <div class="header-inner">
      <div class="name">Johnathon <span>Cameron</span></div>
      <div class="title-line">Full Stack Engineer &nbsp;·&nbsp; Mobile Developer &nbsp;·&nbsp; Cloud Architect</div>
      <div class="header-tags">
        <span class="htag">☁️ AWS Certified</span>
        <span class="htag">📱 iOS · Android · Cross-Platform</span>
        <span class="htag">🏛️ Gov't Cleared</span>
        <span class="htag">🍁 Ottawa, ON</span>
        <span class="htag">5+ Years Experience</span>
      </div>
      <div class="links">
        <span>🔗 linkedin.com/in/johnathoncameron</span>
        &nbsp;&nbsp;
        <span>🐙 github.com/JohnCameron94</span>
      </div>
    </div>
  </header>

  <div class="body">
    <main class="main">

      <div class="section">
        <div class="section-title">About</div>
        <p class="summary">${esc(readme.summary || 'Results-driven software engineer with 5+ years across government border security, startups, and healthcare contracting — architecting clean systems, shipping polished mobile apps, and building cloud infrastructure that scales.')}</p>
      </div>

      <div class="section">
        <div class="section-title">Experience</div>
        ${expParts}
      </div>

    </main>

    <aside class="sidebar">

      <div class="placeholder-box">
        <span class="ph-label">📋 Fill before sharing</span>
        📞 [Phone Number]<br/>
        📍 [Address / City]
      </div>

      <div class="section">
        <div class="section-title">Skills</div>
        ${skillsHTML}
      </div>

      <div class="section">
        <div class="section-title">Certifications</div>
        ${certsHTML}
      </div>

      <div class="section">
        <div class="section-title">Education</div>
        ${eduHTML}
      </div>

      <div class="fun-fact">
        <strong>Fun fact:</strong> My code secures Canada's borders, wrangles rodeo cowboys, and helps surgeons in the OR. 🍁🤠🏥
      </div>

    </aside>
  </div>

  <footer class="footer">
    <span>linkedin.com/in/johnathoncameron</span> &nbsp;·&nbsp; <span>github.com/JohnCameron94</span>
  </footer>

</div>
</body>
</html>`;
}

function buildATSHTML({ jobs, readme }) {
  // Experience sections - plain text with clear structure
  const expParts = jobs.map((job, idx) => {
    const bullets = job.contributions.map(b => `          <li>${esc(b.replace(/\*\*(.+?)\*\*/g, '$1'))}</li>`).join('\n');
    return `
        <div class="job">
          <div class="job-header">
            <h3>${esc(job.role)}</h3>
            <span class="period">${esc(job.period)}</span>
          </div>
          <div class="company">${esc(job.company)}${job.location ? ` | ${esc(job.location)}` : ''}</div>
          <div class="technologies"><strong>Technologies:</strong> ${esc(job.techTags.join(', '))}</div>
          <ul class="contributions">
${bullets}
          </ul>
        </div>`;
  }).join('\n');

  // Skills - grouped plainly
  const SKILLS = [
    { group: 'Languages', tags: ['TypeScript', 'JavaScript', 'Java', 'Kotlin', 'Python', 'Swift', 'Objective-C', 'C'] },
    { group: 'Mobile Development', tags: ['Ionic + Angular', 'Capacitor', 'Jetpack Compose', 'CoreData', 'Room', 'APNS', 'FCM'] },
    { group: 'Frontend & Backend', tags: ['React', 'Angular', 'Node.js', 'Spring Boot', 'GraphQL', 'Express', 'Flask'] },
    { group: 'Cloud & Infrastructure', tags: ['AWS Lambda', 'AWS CDK', 'AppSync', 'DynamoDB', 'SQS', 'SNS', 'Kinesis', 'Jenkins'] },
    { group: 'Databases', tags: ['MySQL', 'PostgreSQL', 'MongoDB', 'DynamoDB', 'Amazon RDS'] },
  ];

  const skillsHTML = SKILLS.map(s => `
        <div class="skill-group">
          <strong>${esc(s.group)}:</strong> ${esc(s.tags.join(', '))}
        </div>`).join('');

  // Certifications - simple list
  const certsHTML = readme.certs.map(c => `          <li>${esc(c.name)}</li>`).join('\n');

  // Education
  const edu = readme.education;
  const eduHTML = edu ? `
        <div class="education">
          <strong>${esc(edu.school)}</strong><br/>
          ${esc(edu.program)}<br/>
          <em>${esc(edu.meta)}</em>
        </div>` : '';

  return /* html */`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Johnathon Cameron - Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #000;
      background: #fff;
      padding: 0.5in 0.75in;
      max-width: 8.5in;
      margin: 0 auto;
    }

    h1 {
      font-size: 24pt;
      font-weight: bold;
      margin-bottom: 4pt;
      color: #000;
    }

    h2 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 16pt;
      margin-bottom: 8pt;
      border-bottom: 2px solid #000;
      padding-bottom: 2pt;
      color: #000;
    }

    h3 {
      font-size: 11pt;
      font-weight: bold;
      margin: 0;
      color: #000;
    }

    .header {
      text-align: center;
      margin-bottom: 16pt;
      border-bottom: 3px solid #000;
      padding-bottom: 12pt;
    }

    .header .title {
      font-size: 12pt;
      margin-bottom: 6pt;
      font-weight: normal;
    }

    .header .contact {
      font-size: 10pt;
      margin-top: 6pt;
    }

    .section {
      margin-bottom: 14pt;
    }

    .summary {
      font-size: 10.5pt;
      line-height: 1.6;
      margin-bottom: 8pt;
      text-align: justify;
    }

    .job {
      margin-bottom: 14pt;
      page-break-inside: avoid;
    }

    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2pt;
    }

    .job .company {
      font-size: 10.5pt;
      font-weight: bold;
      margin-bottom: 4pt;
      color: #000;
    }

    .job .period {
      font-size: 10pt;
      font-weight: normal;
      white-space: nowrap;
    }

    .job .technologies {
      font-size: 10pt;
      margin-bottom: 6pt;
      color: #333;
    }

    .job ul.contributions {
      list-style-type: disc;
      margin-left: 20pt;
      margin-top: 4pt;
    }

    .job ul.contributions li {
      margin-bottom: 3pt;
      font-size: 10.5pt;
    }

    .skills-grid {
      display: block;
    }

    .skill-group {
      margin-bottom: 6pt;
      font-size: 10pt;
      line-height: 1.6;
    }

    .certifications ul {
      list-style-type: disc;
      margin-left: 20pt;
    }

    .certifications ul li {
      margin-bottom: 3pt;
      font-size: 10pt;
    }

    .education {
      font-size: 10pt;
      line-height: 1.6;
    }

    .placeholder {
      background: #f0f0f0;
      border: 1px dashed #999;
      padding: 8pt;
      font-size: 9pt;
      color: #666;
      margin-bottom: 12pt;
      text-align: center;
    }

    @media print {
      body { padding: 0; }
      @page { margin: 0.5in 0.75in; }
    }
  </style>
</head>
<body>

  <div class="header">
    <h1>JOHNATHON CAMERON</h1>
    <div class="title">Full Stack Software Engineer | Mobile Developer | Cloud Architect</div>
    <div class="contact">
      LinkedIn: linkedin.com/in/johnathoncameron | GitHub: github.com/JohnCameron94
    </div>
    <div class="placeholder">
      [PHONE NUMBER] | [EMAIL ADDRESS] | [ADDRESS/CITY]
    </div>
  </div>

  <div class="section">
    <h2>PROFESSIONAL SUMMARY</h2>
    <p class="summary">${esc(readme.summary || 'Results-driven software engineer with 5+ years of experience across government, private sector startups, and healthcare contracting. Specialized in full-stack development, mobile applications, and cloud architecture. Proven track record of delivering mission-critical systems for Canada Border Services Agency, building scalable startup platforms, and developing healthcare mobile solutions.')}</p>
  </div>

  <div class="section">
    <h2>PROFESSIONAL EXPERIENCE</h2>
    ${expParts}
  </div>

  <div class="section">
    <h2>TECHNICAL SKILLS</h2>
    <div class="skills-grid">
      ${skillsHTML}
    </div>
  </div>

  <div class="section certifications">
    <h2>CERTIFICATIONS</h2>
    <ul>
${certsHTML}
    </ul>
  </div>

  <div class="section">
    <h2>EDUCATION</h2>
    ${eduHTML}
  </div>

</body>
</html>`;
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔍  Scanning repo root for markdown files...');

  const expFiles = fs.readdirSync(REPO_ROOT)
    .filter(f => /^EXPERIENCE_.+\.md$/i.test(f))
    .sort();

  const ORDER = ['EXPERIENCE_WEBMARKETERS.md', 'EXPERIENCE_RODEOREADY.md', 'EXPERIENCE_CBSA.md'];
  const sorted = [
    ...ORDER.filter(f => expFiles.includes(f)),
    ...expFiles.filter(f => !ORDER.includes(f)),
  ];

  const jobs = sorted.map(f => {
    const fp  = path.join(REPO_ROOT, f);
    const job = parseExperience(fp);
    job._key  = filenameKey(fp);
    console.log(`  ✅ Parsed ${f}  →  ${job.role || '?'} @ ${job.company || '?'}`);
    return job;
  });

  const readmePath = path.join(REPO_ROOT, 'README.md');
  const readme = fs.existsSync(readmePath)
    ? parseReadme(readmePath)
    : { summary: '', certs: [], education: null };
  console.log(`  ✅ Parsed README.md  →  ${readme.certs.length} cert(s), education: ${readme.education ? 'yes' : 'no'}`);

  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  // ═══════════════════════════════════════════════════════════════════════
  // 1. Generate Styled Resume
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n🎨  Building STYLED HTML resume...');
  const styledHtml = buildHTML({ jobs, readme });
  const styledHtmlOut = path.join(PUBLIC_DIR, 'public_resume.html');
  fs.writeFileSync(styledHtmlOut, styledHtml, 'utf8');
  console.log(`  📄 Styled HTML  →  ${path.relative(process.cwd(), styledHtmlOut)}`);

  // ═══════════════════════════════════════════════════════════════════════
  // 2. Generate ATS-Friendly Resume
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n📋  Building ATS-FRIENDLY HTML resume...');
  const atsHtml = buildATSHTML({ jobs, readme });
  const atsHtmlOut = path.join(PUBLIC_DIR, 'ats_resume.html');
  fs.writeFileSync(atsHtmlOut, atsHtml, 'utf8');
  console.log(`  📄 ATS HTML  →  ${path.relative(process.cwd(), atsHtmlOut)}`);

  // ═══════════════════════════════════════════════════════════════════════
  // 3. Generate PDFs
  // ═══════════════════════════════════════════════════════════════════════
  try {
    const puppeteer = require('puppeteer');
    console.log('\n🖨️   Launching headless browser for PDF generation...');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });

    // Generate Styled PDF
    console.log('  🎨 Generating styled PDF...');
    const styledPage = await browser.newPage();
    await styledPage.setContent(styledHtml, { waitUntil: 'networkidle0' });
    const styledPdfOut = path.join(PUBLIC_DIR, 'public_resume.pdf');
    await styledPage.pdf({
      path:             styledPdfOut,
      format:           'A4',
      printBackground:  true,
      preferCSSPageSize: true,
      margin:           { top: '0', right: '0', bottom: '0', left: '0' },
    });
    console.log(`  📑 Styled PDF  →  ${path.relative(process.cwd(), styledPdfOut)}`);

    // Generate ATS PDF
    console.log('  📋 Generating ATS PDF...');
    const atsPage = await browser.newPage();
    await atsPage.setContent(atsHtml, { waitUntil: 'networkidle0' });
    const atsPdfOut = path.join(PUBLIC_DIR, 'ats_resume.pdf');
    await atsPage.pdf({
      path:             atsPdfOut,
      format:           'Letter',
      printBackground:  false,
      margin:           { top: '0.5in', right: '0.75in', bottom: '0.5in', left: '0.75in' },
    });
    console.log(`  📑 ATS PDF  →  ${path.relative(process.cwd(), atsPdfOut)}`);

    await browser.close();
  } catch (err) {
    console.warn('\n⚠️   PDF generation skipped:', err.message);
  }

  console.log('\n✨  Successfully generated TWO resume versions:');
  console.log('   🎨 Styled version (public_resume.html + .pdf) - for portfolio/website');
  console.log('   📋 ATS version (ats_resume.html + .pdf) - for job applications\n');
}

main().catch(err => { console.error('\n❌  Fatal:', err); process.exit(1); });
