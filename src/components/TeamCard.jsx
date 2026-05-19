import { useState, useEffect, useRef } from 'react'

export default function TeamCard({ team, active, onClick, onDelta }) {
  const [pop, setPop] = useState(false)
  const prev = useRef(team.score)

  useEffect(() => {
    if (prev.current !== team.score) {
      setPop(true)
      const t = setTimeout(()=>setPop(false), 500)
      prev.current = team.score
      return () => clearTimeout(t)
    }
  }, [team.score])

  return (
    <div onClick={onClick}
      className={`relative bg-white rounded-2xl p-3 border-4 cursor-pointer select-none transition-all duration-200
        ${active?'border-yellow-400 glow-gold scale-105':'border-white/30 hover:border-yellow-300'}`}
      style={{minWidth:112}}>
      {team.shielded && <div style={{position:'absolute',top:-8,right:-8,fontSize:18}}>🛡️</div>}
      <div className="text-center">
        <div className="font-black text-red-800 text-sm truncate">{team.name}</div>
        <div className={`font-black text-4xl mt-1 ${team.score<0?'text-red-600':'text-red-900'} ${pop?'score-pop':''}`}>
          {team.score}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">điểm</div>
        <div className="flex gap-1 justify-center mt-2">
          <button className="w-7 h-7 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-black text-base leading-none"
            onClick={e=>{e.stopPropagation();onDelta(team.id,-1)}}>−</button>
          <button className="w-7 h-7 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-black text-base leading-none"
            onClick={e=>{e.stopPropagation();onDelta(team.id,1)}}>+</button>
        </div>
      </div>
    </div>
  )
}
