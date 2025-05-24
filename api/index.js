import { exec } from 'child_process';

export default function handler(req, res) {
  exec('bash start.sh', (error, stdout, stderr) => {
    if (error) {
      res.status(500).send(`Error: ${stderr}`);
    } else {
      res.status(200).send(`Output: ${stdout}`);
    }
  });
}
