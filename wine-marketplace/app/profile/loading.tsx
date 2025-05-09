import { Loader2 } from "lucide-react"

export default function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#722F37] mb-4" />
      <p className="text-gray-500">Loading profile...</p>
    </div>
  )
}
