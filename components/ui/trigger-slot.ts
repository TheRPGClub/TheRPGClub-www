// A trigger's own data-slot, set only when it renders its own element. A
// trigger rendered as another component (`render={<Button variant=... />}`)
// keeps that component's slot, so the Theme draws its look (a Base UI
// trigger's props win over the rendered element's, so stamping the
// trigger's slot there would strip the Button's look).
export function triggerSlot(slot: string, render: unknown): { "data-slot"?: string } {
  return render ? {} : { "data-slot": slot };
}
