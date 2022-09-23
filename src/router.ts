import { Express } from 'express';
import { readFileSync } from 'fs';
import { hydrateBrackets } from './constants';
import {
  addRoute,
  editRoute,
  refreshDeployment,
  removeRoute,
  routes,
} from './handleJSON';

const index = readFileSync('src/html/index.html').toString();

const formatIndex = () =>
  hydrateBrackets(index, {
    routes: routes
      .slice(1)
      .map(
        ({ host, deployment, port, image, env }) => `
          <tr>
            <td
              class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
            >${deployment}</td>
            <td
              class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
            >${host}</td>
            <td
              class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
            >${port}</td>
            <td
              class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
            >${image}</td>
            <td class="hidden">${JSON.stringify(env)}</td>
            <td
              class="flex gap-2 justify-end whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
            >
              <button
                class="text-green-600 hover:text-green-700"
                onclick="refresh('${deployment}')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12c0-1.232.046-2.453.138-3.662a4.006 4.006 0 013.7-3.7 48.678 48.678 0 017.324 0 4.006 4.006 0 013.7 3.7c.017.22.032.441.046.662M4.5 12l-3-3m3 3l3-3m12 3c0 1.232-.046 2.453-.138 3.662a4.006 4.006 0 01-3.7 3.7 48.657 48.657 0 01-7.324 0 4.006 4.006 0 01-3.7-3.7c-.017-.22-.032-.441-.046-.662M19.5 12l-3 3m3-3l3 3" />
                </svg>
              </button>
              <button
                class="text-blue-600 hover:text-blue-700"
                onclick="edit('${deployment}')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                  <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                </svg>
              <button
                class="text-red-600 hover:text-red-700"
                onclick="remove('${deployment}')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                  <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" />
                </svg>
              </button>
            </td>
          </tr>`,
      )
      .join(''),
  });

export const handleRouting = (app: Express) => {
  app.get('/', (req, res) => res.send(formatIndex()));
  app.put('/route', async (req, res) => {
    if (
      typeof req.body.host === 'string' &&
      typeof req.body.deployment === 'string' &&
      routes.find(({ deployment }) => deployment === req.body.deployment) &&
      typeof req.body.port === 'number' &&
      typeof req.body.image === 'string' &&
      typeof req.body.env === 'object' &&
      Object.entries(req.body.env).reduce(
        (prev, [key, value]) =>
          prev ? typeof key === 'string' && typeof value === 'string' : false,
        true,
      )
    ) {
      await editRoute(req.body);
      res.send('success');
    } else {
      throw 'Invalid request';
    }
  });
  app.post('/refresh', (req, res) => {
    if (routes.find(({ deployment }) => deployment === req.body.deployment)) {
      refreshDeployment(req.body.deployment);
      res.send('success');
    } else {
      throw 'Invalid request';
    }
  });
  app.post('/route', async (req, res) => {
    if (
      typeof req.body.host === 'string' &&
      typeof req.body.deployment === 'string' &&
      !routes.find(({ host }) => host === req.body.host) &&
      !routes.find(({ deployment }) => deployment === req.body.deployment) &&
      typeof req.body.port === 'number' &&
      typeof req.body.image === 'string' &&
      typeof req.body.env === 'object' &&
      Object.entries(req.body.env).reduce(
        (prev, [key, value]) =>
          prev ? typeof key === 'string' && typeof value === 'string' : false,
        true,
      )
    ) {
      await addRoute(req.body);
      res.send('success');
    } else {
      throw 'Invalid request';
    }
  });
  app.delete('/route', async (req, res) => {
    if (routes.find(({ deployment }) => deployment === req.body.deployment)) {
      await removeRoute(req.body.deployment);
      res.send('success');
    } else {
      throw 'Invalid request';
    }
  });
};
