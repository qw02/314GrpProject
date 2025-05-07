# Cleaning Platform App - Setup Guide

This repository contains a C2C freelance home cleaners matching platform with a React frontend and Express.js backend.

## Prerequisites

-   **Node.js & npm**: [Download and install](https://nodejs.org/) (LTS version recommended)
-   **Git**: [Download and install](https://git-scm.com/)
-   **MySQL**: [Download and install](https://dev.mysql.com/downloads/mysql/) (Remember your MySQL username/password!)

## Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/raspbury/314GrpProject.git
cd 314GrpProject
```

### 2. Database Setup

1.  Log in to your MySQL server (using the command line or a GUI tool like MySQL Workbench).
2.  Execute the SQL script provided in the repository to create the necessary database and tables:
    ```bash
    # From the project root directory:
    mysql -u YOUR_MYSQL_USERNAME -p < SQL_Scripts/create_tables.sql
    ```
    *(Replace `YOUR_MYSQL_USERNAME` with your actual MySQL username. You'll be prompted for your password.)*
    Alternatively, open `SQL_Scripts/create_tables.sql` in your MySQL client and run the script manually.

### 3. (Optional) Load Dummy Test Data

If you wish to populate your database with sample data for testing and development, you may load the provided test data script after creating the tables:

1.  Ensure you have already completed the database setup above.
2.  From the project root directory, run:
    ```bash
    mysql -u YOUR_MYSQL_USERNAME -p cleaning_platform_db < SQL_Scripts/test_data.sql
    ```
    *(Replace `YOUR_MYSQL_USERNAME` with your actual MySQL username. You will be prompted for your password.)*

    Alternatively, you may open `SQL_Scripts/test_data.sql` in your MySQL client and execute the statements manually.

*This step is optional, but highly recommended for exploring the application's features with pre-filled users, jobs, and other records.*

### 4. Backend Setup (Server)

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies, including `dotenv` to manage environment variables:
    ```bash
    npm install
    ```
3.  **Configure Environment Variables:**
    *   In the `server` directory, find the example environment file (e.g., `.env.example`).
    *   Create a copy of this file and name it `.env`:
        ```bash
        # On Linux/macOS
        cp .env.example .env

        # On Windows (Command Prompt)
        copy .env.example .env
        ```
    *   Open the new `.env` file in a text editor.
    *   Update the values to match your local environment:
        ```dotenv
        # .env file contents
        DB_HOST=localhost            # Your MySQL host (usually localhost)
        DB_USER=YOUR_MYSQL_USER      # Replace with your MySQL username
        DB_PASSWORD=YOUR_MYSQL_PWD   # Replace with your MySQL password
        DB_NAME=cleaning_platform_db # The database name created in Step 2
        DB_PORT=3306                 # Your MySQL port (usually 3306)
        PORT=5000                    # The port the backend server will run on
        ```
    *   **Important:** The `.env` file contains sensitive information and should *not* be committed to Git. Ensure `.env` is listed in your `server/.gitignore` file.

4.  Start the backend server:
    ```bash
    npm start
    ```
    *(Keep this terminal running. It should indicate the server is listening on the `PORT` specified in `.env`, e.g., 5000.)*

### 5. Frontend Setup (Client)

1.  Open a **new** terminal window.
2.  Navigate to the client directory from the project root:
    ```bash
    cd ../app
    ```
    *(Or `cd 314GrpProject/app` if starting from your home directory)*
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the frontend development server (Vite):
    ```bash
    npm run dev
    ```
    *(Vite will typically start the frontend on `http://localhost:5173` or similar. Check the terminal output.)*

### 6. Access the Application

1.  Open your web browser and navigate to the frontend URL provided by Vite (e.g., `http://localhost:5173`).
2.  You should see the login page.

## First Login

To log in as an administrator, you may need to create an initial `UserAdmin` account manually in your MySQL database:

```sql
-- Connect to your MySQL server and use the correct database:
-- USE cleaning_platform_db;

INSERT INTO UserAccount (username, password, role, isActive)
VALUES ('admin', 'password', 'UserAdmin', TRUE);
```

Then log in via the web interface using:
-   Username: `admin`
-   Password: `password`
-   Role: `UserAdmin`

## Troubleshooting

*   **Port Conflicts:** Ensure the ports specified in `server/.env` (`PORT`) and used by Vite (`npm run dev`) are free. Stop conflicting applications or change the port numbers.
*   **Database Connection Errors:** Double-check all `DB_*` values in `server/.env`. Make sure your MySQL server is running and accessible.
*   **API Call Failures (404/500 errors in browser console):** Verify the backend server is running. Check that the `proxy` target in `app/vite.config.js` matches the backend `PORT` (e.g., `http://localhost:5000`).
*   **Dependency Issues:** If `npm install` fails or you encounter strange errors, try deleting the `node_modules` folder and `package-lock.json` file in the problematic directory (`server` or `app`) and run `npm install` again.

## Project Structure

-   `app/`: React frontend application (using Vite)
-   `server/`: Express.js backend API
-   `SQL_Scripts/`: Contains database schema setup scripts and optional test data
