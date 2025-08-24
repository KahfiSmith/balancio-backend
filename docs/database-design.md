# 🗄️ Database Design - Balancio Personal Finance Tracker

## Overview

Balancio uses **MongoDB** as the primary database with **Prisma** as the ORM. The database is designed to handle personal finance data including users, expenses, income, budgets, goals, and analytics.

## 📊 Database Schema

### 1. **Users Collection**
Stores user account information and authentication data.

```typescript
model User {
  id: ObjectId (Primary Key)
  firstName: String (Required)
  lastName: String (Required) 
  email: String (Unique, Required)
  password: String (Hashed, Required)
  avatar?: String (Optional)
  
  // Email verification
  isEmailVerified: Boolean (Default: false)
  emailVerificationToken?: String
  
  // Password reset
  passwordResetToken?: String
  passwordResetExpires?: DateTime
  
  // Account status
  role: String (Default: "user") // "user" | "admin"
  isActive: Boolean (Default: true)
  lastLogin?: DateTime
  
  // Relations
  preferences: UserPreferences (One-to-One)
  categories: Category[] (One-to-Many)
  expenses: Expense[] (One-to-Many)
  incomes: Income[] (One-to-Many)
  budgets: Budget[] (One-to-Many)
  goals: Goal[] (One-to-Many)
  notifications: Notification[] (One-to-Many)
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 2. **User Preferences Collection**
Stores user-specific settings and preferences.

```typescript
model UserPreferences {
  id: ObjectId (Primary Key)
  userId: ObjectId (Foreign Key -> User)
  
  // Localization
  currency: String (Default: "USD")
  timezone: String (Default: "UTC")
  
  // Nested preferences
  notifications: UserNotificationPreferences
  privacy: UserPrivacyPreferences
  
  createdAt: DateTime
  updatedAt: DateTime
}

model UserNotificationPreferences {
  email: Boolean (Default: true)
  push: Boolean (Default: true)
  budgetAlerts: Boolean (Default: true)
  goalMilestones: Boolean (Default: true)
}

model UserPrivacyPreferences {
  profileVisible: Boolean (Default: false)
  dataSharing: Boolean (Default: false)
}
```

### 3. **Categories Collection**
Stores expense and income categories (both default and user-created).

```typescript
model Category {
  id: ObjectId (Primary Key)
  name: String (Required)
  description?: String
  icon: String (Required) // Emoji or icon identifier
  color: String (Required) // Hex color code
  type: String (Required) // "expense" | "income"
  
  // Category ownership
  isDefault: Boolean (Default: false) // System default categories
  userId?: ObjectId (Foreign Key -> User, null for defaults)
  isActive: Boolean (Default: true)
  
  // Relations
  user?: User
  expenses: Expense[]
  incomes: Income[]
  budgets: Budget[]
  
  createdAt: DateTime
  updatedAt: DateTime
  
  // Unique constraint
  @@unique([name, userId, type])
}
```

### 4. **Expenses Collection**
Stores all expense transactions with detailed information.

```typescript
model Expense {
  id: ObjectId (Primary Key)
  userId: ObjectId (Foreign Key -> User)
  categoryId: ObjectId (Foreign Key -> Category)
  
  // Basic information
  title: String (Required)
  description?: String
  amount: Float (Required, > 0)
  date: DateTime (Default: now)
  
  // Additional details
  receipts: String[] // Array of receipt URLs
  tags: String[] // User-defined tags
  location?: String
  paymentMethod: String // "cash" | "card" | "bank_transfer" | "digital_wallet" | "other"
  
  // Recurring expenses
  isRecurring: Boolean (Default: false)
  recurrence?: ExpenseRecurrence (One-to-One)
  
  // Budget tracking
  budgetId?: ObjectId (Foreign Key -> Budget)
  
  isActive: Boolean (Default: true)
  
  // Relations
  user: User
  category: Category
  budget?: Budget
  
  createdAt: DateTime
  updatedAt: DateTime
}

model ExpenseRecurrence {
  id: ObjectId (Primary Key)
  expenseId: ObjectId (Foreign Key -> Expense)
  
  type: String // "daily" | "weekly" | "monthly" | "yearly"
  interval: Int (Default: 1) // Every X periods
  endDate?: DateTime
  nextDate?: DateTime
  
  expense: Expense
}
```

### 5. **Income Collection**
Stores all income transactions and sources.

```typescript
model Income {
  id: ObjectId (Primary Key)
  userId: ObjectId (Foreign Key -> User)
  categoryId: ObjectId (Foreign Key -> Category)
  
  // Basic information
  title: String (Required)
  description?: String
  amount: Float (Required, > 0)
  date: DateTime (Default: now)
  
  // Income details
  source: String // "salary" | "freelance" | "investment" | "business" | "gift" | "other"
  tags: String[]
  
  // Recurring income
  isRecurring: Boolean (Default: false)
  recurrence?: IncomeRecurrence (One-to-One)
  
  isActive: Boolean (Default: true)
  
  // Relations
  user: User
  category: Category
  
  createdAt: DateTime
  updatedAt: DateTime
}

model IncomeRecurrence {
  id: ObjectId (Primary Key)
  incomeId: ObjectId (Foreign Key -> Income)
  
  type: String // "daily" | "weekly" | "monthly" | "yearly"
  interval: Int (Default: 1)
  endDate?: DateTime
  nextDate?: DateTime
  
  income: Income
}
```

### 6. **Budgets Collection**
Stores budget information with tracking and alerts.

```typescript
model Budget {
  id: ObjectId (Primary Key)
  userId: ObjectId (Foreign Key -> User)
  categoryId?: ObjectId (Foreign Key -> Category) // null for overall budget
  
  // Budget details
  name: String (Required)
  description?: String
  amount: Float (Required, > 0) // Budget limit
  spent: Float (Default: 0) // Current spent amount
  
  // Time period
  period: String // "monthly" | "quarterly" | "yearly"
  startDate: DateTime (Required)
  endDate: DateTime (Required)
  
  // Alert settings
  alertThreshold: Float (Default: 80) // Percentage threshold
  
  isActive: Boolean (Default: true)
  
  // Relations
  user: User
  category?: Category
  expenses: Expense[]
  notifications: BudgetNotifications (One-to-One)
  
  createdAt: DateTime
  updatedAt: DateTime
}

model BudgetNotifications {
  id: ObjectId (Primary Key)
  budgetId: ObjectId (Foreign Key -> Budget)
  
  enabled: Boolean (Default: true)
  thresholds: Float[] // [50, 75, 90, 100] - percentage thresholds
  
  budget: Budget
}
```

### 7. **Goals Collection**
Stores financial goals with progress tracking.

```typescript
model Goal {
  id: ObjectId (Primary Key)
  userId: ObjectId (Foreign Key -> User)
  
  // Goal details
  name: String (Required)
  description?: String
  targetAmount: Float (Required, > 0)
  currentAmount: Float (Default: 0)
  targetDate: DateTime (Required, future date)
  
  // Goal management
  status: String // "active" | "completed" | "paused" | "cancelled"
  category: String // "emergency_fund" | "vacation" | "house" | "car" | "education" | "retirement" | "other"
  
  isActive: Boolean (Default: true)
  
  // Relations
  user: User
  milestones: GoalMilestone[]
  contributions: GoalContribution[]
  
  createdAt: DateTime
  updatedAt: DateTime
}

model GoalMilestone {
  id: ObjectId (Primary Key)
  goalId: ObjectId (Foreign Key -> Goal)
  
  amount: Float (Required, > 0)
  note?: String
  achievedAt?: DateTime
  
  goal: Goal
  createdAt: DateTime
}

model GoalContribution {
  id: ObjectId (Primary Key)
  goalId: ObjectId (Foreign Key -> Goal)
  
  amount: Float (Required, > 0)
  date: DateTime (Default: now)
  note?: String
  
  goal: Goal
  createdAt: DateTime
}
```

### 8. **Notifications Collection**
Stores system notifications and alerts.

```typescript
model Notification {
  id: ObjectId (Primary Key)
  userId: ObjectId (Foreign Key -> User)
  
  // Notification details
  type: String // "budget_alert" | "goal_milestone" | "system" | "reminder"
  title: String (Required)
  message: String (Required)
  data?: Json // Additional data payload
  
  // Notification status
  isRead: Boolean (Default: false)
  priority: String // "low" | "medium" | "high"
  
  // Expiration
  expiresAt?: DateTime (Default: 30 days from creation)
  
  // Relations
  user: User
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

## 🔗 Relationships Overview

```
User (1) ←→ (1) UserPreferences
User (1) ←→ (N) Category
User (1) ←→ (N) Expense
User (1) ←→ (N) Income
User (1) ←→ (N) Budget
User (1) ←→ (N) Goal
User (1) ←→ (N) Notification

Category (1) ←→ (N) Expense
Category (1) ←→ (N) Income
Category (1) ←→ (N) Budget

Expense (1) ←→ (1) ExpenseRecurrence
Expense (N) ←→ (1) Budget

Income (1) ←→ (1) IncomeRecurrence

Budget (1) ←→ (1) BudgetNotifications

Goal (1) ←→ (N) GoalMilestone
Goal (1) ←→ (N) GoalContribution
```

## 📈 Indexes and Performance

### Primary Indexes
- All collections have default `_id` indexes
- Unique indexes on `User.email` and compound unique on `Category.(name, userId, type)`

### Performance Indexes
```javascript
// User collection
{ "email": 1 }
{ "isActive": 1 }
{ "createdAt": -1 }

// Expense collection
{ "userId": 1, "date": -1 }
{ "userId": 1, "categoryId": 1 }
{ "userId": 1, "isActive": 1 }
{ "date": -1 }
{ "recurrence.nextDate": 1, "isRecurring": 1 }

// Income collection
{ "userId": 1, "date": -1 }
{ "userId": 1, "categoryId": 1 }
{ "userId": 1, "isActive": 1 }
{ "recurrence.nextDate": 1, "isRecurring": 1 }

// Budget collection
{ "userId": 1, "period": 1 }
{ "userId": 1, "isActive": 1 }
{ "endDate": 1, "isActive": 1 }

// Goal collection
{ "userId": 1, "status": 1 }
{ "userId": 1, "isActive": 1 }
{ "targetDate": 1, "status": 1 }

// Notification collection
{ "userId": 1, "createdAt": -1 }
{ "userId": 1, "isRead": 1 }
{ "userId": 1, "type": 1 }
{ "expiresAt": 1 } // TTL index for auto-deletion
```

## 🔒 Security Considerations

1. **Password Security**: Passwords are hashed using bcrypt with 12 rounds
2. **Data Isolation**: All user data is isolated by `userId`
3. **Soft Deletes**: Users are deactivated, not hard deleted
4. **Token Expiration**: JWT tokens have expiration times
5. **Input Validation**: All inputs validated using Zod schemas
6. **Rate Limiting**: API endpoints are rate limited
7. **CORS Protection**: Cross-origin requests are controlled

## 📊 Data Types and Constraints

### Validation Rules
- **Email**: Valid email format, unique
- **Amounts**: Must be positive numbers with precision
- **Dates**: Future dates for goals, valid date ranges for budgets
- **Colors**: Valid hex color codes
- **Percentages**: 0-100 range for thresholds
- **Enums**: Predefined values for status fields

### Default Values
- User role: "user"
- Currency: "USD"
- Timezone: "UTC"
- Notification preferences: All enabled
- Budget alert threshold: 80%
- Goal status: "active"

This database design provides a robust foundation for the Balancio Personal Finance Tracker, ensuring data integrity, performance, and scalability.