export default function RBag({ id, used, locked, onClick }) {
  return (
    <div className={`rbag ${used?'used':locked?'locked':'bag-r'} flex flex-col items-center justify-center py-3 px-1 aspect-square select-none`}
      style={{animationDelay:`${(id%5)*0.4}s`}}
      onClick={()=>!used&&!locked&&onClick(id)}>
      <div style={{fontSize:26,filter:used?'none':'drop-shadow(0 0 6px #FFD700) drop-shadow(0 0 12px #FFA500)'}}>{used?'📭':'🌟'}</div>
      <div className={`font-bold mt-0.5 ${used?'text-gray-500':'text-yellow-300'}`} style={{fontSize:10}}>#{id}</div>
    </div>
  )
}
