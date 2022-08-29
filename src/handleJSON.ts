import { unlink, writeFile } from 'fs/promises';
import { Route } from './constants';
import { execSync } from 'child_process';

export const routes: Route[] = [
  {
    host: process.env.HOST as string,
    deployment: 'router',
    port: 80,
    env: {},
    image: 'richardx366/kubernetes-router:latest',
  },
];

const getIngressJSON = () =>
  JSON.stringify({
    apiVersion: 'networking.k8s.io/v1',
    kind: 'Ingress',
    metadata: {
      name: 'router',
      annotations: {
        'kubernetes.io/ingress.global-static-ip-name': process.env.IP,
      },
    },
    spec: {
      rules: routes.map(({ host, deployment }) => ({
        host,
        http: {
          paths: [
            {
              path: '/',
              pathType: 'Prefix',
              backend: {
                service: {
                  name: deployment,
                  port: { number: 80 },
                },
              },
            },
          ],
        },
      })),
    },
  });

export const getServiceJSON = ({ deployment, port }: Route) =>
  JSON.stringify({
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: deployment,
      labels: { app: deployment },
    },
    spec: {
      ports: [{ name: 'web', port: 80, targetPort: port }],
      selector: { app: deployment },
    },
  });

const getConfigMapJSON = ({ deployment, env }: Route) =>
  JSON.stringify({
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: {
      name: deployment,
      labels: { app: deployment },
    },
    data: env,
  });

const getDeploymentJSON = ({ deployment, env, image }: Route) =>
  JSON.stringify({
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: deployment,
      labels: { app: deployment },
    },
    spec: {
      replicas: 1,
      selector: { matchLabels: { app: deployment } },
      template: {
        metadata: { labels: { app: deployment } },
        spec: {
          containers: [
            {
              name: deployment,
              image: image.includes(':') ? image : image + ':latest',
              env: Object.keys(env).map((key) => ({
                name: key,
                valueFrom: {
                  configMapKeyRef: {
                    name: deployment,
                    key,
                  },
                },
              })),
            },
          ],
        },
      },
    },
  });

export const updateRouter = (...additionalObjects: string[]) =>
  Promise.all(
    [getIngressJSON(), ...additionalObjects].map((str, i) =>
      writeFile(`${i}.json`, str).then(() => {
        execSync(`kubectl apply -f ${i}.json`);
        unlink(`${i}.json`);
      }),
    ),
  );

export const addRoute = async (route: Route) => {
  routes.push(route);
  await updateRouter(
    getConfigMapJSON(route),
    getDeploymentJSON(route),
    getServiceJSON(route),
  );
};

export const editRoute = async (route: Route) => {
  const additionalObjects = [getServiceJSON(route)];
  const index = routes.findIndex(({ deployment: d }) => d === route.deployment);
  const differentEnv =
    JSON.stringify(routes[index].env) !== JSON.stringify(route.env);
  if (differentEnv) {
    additionalObjects.push(getConfigMapJSON(route));
  }
  if (differentEnv || routes[index].image !== route.image) {
    additionalObjects.push(getDeploymentJSON(route));
  }
  routes[index] = route;
  await updateRouter(...additionalObjects);
};

export const removeRoute = async (deployment: string) => {
  const index = routes.findIndex(({ deployment: d }) => d === deployment);
  if (index !== -1) {
    routes.splice(index, 1);
  }
  execSync(
    `kubectl delete deployment ${deployment} && kubectl delete configmap ${deployment} && kubectl delete service ${deployment}`,
  );
  await updateRouter();
};

export const refreshDeployment = (deployment: string) =>
  execSync('kubectl rollout restart deployment ' + deployment);
