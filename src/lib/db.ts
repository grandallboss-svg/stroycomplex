import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Флаг для предотвращения повторной инициализации
let isInitialized = false

// Инициализация базы данных с демо данными
export async function ensureDbInitialized() {
  if (isInitialized) return

  try {
    // Проверяем есть ли пользователи
    const usersCount = await db.user.count()

    if (usersCount === 0) {
      console.log('🔧 Initializing database with demo data...')

      // Создаём демо пользователя
      const hashedPassword = await bcrypt.hash('admin123', 10)
      const adminUser = await db.user.create({
        data: {
          email: 'admin@stroytest.ru',
          name: 'Администратор',
          password: hashedPassword,
          role: 'ADMIN',
          position: 'Руководитель проекта',
          phone: '+7 (999) 123-45-67',
        }
      })

      // Создаём направление
      const direction = await db.workDirection.create({
        data: {
          name: 'Отопление и вентиляция',
          code: 'ОВ',
          description: 'Системы отопления, вентиляции и кондиционирования',
          color: '#3B82F6',
        }
      })

      // Создаём объект
      const building = await db.building.create({
        data: {
          name: 'ЖК "Новый город"',
          address: 'г. Москва, ул. Строителей, д. 15',
          floors: 12,
          status: 'ACTIVE',
        }
      })

      // Создаём план работ
      const workPlan = await db.workPlan.create({
        data: {
          name: 'Монтаж вентиляции корпуса А',
          contractNumber: 'ДГ-2024-001',
          workDirectionId: direction.id,
          buildingId: building.id,
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-06-30'),
          totalAmount: 5000000,
          status: 'IN_PROGRESS',
          progress: 35,
        }
      })

      // Создаём сотрудников
      const employees = await Promise.all([
        db.employee.create({
          data: {
            fullName: 'Иванов Иван Петрович',
            position: 'Монтажник',
            phone: '+7 (999) 111-22-33',
            monthlySalary: 85000,
            status: 'ACTIVE',
          }
        }),
        db.employee.create({
          data: {
            fullName: 'Петров Сергей Николаевич',
            position: 'Сварщик',
            phone: '+7 (999) 222-33-44',
            monthlySalary: 95000,
            status: 'ACTIVE',
          }
        }),
        db.employee.create({
          data: {
            fullName: 'Сидоров Алексей Викторович',
            position: 'Прораб',
            phone: '+7 (999) 333-44-55',
            monthlySalary: 120000,
            status: 'ACTIVE',
          }
        }),
      ])

      // Создаём инструктажи по технике безопасности
      await Promise.all([
        db.safetyBriefing.create({
          data: {
            name: 'Вводный инструктаж',
            description: 'Первичный инструктаж для новых сотрудников',
            frequency: 'ONCE',
          }
        }),
        db.safetyBriefing.create({
          data: {
            name: 'Инструктаж по пожарной безопасности',
            description: 'Обучение правилам пожарной безопасности',
            frequency: 'QUARTERLY',
          }
        }),
        db.safetyBriefing.create({
          data: {
            name: 'Инструктаж на рабочем месте',
            description: 'Инструктаж непосредственно на рабочем месте',
            frequency: 'MONTHLY',
          }
        }),
      ])

      // Создаём демо наряд
      await db.installationOrder.create({
        data: {
          number: 'НМ-001',
          name: 'Монтаж воздуховодов 5 этаж',
          workPlanId: workPlan.id,
          description: 'Монтаж приточной и вытяжной вентиляции на 5 этаже корпуса А',
          location: 'Корпус А, этаж 5',
          deadline: new Date('2024-03-15'),
          priority: 2,
          status: 'IN_PROGRESS',
          assigneeIds: [employees[0].id, employees[1].id],
          assigneeNames: [employees[0].fullName, employees[1].fullName],
        }
      })

      console.log('✅ Database initialized successfully!')
    }

    isInitialized = true
  } catch (error) {
    console.error('❌ Database initialization error:', error)
  }
}
