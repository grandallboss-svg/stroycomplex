import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(req: Request) {
  try {
    const { id, name, email } = await req.json()
    const user = await db.user.update({
      where: { id },
      data: { name, email }
    })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}
