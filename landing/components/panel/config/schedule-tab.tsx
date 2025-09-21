import { ScheduleConfig } from "@/components/panel/schedule/ScheduleConfig"
import { SpecialHours } from "@/components/panel/schedule/SpecialHours"

interface ScheduleTabProps {
  brandId: number
}

export const ScheduleTab = ({ brandId }: ScheduleTabProps) => {
  return (
    <div className="space-y-6">
      <ScheduleConfig brandId={brandId} />
      <SpecialHours brandId={brandId} />
    </div>
  )
}