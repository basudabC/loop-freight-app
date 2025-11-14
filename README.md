# Loop Freight - Logistics Management System

A comprehensive web application for managing truck assignments and logistics operations for Loop Freight.

## Features

### 🔐 Authentication & Authorization
- Secure login with NextAuth.js
- Role-based access control (Admin, Territory Officer)
- JWT-based session management

### 🚛 Truck Assignment Management
- Create new transport assignments
- View incoming trucks by territory
- Reassign trucks for reverse journeys
- Mark assignments as completed
- Real-time status updates

### 👥 User Management (Admin Only)
- Create and manage territory officers
- Assign territories to officers
- Admin override capabilities

### 📊 Dashboard & Analytics
- Territory-specific dashboards
- Real-time assignment tracking
- Status monitoring
- Historical data view

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd loop-freight
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Update `.env` with your database credentials and other configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/loopfreight?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

## Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Login Credentials

After running the seed command, you can log in with these credentials:

### Admin Account
- **Email**: `admin@loopfreight.io`
- **Password**: `admin123`

### Territory Officer Accounts
1. **Email**: `john.smith@loopfreight.io` / **Password**: `officer123` (Territory: New York)
2. **Email**: `sarah.johnson@loopfreight.io` / **Password**: `officer123` (Territory: Los Angeles)
3. **Email**: `michael.brown@loopfreight.io` / **Password**: `officer123` (Territory: Chicago)
4. **Email**: `emily.davis@loopfreight.io` / **Password**: `officer123` (Territory: Houston)
5. **Email**: `david.wilson@loopfreight.io` / **Password**: `officer123` (Territory: Phoenix)

## Database Schema

### User Model
```typescript
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  password      String?
  role          Role      @default(TERRITORY_OFFICER)
  territoryCity String?
  // ... relations
}
```

### TruckAssignment Model
```typescript
model TruckAssignment {
  id                  String           @id @default(cuid())
  truckNumber         String
  originCity          String
  destinationCity     String
  goodsType           String
  departureTime       DateTime
  expectedArrivalTime DateTime
  status              AssignmentStatus @default(ASSIGNED)
  assignedByUserId    String
  reassignedByUserId  String?
  // ... relations
}
```

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Assignments
- `GET /api/assignments` - List assignments (filtered by role/territory)
- `POST /api/assignments` - Create new assignment
- `GET /api/assignments/incoming` - List incoming trucks for territory
- `PUT /api/assignments/[id]/reassign` - Reassign a truck
- `PUT /api/assignments/[id]/complete` - Mark assignment as completed
- `GET /api/assignments/[id]` - Get assignment details
- `PUT /api/assignments/[id]` - Update assignment (admin only)
- `DELETE /api/assignments/[id]` - Delete assignment (admin only)

### User Management (Admin Only)
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with sample data

## Deployment to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
4. Deploy!

### Environment Variables for Vercel

Make sure to set these environment variables in your Vercel project settings:

- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: A random string for JWT encryption
- `NEXTAUTH_URL`: Your production domain (e.g., `https://your-app.vercel.app`)

## Architecture

### Authentication Flow
1. User submits credentials via login form
2. NextAuth.js validates credentials against database
3. JWT token is generated and stored in session
4. Protected routes check session validity

### Assignment Workflow
1. Territory officer creates assignment from their city
2. System tracks truck movement and automatically updates status
3. Destination territory officer sees incoming trucks
4. Officer can reassign truck for reverse journey or mark complete

### Database Design
- Uses Prisma ORM for type-safe database queries
- PostgreSQL for reliable data storage
- Proper indexing for performance
- Foreign key constraints for data integrity

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- SQL injection prevention via Prisma
- CSRF protection

## Performance Optimizations

- Server-side rendering with Next.js
- Database indexing on frequently queried fields
- Efficient API route handlers
- Optimized image loading
- Minimal bundle size with tree-shaking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.

---

Built with ❤️ for Loop Freight