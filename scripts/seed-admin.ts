import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Criando admin...')

  const email = 'jc@dimas.com'
  const senha = 'dimas2026'
  const senhaHash = await hash(senha, 10)

  const usuario = await prisma.usuario.upsert({
    where: { email },
    update: {
      senha_hash: senhaHash,
    },
    create: {
      email,
      senha_hash: senhaHash,
    },
  })

  console.log('✅ Admin criado com sucesso!')
  console.log('   Email: jc@dimas.com')
  console.log('   Senha: dimas2026')
  console.log('   ID: ', usuario.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
