# Notes-to-Quiz AI

An intelligent quiz generation platform that transforms your study notes into comprehensive, interactive quizzes using AI. Built with the MERN stack and powered by OpenAI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)

## Features

### AI-Powered Quiz Generation
- **Smart Question Generation**: Automatically generates diverse questions (MCQ, True/False, Short Answer, Fill in the Blanks) from your study material
- **Difficulty Distribution**: Customize the mix of Easy, Medium, and Hard questions
- **Bloom's Taxonomy Mode**: Generate questions aligned with cognitive learning levels
- **Topic Extraction**: AI automatically identifies and tags key topics from your content

### Multiple Input Methods
- **PDF Upload**: Upload PDF documents for text extraction
- **Text Paste**: Directly paste your study notes
- **Drag & Drop**: Easy file upload with drag-and-drop support

### Quiz Customization
- **Adjustable Question Count**: Generate 1-50 questions per quiz
- **Question Type Selection**: Choose which question types to include
- **Exam Modes**: General, UPSC, JEE, College, School presets
- **Real-time Preview**: Review and edit questions before starting

### Interactive Quiz Mode
- **Timed Quizzes**: Optional time limits for exam simulation
- **Progress Tracking**: See your progress as you answer
- **Instant Feedback**: Get explanations for correct answers
- **Score Analysis**: Detailed breakdown of your performance

### Cloud Storage
- **Cloudinary Integration**: Secure PDF storage in the cloud
- **Persistent Data**: MongoDB Atlas for reliable data persistence

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Query** for server state management
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **MongoDB Atlas** with Mongoose ODM
- **OpenAI API** (GPT-4o-mini) for quiz generation
- **JWT Authentication** with secure HTTP-only cookies
- **Cloudinary** for file storage
- **pdf-parse** for PDF text extraction

### Security
- Helmet.js for HTTP security headers
- Rate limiting for API protection
- Input sanitization against NoSQL injection
- CORS configuration

## Installation

### Prerequisites
- Node.js >= 18.0.0
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key
- Cloudinary account (optional, for PDF storage)

### Clone the Repository
```bash
git clone https://github.com/yourusername/notes-to-quiz-ai.git
cd notes-to-quiz-ai
```

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:8080
OPENAI_API_KEY=sk-proj-your-openai-key
CLOUD_NAME=your-cloudinary-cloud-name
CLOUD_API_KEY=your-cloudinary-api-key
CLOUD_API_SECRET=your-cloudinary-api-secret
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_SERVER_URI=http://localhost:3000
VITE_CLOUD_NAME=your-cloudinary-cloud-name
```

## Usage

### Start the Backend Server
```bash
cd backend
npm run dev    # Development with nodemon
# or
npm start      # Production
```

### Start the Frontend Development Server
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:8080`

### Generating a Quiz
1. **Upload Content**: Drag and drop a PDF or paste your study notes
2. **Configure Settings**: Adjust question count, types, difficulty, and exam mode
3. **Generate**: Click "Generate Quiz" to create questions
4. **Preview**: Review generated questions and make edits if needed
5. **Start Quiz**: Begin the interactive quiz session
6. **Review Results**: See your score and detailed explanations

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Quiz Generation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate/quiz` | Generate quiz from text |
| POST | `/api/generate/enhance` | Enhance existing questions |
| POST | `/api/generate/topics` | Extract topics from text |

### File Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/pdf` | Upload and extract text from PDF |
| POST | `/api/upload/text` | Upload text content |

### Quizzes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quizzes` | Get all quizzes |
| POST | `/api/quizzes` | Create new quiz |
| GET | `/api/quizzes/:id` | Get quiz by ID |
| PUT | `/api/quizzes/:id` | Update quiz |
| DELETE | `/api/quizzes/:id` | Delete quiz |

## Project Structure

```
notes-to-quiz-ai/
├── backend/
│   ├── config/           # Database and cloud configurations
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Auth, validation, rate limiting
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── utils/            # Helper functions
│   └── server.js         # Entry point
├── frontend/
│   ├── public/           # Static assets
│   └── src/
│       ├── components/   # React components
│       ├── context/      # React context (Quiz state)
│       ├── hooks/        # Custom hooks
│       ├── lib/          # Utilities
│       ├── pages/        # Page components
│       └── types/        # TypeScript types
└── README.md
```

## Dependencies

### Backend
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `openai` - OpenAI API client
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cloudinary` - Cloud file storage
- `pdf-parse` - PDF text extraction
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `express-validator` - Input validation

### Frontend
- `react` - UI library
- `vite` - Build tool
- `tailwindcss` - Styling
- `@radix-ui/*` - UI primitives
- `@tanstack/react-query` - Data fetching
- `react-router-dom` - Routing
- `lucide-react` - Icons
- `sonner` - Toast notifications

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [OpenAI](https://openai.com/) for the GPT API
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Cloudinary](https://cloudinary.com/) for file storage
- [MongoDB Atlas](https://www.mongodb.com/atlas) for database hosting

---

Made with learning in mind
