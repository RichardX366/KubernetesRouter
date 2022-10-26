export interface Rule {
  host: string;
  http: {
    paths: {
      backend: {
        service: {
          name: string;
        };
      };
    }[];
  };
}

export interface Service {
  metadata: {
    name: string;
  };
  spec: {
    ports: {
      targetPort: number;
    }[];
  };
}

export interface Route {
  host: string;
  deployment: string;
  port: number;
  env: { [key: string]: string };
  image: string;
}

export interface ConfigMap {
  data: { [key: string]: string };
  metadata: {
    labels?: {
      app: string;
    };
  };
}

export interface Deployment {
  metadata: {
    name: 'among-us-baguette-discord-bot';
  };
  spec: {
    template: {
      spec: {
        containers: [
          {
            image: 'richardx366/amongusbaguette:latest';
          },
        ];
      };
    };
  };
}

export const hydrateBrackets = (
  string: string,
  data: { [key: string]: string },
) => {
  for (const key in data) {
    string = string.replaceAll(`{${key}}`, data[key]);
  }
  return string;
};
