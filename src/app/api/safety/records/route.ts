import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const briefingId = searchParams.get('briefingId')

    const where: Record<string, unknown> = {}
    if (employeeId) where.employeeId = employeeId
    if (briefingId) where.briefingId = briefingId

    const records = await db.safetyRecord.findMany({
      where,
      include: {
        employee: true,
        briefing: {
          include: {
            workDirection: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error('Get safety records error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения записей о прохождении инструктажей' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const record = await db.safetyRecord.create({
      data: {
        employeeId: data.employeeId,
        briefingId: data.briefingId,
        date: new Date(data.date || new Date()),
        result: data.result || 'прошел',
        notes: data.notes,
        nextDate: data.nextDate ? new Date(data.nextDate) : null,
      },
      include: {
        employee: true,
        briefing: true,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Create safety record error:', error)
    return NextResponse.json(
      { error: 'Ошибка создания записи о прохождении инструктажа' },
      { status: 500 }
    )
  }
}
