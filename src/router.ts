import { Express, Handler } from 'express';
import { readFileSync } from 'fs';
import { hydrateBrackets } from './constants';
import { addRoute, removeRoute, routes } from './handleYML';

const requireAuth: Handler = (req, res, next) => {
  if (req.signedCookies.auth === process.env.PASSWORD) {
    setTimeout(() => res.status(401).send('Unauthorized'));
  } else {
    next();
  }
};

const index = readFileSync('src/html/index.html').toString();

const formatIndex = () =>
  hydrateBrackets(index, {
    routes: routes.map(({ host, deployment, port }) => ``).join(''),
  });

export const handleRouting = (app: Express) => {
  app.get('/', (req, res) =>
    setTimeout(() => {
      if (req.signedCookies.auth === process.env.PASSWORD) {
        res.send(formatIndex());
      } else {
        res.sendFile(__dirname + '/login.html');
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
  app.post('/route', requireAuth, async (req, res) => {
    if (
      typeof req.body.host === 'string' &&
      typeof req.body.deployment === 'string' &&
      !routes.find((route) => route.host === req.body.host) &&
      !routes.find((route) => route.deployment === req.body.deployment) &&
      (typeof req.body.port === 'number' || req.body.port === undefined) &&
      typeof req.body.image === 'string'
    ) {
      await addRoute(req.body, req.body.image);
      res.send('success');
    } else {
      throw 'Invalid request';
    }
  });
  app.delete('/route', requireAuth, async (req, res) => {
    if (routes.find((route) => route.deployment === req.body.deployment)) {
      await removeRoute(req.body);
      res.send('success');
    } else {
      throw 'Invalid request';
    }
  });
};
