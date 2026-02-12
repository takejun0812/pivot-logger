// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding...')

  // 1. 既存データをクリア（リセット）
  await prisma.feedback.deleteMany()
  await prisma.pivotCycle.deleteMany()
  await prisma.project.deleteMany()

  // 2. ダミーのユーザーID（本来はSupabase AuthのUID）
  const userId = 'user-123456'

  // 3. プロジェクト作成: 「佐渡の天然塩キャラメル販売」
  const project = await prisma.project.create({
    data: {
      userId,
      title: '佐渡天然塩キャラメル事業',
      mission: '佐渡のミネラル豊富な塩を使ったお菓子で、観光客のお土産需要を満たす',
      status: 'ACTIVE',
    },
  })

  console.log(`Created project: ${project.title}`)

  // 4. サイクル1: 学園祭での販売（失敗・ピボット）
  await prisma.pivotCycle.create({
    data: {
      projectId: project.id,
      phase: 1,
      hypothesis: '学園祭で1個300円で売れば、高校生でも手軽に買ってもらえるはず',
      action: '手作りで100個用意し、手書きPOPで宣伝した',
      result: '完売したが、原価計算が甘く、利益がほとんど出なかった（赤字ギリギリ）',
      learning: '手作りは限界がある。価格設定をもっと高くできる付加価値が必要。',
      status: 'COMPLETED',
      decision: 'PIVOT', // 次へピボット！
      feedbacks: {
        create: [
          {
            content: '完売は素晴らしい実績です。次は「利益率」を第一に考えましょう。',
            authorType: 'MENTOR',
          },
        ],
      },
    },
  })

  // 5. サイクル2: 高級路線でEC販売（失敗・ピボット）
  await prisma.pivotCycle.create({
    data: {
      projectId: project.id,
      phase: 2,
      hypothesis: 'パッケージを高級にして、ネットで1個800円で全国販売する',
      action: 'BASEでショップを開設し、Instagramで広告を出した',
      result: '広告費がかさみ、送料も高くてリピートにつながらない。競合が多すぎる。',
      learning: '全国配送は送料の壁がある。佐渡に来た人にターゲットを絞るべきでは？',
      status: 'COMPLETED',
      decision: 'PIVOT', // またピボット！
    },
  })

  // 6. サイクル3: ホテルへの卸売（現在進行中）
  await prisma.pivotCycle.create({
    data: {
      projectId: project.id,
      phase: 3,
      hypothesis: '島内の高級ホテルのお茶請けとして採用してもらう',
      action: '現在、島内3つのホテルにサンプルを持ち込み営業中',
      status: 'RUNNING', // 今ここ！
      decision: 'PENDING',
    },
  })

  console.log('✅ Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
