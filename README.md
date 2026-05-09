# AssetTrack

**Group 5 Project Submission**

### Team Members:
- Ahmed Salah Geoshy Elshenawy
- Ahmed Wael Ahmed Naem
- Mona Ahmed Mohamed Yaqout
- Aya Ahmed Farouk Ragab
- Nour Bahgat Zein Eldein

---

AssetTrack is a modern, real-time web application designed to manage, track, and report on hardware assets (laptops, monitors, accessories) within a software development team. It replaces manual spreadsheet tracking with a comprehensive system featuring role-based access control, automated expiration alerts, and dynamic condition reporting.

## Technology Stack
- **Frontend:** React, Vite
- **Backend:** Java 17+, Spring Boot (Spring Web, Spring Data JPA, Spring Security)
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Build Tools:** Maven (Backend), npm (Frontend)

---

## 1. Environment Variables

### Frontend (`frontend/.env`)
The frontend requires an environment variable to point to the backend API. Create a `.env` file in the `frontend/` directory (if it doesn't already exist) with the following content:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Backend
The backend does not require external environment variables to run out-of-the-box. All configuration (Database URL, JWT Secret, Mailtrap SMTP) is pre-configured for local testing directly within `backend/src/main/resources/application.properties`.

---

## 2. PostgreSQL Setup

This project is pre-configured to connect to a cloud-hosted **Neon PostgreSQL** database so you do not need to install a local database to test it. 

**However, if you are strictly required to run it locally:**
1. Install PostgreSQL (v12+).
2. Create a local database named `assettrack`.
3. Open `backend/src/main/resources/application.properties` and replace the existing NeonDB configuration with:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/assettrack
spring.datasource.username=postgres
spring.datasource.password=your_local_postgres_password
```
*(Spring Data JPA is set to `update` and will automatically generate the required tables upon startup).*

---

## 3. How to Run the Project Locally

### Start the Backend
1. Open a terminal and navigate to the `backend/` directory.
2. Run the Spring Boot application using Maven:
   - **Windows:** `.\mvnw.cmd spring-boot:run`
   - **Mac/Linux:** `./mvnw spring-boot:run`
3. The server will start on `http://localhost:8080`.

### Start the Frontend
1. Open a new terminal and navigate to the `frontend/` directory.
2. Install the required npm packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. The web application will start on `http://localhost:5173`.

---

## 4. Default Credentials for Testing

To test the application's Admin functionalities immediately, you can use the pre-seeded account:
- **Email:** `admin@test.com`
- **Password:** `123456`

**Testing Role-Based Access Control:**
1. Navigate to the Sign Up page (`http://localhost:5173/signup`).
2. Create a new account and explicitly request a "Manager" or "Developer" role.
3. Log in as the Admin and navigate to the "User Management" page to approve the pending role request.
4. Log out and log back in as the new user to verify endpoint and UI restrictions.
