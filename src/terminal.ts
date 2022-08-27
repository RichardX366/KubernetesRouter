import { spawn } from 'child_process';

let initialized = false;
let resolver = (...args: any) => {};
const key = JSON.parse(process.env.GKE_SERVICE_ACCOUNT_KEY as string);
const terminal = spawn('bash');

terminal.stdout.on('data', (rawData) => {
  const data = rawData.toString();
  console.log(data);
  if (data.includes('kubeconfig entry generated for') || initialized) {
    initialized = true;
    resolver();
  }
});

export const initTerminal = () =>
  new Promise<void>((res) => {
    resolver = res;
    terminal.stdin.write(
      `
export USE_GKE_GCLOUD_AUTH_PLUGIN=True
google-cloud-sdk/bin/gcloud auth activate-service-account ${key.client_email} --key-file key.json --project=${key.project_id}
google-cloud-sdk/bin/gcloud container clusters get-credentials ${process.env.CLUSTER_NAME} --region us-central1
`,
    );
  });

export const run = (command: string) =>
  new Promise<string>((res) => {
    resolver = res;
    terminal.stdin.write(command + '\n');
  });
