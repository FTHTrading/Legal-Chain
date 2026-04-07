const { execSync } = require('child_process');
process.chdir(__dirname);
execSync('npx next dev -p 3003', { stdio: 'inherit', cwd: __dirname });
