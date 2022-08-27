FROM node:18
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN yarn
COPY . .
RUN npx tsc
RUN curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-399.0.0-linux-x86_64.tar.gz
RUN tar -xf google-cloud-cli-399.0.0-linux-x86_64.tar.gz
RUN rm google-cloud-cli-399.0.0-linux-x86_64.tar.gz
RUN google-cloud-sdk/install.sh -q
RUN google-cloud-sdk/bin/gcloud components install kubectl
CMD ["yarn", "start"]