import { useState, useEffect } from 'react'
import { beep } from '../../utils/audio'

export default function RewardRevealModal({ reward, onApply, onClose }) {
  const [spinning, setSpinning] = useState(true)

  useEffect(() => {
    beep('open')
    const t = setTimeout(()=>setSpinning(false), 900)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="modal-bg">
      {spinning ? (
        <div style={{fontSize:100}} className="animate-bounce">🌟</div>
      ) : (
        <div className={`spin-reveal bg-gradient-to-br ${reward.col} rounded-3xl p-8 mx-4 text-center shadow-2xl`} style={{maxWidth:380}}>
          <div style={{fontSize:64}}>{reward.emoji}</div>
          <div className="text-white font-black text-2xl mt-2">{reward.label}</div>
          <div className="text-white/85 text-sm mt-1">{reward.desc}</div>
          <button className="mt-5 px-8 py-3 bg-white font-black text-gray-800 rounded-2xl shadow-lg text-lg active:scale-95 transition-all"
            onClick={onApply}>Áp dụng! 🎉</button>
          <button className="block mx-auto mt-3 text-white/50 hover:text-white text-sm" onClick={onClose}>Đóng</button>
        </div>
      )}
    </div>
  )
}
