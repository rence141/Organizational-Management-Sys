const { spawn } = require('child_process');
const path = require('path');

console.log('Starting backend server...');

const server = spawn('node', ['app.js'], {
  cwd: path.join(__dirname),
  stdio: 'inherit',
  shell: true
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

console.log('Server should be running on http://localhost:3000');
