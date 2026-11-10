const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const apiDir = path.join(rootDir, 'spotikunai-api');
const expoCli = path.join(rootDir, 'node_modules', 'expo', 'bin', 'cli.js');

const children = [];

function startProcess(label, command, args, cwd) {
  console.log(`\n[${label}] Iniciando em ${cwd}`);

  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      FORCE_COLOR: '1',
    },
  });

  children.push(child);

  child.on('exit', (code, signal) => {
    console.log(`\n[${label}] finalizou com código ${code ?? 'null'} sinal ${signal ?? 'null'}`);
    if (code !== 0 && signal !== 'SIGINT') {
      for (const proc of children) {
        if (proc !== child && !proc.killed) {
          proc.kill('SIGINT');
        }
      }
      process.exit(code ?? 1);
    }
  });

  return child;
}

startProcess('API', process.execPath, [path.join(apiDir, 'server.js')], apiDir);
startProcess('APP', process.execPath, [expoCli, 'start', '--web'], rootDir);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    for (const child of children) {
      if (!child.killed) {
        child.kill(signal);
      }
    }
    process.exit(0);
  });
}
