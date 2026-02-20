import { PrismaClient, UserRole, BuildingStatus, WorkPlanStatus, WorkStageStatus, DocumentStatus, EmployeeStatus, PaymentStatus, InstallationOrderStatus, HiddenWorkActStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...')

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
        name: 'Администратор Системы',
        phone: '+7 (999) 123-45-67',
        role: UserRole.ADMIN,
        position: 'Системный администратор',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'manager@stroytest.ru',
        password: hashedPassword,
        name: 'Петров Иван Сергеевич',
        phone: '+7 (999) 234-56-78',
        role: UserRole.MANAGER,
        position: 'Менеджер проекта',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'foreman@stroytest.ru',
        password: hashedPassword,
        name: 'Сидоров Алексей Николаевич',
        phone: '+7 (999) 345-67-89',
        role: UserRole.FOREMAN,
        position: 'Прораб',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'accountant@stroytest.ru',
        password: hashedPassword,
        name: 'Козлова Мария Викторовна',
        phone: '+7 (999) 456-78-90',
        role: UserRole.ACCOUNTANT,
        position: 'Главный бухгалтер',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'worker@stroytest.ru',
        password: hashedPassword,
        name: 'Иванов Дмитрий Петрович',
        phone: '+7 (999) 567-89-01',
        role: UserRole.WORKER,
        position: 'Монтажник',
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
        name: 'Монтаж сетей связи',
        code: 'СС',
        description: 'Монтаж структурированных кабельных систем, локальных вычислительных сетей, телефонной связи',
        color: '#3B82F6',
        icon: 'Network',
        isActive: true,
      },
    }),
    prisma.workDirection.create({
      data: {
        name: 'Автоматическая система противопожарной защиты',
        code: 'АСПЗ',
        description: 'Монтаж автоматической пожарной сигнализации, систем оповещения и управления эвакуацией, автоматического пожаротушения',
        color: '#EF4444',
        icon: 'Flame',
        isActive: true,
      },
    }),
    prisma.workDirection.create({
      data: {
        name: 'Автоматизация систем вентиляции',
        code: 'АСВ',
        description: 'Монтаж систем автоматического управления вентиляцией и кондиционированием, диспетчеризация',
        color: '#10B981',
        icon: 'Wind',
        isActive: true,
      },
    }),
  ])
  console.log(`✅ Создано ${directions.length} направлений работ`)

  // ============================================
  // ОБЪЕКТЫ (ЗДАНИЯ)
  // ============================================
  const buildings = await Promise.all([
    prisma.building.create({
      data: {
        name: 'Корпус 1',
        address: 'г. Москва, ул. Строителей, д. 15',
        floors: 25,
        totalArea: 45000,
        status: BuildingStatus.ACTIVE,
      },
    }),
    prisma.building.create({
      data: {
        name: 'Корпус 2',
        address: 'г. Москва, ул. Строителей, д. 17',
        floors: 18,
        totalArea: 32000,
        status: BuildingStatus.ACTIVE,
      },
    }),
    prisma.building.create({
      data: {
        name: 'Корпус 3',
        address: 'г. Москва, ул. Строителей, д. 19',
        floors: 12,
        totalArea: 18000,
        status: BuildingStatus.PLANNED,
      },
    }),
    prisma.building.create({
      data: {
        name: 'Паркинг',
        address: 'г. Москва, ул. Строителей, д. 15А',
        floors: 2,
        totalArea: 12000,
        status: BuildingStatus.ACTIVE,
      },
    }),
  ])
  console.log(`✅ Создано ${buildings.length} объектов`)

  // ============================================
  // ПЛАНЫ РАБОТ
  // ============================================
  const workPlans = await Promise.all([
    prisma.workPlan.create({
      data: {
        name: 'Монтаж сетей связи - Корпус 1',
        contractNumber: 'ДС-001/2024',
        workDirectionId: directions[0].id,
        buildingId: buildings[0].id,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-30'),
        totalAmount: 12500000,
        status: WorkPlanStatus.IN_PROGRESS,
        notes: 'Основной контракт, 1 этап строительства',
      },
    }),
    prisma.workPlan.create({
      data: {
        name: 'АСПЗ - Корпус 1',
        contractNumber: 'ДС-002/2024',
        workDirectionId: directions[1].id,
        buildingId: buildings[0].id,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-07-31'),
        totalAmount: 8500000,
        status: WorkPlanStatus.IN_PROGRESS,
        notes: 'Пожарная сигнализация и оповещение',
      },
    }),
    prisma.workPlan.create({
      data: {
        name: 'Автоматизация вентиляции - Корпус 1',
        contractNumber: 'ДС-003/2024',
        workDirectionId: directions[2].id,
        buildingId: buildings[0].id,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-08-31'),
        totalAmount: 5200000,
        status: WorkPlanStatus.APPROVED,
        notes: 'АСУ вентиляцией и кондиционированием',
      },
    }),
    prisma.workPlan.create({
      data: {
        name: 'Монтаж сетей связи - Корпус 2',
        contractNumber: 'ДС-004/2024',
        workDirectionId: directions[0].id,
        buildingId: buildings[1].id,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-09-30'),
        totalAmount: 9800000,
        status: WorkPlanStatus.APPROVED,
        notes: 'Второй корпус',
      },
    }),
    prisma.workPlan.create({
      data: {
        name: 'АСПЗ - Паркинг',
        contractNumber: 'ДС-005/2024',
        workDirectionId: directions[1].id,
        buildingId: buildings[3].id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-04-30'),
        totalAmount: 3200000,
        status: WorkPlanStatus.COMPLETED,
        notes: 'Подземный паркинг',
      },
    }),
  ])
  console.log(`✅ Создано ${workPlans.length} планов работ`)

  // ============================================
  // ЭТАПЫ РАБОТ
  // ============================================
  const stages = []
  
  // Этапы для плана "Монтаж сетей связи - Корпус 1"
  for (let i = 0; i < 5; i++) {
    const stage = await prisma.workStage.create({
      data: {
        workPlanId: workPlans[0].id,
        name: [
          'Прокладка кабель-каналов',
          'Монтаж телекоммуникационных шкафов',
          'Прокладка оптоволоконного кабеля',
          'Монтаж активного оборудования',
          'Пусконаладочные работы',
        ][i],
        description: 'Этап ' + (i + 1) + ' монтажа сетей связи',
        order: i + 1,
        startDate: new Date(2024, 0 + i, 15),
        endDate: new Date(2024, 1 + i, 28),
        plannedAmount: [2500000, 2000000, 3500000, 3000000, 1500000][i],
        actualAmount: [2400000, 2100000, 2800000, 0, 0][i],
        percentComplete: [95, 100, 80, 0, 0][i],
        status: [WorkStageStatus.COMPLETED, WorkStageStatus.COMPLETED, WorkStageStatus.IN_PROGRESS, WorkStageStatus.PENDING, WorkStageStatus.PENDING][i],
      },
    })
    stages.push(stage)
  }

  // Этапы для плана "АСПЗ - Корпус 1"
  for (let i = 0; i < 4; i++) {
    const stage = await prisma.workStage.create({
      data: {
        workPlanId: workPlans[1].id,
        name: [
          'Монтаж пожарных извещателей',
          'Установка оповещателей',
          'Монтаж приборов управления',
          'Пусконаладочные работы',
        ][i],
        description: 'Этап ' + (i + 1) + ' АСПЗ',
        order: i + 1,
        startDate: new Date(2024, 1 + i, 1),
        endDate: new Date(2024, 2 + i, 31),
        plannedAmount: [3000000, 2000000, 2500000, 1000000][i],
        actualAmount: [2900000, 1500000, 0, 0][i],
        percentComplete: [100, 75, 0, 0][i],
        status: [WorkStageStatus.COMPLETED, WorkStageStatus.IN_PROGRESS, WorkStageStatus.PENDING, WorkStageStatus.PENDING][i],
      },
    })
    stages.push(stage)
  }
  console.log(`✅ Создано ${stages.length} этапов работ`)

  // ============================================
  // ПЕРСОНАЛ
  // ============================================
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        fullName: 'Смирнов Александр Владимирович',
        shortName: 'Смирнов А.В.',
        phone: '+7 (999) 111-11-11',
        position: 'Монтажник связи',
        specialty: 'Кабельщик-монтажник',
        hourlyRate: 450,
        monthlySalary: 75000,
        hireDate: new Date('2023-03-15'),
        status: EmployeeStatus.ACTIVE,
      },
    }),
    prisma.employee.create({
      data: {
        fullName: 'Кузнецов Дмитрий Игоревич',
        shortName: 'Кузнецов Д.И.',
        phone: '+7 (999) 222-22-22',
        position: 'Электромонтажник',
        specialty: 'Электромонтажник 5 разряда',
        hourlyRate: 500,
        monthlySalary: 85000,
        hireDate: new Date('2023-05-01'),
        status: EmployeeStatus.ACTIVE,
      },
    }),
    prisma.employee.create({
      data: {
        fullName: 'Волков Сергей Павлович',
        shortName: 'Волков С.П.',
        phone: '+7 (999) 333-33-33',
        position: 'Монтажник ОПС',
        specialty: 'Монтажник охранно-пожарной сигнализации',
        hourlyRate: 480,
        monthlySalary: 80000,
        hireDate: new Date('2023-06-10'),
        status: EmployeeStatus.ACTIVE,
      },
    }),
    prisma.employee.create({
      data: {
        fullName: 'Попов Андрей Николаевич',
        shortName: 'Попов А.Н.',
        phone: '+7 (999) 444-44-44',
        position: 'Наладчик КИПиА',
        specialty: 'Наладчик контрольно-измерительных приборов',
        hourlyRate: 550,
        monthlySalary: 92000,
        hireDate: new Date('2023-04-20'),
        status: EmployeeStatus.ACTIVE,
      },
    }),
    prisma.employee.create({
      data: {
        fullName: 'Лебедев Виктор Александрович',
        shortName: 'Лебедев В.А.',
        phone: '+7 (999) 555-55-55',
        position: 'Монтажник вентиляции',
        specialty: 'Монтажник систем вентиляции',
        hourlyRate: 470,
        monthlySalary: 78000,
        hireDate: new Date('2023-07-01'),
        status: EmployeeStatus.ACTIVE,
      },
    }),
    prisma.employee.create({
      data: {
        fullName: 'Новиков Максим Сергеевич',
        shortName: 'Новиков М.С.',
        phone: '+7 (999) 666-66-66',
        position: 'Монтажник связи',
        specialty: 'Кабельщик-монтажник',
        hourlyRate: 420,
        monthlySalary: 70000,
        hireDate: new Date('2023-08-15'),
        status: EmployeeStatus.ACTIVE,
      },
    }),
  ])
  console.log(`✅ Создано ${employees.length} сотрудников`)

  // ============================================
  // ДОКУМЕНТЫ КС-2
  // ============================================
  const ks2Docs = await Promise.all([
    prisma.documentKS2.create({
      data: {
        number: 'КС-2-001/2024',
        workPlanId: workPlans[0].id,
        period: new Date('2024-01-01'),
        totalAmount: 4500000,
        vatAmount: 900000,
        totalWithVat: 5400000,
        status: DocumentStatus.APPROVED,
        createdById: users[1].id,
        signedById: users[0].id,
        signedAt: new Date('2024-02-05'),
      },
    }),
    prisma.documentKS2.create({
      data: {
        number: 'КС-2-002/2024',
        workPlanId: workPlans[0].id,
        period: new Date('2024-02-01'),
        totalAmount: 3800000,
        vatAmount: 760000,
        totalWithVat: 4560000,
        status: DocumentStatus.SIGNED,
        createdById: users[1].id,
        signedById: users[0].id,
        signedAt: new Date('2024-03-05'),
      },
    }),
    prisma.documentKS2.create({
      data: {
        number: 'КС-2-003/2024',
        workPlanId: workPlans[1].id,
        period: new Date('2024-02-01'),
        totalAmount: 4400000,
        vatAmount: 880000,
        totalWithVat: 5280000,
        status: DocumentStatus.DRAFT,
        createdById: users[1].id,
      },
    }),
  ])

  // Добавляем позиции в КС-2
  await prisma.documentKS2Item.createMany({
    data: [
      // КС-2-001/2024
      { documentKS2Id: ks2Docs[0].id, lineNumber: 1, name: 'Прокладка кабель-каналов 100х50', unit: 'м', quantity: 2500, unitPrice: 450, totalAmount: 1125000 },
      { documentKS2Id: ks2Docs[0].id, lineNumber: 2, name: 'Монтаж телекоммуникационного шкафа 42U', unit: 'шт', quantity: 15, unitPrice: 15000, totalAmount: 225000 },
      { documentKS2Id: ks2Docs[0].id, lineNumber: 3, name: 'Прокладка оптоволоконного кабеля', unit: 'м', quantity: 5000, unitPrice: 630, totalAmount: 3150000 },
      // КС-2-002/2024
      { documentKS2Id: ks2Docs[1].id, lineNumber: 1, name: 'Монтаж коммутаторов L2', unit: 'шт', quantity: 24, unitPrice: 25000, totalAmount: 600000 },
      { documentKS2Id: ks2Docs[1].id, lineNumber: 2, name: 'Прокладка витой пары Cat.6A', unit: 'м', quantity: 8000, unitPrice: 180, totalAmount: 1440000 },
      { documentKS2Id: ks2Docs[1].id, lineNumber: 3, name: 'Монтаж патч-панелей 48 портов', unit: 'шт', quantity: 12, unitPrice: 35000, totalAmount: 420000 },
      { documentKS2Id: ks2Docs[1].id, lineNumber: 4, name: 'Тестирование кабельной системы', unit: 'точка', quantity: 480, unitPrice: 280, totalAmount: 1344000 },
      // КС-2-003/2024
      { documentKS2Id: ks2Docs[2].id, lineNumber: 1, name: 'Монтаж пожарных извещателей дымовых', unit: 'шт', quantity: 320, unitPrice: 2800, totalAmount: 896000 },
      { documentKS2Id: ks2Docs[2].id, lineNumber: 2, name: 'Монтаж ручных пожарных извещателей', unit: 'шт', quantity: 45, unitPrice: 1500, totalAmount: 67500 },
      { documentKS2Id: ks2Docs[2].id, lineNumber: 3, name: 'Установка речевых оповещателей', unit: 'шт', quantity: 180, unitPrice: 4500, totalAmount: 810000 },
      { documentKS2Id: ks2Docs[2].id, lineNumber: 4, name: 'Монтаж приборов управления пожаротушением', unit: 'шт', quantity: 8, unitPrice: 125000, totalAmount: 1000000 },
      { documentKS2Id: ks2Docs[2].id, lineNumber: 5, name: 'Прокладка кабеля питания', unit: 'м', quantity: 2500, unitPrice: 350, totalAmount: 875000 },
    ],
  })
  console.log(`✅ Создано ${ks2Docs.length} документов КС-2`)

  // ============================================
  // ДОКУМЕНТЫ КС-3
  // ============================================
  const ks3Docs = await Promise.all([
    prisma.documentKS3.create({
      data: {
        number: 'КС-3-001/2024',
        workPlanId: workPlans[0].id,
        ks2Id: ks2Docs[0].id,
        period: new Date('2024-01-01'),
        totalAmount: 4500000,
        vatAmount: 900000,
        totalWithVat: 5400000,
        previousTotal: 0,
        currentTotal: 5400000,
        status: DocumentStatus.APPROVED,
        createdById: users[1].id,
        signedById: users[0].id,
        signedAt: new Date('2024-02-10'),
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
        number: 'АСР-001/2024',
        workPlanId: workPlans[0].id,
        workStageId: stages[0].id,
        name: 'Акт освидетельствования скрытых работ - прокладка кабель-каналов',
        description: 'Прокладка кабель-каналов на этажах 1-10, секция А',
        location: 'Корпус 1, этажи 1-10, секция А',
        executedAt: new Date('2024-01-25'),
        signedAt: new Date('2024-01-26'),
        status: HiddenWorkActStatus.APPROVED,
        contractorName: 'Петров И.С.',
        contractorPosition: 'Менеджер проекта',
        customerName: 'Сидоров А.Н.',
        customerPosition: 'Представитель заказчика',
      },
    }),
    prisma.hiddenWorkAct.create({
      data: {
        number: 'АСР-002/2024',
        workPlanId: workPlans[1].id,
        workStageId: stages[5].id,
        name: 'Акт освидетельствования скрытых работ - монтаж пожарных извещателей',
        description: 'Установка дымовых пожарных извещателей на этажах 1-15',
        location: 'Корпус 1, этажи 1-15',
        executedAt: new Date('2024-02-20'),
        signedAt: new Date('2024-02-22'),
        status: HiddenWorkActStatus.SIGNED,
        contractorName: 'Петров И.С.',
        contractorPosition: 'Менеджер проекта',
      },
    }),
  ])
  console.log(`✅ Создано ${hiddenActs.length} актов скрытых работ`)

  // ============================================
  // НАЧИСЛЕНИЯ ЗАРПЛАТЫ
  // ============================================
  const salaryPayments = await Promise.all([
    prisma.salaryPayment.create({
      data: {
        employeeId: employees[0].id,
        period: new Date('2024-01-01'),
        workDays: 20,
        hoursWorked: 160,
        baseAmount: 72000,
        bonus: 5000,
        deductions: 0,
        tax: 10140,
        total: 66860,
        status: PaymentStatus.PAID,
        paidAt: new Date('2024-02-05'),
      },
    }),
    prisma.salaryPayment.create({
      data: {
        employeeId: employees[1].id,
        period: new Date('2024-01-01'),
        workDays: 22,
        hoursWorked: 176,
        baseAmount: 88000,
        bonus: 8000,
        deductions: 0,
        tax: 12480,
        total: 83520,
        status: PaymentStatus.PAID,
        paidAt: new Date('2024-02-05'),
      },
    }),
    prisma.salaryPayment.create({
      data: {
        employeeId: employees[2].id,
        period: new Date('2024-01-01'),
        workDays: 21,
        hoursWorked: 168,
        baseAmount: 80640,
        bonus: 6000,
        deductions: 0,
        tax: 11289,
        total: 75351,
        status: PaymentStatus.PAID,
        paidAt: new Date('2024-02-05'),
      },
    }),
    prisma.salaryPayment.create({
      data: {
        employeeId: employees[0].id,
        period: new Date('2024-02-01'),
        workDays: 19,
        hoursWorked: 152,
        baseAmount: 68400,
        bonus: 3000,
        deductions: 0,
        tax: 9282,
        total: 62118,
        status: PaymentStatus.PENDING,
      },
    }),
    prisma.salaryPayment.create({
      data: {
        employeeId: employees[1].id,
        period: new Date('2024-02-01'),
        workDays: 20,
        hoursWorked: 160,
        baseAmount: 80000,
        bonus: 10000,
        deductions: 0,
        tax: 11700,
        total: 78300,
        status: PaymentStatus.PENDING,
      },
    }),
  ])
  console.log(`✅ Создано ${salaryPayments.length} начислений зарплаты`)

  // ============================================
  // НАРЯДЫ НА МОНТАЖ
  // ============================================
  const orders = await Promise.all([
    prisma.installationOrder.create({
      data: {
        number: 'НРД-001/2024',
        workPlanId: workPlans[0].id,
        workStageId: stages[2].id,
        name: 'Прокладка ВОЛС этажи 11-15',
        description: 'Прокладка оптоволоконного кабеля на этажах 11-15 секция Б',
        location: 'Корпус 1, этажи 11-15, секция Б',
        deadline: new Date('2024-03-15'),
        status: InstallationOrderStatus.IN_PROGRESS,
        priority: 2,
        createdById: users[1].id,
      },
    }),
    prisma.installationOrder.create({
      data: {
        number: 'НРД-002/2024',
        workPlanId: workPlans[0].id,
        workStageId: stages[3].id,
        name: 'Монтаж активного оборудования',
        description: 'Установка коммутаторов и маршрутизаторов в техпомещениях',
        location: 'Корпус 1, техпомещения',
        deadline: new Date('2024-04-01'),
        status: InstallationOrderStatus.ASSIGNED,
        priority: 3,
        createdById: users[1].id,
      },
    }),
    prisma.installationOrder.create({
      data: {
        number: 'НРД-003/2024',
        workPlanId: workPlans[1].id,
        workStageId: stages[6].id,
        name: 'Доустановка оповещателей',
        description: 'Дополнительная установка речевых оповещателей',
        location: 'Корпус 1, этажи 1-5',
        deadline: new Date('2024-03-20'),
        status: InstallationOrderStatus.ASSIGNED,
        priority: 2,
        createdById: users[1].id,
      },
    }),
  ])

  // Назначаем работников на наряды
  await prisma.orderAssignee.createMany({
    data: [
      { orderId: orders[0].id, employeeId: employees[0].id },
      { orderId: orders[0].id, employeeId: employees[5].id },
      { orderId: orders[1].id, employeeId: employees[1].id },
      { orderId: orders[2].id, employeeId: employees[2].id },
    ],
  })
  console.log(`✅ Создано ${orders.length} нарядов на монтаж`)

  // ============================================
  // ТЕХНИКА БЕЗОПАСНОСТИ
  // ============================================
  const briefings = await Promise.all([
    prisma.safetyBriefing.create({
      data: {
        name: 'Вводный инструктаж',
        description: 'Первичный инструктаж по технике безопасности при приеме на работу',
        required: true,
      },
    }),
    prisma.safetyBriefing.create({
      data: {
        name: 'Инструктаж по электробезопасности',
        description: 'Инструктаж по работе с электрооборудованием и инструментом',
        workDirectionId: directions[0].id,
        required: true,
        periodDays: 90,
      },
    }),
    prisma.safetyBriefing.create({
      data: {
        name: 'Инструктаж по пожарной безопасности',
        description: 'Инструктаж по пожарной безопасности на объекте',
        workDirectionId: directions[1].id,
        required: true,
        periodDays: 180,
      },
    }),
    prisma.safetyBriefing.create({
      data: {
        name: 'Инструктаж по работе на высоте',
        description: 'Инструктаж по технике безопасности при работе на высоте',
        required: true,
        periodDays: 90,
      },
    }),
  ])

  // Записи о прохождении инструктажей
  await prisma.safetyRecord.createMany({
    data: [
      { employeeId: employees[0].id, briefingId: briefings[0].id, date: new Date('2024-01-15'), result: 'прошел', nextDate: new Date('2024-07-15') },
      { employeeId: employees[0].id, briefingId: briefings[1].id, date: new Date('2024-01-15'), result: 'прошел', nextDate: new Date('2024-04-15') },
      { employeeId: employees[1].id, briefingId: briefings[0].id, date: new Date('2024-01-10'), result: 'прошел', nextDate: new Date('2024-07-10') },
      { employeeId: employees[2].id, briefingId: briefings[0].id, date: new Date('2024-02-01'), result: 'прошел', nextDate: new Date('2024-08-01') },
      { employeeId: employees[2].id, briefingId: briefings[2].id, date: new Date('2024-02-01'), result: 'прошел', nextDate: new Date('2024-08-01') },
    ],
  })
  console.log(`✅ Создано ${briefings.length} инструктажей`)

  // ============================================
  // СХЕМЫ МОНТАЖА
  // ============================================
  await prisma.installationScheme.createMany({
    data: [
      {
        name: 'Схема прокладки ВОЛС Корпус 1',
        workDirectionId: directions[0].id,
        buildingId: buildings[0].id,
        floor: null,
        description: 'Общая схема прокладки оптоволоконного кабеля по корпусу 1',
      },
      {
        name: 'Схема расстановки пожарных извещателей',
        workDirectionId: directions[1].id,
        buildingId: buildings[0].id,
        floor: 1,
        room: null,
        description: 'Типовая схема расстановки дымовых и тепловых извещателей',
      },
      {
        name: 'Схема АСУ вентиляцией',
        workDirectionId: directions[2].id,
        buildingId: buildings[0].id,
        description: 'Функциональная схема автоматизации системы вентиляции',
      },
    ],
  })
  console.log(`✅ Создано 3 схемы монтажа`)

  console.log('\n✅ Заполнение базы данных завершено!')
  console.log('\n📋 Данные для входа:')
  console.log('  Администратор: admin@stroytest.ru / admin123')
  console.log('  Менеджер: manager@stroytest.ru / admin123')
  console.log('  Прораб: foreman@stroytest.ru / admin123')
  console.log('  Бухгалтер: accountant@stroytest.ru / admin123')
  console.log('  Рабочий: worker@stroytest.ru / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
