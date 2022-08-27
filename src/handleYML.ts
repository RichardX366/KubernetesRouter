import { writeFileSync, unlink } from 'fs';
import { Route } from './constants';
import { execSync } from 'child_process';

export const routes: Route[] = [
  {
    host: process.env.HOST as string,
    deployment: 'router',
    port: 80,
  },
];

const getIngressYML = () => `apiVersion: networking.k8s.io/v1
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
    .join('')}`;

export const getServiceYML = ({ deployment, port }: Route) => `apiVersion: v1
kind: Service
metadata:
  name: ${deployment}

spec:
  ports:
    - name: web
      port: 80
      targetPort: ${port}

  selector:
    app: ${deployment}`;

const getDeploymentYML = (
  { deployment }: Route,
  image: string,
) => `kind: Deployment
apiVersion: apps/v1
metadata:
  name: ${deployment}
  spec:
    selector:
      matchLabels:
        app: ${deployment}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${deployment}
  template:
    metadata:
      labels:
        app: ${deployment}
    spec:
      containers:
        - name: ${deployment}
          image: ${image}:latest`;

export const updateRouter = (...additionalObjects: string[]) => {
  writeFileSync(
    'config.yml',
    [getIngressYML(), ...additionalObjects].join('\n---\n'),
  );
  execSync('kubectl apply -f config.yml');
  unlink('config.yml', () => {});
};

export const addRoute = (route: Route, image: string) => {
  routes.push(route);
  updateRouter(getDeploymentYML(route, image), getServiceYML(route));
};

export const editRoute = (route: Route) => {
  const index = routes.findIndex(({ deployment: d }) => d === route.deployment);
  routes[index] = route;
  updateRouter(getServiceYML(route));
};

export const removeRoute = (deployment: string) => {
  const index = routes.findIndex(({ deployment: d }) => d === deployment);
  if (index !== -1) {
    routes.splice(index, 1);
  }
  execSync(`kubectl delete deployment ${deployment}
kubectl delete service ${deployment}`);
  updateRouter();
};

export const refreshDeployment = (deployment: string) =>
  execSync('kubectl rollout restart deployment ' + deployment);
