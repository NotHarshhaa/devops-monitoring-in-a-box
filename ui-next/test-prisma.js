// Simple test to check if Prisma client works
const { PrismaClient } = require('@prisma/client');

async function testPrisma() {
  try {
    console.log('Creating Prisma client...');
    const prisma = new PrismaClient();
    
    console.log('Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`Found ${userCount} users in database`);
    
    await prisma.$disconnect();
    console.log('Prisma test successful!');
  } catch (error) {
    console.error('Prisma test failed:', error);
  }
}

testPrisma();
