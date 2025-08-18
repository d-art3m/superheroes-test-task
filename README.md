# Superheroes

### Live Demo: https://superheroes-test-task.vercel.app/

Superheroes is a full-stack web application that allows users to create, manage, and explore a database of superheroes. Users can perform full CRUD operations — add new heroes, edit their details, upload and manage images, or remove them entirely. The app provides a paginated listing of all superheroes, as well as a detailed view showing their full profile.

## Tech Stack

- Backend: NestJS
- Frontend: React, TypeScript, Zustand, Shadcn
- Database: PostgreSQL
- ORM: Prisma
- File Storage: Vercel Blob
- Test: Jest 

# Installation

Clone the repository:
```bash
git clone https://github.com/d-art3m/superheroes-test-task
```

## Backend app

1. Open server folder:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create your `.env` file

4. Open the `.env` file and configure the following environment variables:
```bash
PORT=
CLIENT_URL=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
```

5. Run tests:
```bash
npm run test
```

6. Run the development server:
```bash
npm run start
```

## Frontend app

1. Open client folder:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create your `.env` file

4. Open the `.env` file and configure the following environment variables:
```bash
VITE_API_URL=
```

5. Run tests:
```bash
npm run test
```

6. Run the development server:
```bash
npm run dev
```