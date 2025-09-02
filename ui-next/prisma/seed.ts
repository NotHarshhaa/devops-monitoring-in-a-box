import { UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma-server'

async function main() {
  // Create demo admin user
  const hashedPassword = await bcrypt.hash('demo123', 12)
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo Admin',
      password: hashedPassword,
      role: UserRole.ADMIN,
    }
  })

  // Create demo viewer user
  const viewerPassword = await bcrypt.hash('viewer123', 12)
  
  const viewerUser = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      email: 'viewer@example.com',
      name: 'Demo Viewer',
      password: viewerPassword,
      role: UserRole.VIEWER,
    }
  })

  // Create demo editor user
  const editorPassword = await bcrypt.hash('editor123', 12)
  
  const editorUser = await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {},
    create: {
      email: 'editor@example.com',
      name: 'Demo Editor',
      password: editorPassword,
      role: UserRole.EDITOR,
    }
  })

  console.log('Demo users created:')
  console.log('- Admin: demo@example.com / demo123')
  console.log('- Viewer: viewer@example.com / viewer123')
  console.log('- Editor: editor@example.com / editor123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
