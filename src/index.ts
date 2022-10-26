import { config } from 'dotenv';
config();
import { writeFileSync, unlink } from 'fs';
import { ConfigMap, Deployment, Rule, Service } from './constants';
import { getServiceJSON, routes, updateRouter } from './handleJSON';
import { initTerminal } from './terminal';
import express, { NextFunction, Request, Response } from 'express';
import { handleRouting } from './router';
import cookieParser from 'cookie-parser';
import { execSync } from 'child_process';
import routeComponentsScript from '@richardx/html-components';
import authScreen from 'auth-screen';
import 'express-async-errors';

writeFileSync('key.json', process.env.GKE_SERVICE_ACCOUNT_KEY as string);
initTerminal();
unlink('key.json', () => {});
try {
  const rules = JSON.parse(
    execSync('kubectl -ojson get ingress router').toString(),
  ).spec.rules.filter(
    (rule: Rule) => rule.http.paths[0].backend.service.name !== 'router',
  );
  const portMap: { [k: string]: number } = Object.fromEntries(
    JSON.parse(execSync('kubectl -ojson get service').toString()).items.map(
      (service: Service) => [
        service.metadata.name,
        service.spec.ports[0].targetPort,
      ],
    ),
  );
  const envMap: { [k: string]: { [k: string]: string } } = Object.fromEntries(
    JSON.parse(execSync('kubectl -ojson get configmap').toString()).items.map(
      (map: ConfigMap) => [map.metadata?.labels?.app, map.data],
    ),
  );
  const imageMap: { [k: string]: string } = Object.fromEntries(
    JSON.parse(execSync('kubectl -ojson get deployment').toString()).items.map(
      (deployment: Deployment) => [
        deployment.metadata.name,
        deployment.spec.template.spec.containers[0].image,
      ],
    ),
  );
  rules.forEach((rule: Rule) =>
    routes.push({
      deployment: rule.http.paths[0].backend.service.name,
      host: rule.host,
      port: portMap[rule.http.paths[0].backend.service.name],
      env: envMap[rule.http.paths[0].backend.service.name],
      image: imageMap[rule.http.paths[0].backend.service.name],
    }),
  );
} catch (e) {
  console.log(e);
}
updateRouter(getServiceJSON(routes[0]));
const app = express();
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static('src/public'));
routeComponentsScript(app);
app.use(authScreen(process.env.PASSWORD as string));
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  return res.status(400).send(err.message);
});
handleRouting(app);
app.listen(80, () => console.log('The router is listening on port 80!'));
