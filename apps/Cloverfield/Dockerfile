FROM node:lts
 
RUN apt-get update && apt-get install -y jq
RUN npm install -g yalc

RUN mkdir /Cloverfield
WORKDIR /Cloverfield

COPY ./.yalc/@symmio/frontend-sdk ./
COPY package.json ./
COPY yarn.lock ./

COPY .yalc ./.yalc
COPY yalc.lock ./yalc.lock
RUN yalc add @symmio/frontend-sdk


RUN yarn install

COPY . ./


# RUN cp .env.example .env

RUN ls -al .yalc



RUN yarn build

EXPOSE 3000

CMD ["bash", "./docker/deploy.sh"]
