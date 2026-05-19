export default function QBag({ id, used, onClick }) {
  return (
    <div className={`qbag ${used?'used':'bag-q'} flex flex-col items-center justify-center py-3 px-1 aspect-square select-none`}
      style={{animationDelay:`${(id%5)*0.35}s`}}
      onClick={()=>!used&&onClick(id)}>
      <div style={{fontSize:26}}>{used?'📭':'🎁'}</div>
      <div className={`font-bold mt-0.5 ${used?'text-gray-500':'text-yellow-900'}`} style={{fontSize:10}}>#{id}</div>
    </div>
  )
}
