FROM node:18-alpine
RUN apk add --no-cache bash
WORKDIR /app
COPY . .
RUN chmod +x run.sh
CMD ["./run.sh"]