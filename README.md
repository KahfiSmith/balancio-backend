# Balancio Backend

Personal Finance Tracker Backend API built with TypeScript, Express.js, and MongoDB.

## Features

- 🔐 **Authentication & Authorization**: JWT-based auth with refresh tokens
- 💰 **Expense Tracking**: CRUD operations with categories, receipts, and recurring expenses
- 💵 **Income Management**: Multiple income sources with recurring income support
- 📊 **Budget Management**: Category-based budgets with real-time tracking and alerts
- 🎯 **Financial Goals**: Savings goals with progress tracking and milestones
- 📈 **Analytics & Reports**: Spending trends, category breakdowns, and financial insights
- 🔔 **Notifications**: Budget alerts, goal milestones, and system notifications
- 📁 **File Upload**: Receipt uploads via Cloudinary integration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **File Upload**: Cloudinary
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Winston
- **Package Manager**: pnpm

## Project Structure

```
src/
├── app.ts                 # Express app setup
├── server.ts             # Server entry point
├── config/               # Configuration files
│   ├── config.ts         # Environment configuration
│   └── database.ts       # Database connection
├── models/               # Mongoose models
│   ├── User.ts
│   ├── Category.ts
│   ├── Expense.ts
│   ├── Income.ts
│   ├── Budget.ts
│   ├── Goal.ts
│   ├── Notification.ts
│   └── index.ts
├── routes/               # API routes
│   ├── authRoutes.ts
│   ├── userRoutes.ts
│   ├── expenseRoutes.ts
│   ├── incomeRoutes.ts
│   ├── budgetRoutes.ts
│   ├── goalRoutes.ts
│   ├── categoryRoutes.ts
│   ├── notificationRoutes.ts
│   ├── analyticsRoutes.ts
│   └── uploadRoutes.ts
├── controllers/          # Route controllers
├── middleware/           # Custom middleware
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── notFound.ts
├── services/             # Business logic
├── utils/                # Utility functions
│   └── logger.ts
├── validators/           # Input validation schemas
└── types/                # TypeScript type definitions
    └── index.ts
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- pnpm (package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Balancio-Backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   - MongoDB connection string
   - JWT secrets
   - SMTP settings for email
   - Cloudinary credentials

4. **Start development server**
   ```bash
   pnpm dev
   ```

   The server will start on `http://localhost:5000`

### Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm clean` - Remove build directory

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-email` - Verify email address

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `PUT /api/users/preferences` - Update user preferences
- `DELETE /api/users/account` - Delete user account

### Expenses
- `GET /api/expenses` - Get user expenses with filtering
- `GET /api/expenses/:id` - Get specific expense
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Income
- `GET /api/income` - Get user income records
- `GET /api/income/:id` - Get specific income record
- `POST /api/income` - Create new income record
- `PUT /api/income/:id` - Update income record
- `DELETE /api/income/:id` - Delete income record

### Budgets
- `GET /api/budgets` - Get user budgets
- `GET /api/budgets/:id` - Get specific budget
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Goals
- `GET /api/goals` - Get user financial goals
- `GET /api/goals/:id` - Get specific goal
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `POST /api/goals/:id/contribute` - Add contribution to goal

### Categories
- `GET /api/categories` - Get categories
- `GET /api/categories/:id` - Get specific category
- `POST /api/categories` - Create custom category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Analytics
- `GET /api/analytics/spending-trends` - Get spending trends
- `GET /api/analytics/category-breakdown` - Get category breakdown
- `GET /api/analytics/monthly-summary` - Get monthly summary
- `GET /api/analytics/financial-health` - Get financial health metrics

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification

### File Upload
- `POST /api/upload/receipt` - Upload receipt image
- `POST /api/upload/avatar` - Upload user avatar
- `DELETE /api/upload/file/:id` - Delete uploaded file

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.