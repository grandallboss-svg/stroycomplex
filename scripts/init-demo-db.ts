// Скрипт инициализации демо базы данных
// Запускается при сборке Docker образа

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('🔧 Initializing demo database...')

  // Создаём администратора
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await db.user.create({
    data: {
      email: 'admin@stroytest.ru',
      name: 'Администратор',
      password: hashedPassword,
      role: 'ADMIN',
      position: 'Руководитель проекта',
      phone: '+7 (999) 123-45-67',
    }
  })
  console.log('✅ Created admin user')

  // Создаём направления работ
  const directions = await Promise.all([
    db.workDirection.create({
      data: {
        name: 'Система пожарной безопасности',
        code: 'СПБ',
        description: 'Автоматическая пожарная сигнализация, система оповещения и управления эвакуацией, автоматическое пожаротушение, дымоудаление',
        color: '#DC2626',
        icon: 'Flame',
      }
    }),
    db.workDirection.create({
      data: {
        name: 'Сети связи',
        code: 'СС',
        description: 'Структурированные кабельные системы, ВОЛС, телефонная связь, СКУД, видеонаблюдение',
        color: '#2563EB',
        icon: 'Network',
      }
    }),
    db.workDirection.create({
      data: {
        name: 'Автоматизация вентиляции',
        code: 'АСУВ',
        description: 'Автоматическое управление системами приточно-вытяжной вентиляции, кондиционирования, диспетчеризация',
        color: '#059669',
        icon: 'Wind',
      }
    }),
  ])
  console.log('✅ Created 3 work directions')

  // Создаём объект строительства
  const building = await db.building.create({
    data: {
      name: 'ЖК "Пламент"',
      address: 'г. Улан-Удэ, ул. Ключевская, 90Д',
      floors: 15,
      totalArea: 22500,
      status: 'ACTIVE',
    }
  })
  console.log('✅ Created building')

  // Создаём планы работ с этапами
  const plan1 = await db.workPlan.create({
    data: {
      name: 'Система пожарной безопасности - ЖК "Пламент"',
      contractNumber: 'ИМП-ДТТ/2026-001',
      workDirectionId: directions[0].id,
      buildingId: building.id,
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-05-31'),
      totalAmount: 12850000,
      status: 'IN_PROGRESS',
      notes: 'Полный комплекс работ по пожарной безопасности: АПС, СОУЭ, АУПТ, дымоудаление. Заказчик: ООО "ДТТ"',
      stages: {
        create: [
          { name: 'Подготовительные работы и разметка', description: 'Этап 1: Подготовительные работы и разметка', order: 1, startDate: new Date('2026-03-01'), endDate: new Date('2026-03-06'), plannedAmount: 350000, actualAmount: 350000, percentComplete: 100, status: 'COMPLETED' },
          { name: 'Прокладка кабельных трасс', description: 'Этап 2: Прокладка кабельных трасс', order: 2, startDate: new Date('2026-03-07'), endDate: new Date('2026-03-22'), plannedAmount: 1850000, actualAmount: 1572500, percentComplete: 85, status: 'IN_PROGRESS' },
          { name: 'Монтаж пожарных извещателей', description: 'Этап 3: Монтаж пожарных извещателей', order: 3, startDate: new Date('2026-03-23'), endDate: new Date('2026-04-12'), plannedAmount: 2400000, actualAmount: 960000, percentComplete: 40, status: 'IN_PROGRESS' },
          { name: 'Монтаж системы оповещения', description: 'Этап 4: Монтаж системы оповещения', order: 4, startDate: new Date('2026-04-13'), endDate: new Date('2026-04-28'), plannedAmount: 2200000, actualAmount: 330000, percentComplete: 15, status: 'IN_PROGRESS' },
          { name: 'Монтаж приборов управления', description: 'Этап 5: Монтаж приборов управления', order: 5, startDate: new Date('2026-04-29'), endDate: new Date('2026-05-09'), plannedAmount: 1800000, status: 'PENDING' },
          { name: 'Монтаж системы дымоудаления', description: 'Этап 6: Монтаж системы дымоудаления', order: 6, startDate: new Date('2026-05-10'), endDate: new Date('2026-05-22'), plannedAmount: 1650000, status: 'PENDING' },
          { name: 'Монтаж автоматического пожаротушения', description: 'Этап 7: Монтаж автоматического пожаротушения', order: 7, startDate: new Date('2026-05-23'), endDate: new Date('2026-06-10'), plannedAmount: 2100000, status: 'PENDING' },
          { name: 'Пусконаладочные работы', description: 'Этап 8: Пусконаладочные работы', order: 8, startDate: new Date('2026-06-11'), endDate: new Date('2026-06-21'), plannedAmount: 500000, status: 'PENDING' },
        ]
      }
    }
  })

  const plan2 = await db.workPlan.create({
    data: {
      name: 'Сети связи и СКУД - ЖК "Пламент"',
      contractNumber: 'ИМП-ДТТ/2026-002',
      workDirectionId: directions[1].id,
      buildingId: building.id,
      startDate: new Date('2026-03-10'),
      endDate: new Date('2026-05-20'),
      totalAmount: 8750000,
      status: 'IN_PROGRESS',
      notes: 'СКС, ВОЛС, телефония, видеонаблюдение, СКУД. Подключение к сети Интернет',
      stages: {
        create: [
          { name: 'Монтаж телекоммуникационных шкафов', description: 'Этап 1: Монтаж телекоммуникационных шкафов', order: 1, startDate: new Date('2026-03-10'), endDate: new Date('2026-03-17'), plannedAmount: 650000, actualAmount: 650000, percentComplete: 100, status: 'COMPLETED' },
          { name: 'Прокладка кабель-каналов и лотков', description: 'Этап 2: Прокладка кабель-каналов и лотков', order: 2, startDate: new Date('2026-03-18'), endDate: new Date('2026-04-01'), plannedAmount: 1200000, actualAmount: 840000, percentComplete: 70, status: 'IN_PROGRESS' },
          { name: 'Прокладка ВОЛС', description: 'Этап 3: Прокладка ВОЛС', order: 3, startDate: new Date('2026-04-02'), endDate: new Date('2026-04-14'), plannedAmount: 1850000, actualAmount: 555000, percentComplete: 30, status: 'IN_PROGRESS' },
          { name: 'Монтаж СКС и телефонии', description: 'Этап 4: Монтаж СКС и телефонии', order: 4, startDate: new Date('2026-04-15'), endDate: new Date('2026-05-03'), plannedAmount: 1600000, actualAmount: 160000, percentComplete: 10, status: 'IN_PROGRESS' },
          { name: 'Монтаж видеонаблюдения', description: 'Этап 5: Монтаж видеонаблюдения', order: 5, startDate: new Date('2026-05-04'), endDate: new Date('2026-05-14'), plannedAmount: 1450000, status: 'PENDING' },
          { name: 'Монтаж СКУД', description: 'Этап 6: Монтаж СКУД', order: 6, startDate: new Date('2026-05-15'), endDate: new Date('2026-05-23'), plannedAmount: 1200000, status: 'PENDING' },
          { name: 'Пусконаладочные работы', description: 'Этап 7: Пусконаладочные работы', order: 7, startDate: new Date('2026-05-24'), endDate: new Date('2026-05-30'), plannedAmount: 800000, status: 'PENDING' },
        ]
      }
    }
  })

  const plan3 = await db.workPlan.create({
    data: {
      name: 'Автоматизация вентиляции - ЖК "Пламент"',
      contractNumber: 'ИМП-ДТТ/2026-003',
      workDirectionId: directions[2].id,
      buildingId: building.id,
      startDate: new Date('2026-03-15'),
      endDate: new Date('2026-05-15'),
      totalAmount: 5420000,
      status: 'IN_PROGRESS',
      notes: 'АСУ приточно-вытяжной вентиляцией, кондиционирование, диспетчеризация',
      stages: {
        create: [
          { name: 'Монтаж щитов управления', description: 'Этап 1: Монтаж щитов управления', order: 1, startDate: new Date('2026-03-15'), endDate: new Date('2026-03-23'), plannedAmount: 850000, actualAmount: 510000, percentComplete: 60, status: 'IN_PROGRESS' },
          { name: 'Прокладка кабелей управления', description: 'Этап 2: Прокладка кабелей управления', order: 2, startDate: new Date('2026-03-24'), endDate: new Date('2026-04-05'), plannedAmount: 720000, actualAmount: 144000, percentComplete: 20, status: 'IN_PROGRESS' },
          { name: 'Монтаж датчиков и исполнительных механизмов', description: 'Этап 3: Монтаж датчиков и исполнительных механизмов', order: 3, startDate: new Date('2026-04-06'), endDate: new Date('2026-04-21'), plannedAmount: 1350000, actualAmount: 67500, percentComplete: 5, status: 'IN_PROGRESS' },
          { name: 'Монтаж диспетчерского пункта', description: 'Этап 4: Монтаж диспетчерского пункта', order: 4, startDate: new Date('2026-04-22'), endDate: new Date('2026-05-02'), plannedAmount: 1100000, status: 'PENDING' },
          { name: 'Пусконаладочные работы', description: 'Этап 5: Пусконаладочные работы', order: 5, startDate: new Date('2026-05-03'), endDate: new Date('2026-05-15'), plannedAmount: 1400000, status: 'PENDING' },
        ]
      }
    }
  })
  console.log('✅ Created 3 work plans with stages')

  // Создаём сотрудников
  const employees = await Promise.all([
    db.employee.create({
      data: {
        fullName: 'Иванов Иван Петрович',
        shortName: 'Иванов И.П.',
        position: 'Монтажник',
        specialty: 'Слесарь-монтажник',
        phone: '+7 (999) 111-22-33',
        hourlyRate: 500,
        monthlySalary: 85000,
        status: 'ACTIVE',
      }
    }),
    db.employee.create({
      data: {
        fullName: 'Петров Сергей Николаевич',
        shortName: 'Петров С.Н.',
        position: 'Сварщик',
        specialty: 'Электросварщик',
        phone: '+7 (999) 222-33-44',
        hourlyRate: 550,
        monthlySalary: 95000,
        status: 'ACTIVE',
      }
    }),
    db.employee.create({
      data: {
        fullName: 'Сидоров Алексей Викторович',
        shortName: 'Сидоров А.В.',
        position: 'Прораб',
        specialty: 'Инженер ПТО',
        phone: '+7 (999) 333-44-55',
        hourlyRate: 700,
        monthlySalary: 120000,
        status: 'ACTIVE',
      }
    }),
    db.employee.create({
      data: {
        fullName: 'Козлов Дмитрий Александрович',
        shortName: 'Козлов Д.А.',
        position: 'Электромонтажник',
        specialty: 'Электромонтажник',
        phone: '+7 (999) 444-55-66',
        hourlyRate: 480,
        monthlySalary: 82000,
        status: 'ACTIVE',
      }
    }),
    db.employee.create({
      data: {
        fullName: 'Морозов Павел Игоревич',
        shortName: 'Морозов П.И.',
        position: 'Инженер',
        specialty: 'Инженер АСУ',
        phone: '+7 (999) 555-66-77',
        hourlyRate: 650,
        monthlySalary: 110000,
        status: 'ACTIVE',
      }
    }),
  ])
  console.log('✅ Created 5 employees')

  // Создаём инструктажи по технике безопасности
  await Promise.all([
    db.safetyBriefing.create({
      data: {
        name: 'Вводный инструктаж',
        description: 'Первичный инструктаж для новых сотрудников',
        required: true,
        periodDays: null,
      }
    }),
    db.safetyBriefing.create({
      data: {
        name: 'Инструктаж по пожарной безопасности',
        description: 'Обучение правилам пожарной безопасности на объекте',
        required: true,
        periodDays: 90,
      }
    }),
    db.safetyBriefing.create({
      data: {
        name: 'Инструктаж на рабочем месте',
        description: 'Инструктаж непосредственно на рабочем месте',
        required: true,
        periodDays: 30,
      }
    }),
    db.safetyBriefing.create({
      data: {
        name: 'Инструктаж по электробезопасности',
        description: 'Правила работы с электрооборудованием',
        required: true,
        periodDays: 365,
      }
    }),
  ])
  console.log('✅ Created 4 safety briefings')

  // Создаём наряды на монтаж
  await db.installationOrder.create({
    data: {
      number: 'НМ-001',
      name: 'Монтаж воздуховодов 5 этаж',
      workPlanId: plan3.id,
      description: 'Монтаж приточной и вытяжной вентиляции на 5 этаже',
      location: 'Корпус А, этаж 5',
      deadline: new Date('2026-03-25'),
      priority: 2,
      status: 'IN_PROGRESS',
      items: {
        create: [
          { name: 'Монтаж воздуховода 400x200', unit: 'м', quantity: 45, unitPrice: 2500 },
          { name: 'Монтаж воздуховода 300x150', unit: 'м', quantity: 30, unitPrice: 2200 },
          { name: 'Установка решётки приточной', unit: 'шт', quantity: 12, unitPrice: 1500 },
        ]
      }
    }
  })

  await db.installationOrder.create({
    data: {
      number: 'НМ-002',
      name: 'Прокладка кабеля КПСнг 1x2x0.5',
      workPlanId: plan1.id,
      description: 'Прокладка кабеля пожарной сигнализации',
      location: 'Корпус А, этажи 1-5',
      deadline: new Date('2026-03-20'),
      priority: 3,
      status: 'IN_PROGRESS',
      items: {
        create: [
          { name: 'Прокладка кабеля КПСнг 1x2x0.5', unit: 'м', quantity: 850, unitPrice: 120 },
          { name: 'Монтаж распаячной коробки', unit: 'шт', quantity: 15, unitPrice: 800 },
        ]
      }
    }
  })
  console.log('✅ Created 2 installation orders')

  console.log('🎉 Demo database initialized successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error initializing demo database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
