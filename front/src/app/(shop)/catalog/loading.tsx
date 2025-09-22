export default function Loading() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="h-8 w-64 skeleton-text mb-2" />
          <div className="h-5 w-96 skeleton-text" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="aspect-square skeleton" />
              <div className="p-4 space-y-3">
                <div className="skeleton-text h-3 w-1/3" />
                <div className="skeleton-title" />
                <div className="skeleton-text h-5 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
