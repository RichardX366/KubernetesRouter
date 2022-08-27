FROM node:18
WORKDIR /app
RUN curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-399.0.0-linux-x86_64.tar.gz
RUN tar -xf google-cloud-cli-399.0.0-linux-x86_64.tar.gz
RUN rm google-cloud-cli-399.0.0-linux-x86_64.tar.gz
RUN google-cloud-sdk/install.sh -q
RUN google-cloud-sdk/bin/gcloud components install kubectl
ENV PATH=$PATH:/app/google-cloud-sdk/bin
COPY package.json ./
COPY yarn.lock ./
RUN yarn
COPY . .
RUN npx tsc
COPY ./src ./dist
CMD ["yarn", "start"]