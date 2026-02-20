import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const act = await db.hiddenWorkAct.findUnique({
      where: { id },
      include: {
        workPlan: {
          include: {
            workDirection: true,
            building: true,
          },
        },
        workStage: true,
      },
    })

    if (!act) {
      return NextResponse.json(
        { error: 'Акт не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json(act)
  } catch (error) {
    console.error('Get hidden act error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения акта скрытых работ' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const act = await db.hiddenWorkAct.update({
      where: { id },
      data: {
        description: data.description,
        executedAt: data.executedAt ? new Date(data.executedAt) : undefined,
        status: data.status,
        signedBy: data.signedBy,
        acceptedBy: data.acceptedBy,
        signedAt: data.status === 'SIGNED' ? new Date() : undefined,
      },
      include: {
        workPlan: true,
        workStage: true,
      },
    })

    return NextResponse.json(act)
  } catch (error) {
    console.error('Update hidden act error:', error)
    return NextResponse.json(
      { error: 'Ошибка обновления акта скрытых работ' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.hiddenWorkAct.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Акт скрытых работ удален' })
  } catch (error) {
    console.error('Delete hidden act error:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления акта скрытых работ' },
      { status: 500 }
    )
  }
}
