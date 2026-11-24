import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";

// A trigger rendered as a Button keeps the Button's slot and variant, so the
// Theme draws its look ([data-slot="button"][data-variant]); a trigger on its
// own element keeps its own slot.
const button = <Button variant="outline" size="sm" />;
const cases = {
  "alert-dialog": (r?: React.ReactElement) => <AlertDialog><AlertDialogTrigger render={r}>x</AlertDialogTrigger></AlertDialog>,
  collapsible: (r?: React.ReactElement) => <Collapsible><CollapsibleTrigger render={r}>x</CollapsibleTrigger></Collapsible>,
  dialog: (r?: React.ReactElement) => <Dialog><DialogTrigger render={r}>x</DialogTrigger></Dialog>,
  "dropdown-menu": (r?: React.ReactElement) => <DropdownMenu><DropdownMenuTrigger render={r}>x</DropdownMenuTrigger></DropdownMenu>,
  popover: (r?: React.ReactElement) => <Popover><PopoverTrigger render={r}>x</PopoverTrigger></Popover>,
  sheet: (r?: React.ReactElement) => <Sheet><SheetTrigger render={r}>x</SheetTrigger></Sheet>,
};

describe("triggers rendered as a Button", () => {
  for (const [name, make] of Object.entries(cases)) {
    it(`${name} keeps the Button's slot and variant`, () => {
      const html = renderToStaticMarkup(make(button));
      expect(html).toContain('data-slot="button"');
      expect(html).toContain('data-variant="outline"');
    });

    it(`${name} keeps its own slot on its own element`, () => {
      expect(renderToStaticMarkup(make())).toContain(`data-slot="${name}-trigger"`);
    });
  }

  it("a field popover trigger keeps its slot and variant", () => {
    const html = renderToStaticMarkup(<Popover><PopoverTrigger variant="field">x</PopoverTrigger></Popover>);
    expect(html).toContain('data-slot="popover-trigger"');
    expect(html).toContain('data-variant="field"');
  });
});
