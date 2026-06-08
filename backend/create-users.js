const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createUsers() {
  try {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const employeePassword = await bcrypt.hash('employee123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@mysecretdrawer.com' },
      update: {},
      create: {
        email: 'admin@mysecretdrawer.com',
        password: adminPassword,
        name: 'Super Admin',
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log('✅ Admin created:', admin.email);

    const employee = await prisma.user.upsert({
      where: { email: 'employee@mysecretdrawer.com' },
      update: {},
      create: {
        email: 'employee@mysecretdrawer.com',
        password: employeePassword,
        name: 'Staff Member',
        role: 'EMPLOYEE',
        isActive: true
      }
    });
    console.log('✅ Employee created:', employee.email);

    const customer = await prisma.user.upsert({
      where: { email: 'customer@test.com' },
      update: {},
      create: {
        email: 'customer@test.com',
        password: customerPassword,
        name: 'Test Customer',
        role: 'CUSTOMER',
        isActive: true
      }
    });
    console.log('✅ Customer created:', customer.email);

    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔴 ADMIN:');
    console.log('   Email: admin@mysecretdrawer.com');
    console.log('   Password: admin123');
    console.log('🔵 EMPLOYEE:');
    console.log('   Email: employee@mysecretdrawer.com');
    console.log('   Password: employee123');
    console.log('🟢 CUSTOMER:');
    console.log('   Email: customer@test.com');
    console.log('   Password: customer123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();