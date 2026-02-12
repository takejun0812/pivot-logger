import { prisma } from '@/lib/prisma'
import { cache } from 'react'

// プロジェクトと、それに紐づく履歴（Cycles）を全取得
export const getProjectWithHistory = cache(async (userId: string) => {
  return await prisma.project.findFirst({
    where: {
      userId: userId,
    },
    include: {
      cycles: {
        orderBy: {
          phase: 'desc',
        },
        include: {
          feedbacks: true,
        },
      },
    },
  })
})
