import { config } from 'dotenv';
config();
import { writeFileSync, unlink } from 'fs';
import { Rule, Service } from './constants';
import { getServiceYML, routes, updateRouter } from './handleYML';
import { initTerminal, run } from './terminal';
import express from 'express';
import { handleRouting } from './router';
import cookieParser from 'cookie-parser';

writeFileSync('key.json', process.env.GKE_SERVICE_ACCOUNT_KEY as string);

const main = async () => {
  await initTerminal();
  unlink('key.json', () => {});
  try {
    const rules = JSON.parse(
      await run('kubectl -ojson get ingress router'),
    ).spec.rules.filter(
      (rule: Rule) => rule.http.paths[0].backend.service.name !== 'router',
    );
    const servicePortMap: { [k: string]: number } = Object.fromEntries(
      JSON.parse(await run('kubectl -ojson get service')).items.map(
        (service: Service) => [
          service.metadata.name,
          service.spec.ports[0].targetPort,
        ],
      ),
    );
    rules.forEach((rule: Rule) =>
      routes.push({
        deployment: rule.http.paths[0].backend.service.name,
        host: rule.host,
        port: servicePortMap[rule.http.paths[0].backend.service.name],
      }),
    );
  } catch {}
  await updateRouter(getServiceYML(routes[0]));
  const app = express();
  app.use(express.json());
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(express.static('src/public'));
  handleRouting(app);
  app.listen(80, () => console.log('The router is listening on port 80!'));
};

main().catch(console.error);
