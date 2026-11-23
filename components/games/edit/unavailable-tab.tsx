import { TriangleAlert } from "lucide-react";
import { EditSection } from "@/components/games/edit/edit-section";

// A Game Edit section that can't be edited: its read failed when the page
// loaded, or after a save. It says why instead of showing an empty, editable
// section (www#165 review).
export function UnavailableTab({ title, message }: { title: string; message: string }) {
  return (
    <EditSection title={title}>
      <div role="alert" className="grid grid-cols-[20px_minmax(0,1fr)] gap-x-2.5 gap-y-1 rounded-sm border-[1.5px] border-dashed border-destructive px-3.5 py-3">
        <TriangleAlert aria-hidden className="mt-px size-4.5 text-destructive" />
        <p className="font-label text-[0.9rem] font-extrabold tracking-[0.07em] text-destructive">{title} unavailable</p>
        <p className="col-start-2 text-[0.92rem]">{message}</p>
      </div>
    </EditSection>
  );
}
