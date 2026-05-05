export function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-800 rounded-lg w-2/3" />
          <div className="h-4 bg-gray-800 rounded-lg w-1/3" />
          <div className="h-3 bg-gray-800 rounded-lg w-1/2" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-gray-800 rounded-lg" />
          <div className="h-8 w-20 bg-gray-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
      <div className="h-8 bg-gray-800 rounded-lg w-16 mb-2" />
      <div className="h-4 bg-gray-800 rounded-lg w-24" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-gray-800 rounded w-48" />
        <div className="h-3 bg-gray-800 rounded w-32" />
      </div>
      <div className="h-8 w-16 bg-gray-800 rounded-lg" />
    </div>
  );
}

export function SkeletonVerify() {
  return (
    <div className="border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="bg-gray-800 px-6 py-4 h-16" />
      <div className="px-6 py-5 space-y-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex justify-between border-b border-gray-800 pb-2">
            <div className="h-4 bg-gray-800 rounded w-24" />
            <div className="h-4 bg-gray-800 rounded w-36" />
          </div>
        ))}
      </div>
    </div>
  );
}
