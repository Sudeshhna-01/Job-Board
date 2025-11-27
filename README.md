# 🚀 Job Board Project

A modern, full-stack job board platform built with Next.js, Node.js, Express, Prisma, and PostgreSQL. Features a clean, professional UI without Tailwind CSS, using CSS Modules for styling.

## ✨ Features

- 🔐 **JWT Authentication** with role-based access (Company, Applicant, Admin)
- 💼 **Job Management** - Post, edit, delete jobs with rich details
- 🔍 **Advanced Search** - Filter jobs by title, location, category
- 📄 **Application System** - Resume upload and cover letter submission
- 📊 **Dashboards** - Separate views for companies and job seekers
- 📱 **Responsive Design** - Works perfectly on all devices
- 🎨 **Modern UI** - Clean, professional design with CSS Modules
- 📁 **File Upload** - Secure resume handling with validation

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript** for type safety
- **CSS Modules** for styling (no Tailwind!)
- **Material UI** for components
- **React Query** (TanStack Query) for data fetching
- **Axios** for API calls

### Backend
- **Node.js** with Express.js
- **Prisma ORM** with PostgreSQL
- **JWT Authentication** with bcrypt
- **Multer** for file uploads
- **CORS** enabled for frontend communication

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### 1. Clone and Setup
```bash
# Navigate to project directory
cd "Job Board"

# Run the setup script
./setup.sh
```

### 2. Database Setup
```bash
# Install PostgreSQL (if not already installed)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Start PostgreSQL service
# macOS: brew services start postgresql
# Ubuntu: sudo service postgresql start

# Create database
createdb jobboard
```

### 3. Backend Configuration
```bash
cd backend

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://username:password@localhost:5432/jobboard"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
UPLOAD_DIR="./src/uploads"
MAX_FILE_SIZE=5242880
EOF

# Initialize database
npx prisma generate
npx prisma db push

# Seed with sample data
npm run seed
```

### 4. Frontend Configuration
```bash
cd ../frontend

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000/api
EOF
```

### 5. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🌐 Access the Application

- **Frontend**: https://job-board-zeta-ruddy.vercel.app/
- **Backend API**: https://job-board-production-c1d3.up.railway.app/

## 👥 Test Accounts

After running the seed script, you can use these test accounts:

### Companies
- **TechCorp Inc.**
  - Email: `admin@techcorp.com`
  - Password: `password`

- **HealthPlus**
  - Email: `hr@healthplus.com`
  - Password: `password`

### Job Seeker
- **John Doe**
  - Email: `john@example.com`
  - Password: `password`

## 📱 Application Features

### For Job Seekers
1. **Browse Jobs** - Search and filter available positions
2. **Apply for Jobs** - Upload resume and cover letter
3. **Track Applications** - Monitor application status
4. **View Companies** - Learn about hiring companies

### For Companies
1. **Post Jobs** - Create detailed job listings
2. **Manage Applications** - Review and update application status
3. **Company Profile** - Maintain company information
4. **Dashboard Analytics** - Track job performance

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Building for Production
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

### Database Management
```bash
# View database in Prisma Studio
cd backend && npx prisma studio

# Reset database
cd backend && npx prisma db push --force-reset
```

## Database Schema

The project uses the following main models:
- **User**: Authentication and user information
- **Company**: Company profiles and information
- **Job**: Job postings with details
- **Application**: Job applications with resume uploads

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs with filters
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (Company only)
- `PUT /api/jobs/:id` - Update job (Company only)
- `DELETE /api/jobs/:id` - Delete job (Company only)

### Applications
- `POST /api/applications/apply/:jobId` - Apply for job
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/company-applications` - Get company's applications
- `PUT /api/applications/:id/status` - Update application status

### Companies
- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get single company
- `PUT /api/companies/profile` - Update company profile
- `GET /api/companies/dashboard/stats` - Get dashboard statistics

## Usage

1. **For Job Seekers:**
   - Register as an "Applicant"
   - Browse and search jobs
   - Apply for jobs with resume upload
   - Track application status

2. **For Companies:**
   - Register as a "Company"
   - Post job openings
   - Manage applications
   - Update company profile

## Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Building for Production
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
