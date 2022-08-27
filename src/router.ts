import { Express, Handler } from 'express';
import { readFileSync } from 'fs';
import { hydrateBrackets } from './constants';
import { addRoute, editRoute, removeRoute, routes } from './handleYML';

const requireAuth: Handler = (req, res, next) => {
  if (req.signedCookies?.auth === process.env.PASSWORD) {
    next();
  } else {
    setTimeout(() => res.status(401).send('Unauthorized'));
  }
};

const index = readFileSync('src/html/index.html').toString();

const formatIndex = () =>
  hydrateBrackets(index, {
    routes: routes
      .map(
        ({ host, deployment, port }) => `
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
            class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
          >
            <button
              class="text-blue-600 hover:text-blue-700"
              onclick="edit('${deployment}')"
            >
              Edit
            </button>
          </td>
          <td
            class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
          >
            <button
              class="text-red-600 hover:text-red-700"
              onclick="remove('${deployment}')"
            >
              Delete
            </button>
          </td>`,
      )
      .join(''),
  });

export const handleRouting = (app: Express) => {
  app.get('/', (req, res) =>
    setTimeout(() => {
      if (req.signedCookies?.auth === process.env.PASSWORD) {
        res.send(formatIndex());
      } else {
        res.sendFile(__dirname + '/html/login.html');
      }
    }, 75 + Math.random() * 50),
  );
  app.post('/password', (req, res) => {
    setTimeout(() => {
      if (req.body.password === process.env.PASSWORD) {
        res.cookie('auth', process.env.PASSWORD, {
          httpOnly: true,
          secure: true,
          signed: true,
        });
        res.send('success');
      } else {
        res.send('Incorrect password!');
      }
    }, 75 + Math.random() * 50);
  });
  app.get('/logout', (req, res) => {
    res.clearCookie('auth');
    res.send('success');
  });
  app.put('/route', requireAuth, async (req, res) => {
    try {
      if (
        typeof req.body.host === 'string' &&
        typeof req.body.deployment === 'string' &&
        routes.find(({ deployment }) => deployment === req.body.deployment) &&
        typeof req.body.port === 'number'
      ) {
        await editRoute(req.body);
        res.send('success');
      } else {
        throw 'Invalid request';
      }
    } catch (e: any) {
      res.status(400).send(e.message || e);
    }
  });
  app.post('/route', requireAuth, async (req, res) => {
    try {
      if (
        typeof req.body.host === 'string' &&
        typeof req.body.deployment === 'string' &&
        !routes.find(({ host }) => host === req.body.host) &&
        !routes.find(({ deployment }) => deployment === req.body.deployment) &&
        typeof req.body.port === 'number' &&
        typeof req.body.image === 'string'
      ) {
        await addRoute(req.body, req.body.image);
        res.send('success');
      } else {
        throw 'Invalid request';
      }
    } catch (e: any) {
      res.status(400).send(e.message || e);
    }
  });
  app.delete('/route', requireAuth, async (req, res) => {
    try {
      if (routes.find(({ deployment }) => deployment === req.body.deployment)) {
        await removeRoute(req.body);
        res.send('success');
      } else {
        throw 'Invalid request';
      }
    } catch (e: any) {
      res.status(400).send(e.message || e);
    }
  });
};
