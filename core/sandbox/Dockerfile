# XORAS SANDBOX: LOCAL DOCKER TARGET [v1.0]
FROM node:18-alpine

WORKDIR /app

# Intentionally including vulnerable assets
COPY package.json .
COPY vulnerable_target.cjs .

# Simulated: Environment variable with a secret
ENV AWS_SECRET_KEY="AKIAIOSFODNN7EXAMPLE"

RUN npm install

EXPOSE 3001

CMD ["node", "vulnerable_target.cjs"]
