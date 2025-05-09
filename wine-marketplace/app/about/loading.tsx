import { Skeleton } from "@/components/ui/skeleton"

export default function AboutLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section Skeleton */}
      <div className="relative rounded-xl overflow-hidden mb-16">
        <Skeleton className="w-full h-[400px]" />
      </div>

      {/* Our Story Skeleton */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <Skeleton className="h-10 w-2/3 mb-6" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="md:w-1/2">
            <Skeleton className="w-full h-[300px] rounded-lg" />
          </div>
        </div>
      </section>

      <Skeleton className="h-px w-full my-16" />

      {/* Our Mission Skeleton */}
      <section className="mb-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Skeleton className="h-10 w-1/3 mx-auto mb-6" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border rounded-lg p-6">
              <Skeleton className="h-6 w-1/3 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </section>

      {/* Wine Selection Process Skeleton */}
      <section className="mb-16 bg-gray-50 rounded-xl p-8">
        <Skeleton className="h-10 w-1/3 mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-4 mb-6">
                <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full" />
                <div className="w-full">
                  <Skeleton className="h-6 w-1/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>
          <div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-4 mb-6">
                <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full" />
                <div className="w-full">
                  <Skeleton className="h-6 w-1/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Skeleton */}
      <section className="mb-16">
        <Skeleton className="h-10 w-1/3 mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-40 w-40 rounded-full mx-auto mb-4" />
              <Skeleton className="h-6 w-2/3 mx-auto mb-2" />
              <Skeleton className="h-4 w-1/3 mx-auto mb-2" />
              <Skeleton className="h-4 w-5/6 mx-auto" />
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA Skeleton */}
      <section className="bg-gray-100 rounded-xl p-8 text-center">
        <Skeleton className="h-10 w-1/3 mx-auto mb-4" />
        <Skeleton className="h-4 w-full max-w-2xl mx-auto mb-2" />
        <Skeleton className="h-4 w-5/6 max-w-2xl mx-auto mb-6" />
        <div className="flex flex-wrap justify-center gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </section>
    </div>
  )
}
