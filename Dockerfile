FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_SUPABASE_PROJECT_ID
ARG VITE_SUPABASE_ANON_KEY

COPY package*.json ./

RUN npm ci

COPY . .

ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

FROM nginx:alpine AS production

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
