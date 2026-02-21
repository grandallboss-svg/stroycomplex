import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function PUT(req: Request) {
  try {
    const { id, oldPassword, newPassword } = await req.json()
    const user = await db.user.findUnique({ where: { id } })
    if (!user) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    const valid = await bcrypt.compare(oldPassword, user.password)
    if (!valid) return NextResponse.json({ error: 'Неверный пароль' }, { status: 400 })
    const hashed = await bcrypt.hash(newPassword, 10)
    await db.user.update({ where: { id }, data: { password: hashed } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}
