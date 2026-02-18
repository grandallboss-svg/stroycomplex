import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
// GET /api/dashboard - Статистика для дашборда
export async function GET() {
  try {
    // Получаем общую статистику
    const [
      totalPlans,
      activePlans,
      completedPlans,
      totalEmployees,
      activeEmployees,
      totalKS2,
      totalKS3,
      pendingSalary,
      totalSalaryAmount,
      totalOrders,
      activeOrders,
      directionsStats,
      recentDocuments,
    ] = await Promise.all([
      // Всего планов работ
      db.workPlan.count(),
      // Активных планов
      db.workPlan.count({ where: { status: 'IN_PROGRESS' } }),
      // Завершенных планов
      db.workPlan.count({ where: { status: 'COMPLETED' } }),
      // Всего сотрудников
      db.employee.count(),
      // Активных сотрудников
      db.employee.count({ where: { status: 'ACTIVE' } }),
      // Документов КС-2
      db.documentKS2.count(),
      // Документов КС-3
      db.documentKS3.count(),
      // Ожидаемых выплат зарплаты
      db.salaryPayment.count({ where: { status: 'PENDING' } }),
      // Сумма к выплате
      db.salaryPayment.aggregate({
        where: { status: 'PENDING' },
        _sum: { total: true }
      }),
      // Всего нарядов
      db.installationOrder.count(),
      // Активных нарядов
      db.installationOrder.count({
        where: { status: { in: ['ASSIGNED', 'IN_PROGRESS'] } }
      }),
      // Статистика по направлениям
      db.workDirection.findMany({
        include: {
          _count: { select: { workPlans: true } },
          workPlans: {
            select: { totalAmount: true, status: true }
          }
        }
      }),
      // Последние документы
      db.documentKS2.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          workPlan: {
            include: { workDirection: true, building: true }
          }
        }
      }),
    ])

    // Суммы по планам работ
    const plansAmounts = await db.workPlan.aggregate({
      _sum: { totalAmount: true }
    })

    // Выполненные суммы по КС-2
    const ks2Amounts = await db.documentKS2.aggregate({
      where: { status: 'APPROVED' },
      _sum: { totalWithVat: true }
    })

    // Статистика по этапам
    const stagesStats = await db.workStage.groupBy({
      by: ['status'],
      _count: { id: true }
    })

    return NextResponse.json({
      overview: {
        totalPlans,
        activePlans,
        completedPlans,
        totalEmployees,
        activeEmployees,
        totalKS2,
        totalKS3,
        pendingSalary,
        totalSalaryAmount: totalSalaryAmount._sum.total || 0,
        totalOrders,
        activeOrders,
      },
      amounts: {
        totalContracts: plansAmounts._sum.totalAmount || 0,
        completedWorks: ks2Amounts._sum.totalWithVat || 0,
      },
      directions: directionsStats.map(d => ({
        id: d.id,
        name: d.name,
        code: d.code,
        color: d.color,
        plansCount: d._count.workPlans,
        totalAmount: d.workPlans.reduce((sum, p) => sum + p.totalAmount, 0),
      })),
      stages: stagesStats,
      recentDocuments,
    })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json({ error: 'Ошибка получения статистики' }, { status: 500 })
  }
}
