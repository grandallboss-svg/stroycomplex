import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET - получить информацию о базе данных
export async function GET() {
  try {
    const [users, directions, buildings, plans, employees, orders] = await Promise.all([
      db.user.count(),
      db.workDirection.count(),
      db.building.count(),
      db.workPlan.count(),
      db.employee.count(),
      db.installationOrder.count(),
    ])
    
    return NextResponse.json({
      counts: { users, directions, buildings, plans, employees, orders },
      total: users + directions + buildings + plans + employees + orders
    })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка получения статистики' }, { status: 500 })
  }
}

// POST - инициализировать демо-данные или очистить базу
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'clear') {
      // Очистка базы данных (кроме пользователя admin)
      await Promise.all([
        db.work.deleteMany(),
        db.workStage.deleteMany(),
        db.documentKS2Item.deleteMany(),
        db.documentKS2.deleteMany(),
        db.documentKS3.deleteMany(),
        db.hiddenWorkAct.deleteMany(),
        db.orderAssignee.deleteMany(),
        db.orderItem.deleteMany(),
        db.installationOrder.deleteMany(),
        db.workAssignment.deleteMany(),
        db.salaryPayment.deleteMany(),
        db.safetyRecord.deleteMany(),
        db.safetyBriefing.deleteMany(),
        db.employee.deleteMany(),
        db.workPlan.deleteMany(),
        db.installationScheme.deleteMany(),
        db.building.deleteMany(),
        db.workDirection.deleteMany(),
      ])
      
      return NextResponse.json({ success: true, message: 'База данных очищена' })
    }
    
    if (action === 'demo') {
      // Сначала очищаем
      await Promise.all([
        db.work.deleteMany(),
        db.workStage.deleteMany(),
        db.documentKS2Item.deleteMany(),
        db.documentKS2.deleteMany(),
        db.documentKS3.deleteMany(),
        db.hiddenWorkAct.deleteMany(),
        db.orderAssignee.deleteMany(),
        db.orderItem.deleteMany(),
        db.installationOrder.deleteMany(),
        db.workAssignment.deleteMany(),
        db.salaryPayment.deleteMany(),
        db.safetyRecord.deleteMany(),
        db.safetyBriefing.deleteMany(),
        db.employee.deleteMany(),
        db.workPlan.deleteMany(),
        db.installationScheme.deleteMany(),
        db.building.deleteMany(),
        db.workDirection.deleteMany(),
      ])
      
      // Создаём направления
      const dir1 = await db.workDirection.create({
        data: { name: 'Сети связи', code: 'СС', description: 'Монтаж структурированных кабельных сетей', color: '#3B82F6' }
      })
      const dir2 = await db.workDirection.create({
        data: { name: 'АСПЗ', code: 'АСПЗ', description: 'Автоматическая система пожаротушения', color: '#EF4444' }
      })
      const dir3 = await db.workDirection.create({
        data: { name: 'Автоматизация вентиляции', code: 'АСВ', description: 'Системы вентиляции и кондиционирования', color: '#10B981' }
      })
      
      // Создаём объекты
      const bld1 = await db.building.create({
        data: { name: 'Корпус 1', address: 'г. Москва, ул. Строителей, д. 1', floors: 12, status: 'ACTIVE' }
      })
      const bld2 = await db.building.create({
        data: { name: 'Корпус 2', address: 'г. Москва, ул. Строителей, д. 2', floors: 8, status: 'ACTIVE' }
      })
      const bld3 = await db.building.create({
        data: { name: 'Корпус 3', address: 'г. Москва, ул. Строителей, д. 3', floors: 5, status: 'PLANNED' }
      })
      
      // Создаём сотрудников
      const emp1 = await db.employee.create({
        data: { fullName: 'Иванов Иван Петрович', phone: '+7 900 111-11-11', position: 'Прораб', specialty: 'Электромонтажник', monthlySalary: 85000, status: 'ACTIVE' }
      })
      const emp2 = await db.employee.create({
        data: { fullName: 'Петров Сергей Николаевич', phone: '+7 900 222-22-22', position: 'Монтажник', specialty: 'Монтажник СКС', monthlySalary: 65000, status: 'ACTIVE' }
      })
      const emp3 = await db.employee.create({
        data: { fullName: 'Сидоров Алексей Викторович', phone: '+7 900 333-33-33', position: 'Монтажник', specialty: 'Слесарь', monthlySalary: 60000, status: 'ACTIVE' }
      })
      
      // Создаём планы работ
      const plan1 = await db.workPlan.create({
        data: {
          name: 'Монтаж ЛВС Корпус 1',
          contractNumber: 'Д-2024-001',
          workDirectionId: dir1.id,
          buildingId: bld1.id,
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-06-30'),
          totalAmount: 2500000,
          status: 'IN_PROGRESS',
          stages: {
            create: [
              { name: 'Прокладка кабель-каналов', order: 0, plannedAmount: 500000, status: 'COMPLETED', percentComplete: 100 },
              { name: 'Монтаж кабельных трасс', order: 1, plannedAmount: 800000, status: 'IN_PROGRESS', percentComplete: 60 },
              { name: 'Установка розеток', order: 2, plannedAmount: 400000, status: 'PENDING', percentComplete: 0 },
              { name: 'Тестирование и сдача', order: 3, plannedAmount: 300000, status: 'PENDING', percentComplete: 0 },
            ]
          }
        }
      })
      
      const plan2 = await db.workPlan.create({
        data: {
          name: 'АСПЗ Корпус 2',
          contractNumber: 'Д-2024-002',
          workDirectionId: dir2.id,
          buildingId: bld2.id,
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-08-31'),
          totalAmount: 4200000,
          status: 'IN_PROGRESS',
          stages: {
            create: [
              { name: 'Проектирование', order: 0, plannedAmount: 400000, status: 'COMPLETED', percentComplete: 100 },
              { name: 'Монтаж трубопроводов', order: 1, plannedAmount: 1500000, status: 'IN_PROGRESS', percentComplete: 45 },
              { name: 'Установка оросителей', order: 2, plannedAmount: 1200000, status: 'PENDING', percentComplete: 0 },
              { name: 'Пуско-наладка', order: 3, plannedAmount: 600000, status: 'PENDING', percentComplete: 0 },
            ]
          }
        }
      })
      
      const plan3 = await db.workPlan.create({
        data: {
          name: 'Вентиляция Корпус 1',
          contractNumber: 'Д-2024-003',
          workDirectionId: dir3.id,
          buildingId: bld1.id,
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-09-30'),
          totalAmount: 3100000,
          status: 'APPROVED',
          stages: {
            create: [
              { name: 'Монтаж воздуховодов', order: 0, plannedAmount: 1200000, status: 'PENDING', percentComplete: 0 },
              { name: 'Установка вентиляторов', order: 1, plannedAmount: 800000, status: 'PENDING', percentComplete: 0 },
              { name: 'Автоматизация', order: 2, plannedAmount: 600000, status: 'PENDING', percentComplete: 0 },
            ]
          }
        }
      })
      
      // Создаём инструктажи
      const brief1 = await db.safetyBriefing.create({
        data: { name: 'Вводный инструктаж', description: 'Первичный инструктаж по технике безопасности', required: true }
      })
      const brief2 = await db.safetyBriefing.create({
        data: { name: 'Инструктаж по электробезопасности', description: 'Работы с электрооборудованием', required: true }
      })
      
      // Создаём записи инструктажей
      await db.safetyRecord.createMany({
        data: [
          { employeeId: emp1.id, briefingId: brief1.id, result: 'прошел' },
          { employeeId: emp2.id, briefingId: brief1.id, result: 'прошел' },
          { employeeId: emp3.id, briefingId: brief1.id, result: 'прошел' },
          { employeeId: emp1.id, briefingId: brief2.id, result: 'прошел' },
          { employeeId: emp2.id, briefingId: brief2.id, result: 'прошел' },
        ]
      })
      
      // Создаём наряды
      await db.installationOrder.create({
        data: {
          number: 'НМ-001',
          name: 'Прокладка кабеля 5 этаж',
          workPlanId: plan1.id,
          location: 'Корпус 1, 5 этаж',
          deadline: new Date('2024-04-15'),
          status: 'COMPLETED',
          priority: 2,
          assignees: {
            create: [
              { employeeId: emp1.id },
              { employeeId: emp2.id },
            ]
          },
          items: {
            create: [
              { name: 'Прокладка кабеля UTP cat.6', unit: 'м', quantity: 150, unitPrice: 120 },
              { name: 'Монтаж короба 60x40', unit: 'м', quantity: 80, unitPrice: 350 },
            ]
          }
        }
      })
      
      await db.installationOrder.create({
        data: {
          number: 'НМ-002',
          name: 'Установка оросителей 3 этаж',
          workPlanId: plan2.id,
          location: 'Корпус 2, 3 этаж',
          deadline: new Date('2024-05-20'),
          status: 'IN_PROGRESS',
          priority: 3,
          assignees: {
            create: [
              { employeeId: emp2.id },
              { employeeId: emp3.id },
            ]
          },
          items: {
            create: [
              { name: 'Установка оросителя', unit: 'шт', quantity: 24, unitPrice: 2500 },
              { name: 'Монтаж распределительной трубы', unit: 'м', quantity: 45, unitPrice: 800 },
            ]
          }
        }
      })
      
      return NextResponse.json({ success: true, message: 'Демо-данные загружены' })
    }
    
    return NextResponse.json({ error: 'Неизвестное действие' }, { status: 400 })
  } catch (error) {
    console.error('Database action error:', error)
    return NextResponse.json({ error: 'Ошибка выполнения операции' }, { status: 500 })
  }
}
