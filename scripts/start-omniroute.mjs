import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
const entry = resolve(
  '.local/omniroute-runtime/node_modules/omniroute/bin/omniroute.mjs',
);
if (!existsSync(entry)) {
  console.error(
    'Install the private OmniRoute runtime first. See docs/local-lab.md.',
  );
  process.exit(1);
}
const child = spawn(
  process.execPath,
  [entry, 'serve', '--port', '20128', '--no-open', '--no-tray', '--log'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATA_DIR: resolve('.local/omniroute-data'),
      OMNIROUTE_SERVER_HOST: '127.0.0.1',
      REQUIRE_API_KEY: 'true',
      OMNIROUTE_NO_UPDATE_NOTIFIER: '1',
    },
  },
);
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => child.kill(signal));
