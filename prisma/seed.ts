import { PrismaClient, UserRole, BuildingStatus, WorkPlanStatus, WorkStageStatus, DocumentStatus, EmployeeStatus, PaymentStatus, InstallationOrderStatus, HiddenWorkActStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Заполнение базы данных: ЖК "Пламент"...')

  // Очищаем существующие данные
  await prisma.safetyRecord.deleteMany()
  await prisma.safetyBriefing.deleteMany()
  await prisma.installationScheme.deleteMany()
  await prisma.orderAssignee.deleteMany()
  await prisma.installationOrder.deleteMany()
  await prisma.salaryPayment.deleteMany()
  await prisma.workAssignment.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.documentKS2Item.deleteMany()
  await prisma.documentKS3.deleteMany()
  await prisma.documentKS2.deleteMany()
  await prisma.hiddenWorkAct.deleteMany()
  await prisma.workStage.deleteMany()
  await prisma.workPlan.deleteMany()
  await prisma.installationScheme.deleteMany()
  await prisma.building.deleteMany()
  await prisma.workDirection.deleteMany()
  await prisma.user.deleteMany()

  // ============================================
  // ПОЛЬЗОВАТЕЛИ
  // ============================================
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@stroytest.ru',
        password: hashedPassword,
        name: 'Бадмаев Виктор Олегович',
        phone: '+7 (902) 123-45-67',
        role: UserRole.ADMIN,
        position: 'Директор ООО "Импульс"',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'manager@stroytest.ru',
        password: hashedPassword,
        name: 'Цыденова Анна Борисовна',
        phone: '+7 (902) 234-56-78',
        role: UserRole.MANAGER,
        position: 'Менеджер проекта',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'foreman@stroytest.ru',
        password: hashedPassword,
        name: 'Доржиев Баир Викторович',
        phone: '+7 (902) 345-67-89',
        role: UserRole.FOREMAN,
        position: 'Главный прораб',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'accountant@stroytest.ru',
        password: hashedPassword,
        name: 'Ринчинова Сэсэгма Николаевна',
        phone: '+7 (902) 456-78-90',
        role: UserRole.ACCOUNTANT,
        position: 'Главный бухгалтер',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'engineer@stroytest.ru',
        password: hashedPassword,
        name: 'Жамбалов Тумэн Батоевич',
        phone: '+7 (902) 567-89-01',
        role: UserRole.MANAGER,
        position: 'Главный инженер',
        isActive: true,
      },
    }),
  ])
  console.log(`✅ Создано ${users.length} пользователей`)

  // ============================================
  // НАПРАВЛЕНИЯ РАБОТ
  // ============================================
  const directions = await Promise.all([
    prisma.workDirection.create({
      data: {
        name: 'Система пожарной безопасности',
        code: 'СПБ',
        description: 'Автоматическая пожарная сигнализация, система оповещения и управления эвакуацией, автоматическое пожаротушение, дымоудаление',
        color: '#DC2626',
        icon: 'Flame',
        isActive: true,
      },
    }),
    prisma.workDirection.create({
      data: {
        name: 'Сети связи',
        code: 'СС',
        description: 'Структурированные кабельные системы, ВОЛС, телефонная связь, СКУД, видеонаблюдение',
        color: '#2563EB',
        icon: 'Network',
        isActive: true,
      },
    }),
    prisma.workDirection.create({
      data: {
        name: 'Автоматизация вентиляции',
        code: 'АСУВ',
        description: 'Автоматическое управление системами приточно-вытяжной вентиляции, кондиционирования, диспетчеризация',
        color: '#059669',
        icon: 'Wind',
        isActive: true,
      },
    }),
  ])
  console.log(`✅ Создано ${directions.length} направлений работ`)

  // ============================================
  // ОБЪЕКТЫ
  // ============================================
  const building = await prisma.building.create({
    data: {
      name: 'ЖК "Пламент"',
      address: 'г. Улан-Удэ, ул. Ключевская, 90Д',
      floors: 15,
      totalArea: 22500,
      status: BuildingStatus.ACTIVE,
    },
  })
  console.log(`✅ Создан объект: ${building.name}`)

  // ============================================
  // ПЛАНЫ РАБОТ
  // ============================================
  const workPlans = await Promise.all([
    // Система пожарной безопасности
    prisma.workPlan.create({
      data: {
        name: 'Система пожарной безопасности - ЖК "Пламент"',
        contractNumber: 'ИМП-ДТТ/2026-001',
        workDirectionId: directions[0].id,
        buildingId: building.id,
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-05-31'),
        totalAmount: 12850000,
        status: WorkPlanStatus.IN_PROGRESS,
        notes: 'Полный комплекс работ по пожарной безопасности: АПС, СОУЭ, АУПТ, дымоудаление. Заказчик: ООО "ДТТ"',
      },
    }),
    // Сети связи
    prisma.workPlan.create({
      data: {
        name: 'Сети связи и СКУД - ЖК "Пламент"',
        contractNumber: 'ИМП-ДТТ/2026-002',
        workDirectionId: directions[1].id,
        buildingId: building.id,
        startDate: new Date('2026-03-10'),
        endDate: new Date('2026-05-20'),
        totalAmount: 8750000,
        status: WorkPlanStatus.IN_PROGRESS,
        notes: 'СКС, ВОЛС, телефония, видеонаблюдение, СКУД. Подключение к сети Интернет',
      },
    }),
    // Автоматизация вентиляции
    prisma.workPlan.create({
      data: {
        name: 'Автоматизация вентиляции - ЖК "Пламент"',
        contractNumber: 'ИМП-ДТТ/2026-003',
        workDirectionId: directions[2].id,
        buildingId: building.id,
        startDate: new Date('2026-03-15'),
        endDate: new Date('2026-05-15'),
        totalAmount: 5420000,
        status: WorkPlanStatus.IN_PROGRESS,
        notes: 'АСУ приточно-вытяжной вентиляцией, кондиционирование, диспетчеризация',
      },
    }),
  ])
  console.log(`✅ Создано ${workPlans.length} планов работ`)

  // ============================================
  // ЭТАПЫ РАБОТ - Система пожарной безопасности
  // ============================================
  const stages = []
  
  // Этапы АСПЗ
  const fireStages = [
    { name: 'Подготовительные работы и разметка', days: 5, amount: 350000, progress: 100 },
    { name: 'Прокладка кабельных трасс', days: 15, amount: 1850000, progress: 85 },
    { name: 'Монтаж пожарных извещателей', days: 20, amount: 2400000, progress: 40 },
    { name: 'Монтаж системы оповещения', days: 15, amount: 2200000, progress: 15 },
    { name: 'Монтаж приборов управления', days: 10, amount: 1800000, progress: 0 },
    { name: 'Монтаж системы дымоудаления', days: 12, amount: 1650000, progress: 0 },
    { name: 'Монтаж автоматического пожаротушения', days: 18, amount: 2100000, progress: 0 },
    { name: 'Пусконаладочные работы', days: 10, amount: 500000, progress: 0 },
  ]
  
  let startDate = new Date('2026-03-01')
  for (let i = 0; i < fireStages.length; i++) {
    const stage = fireStages[i]
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + stage.days)
    
    const created = await prisma.workStage.create({
      data: {
        workPlanId: workPlans[0].id,
        name: stage.name,
        description: `Этап ${i + 1}: ${stage.name}`,
        order: i + 1,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        plannedAmount: stage.amount,
        actualAmount: stage.progress > 0 ? Math.round(stage.amount * stage.progress / 100) : 0,
        percentComplete: stage.progress,
        status: stage.progress === 100 ? WorkStageStatus.COMPLETED : 
                stage.progress > 0 ? WorkStageStatus.IN_PROGRESS : WorkStageStatus.PENDING,
      },
    })
    stages.push(created)
    startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() + 1)
  }

  // Этапы сетей связи
  const networkStages = [
    { name: 'Монтаж телекоммуникационных шкафов', days: 7, amount: 650000, progress: 100 },
    { name: 'Прокладка кабель-каналов и лотков', days: 14, amount: 1200000, progress: 70 },
    { name: 'Прокладка ВОЛС', days: 12, amount: 1850000, progress: 30 },
    { name: 'Монтаж СКС и телефонии', days: 18, amount: 1600000, progress: 10 },
    { name: 'Монтаж видеонаблюдения', days: 10, amount: 1450000, progress: 0 },
    { name: 'Монтаж СКУД', days: 8, amount: 1200000, progress: 0 },
    { name: 'Пусконаладочные работы', days: 6, amount: 800000, progress: 0 },
  ]
  
  startDate = new Date('2026-03-10')
  for (let i = 0; i < networkStages.length; i++) {
    const stage = networkStages[i]
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + stage.days)
    
    const created = await prisma.workStage.create({
      data: {
        workPlanId: workPlans[1].id,
        name: stage.name,
        description: `Этап ${i + 1}: ${stage.name}`,
        order: i + 1,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        plannedAmount: stage.amount,
        actualAmount: stage.progress > 0 ? Math.round(stage.amount * stage.progress / 100) : 0,
        percentComplete: stage.progress,
        status: stage.progress === 100 ? WorkStageStatus.COMPLETED : 
                stage.progress > 0 ? WorkStageStatus.IN_PROGRESS : WorkStageStatus.PENDING,
      },
    })
    stages.push(created)
    startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() + 1)
  }

  // Этапы автоматизации вентиляции
  const ventStages = [
    { name: 'Монтаж щитов управления', days: 8, amount: 850000, progress: 60 },
    { name: 'Прокладка кабелей управления', days: 12, amount: 720000, progress: 20 },
    { name: 'Монтаж датчиков и исполнительных механизмов', days: 15, amount: 1350000, progress: 5 },
    { name: 'Монтаж диспетчерского пункта', days: 10, amount: 1100000, progress: 0 },
    { name: 'Пусконаладочные работы', days: 12, amount: 1400000, progress: 0 },
  ]
  
  startDate = new Date('2026-03-15')
  for (let i = 0; i < ventStages.length; i++) {
    const stage = ventStages[i]
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + stage.days)
    
    const created = await prisma.workStage.create({
      data: {
        workPlanId: workPlans[2].id,
        name: stage.name,
        description: `Этап ${i + 1}: ${stage.name}`,
        order: i + 1,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        plannedAmount: stage.amount,
        actualAmount: stage.progress > 0 ? Math.round(stage.amount * stage.progress / 100) : 0,
        percentComplete: stage.progress,
        status: stage.progress === 100 ? WorkStageStatus.COMPLETED : 
                stage.progress > 0 ? WorkStageStatus.IN_PROGRESS : WorkStageStatus.PENDING,
      },
    })
    stages.push(created)
    startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() + 1)
  }
  
  console.log(`✅ Создано ${stages.length} этапов работ`)

  // ============================================
  // ПЕРСОНАЛ
  // ============================================
  const employees = await Promise.all([
    // Бригада пожарной безопасности
    prisma.employee.create({
      data: {
        fullName: 'Бадмацыренов Сергей Анатольевич',
        shortName: 'Бадмацыренов С.А.',
        phone: '+7 (902) 111-22-33',
        position: 'Бригадир монтажников ОПС',
        specialty: 'Монтажник охранно-пожарной сигнализации 6 разряда',
        hourlyRate: 520,
        monthlySalary: 92000,
        hireDate: new Date('2024-03-15'),
        status: EmployeeStatus.ACTIVE,
      },
    }),
    prisma.employee.create({
      data: {
        fullName: 'Гармаев Баир Батоевич',
        shortName: 'Гармаев Б.Б.',
        phone: '+7 (902) 222-33-44',
        position: 'Монтажник ОПС',
        specialty: 'Монтажник охранно-пожарной сигнализации 5 разряда',
        hourlyRate: 480,
        monthlySalary: 85000,
        hireDate: new Date('2024-05-01'),
        status: EmployeeStatus.ACTIVE,
      },
    }),
    prisma.employee.create({
      data: {
        fullName: 'Дашиев Арюн Жаргалович',
        shortName: 'Дашиев А.Ж.',
        phone: '+7 (902) 333-44-55',
        position: 'Монтажник ОПС',
        specialty: 'Монтажник систем пожаротушения',
        hourlyRate: 470,
        monthlySalary: 82000,
        hireDate: new Date('2024-06-10'),
        status: EmployeeStatus.ACTIVE,
      },
    }),
    // Бригада сетей связи
    prisma.employee.create({
      data: {
        fullName: 'Жапов Владимир Баторович',
        shortName: 'Жапов В.Б.',
        phone: '+7 (902) 444-55-66',
        position: 'Бригадир связи',
        specialty: 'Кабельщик-монтажник 6 разряда',
        hourlyRate: 510,
        monthlySalary: 88000,
        hireDate: new Date('2024-04-01'),
        status: EmployeeStatus.ACTIVE,
      },
    }),
    prisma.employee.create({
      data: {
        fullName: 'Иванов Максим Александрович',
        shortName: 'Иванов М.А.',
        phone: '+7 (902) 555-66-77',
        position: 'Монтажник связи',
        specialty: 'Электромонтажник 5 разряда',
        hourlyRate: 460,
        monthlySalary: 80000,
        hireDate: new Date('2024-07-15'),
        status: EmployeeStatus.ACTIVE,
      },
    }),
    prisma.employee.create({
      data: {
        fullName: 'Лубсанов Геннадий Цыремпилович',
        shortName: 'Лубсанов Г.Ц.',
        phone: '+7 (902) 666-77-88',
        position: 'Монтажник ВОЛС',
        specialty: 'Специалист по волоконно-оптическим линиям',
        hourlyRate: 490,
        monthlySalary: 86000,
        hireDate: new Date('2024-08-01'),
        status: EmployeeStatus.ACTIVE,
      },
    }),
    // Бригада автоматизации
    prisma.employee.create({
      data: {
        fullName: 'Мыльников Андрей Владимирович',
        shortName: 'Мыльников А.В.',
        phone: '+7 (902) 777-88-99',
        position: 'Наладчик КИПиА',
        specialty: 'Наладчик контрольно-измерительных приборов 6 разряда',
        hourlyRate: 540,
        monthlySalary: 95000,
        hireDate: new Date('2024-04-20'),
        status: EmployeeStatus.ACTIVE,
      },
    }),
    prisma.employee.create({
      data: {
        fullName: 'Намдаков Юрий Балданович',
        shortName: 'Намдаков Ю.Б.',
        phone: '+7 (902) 888-99-00',
        position: 'Монтажник АСУ',
        specialty: 'Монтажник систем автоматизации',
        hourlyRate: 475,
        monthlySalary: 83000,
        hireDate: new Date('2024-09-01'),
        status: EmployeeStatus.ACTIVE,
      },
    }),
    prisma.employee.create({
      data: {
        fullName: 'Очиров Баир Цырендоржиевич',
        shortName: 'Очиров Б.Ц.',
        phone: '+7 (902) 999-00-11',
        position: 'Электромонтажник',
        specialty: 'Электромонтажник 4 разряда',
        hourlyRate: 420,
        monthlySalary: 72000,
        hireDate: new Date('2024-10-15'),
        status: EmployeeStatus.ACTIVE,
      },
    }),
  ])
  console.log(`✅ Создано ${employees.length} сотрудников`)

  // ============================================
  // ДОКУМЕНТЫ КС-2
  // ============================================
  const ks2Docs = await Promise.all([
    // Март - Система пожарной безопасности
    prisma.documentKS2.create({
      data: {
        number: 'КС-2-001/03.26',
        workPlanId: workPlans[0].id,
        period: new Date('2026-03-01'),
        totalAmount: 2200000,
        vatAmount: 440000,
        totalWithVat: 2640000,
        status: DocumentStatus.APPROVED,
        createdById: users[1].id,
        signedById: users[0].id,
        signedAt: new Date('2026-04-05'),
        notes: 'Подготовительные работы, прокладка кабельных трасс (март)',
      },
    }),
    // Март - Сети связи
    prisma.documentKS2.create({
      data: {
        number: 'КС-2-002/03.26',
        workPlanId: workPlans[1].id,
        period: new Date('2026-03-01'),
        totalAmount: 1850000,
        vatAmount: 370000,
        totalWithVat: 2220000,
        status: DocumentStatus.SIGNED,
        createdById: users[1].id,
        signedById: users[0].id,
        signedAt: new Date('2026-04-05'),
        notes: 'Монтаж телекоммуникационных шкафов, прокладка трасс (март)',
      },
    }),
    // Март - Автоматизация
    prisma.documentKS2.create({
      data: {
        number: 'КС-2-003/03.26',
        workPlanId: workPlans[2].id,
        period: new Date('2026-03-01'),
        totalAmount: 610000,
        vatAmount: 122000,
        totalWithVat: 732000,
        status: DocumentStatus.DRAFT,
        createdById: users[1].id,
        notes: 'Монтаж щитов управления (март)',
      },
    }),
    // Апрель - Система пожарной безопасности
    prisma.documentKS2.create({
      data: {
        number: 'КС-2-004/04.26',
        workPlanId: workPlans[0].id,
        period: new Date('2026-04-01'),
        totalAmount: 3600000,
        vatAmount: 720000,
        totalWithVat: 4320000,
        status: DocumentStatus.DRAFT,
        createdById: users[1].id,
        notes: 'Монтаж извещателей, система оповещения (апрель)',
      },
    }),
  ])

  // Позиции КС-2
  await prisma.documentKS2Item.createMany({
    data: [
      // КС-2-001/03.26 - Пожарная безопасность март
      { documentKS2Id: ks2Docs[0].id, lineNumber: 1, name: 'Разметка мест установки оборудования', unit: 'точка', quantity: 450, unitPrice: 180, totalAmount: 81000 },
      { documentKS2Id: ks2Docs[0].id, lineNumber: 2, name: 'Прокладка кабель-канала 100х50', unit: 'м', quantity: 2800, unitPrice: 320, totalAmount: 896000 },
      { documentKS2Id: ks2Docs[0].id, lineNumber: 3, name: 'Прокладка лотка перфорированного', unit: 'м', quantity: 850, unitPrice: 580, totalAmount: 493000 },
      { documentKS2Id: ks2Docs[0].id, lineNumber: 4, name: 'Прокладка кабеля КПСнг(А)-FRLS 2х1.5', unit: 'м', quantity: 5200, unitPrice: 95, totalAmount: 494000 },
      { documentKS2Id: ks2Docs[0].id, lineNumber: 5, name: 'Прокладка кабеля КПСнг(А)-FRLS 1х2х1.5', unit: 'м', quantity: 3800, unitPrice: 72, totalAmount: 273600 },
      
      // КС-2-002/03.26 - Сети связи март
      { documentKS2Id: ks2Docs[1].id, lineNumber: 1, name: 'Монтаж телекоммуникационного шкафа 42U', unit: 'шт', quantity: 8, unitPrice: 18500, totalAmount: 148000 },
      { documentKS2Id: ks2Docs[1].id, lineNumber: 2, name: 'Монтаж шкафа напольного серверного', unit: 'шт', quantity: 2, unitPrice: 35000, totalAmount: 70000 },
      { documentKS2Id: ks2Docs[1].id, lineNumber: 3, name: 'Прокладка лотка металлического 300х100', unit: 'м', quantity: 650, unitPrice: 720, totalAmount: 468000 },
      { documentKS2Id: ks2Docs[1].id, lineNumber: 4, name: 'Прокладка кабель-канала 60х40', unit: 'м', quantity: 3200, unitPrice: 165, totalAmount: 528000 },
      { documentKS2Id: ks2Docs[1].id, lineNumber: 5, name: 'Установка розеток компьютерных', unit: 'шт', quantity: 180, unitPrice: 350, totalAmount: 63000 },
      
      // КС-2-003/03.26 - Автоматизация март
      { documentKS2Id: ks2Docs[2].id, lineNumber: 1, name: 'Монтаж щита управления ЩУ-В1', unit: 'шт', quantity: 3, unitPrice: 42000, totalAmount: 126000 },
      { documentKS2Id: ks2Docs[2].id, lineNumber: 2, name: 'Монтаж щита управления ЩУ-В2', unit: 'шт', quantity: 2, unitPrice: 38500, totalAmount: 77000 },
      { documentKS2Id: ks2Docs[2].id, lineNumber: 3, name: 'Монтаж шкафа диспетчерского', unit: 'шт', quantity: 1, unitPrice: 125000, totalAmount: 125000 },
      { documentKS2Id: ks2Docs[2].id, lineNumber: 4, name: 'Прокладка кабеля КВВГнг(А)-LS 5х1.5', unit: 'м', quantity: 2800, unitPrice: 98, totalAmount: 274400 },
      
      // КС-2-004/04.26 - Пожарная безопасность апрель
      { documentKS2Id: ks2Docs[3].id, lineNumber: 1, name: 'Монтаж извещателя дымового ИП 212-141', unit: 'шт', quantity: 380, unitPrice: 1850, totalAmount: 703000 },
      { documentKS2Id: ks2Docs[3].id, lineNumber: 2, name: 'Монтаж извещателя теплового ИП 103-4', unit: 'шт', quantity: 85, unitPrice: 1250, totalAmount: 106250 },
      { documentKS2Id: ks2Docs[3].id, lineNumber: 3, name: 'Монтаж ручного пожарного извещателя', unit: 'шт', quantity: 45, unitPrice: 1400, totalAmount: 63000 },
      { documentKS2Id: ks2Docs[3].id, lineNumber: 4, name: 'Монтаж оповещателя речевого ТАНДЕР-М', unit: 'шт', quantity: 180, unitPrice: 4200, totalAmount: 756000 },
      { documentKS2Id: ks2Docs[3].id, lineNumber: 5, name: 'Монтаж табло "Выход"', unit: 'шт', quantity: 65, unitPrice: 3800, totalAmount: 247000 },
      { documentKS2Id: ks2Docs[3].id, lineNumber: 6, name: 'Монтаж прибора приёмно-контрольного С2000М', unit: 'шт', quantity: 4, unitPrice: 45000, totalAmount: 180000 },
      { documentKS2Id: ks2Docs[3].id, lineNumber: 7, name: 'Монтаж блока контр. и управ. С2000-КДЛ', unit: 'шт', quantity: 12, unitPrice: 18500, totalAmount: 222000 },
      { documentKS2Id: ks2Docs[3].id, lineNumber: 8, name: 'Прокладка кабеля КПСнг(А)-FRLS 2х1.5', unit: 'м', quantity: 3800, unitPrice: 95, totalAmount: 361000 },
    ],
  })
  console.log(`✅ Создано ${ks2Docs.length} документов КС-2 с позициями`)

  // ============================================
  // ДОКУМЕНТЫ КС-3
  // ============================================
  const ks3Docs = await Promise.all([
    prisma.documentKS3.create({
      data: {
        number: 'КС-3-001/03.26',
        workPlanId: workPlans[0].id,
        ks2Id: ks2Docs[0].id,
        period: new Date('2026-03-01'),
        totalAmount: 2200000,
        vatAmount: 440000,
        totalWithVat: 2640000,
        previousTotal: 0,
        currentTotal: 2640000,
        status: DocumentStatus.APPROVED,
        createdById: users[1].id,
        signedById: users[0].id,
        signedAt: new Date('2026-04-10'),
        notes: 'Справка о стоимости выполненных работ за март 2026',
      },
    }),
    prisma.documentKS3.create({
      data: {
        number: 'КС-3-002/03.26',
        workPlanId: workPlans[1].id,
        ks2Id: ks2Docs[1].id,
        period: new Date('2026-03-01'),
        totalAmount: 1850000,
        vatAmount: 370000,
        totalWithVat: 2220000,
        previousTotal: 0,
        currentTotal: 2220000,
        status: DocumentStatus.SIGNED,
        createdById: users[1].id,
        signedById: users[0].id,
        signedAt: new Date('2026-04-10'),
        notes: 'Справка о стоимости выполненных работ за март 2026',
      },
    }),
  ])
  console.log(`✅ Создано ${ks3Docs.length} документов КС-3`)

  // ============================================
  // АКТЫ СКРЫТЫХ РАБОТ
  // ============================================
  const hiddenActs = await Promise.all([
    prisma.hiddenWorkAct.create({
      data: {
        number: 'АОСР-001/2026',
        workPlanId: workPlans[0].id,
        workStageId: stages[1].id,
        name: 'Акт освидетельствования скрытых работ - прокладка кабельных трасс',
        description: 'Прокладка кабель-каналов и лотков на этажах 1-8, жилые помещения',
        location: 'ЖК "Пламент", этажи 1-8, коридоры и техпомещения',
        executedAt: new Date('2026-03-18'),
        signedAt: new Date('2026-03-19'),
        status: HiddenWorkActStatus.APPROVED,
        contractorName: 'Доржиев Б.В.',
        contractorPosition: 'Главный прораб ООО "Импульс"',
        customerName: 'Соколов Д.А.',
        customerPosition: 'Представитель заказчика ООО "ДТТ"',
      },
    }),
    prisma.hiddenWorkAct.create({
      data: {
        number: 'АОСР-002/2026',
        workPlanId: workPlans[0].id,
        workStageId: stages[1].id,
        name: 'Акт освидетельствования скрытых работ - прокладка кабельных трасс (подземная стоянка)',
        description: 'Прокладка кабель-каналов и лотков на подземной стоянке',
        location: 'ЖК "Пламент", подземная стоянка, уровни -1, -2',
        executedAt: new Date('2026-03-22'),
        signedAt: new Date('2026-03-23'),
        status: HiddenWorkActStatus.APPROVED,
        contractorName: 'Доржиев Б.В.',
        contractorPosition: 'Главный прораб ООО "Импульс"',
        customerName: 'Соколов Д.А.',
        customerPosition: 'Представитель заказчика ООО "ДТТ"',
      },
    }),
    prisma.hiddenWorkAct.create({
      data: {
        number: 'АОСР-003/2026',
        workPlanId: workPlans[1].id,
        workStageId: stages[9].id,
        name: 'Акт освидетельствования скрытых работ - прокладка ВОЛС',
        description: 'Прокладка волоконно-оптического кабеля в вертикальных стояках',
        location: 'ЖК "Пламент", техпомещения, стояки связи',
        executedAt: new Date('2026-03-28'),
        status: HiddenWorkActStatus.SIGNED,
        contractorName: 'Доржиев Б.В.',
        contractorPosition: 'Главный прораб ООО "Импульс"',
        customerName: 'Соколов Д.А.',
        customerPosition: 'Представитель заказчика ООО "ДТТ"',
      },
    }),
    prisma.hiddenWorkAct.create({
      data: {
        number: 'АОСР-004/2026',
        workPlanId: workPlans[0].id,
        workStageId: stages[2].id,
        name: 'Акт освидетельствования скрытых работ - монтаж пожарных извещателей',
        description: 'Установка дымовых и тепловых пожарных извещателей на этажах 1-5',
        location: 'ЖК "Пламент", этажи 1-5, жилые помещения',
        executedAt: new Date('2026-04-05'),
        status: HiddenWorkActStatus.DRAFT,
        contractorName: 'Доржиев Б.В.',
        contractorPosition: 'Главный прораб ООО "Импульс"',
      },
    }),
  ])
  console.log(`✅ Создано ${hiddenActs.length} актов скрытых работ`)

  // ============================================
  // НАРЯДЫ НА МОНТАЖ
  // ============================================
  const orders = await Promise.all([
    prisma.installationOrder.create({
      data: {
        number: 'НМ-001/2026',
        workPlanId: workPlans[0].id,
        workStageId: stages[2].id,
        name: 'Монтаж пожарных извещателей этажи 6-10',
        description: 'Установка дымовых пожарных извещателей на этажах 6-10, секция А. Требуется установка 85 извещателей.',
        location: 'ЖК "Пламент", этажи 6-10, секция А',
        deadline: new Date('2026-04-15'),
        status: InstallationOrderStatus.IN_PROGRESS,
        priority: 3,
        createdById: users[1].id,
      },
    }),
    prisma.installationOrder.create({
      data: {
        number: 'НМ-002/2026',
        workPlanId: workPlans[0].id,
        workStageId: stages[3].id,
        name: 'Монтаж системы оповещения этажи 1-7',
        description: 'Установка речевых оповещателей и табло "Выход" на этажах 1-7',
        location: 'ЖК "Пламент", этажи 1-7',
        deadline: new Date('2026-04-20'),
        status: InstallationOrderStatus.ASSIGNED,
        priority: 2,
        createdById: users[1].id,
      },
    }),
    prisma.installationOrder.create({
      data: {
        number: 'НМ-003/2026',
        workPlanId: workPlans[1].id,
        workStageId: stages[10].id,
        name: 'Прокладка ВОЛС стояки А и Б',
        description: 'Прокладка волоконно-оптического кабеля в вертикальных стояках А и Б, 12-волоконный кабель',
        location: 'ЖК "Пламент", стояки А и Б, техпомещения',
        deadline: new Date('2026-04-08'),
        status: InstallationOrderStatus.IN_PROGRESS,
        priority: 3,
        createdById: users[1].id,
      },
    }),
    prisma.installationOrder.create({
      data: {
        number: 'НМ-004/2026',
        workPlanId: workPlans[2].id,
        workStageId: stages[15].id,
        name: 'Монтаж датчиков температуры и влажности',
        description: 'Установка датчиков температуры, влажности и давления в приточных камерах',
        location: 'ЖК "Пламент", приточные камеры, кровля',
        deadline: new Date('2026-04-12'),
        status: InstallationOrderStatus.ASSIGNED,
        priority: 2,
        createdById: users[1].id,
      },
    }),
    prisma.installationOrder.create({
      data: {
        number: 'НМ-005/2026',
        workPlanId: workPlans[0].id,
        workStageId: stages[5].id,
        name: 'Монтаж системы дымоудаления подземная стоянка',
        description: 'Установка клапанов дымоудаления и вентиляторов на подземной стоянке',
        location: 'ЖК "Пламент", подземная стоянка',
        deadline: new Date('2026-04-25'),
        status: InstallationOrderStatus.DRAFT,
        priority: 2,
        createdById: users[1].id,
      },
    }),
  ])

  // Назначаем работников на наряды
  await prisma.orderAssignee.createMany({
    data: [
      { orderId: orders[0].id, employeeId: employees[0].id },
      { orderId: orders[0].id, employeeId: employees[1].id },
      { orderId: orders[1].id, employeeId: employees[2].id },
      { orderId: orders[2].id, employeeId: employees[5].id },
      { orderId: orders[3].id, employeeId: employees[6].id },
      { orderId: orders[3].id, employeeId: employees[7].id },
    ],
  })

  // Добавляем позиции в наряды
  await prisma.orderItem.createMany({
    data: [
      // НМ-001/2026
      { orderId: orders[0].id, name: 'Извещатель дымовой ИП 212-141', unit: 'шт', quantity: 85, unitPrice: 1850 },
      { orderId: orders[0].id, name: 'Розетка для извещателя', unit: 'шт', quantity: 85, unitPrice: 180 },
      { orderId: orders[0].id, name: 'Крепёжные изделия', unit: 'компл', quantity: 85, unitPrice: 95 },
      // НМ-002/2026
      { orderId: orders[1].id, name: 'Оповещатель речевой ТАНДЕР-М', unit: 'шт', quantity: 42, unitPrice: 4200 },
      { orderId: orders[1].id, name: 'Табло "Выход" светодиодное', unit: 'шт', quantity: 28, unitPrice: 3800 },
      // НМ-003/2026
      { orderId: orders[2].id, name: 'Кабель ВО 12 волокон одномодовый', unit: 'м', quantity: 1800, unitPrice: 165 },
      { orderId: orders[2].id, name: 'Муфта оптическая', unit: 'шт', quantity: 8, unitPrice: 3500 },
      { orderId: orders[2].id, name: 'Патч-корд LC-LC 3м', unit: 'шт', quantity: 24, unitPrice: 850 },
      // НМ-004/2026
      { orderId: orders[3].id, name: 'Датчик температуры Pt1000', unit: 'шт', quantity: 18, unitPrice: 2800 },
      { orderId: orders[3].id, name: 'Датчик влажности', unit: 'шт', quantity: 12, unitPrice: 4200 },
      { orderId: orders[3].id, name: 'Датчик перепада давления', unit: 'шт', quantity: 6, unitPrice: 8500 },
      // НМ-005/2026
      { orderId: orders[4].id, name: 'Клапан дымоудаления КДМ-2', unit: 'шт', quantity: 12, unitPrice: 18500 },
      { orderId: orders[4].id, name: 'Вентилятор дымоудаления', unit: 'шт', quantity: 4, unitPrice: 125000 },
      { orderId: orders[4].id, name: 'Привод электромеханический', unit: 'шт', quantity: 12, unitPrice: 8500 },
    ],
  })
  console.log(`✅ Создано ${orders.length} нарядов на монтаж`)

  // ============================================
  // ЗАРПЛАТА
  // ============================================
  const salaryPayments = await Promise.all([
    // Март 2026
    prisma.salaryPayment.create({
      data: {
        employeeId: employees[0].id,
        period: new Date('2026-03-01'),
        workDays: 21,
        hoursWorked: 168,
        baseAmount: 80640,
        bonus: 12000,
        deductions: 0,
        tax: 12043,
        total: 80597,
        status: PaymentStatus.PAID,
        paidAt: new Date('2026-04-05'),
        notes: 'Премия за досрочное выполнение этапа',
      },
    }),
    prisma.salaryPayment.create({
      data: {
        employeeId: employees[1].id,
        period: new Date('2026-03-01'),
        workDays: 22,
        hoursWorked: 176,
        baseAmount: 84480,
        bonus: 8000,
        deductions: 0,
        tax: 12057,
        total: 82423,
        status: PaymentStatus.PAID,
        paidAt: new Date('2026-04-05'),
      },
    }),
    prisma.salaryPayment.create({
      data: {
        employeeId: employees[2].id,
        period: new Date('2026-03-01'),
        workDays: 20,
        hoursWorked: 160,
        baseAmount: 75200,
        bonus: 5000,
        deductions: 0,
        tax: 10426,
        total: 69774,
        status: PaymentStatus.PAID,
        paidAt: new Date('2026-04-05'),
      },
    }),
    prisma.salaryPayment.create({
      data: {
        employeeId: employees[3].id,
        period: new Date('2026-03-01'),
        workDays: 23,
        hoursWorked: 184,
        baseAmount: 93840,
        bonus: 15000,
        deductions: 0,
        tax: 14199,
        total: 94641,
        status: PaymentStatus.PAID,
        paidAt: new Date('2026-04-05'),
        notes: 'Премия бригадиру',
      },
    }),
    prisma.salaryPayment.create({
      data: {
        employeeId: employees[4].id,
        period: new Date('2026-03-01'),
        workDays: 22,
        hoursWorked: 176,
        baseAmount: 80960,
        bonus: 6000,
        deductions: 0,
        tax: 11252,
        total: 75708,
        status: PaymentStatus.PAID,
        paidAt: new Date('2026-04-05'),
      },
    }),
    // Апрель 2026 - ожидают выплаты
    prisma.salaryPayment.create({
      data: {
        employeeId: employees[0].id,
        period: new Date('2026-04-01'),
        workDays: 20,
        hoursWorked: 160,
        baseAmount: 83200,
        bonus: 10000,
        deductions: 0,
        tax: 12016,
        total: 81184,
        status: PaymentStatus.PENDING,
      },
    }),
    prisma.salaryPayment.create({
      data: {
        employeeId: employees[1].id,
        period: new Date('2026-04-01'),
        workDays: 21,
        hoursWorked: 168,
        baseAmount: 80640,
        bonus: 6000,
        deductions: 0,
        tax: 11289,
        total: 75351,
        status: PaymentStatus.PENDING,
      },
    }),
    prisma.salaryPayment.create({
      data: {
        employeeId: employees[3].id,
        period: new Date('2026-04-01'),
        workDays: 22,
        hoursWorked: 176,
        baseAmount: 89760,
        bonus: 12000,
        deductions: 0,
        tax: 13116,
        total: 88644,
        status: PaymentStatus.PENDING,
      },
    }),
  ])
  console.log(`✅ Создано ${salaryPayments.length} начислений зарплаты`)

  // ============================================
  // ТЕХНИКА БЕЗОПАСНОСТИ
  // ============================================
  const briefings = await Promise.all([
    prisma.safetyBriefing.create({
      data: {
        name: 'Вводный инструктаж',
        description: 'Первичный инструктаж по технике безопасности при приеме на работу',
        required: true,
        periodDays: 365,
      },
    }),
    prisma.safetyBriefing.create({
      data: {
        name: 'Инструктаж по электробезопасности (II группа)',
        description: 'Инструктаж по работе с электрооборудованием до 1000В',
        workDirectionId: directions[0].id,
        required: true,
        periodDays: 90,
      },
    }),
    prisma.safetyBriefing.create({
      data: {
        name: 'Инструктаж по пожарной безопасности',
        description: 'Инструктаж по пожарной безопасности на объекте',
        workDirectionId: directions[0].id,
        required: true,
        periodDays: 180,
      },
    }),
    prisma.safetyBriefing.create({
      data: {
        name: 'Инструктаж по работе на высоте',
        description: 'Инструктаж по технике безопасности при работе на высоте более 1.8м',
        required: true,
        periodDays: 90,
      },
    }),
    prisma.safetyBriefing.create({
      data: {
        name: 'Инструктаж по работе в замкнутых пространствах',
        description: 'Техника безопасности при работе в техподпольях, шахтах, коллекторах',
        workDirectionId: directions[1].id,
        required: true,
        periodDays: 180,
      },
    }),
  ])

  // Записи о прохождении инструктажей
  await prisma.safetyRecord.createMany({
    data: [
      // Все прошли вводный
      { employeeId: employees[0].id, briefingId: briefings[0].id, date: new Date('2026-03-01'), result: 'прошел', nextDate: new Date('2027-03-01'), notes: 'Бадмацыренов С.А.' },
      { employeeId: employees[1].id, briefingId: briefings[0].id, date: new Date('2026-03-01'), result: 'прошел', nextDate: new Date('2027-03-01') },
      { employeeId: employees[2].id, briefingId: briefings[0].id, date: new Date('2026-03-01'), result: 'прошел', nextDate: new Date('2027-03-01') },
      { employeeId: employees[3].id, briefingId: briefings[0].id, date: new Date('2026-03-01'), result: 'прошел', nextDate: new Date('2027-03-01') },
      { employeeId: employees[4].id, briefingId: briefings[0].id, date: new Date('2026-03-01'), result: 'прошел', nextDate: new Date('2027-03-01') },
      { employeeId: employees[5].id, briefingId: briefings[0].id, date: new Date('2026-03-01'), result: 'прошел', nextDate: new Date('2027-03-01') },
      { employeeId: employees[6].id, briefingId: briefings[0].id, date: new Date('2026-03-01'), result: 'прошел', nextDate: new Date('2027-03-01') },
      { employeeId: employees[7].id, briefingId: briefings[0].id, date: new Date('2026-03-01'), result: 'прошел', nextDate: new Date('2027-03-01') },
      { employeeId: employees[8].id, briefingId: briefings[0].id, date: new Date('2026-03-01'), result: 'прошел', nextDate: new Date('2027-03-01') },
      
      // Электробезопасность - монтажники ОПС
      { employeeId: employees[0].id, briefingId: briefings[1].id, date: new Date('2026-03-05'), result: 'прошел', nextDate: new Date('2026-06-05') },
      { employeeId: employees[1].id, briefingId: briefings[1].id, date: new Date('2026-03-05'), result: 'прошел', nextDate: new Date('2026-06-05') },
      { employeeId: employees[2].id, briefingId: briefings[1].id, date: new Date('2026-03-05'), result: 'прошел', nextDate: new Date('2026-06-05') },
      
      // Пожарная безопасность
      { employeeId: employees[0].id, briefingId: briefings[2].id, date: new Date('2026-03-05'), result: 'прошел', nextDate: new Date('2026-09-05') },
      { employeeId: employees[1].id, briefingId: briefings[2].id, date: new Date('2026-03-05'), result: 'прошел', nextDate: new Date('2026-09-05') },
      { employeeId: employees[2].id, briefingId: briefings[2].id, date: new Date('2026-03-05'), result: 'прошел', nextDate: new Date('2026-09-05') },
      
      // Работа на высоте - все
      { employeeId: employees[0].id, briefingId: briefings[3].id, date: new Date('2026-03-10'), result: 'прошел', nextDate: new Date('2026-06-10') },
      { employeeId: employees[1].id, briefingId: briefings[3].id, date: new Date('2026-03-10'), result: 'прошел', nextDate: new Date('2026-06-10') },
      { employeeId: employees[3].id, briefingId: briefings[3].id, date: new Date('2026-03-10'), result: 'прошел', nextDate: new Date('2026-06-10') },
      { employeeId: employees[4].id, briefingId: briefings[3].id, date: new Date('2026-03-10'), result: 'прошел', nextDate: new Date('2026-06-10') },
      { employeeId: employees[5].id, briefingId: briefings[3].id, date: new Date('2026-03-10'), result: 'прошел', nextDate: new Date('2026-06-10') },
      
      // Требуется перепрохождение
      { employeeId: employees[7].id, briefingId: briefings[3].id, date: new Date('2026-03-15'), result: 'не прошел', notes: 'Назначить повторный инструктаж' },
    ],
  })
  console.log(`✅ Создано ${briefings.length} инструктажей`)

  // ============================================
  // СХЕМЫ МОНТАЖА
  // ============================================
  await prisma.installationScheme.createMany({
    data: [
      {
        name: 'Структурная схема АПС ЖК "Пламент"',
        workDirectionId: directions[0].id,
        buildingId: building.id,
        description: 'Общая схема автоматической пожарной сигнализации с указанием шлейфов и приборов',
      },
      {
        name: 'Схема расстановки извещателей типовой этаж',
        workDirectionId: directions[0].id,
        buildingId: building.id,
        floor: 1,
        description: 'Типовая схема расстановки дымовых и тепловых извещателей на жилом этаже',
      },
      {
        name: 'Схема СОУЭ',
        workDirectionId: directions[0].id,
        buildingId: building.id,
        description: 'Система оповещения и управления эвакуацией, зоны оповещения',
      },
      {
        name: 'Схема ВОЛС',
        workDirectionId: directions[1].id,
        buildingId: building.id,
        description: 'Схема прокладки волоконно-оптического кабеля, места установки муфт',
      },
      {
        name: 'Схема СКС типовой этаж',
        workDirectionId: directions[1].id,
        buildingId: building.id,
        floor: 1,
        description: 'Схема структурированной кабельной системы, расположение розеток',
      },
      {
        name: 'Схема видеонаблюдения',
        workDirectionId: directions[1].id,
        buildingId: building.id,
        description: 'Схема расстановки камер видеонаблюдения, придомовая территория и стоянка',
      },
      {
        name: 'Функциональная схема АСУ вентиляцией',
        workDirectionId: directions[2].id,
        buildingId: building.id,
        description: 'Функциональная схема автоматического управления системами вентиляции',
      },
      {
        name: 'Схема диспетчеризации',
        workDirectionId: directions[2].id,
        buildingId: building.id,
        description: 'Схема диспетчерского управления инженерными системами',
      },
    ],
  })
  console.log(`✅ Создано 8 схем монтажа`)

  console.log('\n✅ Заполнение базы данных завершено!')
  console.log('\n📋 Данные для входа:')
  console.log('  Директор: admin@stroytest.ru / admin123')
  console.log('  Менеджер: manager@stroytest.ru / admin123')
  console.log('  Прораб: foreman@stroytest.ru / admin123')
  console.log('  Бухгалтер: accountant@stroytest.ru / admin123')
  console.log('  Инженер: engineer@stroytest.ru / admin123')
  console.log('\n🏢 Объект: ЖК "Пламент", г. Улан-Удэ')
  console.log('📅 Период работ: март - май 2026')
  console.log('💰 Общая сумма контрактов: 27 020 000 ₽')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
