import { PivotCycle } from '@prisma/client'
import { PivotCard } from './PivotCard'
import { CurrentPhaseForm } from './CurrentPhaseForm' // インポート追加

type Props = {
  cycles: PivotCycle[]
}

export function PivotTimeline({ cycles }: Props) {
  return (
    <div className="relative pl-8 space-y-12">
      {/* 縦の線 */}
      <div className="absolute left-[11px] top-2 bottom-0 w-0.5 bg-gray-200" />

      {cycles.map((cycle, index) => {
        const isLatest = index === 0

        return (
          <div key={cycle.id} className="relative">
            {/* 丸いドット */}
            <div 
              className={`absolute -left-[29px] top-6 w-6 h-6 rounded-full border-4 border-white 
                ${isLatest ? 'bg-blue-500 ring-4 ring-blue-100 z-10' : 'bg-gray-400 z-0'}
              `}
            />

            {/* ここで分岐！ */}
            {isLatest ? (
              // 最新ならフォームを表示
              <CurrentPhaseForm cycle={cycle} />
            ) : (
              // 過去なら閲覧用カードを表示
              <PivotCard cycle={cycle} isLatest={false} />
            )}
          </div>
        )
      })}
    </div>
  )
}
