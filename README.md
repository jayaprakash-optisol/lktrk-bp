## Getting Started

### Prerequisites

- Node.js (v18+)
- Docker and Docker Compose (for containerized setup)
- PostgreSQL (if running locally)
- Redis (if running locally)

### Installation

1. Clone the repository

   ```
   git clone https://github.com/yourusername/leaktrak-api
   cd leaktrak-api
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Set up environment variables
   ```
   cp .env.example .env
   ```
   Edit `.env` file with your configuration

### Running the Application

#### Using Docker (recommended)

Start all services:

```
docker-compose up -d
```

#### Locally

1. Make sure PostgreSQL and Redis are running
2. Run migrations:
   ```
   npm run db:push
   ```
3. Start the development server:
   ```
   npm run dev
   ```

### API Documentation

Once the server is running, access the Swagger documentation at:

```
http://localhost:3000/api-docs
```

## Database Management

- Generate migrations:
  ```
  npm run db:generate
  ```
- Run migrations:
  ```
  npm run db:push
  ```
- Seed the database:
  ```
  npm run seed
  ```

## Testing

- Run all tests:
  ```
  npm test
  ```
- Run unit tests:
  ```
  npm run test:unit
  ```
- Run integration tests:
  ```
  npm run test:integration
  ```
- Run tests in watch mode:
  ```
  npm run test:watch
  ```

## Code Quality with SonarQube

This project includes SonarQube integration for code quality and coverage analysis.

### Setup SonarQube

1. Start the SonarQube server using Docker Compose:

   ```
   docker-compose up -d sonarqube sonar-postgres
   ```

2. Wait for SonarQube to start (this may take a few minutes)

3. Access the SonarQube dashboard at http://localhost:9000

   - Default credentials: admin/admin
   - You'll be prompted to change the password on first login

4. Generate a token in SonarQube:

   - Go to User > My Account > Security
   - Generate a token and copy it

5. Add the token to your .env file:
   ```
   SONAR_TOKEN=your_generated_token
   SONAR_SERVER_URL=http://localhost:9000
   ```

### Run Code Analysis

1. Run tests with coverage:

   ```
   npm test
   ```

2. Run SonarQube analysis:

   ```
   npm run sonar
   ```

3. View the results in the SonarQube dashboard at http://localhost:9000

### Troubleshooting

- If SonarQube fails to start, try:

  ```
  docker-compose down
  docker-compose up -d sonar-postgres
  docker-compose up -d sonarqube
  ```

- If you encounter memory errors, increase Docker memory limits in Docker Desktop settings

- To check container logs:
  ```
  docker logs sonarqube
  ```

### Stopping SonarQube

When you're done with SonarQube, you can stop it:

```
docker-compose stop sonarqube sonar-postgres
```

To remove the containers:

```
docker-compose rm -f sonarqube sonar-postgres
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server
- `npm run build` - Build the TypeScript code
- `npm run lint` - Lint the code
- `npm run format` - Format the code with Prettier
- `npm test:coverage` - Run tests with coverage
- `npm run db:generate` - Generate migrations
- `npm run db:push` - Run database migrations
- `npm run sonar` - Run SonarQube analysis

## License

MIT
