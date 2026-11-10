export function StatGridSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card p-5">
          <div className="flex items-start justify-between">
            <div className="w-full space-y-2">
              <div className="skeleton h-3.5 w-24" />
              <div className="skeleton h-8 w-16" />
              <div className="skeleton h-3 w-28" />
            </div>
            <div className="skeleton size-11 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TaskGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card space-y-3 p-5">
          <div className="flex gap-2">
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-5 w-20 rounded-full" />
          </div>
          <div className="skeleton h-5 w-3/4" />
          <div className="skeleton h-3.5 w-full" />
          <div className="skeleton h-3.5 w-2/3" />
          <div className="flex items-center justify-between pt-3">
            <div className="skeleton h-3.5 w-24" />
            <div className="skeleton h-7 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-4 w-72" />
      </div>
      <StatGridSkeleton />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card space-y-4 p-5 lg:col-span-2">
          <div className="skeleton h-5 w-32" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-12 w-full" />
          ))}
        </div>
        <div className="card space-y-4 p-5">
          <div className="skeleton h-5 w-32" />
          <div className="skeleton mx-auto size-32 rounded-full" />
          <div className="skeleton h-4 w-full" />
        </div>
      </div>
    </div>
  );
}
