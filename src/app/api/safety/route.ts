import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
// GET /api/safety - Получить инструктажи или записи
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'briefings'
    
    if (type === 'records') {
      const employeeId = searchParams.get('employeeId')
      const where: Record<string, unknown> = {}
      if (employeeId) where.employeeId = employeeId
      
      const records = await db.safetyRecord.findMany({
        where,
        orderBy: { date: 'desc' },
        include: {
          employee: true,
          briefing: true,
        }
      })
      return NextResponse.json(records)
    } else {
      const briefings = await db.safetyBriefing.findMany({
        orderBy: { name: 'asc' },
        include: {
          workDirection: true,
          _count: {
            select: { records: true }
          }
        }
      })
      return NextResponse.json(briefings)
    }
  } catch (error) {
    console.error('Error fetching safety data:', error)
    return NextResponse.json({ error: 'Ошибка получения данных' }, { status: 500 })
  }
}

// POST /api/safety - Создать запись о прохождении инструктажа
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (data.type === 'briefing') {
      const briefing = await db.safetyBriefing.create({
        data: {
          name: data.name,
          description: data.description,
          workDirectionId: data.workDirectionId,
          required: data.required ?? true,
          periodDays: data.periodDays,
        }
      })
      return NextResponse.json(briefing)
    } else {
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
        }
      })
      return NextResponse.json(record)
    }
  } catch (error) {
    console.error('Error creating safety data:', error)
    return NextResponse.json({ error: 'Ошибка создания записи' }, { status: 500 })
  }
}
