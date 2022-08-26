import { config } from 'dotenv';
import { writeFileSync, unlink } from 'fs';
import { Rule, Service } from './constants';
import { addRoute, updateRouter } from './handleYML';
import { initTerminal, run } from './terminal';
import express from 'express';
import { handleRouting } from './router';

config();

writeFileSync('key.json', process.env.GKE_SERVICE_ACCOUNT_KEY as string);

const main = async () => {
  await initTerminal();
  unlink('key.json', () => {});
  const servicePortMap: { [k: string]: number } = Object.fromEntries(
    JSON.parse(await run('kubectl -ojson get service')).items.map(
      (service: Service) => [
        service.metadata.name,
        service.spec.ports[0].targetPort,
      ],
    ),
  );
  JSON.parse(await run('kubectl -ojson get ingress router'))
    .spec.rules.filter(
      (rule: Rule) => rule.http.paths[0].backend.service.name !== 'router',
    )
    .forEach((rule: Rule) =>
      addRoute({
        deployment: rule.http.paths[0].backend.service.name,
        host: rule.host,
        port: servicePortMap[rule.http.paths[0].backend.service.name],
      }),
    );
  await updateRouter();

  const app = express();
  handleRouting(app);
  app.listen(80, () => console.log('The router is listening on port 80!'));
};

main().catch(console.error);
