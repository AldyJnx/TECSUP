"use client";

import { CalendarIcon } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value: string; // ISO yyyy-mm-dd
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

function toDate(value: string): Date | undefined {
  if (!value) return undefined;
  const d = parseISO(value);
  return isValid(d) ? d : undefined;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecciona una fecha",
  id,
}: DatePickerProps) {
  const selected = toDate(value);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selected && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 size-4" />
            {selected
              ? format(selected, "PPP", { locale: es })
              : placeholder}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          captionLayout="dropdown"
          locale={es}
          onSelect={(date) =>
            onChange(date ? format(date, "yyyy-MM-dd") : "")
          }
        />
      </PopoverContent>
    </Popover>
  );
}
