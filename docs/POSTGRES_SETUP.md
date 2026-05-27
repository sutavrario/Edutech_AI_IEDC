# PostgreSQL Database Setup Guide

This guide outlines the steps to set up the PostgreSQL database for the EduTech AI Platform (Phase 1).

## 1. Prerequisites

- Ensure you have PostgreSQL installed on your machine.
  - **Mac**: `brew install postgresql`
  - **Windows/Linux**: Download from the official website.

## 2. Start PostgreSQL Service

**Mac (Homebrew):**
```bash
brew services start postgresql
```

## 3. Create the Database and User

Open the PostgreSQL interactive terminal (`psql`):

```bash
psql postgres
```

Run the following SQL commands to create the `postgres` user (if not already created), set a password, and create the database `edutech_db`:

```sql
-- Create a user named 'postgres' with password 'postgres' (for local dev only)
CREATE ROLE postgres WITH LOGIN PASSWORD 'postgres';

-- Give the user privileges to create databases
ALTER ROLE postgres CREATEDB;

-- Create the edutech database
CREATE DATABASE edutech_db OWNER postgres;
```

Exit `psql`:
```text
\q
```

## 4. Connect and Initialize Tables

The FastAPI application is configured to connect to:
`postgresql://postgres:postgres@localhost/edutech_db`

When you start the FastAPI server for the first time, SQLAlchemy will automatically create the `users` table based on the models defined in `app/models/user.py`.

## 5. (Optional) Manual Verification

To verify the table was created, connect to the new database:
```bash
psql -d edutech_db -U postgres
```
And list the tables:
```sql
\dt
```
You should see the `users` table.
