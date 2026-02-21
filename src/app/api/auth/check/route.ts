import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ active: false }, { status: 401 })
    const user = await db.user.findUnique({ where: { id }, select: { isActive: true } })
    if (!user || !user.isActive) return NextResponse.json({ active: false }, { status: 401 })
    return NextResponse.json({ active: true })
  } catch {
    return NextResponse.json({ active: false }, { status: 500 })
  }
}
