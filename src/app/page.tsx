import { getProjectWithHistory } from '@/features/pivot/queries'
// 作成したコンポーネントをインポート
import { PivotTimeline } from '@/features/pivot/components/PivotTimeline'

export default async function Home() {
  const project = await getProjectWithHistory('user-123456')

  if (!project) return <div className="p-8">プロジェクトが見つかりません</div>

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* ヘッダーセクション */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            {project.title}
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Mission: {project.mission}
          </p>
        </div>

        {/* ここにタイムラインを配置！ */}
        <PivotTimeline cycles={project.cycles} />
        
      </div>
    </main>
  )
}
