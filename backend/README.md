# AssetTrack - Backend

This folder contains the Spring Boot backend codebase for the AssetTrack application.

## Technology Stack
- Java 17+
- Spring Boot (Spring Web, Spring Security, Spring Data JPA)
- PostgreSQL
- JWT Authentication
- Maven Build Tool

## Setup Instructions

### 1. Database Configuration
By default, the backend connects to a cloud-hosted Neon PostgreSQL database. 
If you wish to use a local database, open `src/main/resources/application.properties` and update the URL and credentials:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/assettrack
spring.datasource.username=postgres
spring.datasource.password=your_password
```

### 2. SMTP & JWT Configuration
SMTP settings (via Mailtrap) and the JWT Secret key are hardcoded in `application.properties` to ensure the project runs out-of-the-box for grading without complex environment variable setups.

### 3. Run the Application
You can run the application using the included Maven wrapper. Navigate to this `backend/` folder in your terminal and execute:

**Windows:**
```bash
.\mvnw.cmd spring-boot:run
```

**Mac/Linux:**
```bash
./mvnw spring-boot:run
```

The Spring Boot server will initialize and run on `http://localhost:8080`.
