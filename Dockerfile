FROM node:alpine as builder

WORKDIR /app
COPY . .
RUN npm i -g pnpm
RUN pnpm i && pnpm build && pnpm prune --prod

FROM node:alpine as font-reporter-lite

COPY --from=builder /app /app
RUN cd /app && npm link

WORKDIR /data
ENTRYPOINT [ "font-reporter" ]
CMD [ "-f", "html" ]

FROM jacoblincool/playwright:chromium-light as font-reporter

COPY --from=builder /app /app
RUN cd /app && npm link

WORKDIR /data
ENTRYPOINT [ "font-reporter" ]
CMD [ "-f", "pdf" ]
