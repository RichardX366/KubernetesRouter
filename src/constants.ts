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
