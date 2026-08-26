import 'dotenv/config'
import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const username = process.env.ADMIN_LOGIN
  const passwordHash = process.env.ADMIN_PASSWORD_HASH

  if (!username) {
    throw new Error('ADMIN_LOGIN is missing')
  }

  if (!passwordHash) {
    throw new Error('ADMIN_PASSWORD_HASH is missing')
  }

  const admin = await prisma.user.upsert({
    where: {
      username
    },
    update: {
      passwordHash,
      role: UserRole.ADMIN,
      active: true
    },
    create: {
      name: 'Administrator',
      username,
      passwordHash,
      role: UserRole.ADMIN,
      active: true
    }
  })

  
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })