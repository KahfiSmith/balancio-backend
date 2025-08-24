import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed...');

  // Create default categories for expenses
  const expenseCategories = [
    { name: 'Food & Dining', icon: '🍽️', color: '#FF6B6B', description: 'Restaurants, groceries, food delivery' },
    { name: 'Transportation', icon: '🚗', color: '#4ECDC4', description: 'Gas, public transport, parking, car maintenance' },
    { name: 'Shopping', icon: '🛍️', color: '#45B7D1', description: 'Clothes, electronics, household items' },
    { name: 'Entertainment', icon: '🎬', color: '#F9CA24', description: 'Movies, games, subscriptions, hobbies' },
    { name: 'Bills & Utilities', icon: '⚡', color: '#F0932B', description: 'Electricity, water, internet, phone' },
    { name: 'Healthcare', icon: '🏥', color: '#EB4D4B', description: 'Doctor visits, medications, insurance' },
    { name: 'Education', icon: '📚', color: '#6C5CE7', description: 'Books, courses, training, school fees' },
    { name: 'Travel', icon: '✈️', color: '#A29BFE', description: 'Flights, hotels, vacation expenses' },
    { name: 'Personal Care', icon: '💄', color: '#FD79A8', description: 'Haircuts, cosmetics, gym membership' },
    { name: 'Housing', icon: '🏠', color: '#2D3436', description: 'Rent, mortgage, home maintenance' },
    { name: 'Insurance', icon: '🛡️', color: '#00B894', description: 'Life, health, auto insurance' },
    { name: 'Taxes', icon: '🧾', color: '#6C5CE7', description: 'Income tax, property tax' },
    { name: 'Subscriptions', icon: '📱', color: '#0984E3', description: 'Software, streaming services, memberships' },
    { name: 'Gifts & Donations', icon: '🎁', color: '#E84393', description: 'Gifts, charitable donations' },
    { name: 'Other', icon: '📋', color: '#636E72', description: 'Miscellaneous expenses' },
  ];

  // Create default categories for income
  const incomeCategories = [
    { name: 'Salary', icon: '💼', color: '#00B894', description: 'Regular employment income' },
    { name: 'Freelance', icon: '💻', color: '#00CEC9', description: 'Freelance and contract work' },
    { name: 'Investment', icon: '📈', color: '#FDCB6E', description: 'Dividends, capital gains, interest' },
    { name: 'Business', icon: '🏢', color: '#E17055', description: 'Business income and profits' },
    { name: 'Rental Income', icon: '🏘️', color: '#A29BFE', description: 'Property rental income' },
    { name: 'Side Hustle', icon: '⚡', color: '#FD79A8', description: 'Part-time jobs, gig economy' },
    { name: 'Gift', icon: '🎁', color: '#D63031', description: 'Gifts and bonuses' },
    { name: 'Refund', icon: '💸', color: '#00B894', description: 'Tax refunds, cashbacks' },
    { name: 'Other Income', icon: '💰', color: '#74B9FF', description: 'Other sources of income' },
  ];

  // Seed expense categories
  console.log('📁 Creating expense categories...');
  for (const category of expenseCategories) {
    await prisma.category.upsert({
      where: {
        name_userId_type: {
          name: category.name,
          userId: null,
          type: 'expense',
        },
      },
      update: {},
      create: {
        ...category,
        type: 'expense',
        isDefault: true,
        userId: null,
      },
    });
  }

  // Seed income categories
  console.log('📁 Creating income categories...');
  for (const category of incomeCategories) {
    await prisma.category.upsert({
      where: {
        name_userId_type: {
          name: category.name,
          userId: null,
          type: 'income',
        },
      },
      update: {},
      create: {
        ...category,
        type: 'income',
        isDefault: true,
        userId: null,
      },
    });
  }

  // Create demo admin user
  console.log('👤 Creating demo admin user...');
  const hashedAdminPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@balancio.com' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@balancio.com',
      password: hashedAdminPassword,
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      preferences: {
        create: {
          currency: 'USD',
          timezone: 'UTC',
          notifications: {
            create: {
              email: true,
              push: true,
              budgetAlerts: true,
              goalMilestones: true,
            },
          },
          privacy: {
            create: {
              profileVisible: false,
              dataSharing: false,
            },
          },
        },
      },
    },
  });

  // Create multiple demo users for testing
  const demoUsers = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@balancio.com',
      password: await bcrypt.hash('demo123', 12),
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@balancio.com', 
      password: await bcrypt.hash('demo123', 12),
    },
    {
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@balancio.com',
      password: await bcrypt.hash('demo123', 12),
    },
  ];

  console.log('👥 Creating demo users...');
  const createdUsers = [];
  
  for (const userData of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        role: 'user',
        isEmailVerified: true,
        isActive: true,
        preferences: {
          create: {
            currency: 'USD',
            timezone: 'UTC',
            notifications: {
              create: {
                email: true,
                push: true,
                budgetAlerts: true,
                goalMilestones: true,
              },
            },
            privacy: {
              create: {
                profileVisible: false,
                dataSharing: false,
              },
            },
          },
        },
      },
    });
    createdUsers.push(user);
  }

  const demoUser = createdUsers.find(user => user.email === 'demo@balancio.com')!;

  // Create comprehensive demo data for users
  console.log('📊 Creating comprehensive demo data...');
  
  // Get categories for demo data
  const categories = await prisma.category.findMany();
  const foodCategory = categories.find(c => c.name === 'Food & Dining' && c.type === 'expense');
  const transportCategory = categories.find(c => c.name === 'Transportation' && c.type === 'expense');
  const housingCategory = categories.find(c => c.name === 'Housing' && c.type === 'expense');
  const entertainmentCategory = categories.find(c => c.name === 'Entertainment' && c.type === 'expense');
  const salaryCategory = categories.find(c => c.name === 'Salary' && c.type === 'income');
  const freelanceCategory = categories.find(c => c.name === 'Freelance' && c.type === 'income');

  if (!foodCategory || !salaryCategory) {
    console.error('Required categories not found');
    return;
  }

  // Create expenses for demo user
  console.log('💸 Creating demo expenses...');
  const expenseData = [
    {
      categoryId: foodCategory.id,
      title: 'Grocery Shopping',
      description: 'Weekly grocery shopping at supermarket',
      amount: 85.50,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      paymentMethod: 'card',
      location: 'Fresh Market',
      tags: ['grocery', 'weekly'],
    },
    {
      categoryId: foodCategory.id,
      title: 'Lunch at Downtown Cafe',
      description: 'Business lunch with client',
      amount: 45.50,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      paymentMethod: 'card',
      location: 'Downtown Cafe',
      tags: ['business', 'lunch'],
    },
    {
      categoryId: transportCategory?.id || foodCategory.id,
      title: 'Gas Station',
      description: 'Fill up gas tank',
      amount: 60.00,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      paymentMethod: 'card',
      location: 'Shell Station',
      tags: ['gas', 'transportation'],
    },
    {
      categoryId: entertainmentCategory?.id || foodCategory.id,
      title: 'Netflix Subscription',
      description: 'Monthly Netflix subscription',
      amount: 15.99,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      paymentMethod: 'card',
      tags: ['subscription', 'entertainment'],
    },
    {
      categoryId: housingCategory?.id || foodCategory.id,
      title: 'Monthly Rent',
      description: 'Apartment rent payment',
      amount: 1200.00,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      paymentMethod: 'bank_transfer',
      tags: ['rent', 'housing'],
    },
  ];

  for (const expense of expenseData) {
    await prisma.expense.create({
      data: {
        ...expense,
        userId: demoUser.id,
        isRecurring: false,
        isActive: true,
      },
    });
  }

  // Create income records
  console.log('💰 Creating demo income...');
  const incomeData = [
    {
      categoryId: salaryCategory.id,
      title: 'Monthly Salary',
      description: 'Regular monthly salary payment',
      amount: 5000.00,
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      source: 'salary',
      tags: ['salary', 'monthly'],
      isRecurring: true,
      recurrence: {
        create: {
          type: 'monthly',
          interval: 1,
          nextDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        },
      },
    },
    {
      categoryId: freelanceCategory?.id || salaryCategory.id,
      title: 'Freelance Project',
      description: 'Website development project',
      amount: 1500.00,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      source: 'freelance',
      tags: ['freelance', 'web-dev'],
      isRecurring: false,
    },
  ];

  for (const income of incomeData) {
    await prisma.income.create({
      data: {
        ...income,
        userId: demoUser.id,
        isActive: true,
      },
    });
  }

  // Create budgets
  console.log('📊 Creating demo budgets...');
  const currentMonth = new Date();
  currentMonth.setDate(1);
  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(0);

  const budgetData = [
    {
      categoryId: foodCategory.id,
      name: 'Monthly Food Budget',
      description: 'Budget for dining and groceries',
      amount: 800.00,
      spent: 131.00,
      period: 'monthly',
      startDate: currentMonth,
      endDate: nextMonth,
      alertThreshold: 80,
    },
    {
      categoryId: transportCategory?.id,
      name: 'Transportation Budget',
      description: 'Monthly transportation expenses',
      amount: 300.00,
      spent: 60.00,
      period: 'monthly',
      startDate: currentMonth,
      endDate: nextMonth,
      alertThreshold: 75,
    },
    {
      categoryId: entertainmentCategory?.id,
      name: 'Entertainment Budget',
      description: 'Monthly entertainment and subscriptions',
      amount: 150.00,
      spent: 15.99,
      period: 'monthly',
      startDate: currentMonth,
      endDate: nextMonth,
      alertThreshold: 90,
    },
  ];

  for (const budget of budgetData) {
    if (budget.categoryId) {
      await prisma.budget.create({
        data: {
          ...budget,
          userId: demoUser.id,
          isActive: true,
          notifications: {
            create: {
              enabled: true,
              thresholds: [50, 75, 90, 100],
            },
          },
        },
      });
    }
  }

  // Create financial goals
  console.log('🎯 Creating demo goals...');
  const goalData = [
    {
      name: 'Emergency Fund',
      description: '6 months of expenses for emergency situations',
      targetAmount: 10000.00,
      currentAmount: 1500.00,
      targetDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
      category: 'emergency_fund',
      milestones: [
        { amount: 2500.00, note: '25% milestone' },
        { amount: 5000.00, note: '50% milestone' },
        { amount: 7500.00, note: '75% milestone' },
      ],
      contributions: [
        {
          amount: 1000.00,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          note: 'Initial contribution',
        },
        {
          amount: 500.00,
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          note: 'Bonus contribution',
        },
      ],
    },
    {
      name: 'Vacation Fund',
      description: 'Save for summer vacation to Europe',
      targetAmount: 5000.00,
      currentAmount: 750.00,
      targetDate: new Date(Date.now() + 8 * 30 * 24 * 60 * 60 * 1000),
      category: 'vacation',
      milestones: [
        { amount: 1250.00, note: '25% milestone' },
        { amount: 2500.00, note: '50% milestone' },
        { amount: 3750.00, note: '75% milestone' },
      ],
      contributions: [
        {
          amount: 500.00,
          date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          note: 'Initial savings',
        },
        {
          amount: 250.00,
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          note: 'Monthly contribution',
        },
      ],
    },
    {
      name: 'New Car Fund',
      description: 'Save for a new car down payment',
      targetAmount: 15000.00,
      currentAmount: 2000.00,
      targetDate: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000),
      category: 'car',
      milestones: [
        { amount: 5000.00, note: 'First milestone' },
        { amount: 10000.00, note: 'Two-thirds milestone' },
      ],
      contributions: [
        {
          amount: 2000.00,
          date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          note: 'Starting amount',
        },
      ],
    },
  ];

  for (const goal of goalData) {
    await prisma.goal.create({
      data: {
        userId: demoUser.id,
        name: goal.name,
        description: goal.description,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate,
        status: 'active',
        category: goal.category,
        isActive: true,
        milestones: {
          create: goal.milestones,
        },
        contributions: {
          create: goal.contributions,
        },
      },
    });
  }

  // Create sample notifications
  console.log('🔔 Creating demo notifications...');
  const notificationData = [
    {
      type: 'budget_alert',
      title: 'Budget Alert',
      message: 'You have spent 80% of your Food & Dining budget for this month.',
      priority: 'medium',
      isRead: false,
    },
    {
      type: 'goal_milestone',
      title: 'Goal Milestone Achieved!',
      message: 'Congratulations! You have reached 25% of your Emergency Fund goal.',
      priority: 'high',
      isRead: false,
    },
    {
      type: 'system',
      title: 'Welcome to Balancio!',
      message: 'Thank you for joining Balancio. Start by setting up your first budget.',
      priority: 'low',
      isRead: true,
    },
    {
      type: 'reminder',
      title: 'Monthly Review',
      message: 'It\'s time for your monthly financial review. Check your spending patterns.',
      priority: 'medium',
      isRead: false,
    },
  ];

  for (const notification of notificationData) {
    await prisma.notification.create({
      data: {
        ...notification,
        userId: demoUser.id,
        data: null,
      },
    });
  }

  console.log('✅ Database seed completed successfully!');
  console.log('\n📋 Demo Accounts Created:');
  console.log('🔑 Admin: admin@balancio.com / admin123');
  console.log('👤 John:  john@balancio.com / demo123');
  console.log('👤 Jane:  jane@balancio.com / demo123');
  console.log('👤 Demo:  demo@balancio.com / demo123');
  
  console.log('\n📊 Sample Data Created:');
  console.log('✅ 15 Expense Categories');
  console.log('✅ 9 Income Categories');
  console.log('✅ 5 Demo Expenses');
  console.log('✅ 2 Demo Income Records');
  console.log('✅ 3 Demo Budgets');
  console.log('✅ 3 Financial Goals');
  console.log('✅ 4 Sample Notifications');
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Run: pnpm db:generate');
  console.log('2. Run: pnpm dev');
  console.log('3. Test API endpoints');
  console.log('4. Use Prisma Studio: pnpm db:studio');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });