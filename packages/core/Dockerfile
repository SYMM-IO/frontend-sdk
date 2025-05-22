FROM node:lts

RUN apt-get update && apt-get install -y jq

RUN mkdir /core
WORKDIR /core

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . ./

RUN yarn build

EXPOSE 3000

CMD ["bash", "./docker/deploy.sh"]
