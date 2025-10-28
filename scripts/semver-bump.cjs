#!/usr/bin/env node
// SemVer bump and release tag script
// Usage:
//  - node scripts/semver-bump.cjs --type patch|minor|major
//  - node scripts/semver-bump.cjs --auto (detects from commits: BREAKING CHANGE => major, feat => minor, fix/others => patch)

const { execSync } = require('node:child_process');

const log = (msg) => console.log(`[semver] ${msg}`);
const run = (cmd) => execSync(cmd, { stdio: 'pipe' }).toString().trim();

function getArg(name) {
  const idx = process.argv.findIndex((a) => a === `--${name}`);
  if (idx === -1) return null;
  const next = process.argv[idx + 1];
  if (!next || next.startsWith('--')) return true; // flag only
  return next;
}

function getLatestTag() {
  try {
    const tag = run('git describe --tags --abbrev=0');
    return tag;
  } catch {
    return null;
  }
}

function parseTag(tag) {
  if (!tag) return { major: 0, minor: 1, patch: 0 }; // default v0.1.0 baseline
  const clean = tag.replace(/^v/, '');
  const [major, minor, patch] = clean.split('.').map((n) => parseInt(n, 10));
  return { major, minor, patch };
}

function detectBumpFromCommits(sinceTag) {
  try {
    const range = sinceTag ? `${sinceTag}..HEAD` : 'HEAD';
    const commits = run(`git log ${range} --pretty=%s`);
    const body = run(`git log ${range} --pretty=%b`);
    const text = `${commits}\n${body}`.toLowerCase();
    if (text.includes('breaking change') || /feat!|fix!/i.test(text)) return 'major';
    if (/^feat/m.test(commits)) return 'minor';
    return 'patch';
  } catch {
    return 'patch';
  }
}

function bump(tagObj, type) {
  const { major, minor, patch } = tagObj;
  if (type === 'major') return `v${major + 1}.0.0`;
  if (type === 'minor') return `v${major}.${minor + 1}.0`;
  return `v${major}.${minor}.${patch + 1}`; // patch default
}

function main() {
  // Ensure we're in a git repo and on main
  try {
    const branch = run('git rev-parse --abbrev-ref HEAD');
    log(`Branch atual: ${branch}`);
    if (branch !== 'main') {
      log('Mudando para branch main');
      run('git checkout main');
    }
  } catch (e) {
    console.error('[semver] Erro ao verificar/mudar branch:', e.message);
    process.exit(1);
  }

  // Ensure clean or commit staged changes
  try {
    const status = run('git status --porcelain');
    if (status) {
      log('Há alterações não commitadas. Fazendo commit automático.');
      try {
        run('git add -A');
        run('git commit -m "chore(release): preparar versão"');
      } catch (e) {
        log('Commit automático falhou, configurando usuário e repetindo...');
        run('git config user.name "OficinaGo Dev"');
        run('git config user.email "dev@oficinago.local"');
        run('git commit -m "chore(release): preparar versão"');
      }
    }
  } catch (e) {
    console.error('[semver] Erro ao verificar estado do git:', e.message);
    process.exit(1);
  }

  // Push main to ensure remote updated
  try {
    log('Enviando branch main para origin');
    run('git push origin main');
  } catch (e) {
    console.error('[semver] Erro ao fazer push da main:', e.message);
    process.exit(1);
  }

  const latest = getLatestTag();
  log(`Última tag: ${latest || '(nenhuma)'}`);
  const tagObj = parseTag(latest);

  const typeArg = getArg('type');
  const autoFlag = getArg('auto');
  let bumpType = 'patch';
  if (autoFlag) {
    bumpType = detectBumpFromCommits(latest);
  } else if (typeof typeArg === 'string') {
    if (!['patch', 'minor', 'major'].includes(typeArg)) {
      console.error('[semver] Tipo inválido. Use patch|minor|major.');
      process.exit(1);
    }
    bumpType = typeArg;
  }
  log(`Tipo de bump: ${bumpType}`);

  const newTag = bump(tagObj, bumpType);
  log(`Criando nova tag: ${newTag}`);
  try {
    run(`git tag -a ${newTag} -m "Release ${newTag}"`);
  } catch (e) {
    console.error('[semver] Erro ao criar tag:', e.message);
    process.exit(1);
  }

  try {
    log(`Enviando tag ${newTag} para origin`);
    run(`git push origin ${newTag}`);
    log('Release solicitado. Verifique GitHub Actions e Vercel.');
  } catch (e) {
    console.error('[semver] Erro ao enviar tag:', e.message);
    process.exit(1);
  }
}

main();