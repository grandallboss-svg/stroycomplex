import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true }
    })
    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json()
    const hashed = await bcrypt.hash(password, 10)
    const user = await db.user.create({
      data: { name, email, password: hashed, role }
    })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Ошибка создания' }, { status: 500 })
  }
}
