import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
// GET /api/employees - Получить всех сотрудников
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const employees = await db.employee.findMany({
      where,
      orderBy: { fullName: 'asc' },
      include: {
        _count: {
          select: { workAssignments: true, salaryPayments: true, orderAssignments: true }
        }
      }
    })
    return NextResponse.json(employees)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({ error: 'Ошибка получения сотрудников' }, { status: 500 })
  }
}

// POST /api/employees - Создать сотрудника
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const employee = await db.employee.create({
      data: {
        fullName: data.fullName,
        shortName: data.shortName,
        phone: data.phone,
        email: data.email,
        position: data.position,
        specialty: data.specialty,
        hourlyRate: data.hourlyRate || 0,
        monthlySalary: data.monthlySalary || 0,
        hireDate: data.hireDate ? new Date(data.hireDate) : null,
        status: data.status || 'ACTIVE',
        notes: data.notes,
      }
    })
    return NextResponse.json(employee)
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json({ error: 'Ошибка создания сотрудника' }, { status: 500 })
  }
}
