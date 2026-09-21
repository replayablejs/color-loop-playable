#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type Dependencies = Record<string, string>;

interface PackageManifest {
  name: string;
  version: string;
  private?: boolean;
  dependencies?: Dependencies;
  devDependencies?: Dependencies;
  optionalDependencies?: Dependencies;
  peerDependencies?: Dependencies;
  pnpm?: { overrides?: Record<string, string>; [key: string]: unknown };
}

interface LocalPackage extends PackageManifest {
  directory: string;
}

interface DependencyFiles {
  manifest: string | null;
  lock: string | null;
}

interface ConnectionState {
  repo: string;
  original: DependencyFiles;
  manifestHash: string;
  lockHash: string;
  status: 'installing' | 'connected';
}

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cache = join(project, '.replayable-local');
const stateFile = join(cache, 'state.json');
const manifestFile = join(project, 'package.json');
const lockFile = join(project, 'pnpm-lock.yaml');
const [command, ...args] = process.argv.slice(2);

function run(program: string, commandArgs: string[], cwd: string) {
  console.log(`\n${program} ${commandArgs.join(' ')}`);
  if (process.platform === 'win32') {
    throw new Error('This workflow currently supports macOS/Linux. Use WSL on Windows.');
  }
  const result = spawnSync(program, commandArgs, { cwd, stdio: 'inherit' });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${program} failed (exit ${result.status ?? 'unknown'}).`);
  }
}

function readOptional(file: string) {
  return existsSync(file) ? readFileSync(file, 'utf8') : null;
}

function writeOptional(file: string, content: string | null) {
  if (content === null) {
    rmSync(file, { force: true });
  } else {
    writeFileSync(file, content);
  }
}

function snapshot(): DependencyFiles {
  return { manifest: readOptional(manifestFile), lock: readOptional(lockFile) };
}

function restoreFiles(files: DependencyFiles) {
  writeOptional(manifestFile, files.manifest);
  writeOptional(lockFile, files.lock);
}

function hash(content: string | null) {
  return createHash('sha256')
    .update(content ?? '')
    .digest('hex');
}

function saveState(state: ConnectionState) {
  mkdirSync(cache, { recursive: true });
  writeFileSync(stateFile, `${JSON.stringify(state, null, 2)}\n`);
}

function readState(): ConnectionState | undefined {
  return existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, 'utf8')) : undefined;
}

function assertUnchanged(state: ConnectionState) {
  const current = snapshot();
  if (hash(current.manifest) !== state.manifestHash || hash(current.lock) !== state.lockHash) {
    throw new Error(
      'package.json or pnpm-lock.yaml changed after connecting. Preserve those edits and restore the connected versions before continuing; this script will not overwrite them. The original files are saved in .replayable-local/state.json.',
    );
  }
}

function packagesFor(repo: string, manifest: PackageManifest) {
  const available = new Map<string, LocalPackage>();
  for (const entry of readdirSync(join(repo, 'packages'), { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const directory = join(repo, 'packages', entry.name);
    const file = join(directory, 'package.json');
    if (!existsSync(file)) {
      continue;
    }
    const pkg: PackageManifest = JSON.parse(readFileSync(file, 'utf8'));
    if (!pkg.private && pkg.name?.startsWith('@replayablejs/')) {
      available.set(pkg.name, { directory, ...pkg });
    }
  }
  const roots = Object.keys({ ...manifest.dependencies, ...manifest.devDependencies }).filter(
    (name) => name.startsWith('@replayablejs/'),
  );
  if (!roots.length) {
    throw new Error('No Replayable dependencies found in this project.');
  }
  const selected = new Map<string, LocalPackage>();
  function visit(name: string) {
    if (selected.has(name)) {
      return;
    }
    const pkg = available.get(name);
    if (!pkg) {
      throw new Error(`The checkout does not provide ${name}.`);
    }
    selected.set(name, pkg);
    for (const dependency of Object.keys({
      ...pkg.dependencies,
      ...pkg.optionalDependencies,
      ...pkg.peerDependencies,
    })) {
      if (dependency.startsWith('@replayablejs/')) {
        visit(dependency);
      }
    }
  }
  roots.forEach(visit);
  const packages = [...selected.values()];
  if (new Set(packages.map((pkg) => pkg.version)).size !== 1) {
    throw new Error('Local Replayable packages must have matching versions.');
  }
  return packages;
}

function connect(repoArgument: string | undefined, skipBuild: boolean) {
  const previousState = readState();
  if (previousState) {
    assertUnchanged(previousState);
  }
  const repo = realpathSync(resolve(repoArgument ?? previousState?.repo ?? '../replayable'));
  const before = snapshot();
  const original = previousState?.original ?? before;
  if (original.manifest === null) {
    throw new Error('Project package.json is missing.');
  }
  const manifest: PackageManifest = JSON.parse(original.manifest);
  const packages = packagesFor(repo, manifest);
  if (!skipBuild) {
    // Build only the public packages this consumer needs, plus their workspace dependencies.
    run(
      'pnpm',
      ['exec', 'turbo', 'run', 'build', ...packages.map((pkg) => `--filter=${pkg.name}...`)],
      repo,
    );
  }
  // A fresh path prevents pnpm from reusing an older tarball of the same package version.
  const output = join(cache, 'packages', `${Date.now()}-${process.pid}`);
  mkdirSync(output, { recursive: true });
  const local: Dependencies = {};
  try {
    for (const pkg of packages) {
      run('pnpm', ['pack', '--pack-destination', output], pkg.directory);
      const filename = `${pkg.name.replace('@', '').replace('/', '-')}-${pkg.version}.tgz`;
      if (!existsSync(join(output, filename))) {
        throw new Error(`Expected package tarball was not produced: ${filename}`);
      }
      local[pkg.name] = `file:./${relative(project, join(output, filename)).split('\\').join('/')}`;
    }
    for (const section of ['dependencies', 'devDependencies'] as const) {
      const dependencies = manifest[section];
      if (!dependencies) {
        continue;
      }
      for (const name of Object.keys(dependencies)) {
        if (local[name]) {
          dependencies[name] = local[name];
        }
      }
    }
    // Override transitive dependencies as well as the directly installed packages.
    manifest.pnpm = {
      ...manifest.pnpm,
      overrides: { ...manifest.pnpm?.overrides, ...local },
    };
    const state: ConnectionState = {
      repo,
      original,
      manifestHash: hash(before.manifest),
      lockHash: hash(before.lock),
      status: 'installing',
    };
    saveState(state);
    writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
    try {
      run('pnpm', ['install', '--no-frozen-lockfile'], project);
    } catch (error) {
      restoreFiles(before);
      if (previousState) {
        saveState(previousState);
      } else {
        rmSync(stateFile, { force: true });
      }
      console.error(
        'Dependency files restored. Run pnpm install --frozen-lockfile to repair node_modules if the install failed partway through.',
      );
      throw error;
    }
    const installed = snapshot();
    saveState({
      ...state,
      status: 'connected',
      manifestHash: hash(installed.manifest),
      lockHash: hash(installed.lock),
    });
    console.log(
      `\nConnected ${packages.length} local packages from ${repo}.\nRun pnpm replayable:local refresh after toolkit changes.\nRun pnpm replayable:local restore before committing dependency files.`,
    );
  } catch (error) {
    if (!readOptional(manifestFile)?.includes(relative(project, output).split('\\').join('/'))) {
      rmSync(output, { recursive: true, force: true });
    }
    throw error;
  }
}

function restore() {
  const state = readState();
  if (!state) {
    console.log('Already using the original dependency files; no local connection to restore.');
    return;
  }
  assertUnchanged(state);
  const connected = snapshot();
  restoreFiles(state.original);
  try {
    run(
      'pnpm',
      state.original.lock ? ['install', '--frozen-lockfile'] : ['install', '--no-frozen-lockfile'],
      project,
    );
  } catch (error) {
    restoreFiles(connected);
    console.error(
      'Restoration failed; local dependency files and saved state retained. Retry restore when the installation issue is resolved.',
    );
    throw error;
  }
  rmSync(cache, { recursive: true, force: true });
  console.log('\nOriginal dependencies restored; local tarballs removed.');
}

try {
  if (!command || command === '--help' || command === 'help') {
    console.log(
      'Usage: pnpm replayable:local <connect [repo-path] | refresh | restore | status> [--skip-build]\n\nStop the playable dev server first. Connect defaults to ../replayable.\nThe checkout must already have its pnpm dependencies installed.\nRefresh reuses the saved checkout. --skip-build packs existing build output.\nLocal dependency edits are temporary; restore before committing them.',
    );
  } else if (command === 'status') {
    const state = readState();
    console.log(
      state
        ? `Local checkout: ${state.repo}\nStatus: ${state.status}`
        : 'Not connected to a local checkout.',
    );
  } else if (command === 'restore' && args.length === 0) {
    restore();
  } else if (command === 'connect' || command === 'refresh') {
    const positional = args.filter((arg) => arg !== '--skip-build');
    if (
      positional.length > (command === 'connect' ? 1 : 0) ||
      positional.some((arg) => arg.startsWith('--'))
    ) {
      throw new Error('Invalid arguments. Use --help for usage.');
    }
    if (command === 'refresh' && !readState()) {
      throw new Error('Connect a checkout before refreshing.');
    }
    connect(positional[0], args.includes('--skip-build'));
  } else {
    throw new Error('Unknown command or arguments. Use --help for usage.');
  }
} catch (error) {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
