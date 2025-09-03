"use client";

import { WeeklyScheduleCalendar } from "@/components/weekly-schedule-calendar";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WeeklySchedulePage() {
  const router = useRouter();

  return (
    <div className="flex-1 p-4 md:p-6">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          بازگشت به صفحه قبل
        </Button>
      </div>
      <WeeklyScheduleCalendar />
    </div>
  );
}

