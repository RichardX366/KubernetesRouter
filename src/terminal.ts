import { execSync } from 'child_process';

const key = JSON.parse(process.env.GKE_SERVICE_ACCOUNT_KEY as string);

export const initTerminal = () =>
  execSync(
    [
      'export USE_GKE_GCLOUD_AUTH_PLUGIN=True',
      `gcloud auth activate-service-account ${key.client_email} --key-file key.json --project=${key.project_id}`,
      `gcloud container clusters get-credentials ${process.env.CLUSTER_NAME} --region us-central1`,
    ].join(' && '),
  );
