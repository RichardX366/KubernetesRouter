import { writeFileSync, unlink } from 'fs';
import { Route } from './constants';
import { run } from './terminal';

export const routes: Route[] = [
  {
    host: process.env.HOST as string,
    deployment: 'router',
  },
];

const getYML = () => `
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: router
  annotations:
    kubernetes.io/ingress.global-static-ip-name: ${process.env.IP}

spec:
  rules:${routes
    .map(
      ({ host, deployment }) => `
    - host: ${host}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ${deployment}
                port:
                  number: 80`,
    )
    .join('')}
---${routes
  .map(
    ({ deployment, port }) => `
apiVersion: v1
kind: Service
metadata:
  name: ${deployment}

spec:
  ports:
    - name: web
      port: 80
      targetPort: ${port || 80}

  selector:
    app: ${deployment}
`,
  )
  .join('---')}`;

export const updateRouter = async (additionalObjects = '') => {
  writeFileSync('config.yml', getYML() + additionalObjects);
  await run('kubectl apply -f config.yml');
  unlink('config.yml', () => {});
};

/**
 * Adds a route to the router.
 * @param route - Route to add to the router
 * @param update - The image to use when deploying the new route
 */
export const addRoute = async (route: Route, update?: string) => {
  routes.push(route);
  if (update) {
    await updateRouter(`---
kind: Deployment
apiVersion: apps/v1
metadata:
  name: ${route.deployment}
  spec:
    selector:
      matchLabels:
        app: ${route.deployment}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${route.deployment}
  template:
    metadata:
      labels:
        app: ${route.deployment}
    spec:
      containers:
        - name: ${route.deployment}
          image: ${update}`);
  }
};

export const removeRoute = async (deployment: string, update?: true) => {
  const index = routes.findIndex(({ deployment: d }) => d === deployment);
  if (index !== -1) {
    routes.splice(index, 1);
  }
  if (update) {
    await run(`kubectl delete deployment ${deployment}
kubectl delete service ${deployment}`);
    updateRouter();
  }
};
