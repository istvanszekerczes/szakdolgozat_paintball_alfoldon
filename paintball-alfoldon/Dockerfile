# Builds one of the two Angular SSR apps; docker-compose.yml passes the project and its output folder.
FROM node:24-slim AS build
WORKDIR /app
ENV NG_CLI_ANALYTICS=false
# scripts/ is needed by the postinstall hook.
COPY package.json package-lock.json ./
COPY scripts ./scripts
RUN npm ci
COPY . .
ARG PROJECT
ARG DIST_DIR
# Compiled into the browser code. No map key is passed on purpose, so none ends up in the image.
ARG API_URL=
RUN API_URL="$API_URL" node scripts/set-env.mjs \
  && npx ng build "$PROJECT" \
  && mv "$DIST_DIR" /output

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
COPY --from=build /output ./
USER node
EXPOSE 4000
CMD ["node", "server/server.mjs"]
