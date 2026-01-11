# Escape Room - Digital Puzzle Game

A full-stack digital escape room application where players solve puzzles, inspect scenes, unlock locks, and escape through multiple stages. The application features user authentication, game session management, and progress tracking.

## 🎮 Features

- **User Authentication**: Register and login with secure password handling
- **Game Session Management**: Start new games or resume existing progress
- **Multi-Stage Gameplay**: Navigate through different rooms (Cell, Desk, etc.)
- **Scene Inspection**: Click on areas to inspect and discover clues
- **Inventory System**: Collect and use items (rod, desk key, etc.)
- **Lock Puzzles**: Solve various locks (cell drawer, cell door, desk drawer, final door)
- **Progress Tracking**: Save and resume game sessions
- **Internationalization**: Support for English and French (via text constants)
- **RESTful API**: Comprehensive backend API with Swagger documentation
- **Responsive UI**: Modern React interface with smooth transitions

## 🛠️ Technology Stack

### Backend
- **Java 21**
- **Spring Boot 3.5.5**
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database persistence
- **PostgreSQL** - Database
- **Lombok** - Reduced boilerplate code
- **SpringDoc OpenAPI** - API documentation (Swagger)
- **Maven** - Dependency management
- **Testcontainers** - Integration testing

### Frontend
- **React 19**
- **Vite** - Build tool and dev server
- **React Router DOM 7** - Client-side routing
- **CSS3** - Styling with custom design system

## 📁 Project Structure

```
Escape Room/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/escaperoom/backend/
│   │   │   │   ├── config/          # Security and Swagger configuration
│   │   │   │   ├── controller/      # REST API controllers
│   │   │   │   ├── dto/             # Data Transfer Objects
│   │   │   │   ├── model/           # Entity models
│   │   │   │   ├── repo/            # JPA repositories
│   │   │   │   └── service/         # Business logic services
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                    # Test files
│   └── pom.xml
│
└── frontend/
    ├── src/
    │   ├── components/              # React components
    │   │   ├── game/                # Game-specific components
    │   │   └── ...
    │   ├── constants/               # Colors, fonts, text content
    │   ├── contexts/                # React contexts (GameContext)
    │   ├── services/                # API service layer
    │   └── App.jsx
    ├── public/                      # Static assets
    └── package.json
```

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Java 21** or higher
- **Maven 3.6+**
- **PostgreSQL 12+**
- **Node.js 18+** and **npm**
- **Git** (optional, for cloning)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
cd "Escape Room"
```

### 2. Database Setup

1. Install and start PostgreSQL
2. Create a database (e.g., `dhruv`)
3. Update database credentials in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/your_database
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. Backend Setup

```bash
cd backend
mvn clean install
```

This will:
- Download all Maven dependencies
- Compile the project
- Run tests

### 4. Frontend Setup

```bash
cd frontend
npm install
```

This will install all Node.js dependencies.

## ▶️ Running the Application

### Start the Backend

```bash
cd backend
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

**API Documentation**: Once the backend is running, access Swagger UI at:
- `http://localhost:8080/swagger-ui.html`

### Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🎯 Usage

1. **Access the Application**: Open `http://localhost:5173` in your browser
2. **Create Account**: Click "Sign Up" and create a new account
3. **Login**: Use your credentials to login
4. **Start Game**: Choose to start a new game or resume previous progress
5. **Play**: 
   - Inspect different areas by clicking on the scene
   - Collect items and add them to your inventory
   - Solve locks by entering the correct answers
   - Progress through stages to escape!

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get user profile

### Game Session
- `POST /api/game/session/start` - Start a new game session
- `GET /api/game/session/{sessionId}` - Get a specific game session
- `GET /api/game/session/latest` - Get the latest game session for a user
- `PUT /api/game/session/{sessionId}/state` - Update game state

### Game Actions
- `POST /api/game/inspect` - Inspect a scene area
- `POST /api/game/validate/cell-drawer` - Validate cell drawer lock
- `POST /api/game/validate/cell-door` - Validate cell door lock
- `POST /api/game/validate/desk-drawer` - Validate desk drawer lock
- `POST /api/game/validate/final-door` - Validate final door lock
- `POST /api/game/use-item` - Use an item on a target
- `POST /api/game/transition` - Transition to a new stage

For complete API documentation, visit the Swagger UI when the backend is running.

## 🗄️ Database Schema

The application uses the following main entities:

- **User** - User accounts and authentication
- **GameSession** - Active game sessions with state
- **EscapeRun** - Completed game runs and statistics
- **Question** - Puzzle questions and answers

The database schema is automatically created/updated by Hibernate on startup (configured in `application.properties`).

## 🔧 Configuration

### Backend Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/your_database
spring.datasource.username=your_username
spring.datasource.password=your_password

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### Frontend Configuration

The frontend API base URL is configured in `frontend/src/services/api.js`. Default: `http://localhost:8080/api`

## 🧪 Testing

### Backend Tests

```bash
cd backend
mvn test
```

The project uses Testcontainers for integration tests with PostgreSQL.

### Frontend Linting

```bash
cd frontend
npm run lint
```

## 📝 Development Notes

### Code Organization

- **Backend**: Follows Spring Boot best practices with layered architecture (Controller → Service → Repository)
- **Frontend**: 
  - Component-based React architecture
  - Constants stored in separate files (`colors.js`, `fonts.js`, `text.js`)
  - API calls centralized in `services/api.js`
  - Game state managed through React Context

### Adding New Features

- **Backend**: Create DTOs in `dto/` package, add service methods in `service/` package, expose via controllers
- **Frontend**: Add new components in `components/` directory, update constants files for UI elements, modify `api.js` for new endpoints

### Internationalization

Text content is stored in `frontend/src/constants/text.js`. Add entries for both English and French translations.

## 🐛 Troubleshooting

### Backend won't start
- Verify PostgreSQL is running
- Check database credentials in `application.properties`
- Ensure port 8080 is available

### Frontend can't connect to backend
- Verify backend is running on port 8080
- Check CORS configuration in `SecurityConfig.java`
- Verify API base URL in `frontend/src/services/api.js`

### Database connection errors
- Ensure PostgreSQL service is running
- Verify database exists and credentials are correct
- Check PostgreSQL logs for connection issues

## 📄 License

This project is for educational purposes.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions, please check the codebase documentation or open an issue in the repository.

---

**Happy Escaping! 🚪🔓**
