'use client'
import { PivotCycle } from '@prisma/client'

type Props = {
  cycle: PivotCycle
  isLatest: boolean
}

export function PivotCard({ cycle, isLatest }: Props) {
  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-600',
    RUNNING: 'bg-blue-100 text-blue-700 border-blue-200',
    REVIEW: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  }

  const cardStyle = isLatest
    ? 'bg-white border-2 border-blue-500 shadow-lg scale-100'
    : 'bg-gray-50 border border-gray-200 grayscale-[0.5] hover:grayscale-0 transition-all'

  return (
    <div className={`rounded-xl p-6 ${cardStyle} relative`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Phase {cycle.phase}
          </span>
          <h3 className="text-lg font-bold text-gray-900 mt-1">
            {cycle.hypothesis || '仮説がまだ設定されていません'}
          </h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[cycle.status]}`}>
          {cycle.status}
        </span>
      </div>

      <div className="space-y-3 text-sm text-gray-600">
        {cycle.action && (
          <div className="flex gap-2">
            <span className="font-bold min-w-[3rem]">Action:</span>
            <p>{cycle.action}</p>
          </div>
        )}
        {cycle.result && (
          <div className="flex gap-2">
            <span className="font-bold min-w-[3rem]">Result:</span>
            <p>{cycle.result}</p>
          </div>
        )}
      </div>

      {!isLatest && cycle.decision !== 'PENDING' && (
    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
      
      <div className="flex-1 pr-4">
        {cycle.learning ? (
          <p className="text-xs text-gray-500 italic">
            <span className="font-bold">学び:</span> "{cycle.learning}"
          </p>
        ) : (
          <span className="text-xs text-gray-300">学びの記録なし</span>
        )}
      </div>

      <div className={`px-3 py-1 rounded-lg border-2 text-xs font-black uppercase tracking-widest transform -rotate-2
        ${cycle.decision === 'PIVOT' 
          ? 'border-orange-200 bg-orange-50 text-orange-600'
          : 'border-green-200 bg-green-50 text-green-600'
        }
      `}>
        {cycle.decision === 'PIVOT' ? '⚡️ PIVOTED' : '🚀 PERSEVERED'}
      </div>

    </div>
  )}
</div>
  )
}
