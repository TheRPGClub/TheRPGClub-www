import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { FeaturePreferences } from "@/lib/feature-preferences";
import type { StaffSection } from "@/lib/staff";
import { SectionHeading, headingLinkClass } from "@/components/templates/page-header";
import { PreviewSwitch } from "@/components/settings/preview-switch";

// The Staff tab, for Moderators and up: the Admins' "Show Preview features"
// switch (absent for a Moderator, whose preferences carry no such setting),
// and links to the desk tools that set what this page can't: the Feature
// Flags and other members' Birth Dates, each only for a role that can open
// it.
export function StaffTab({ prefs, desk }: { prefs: FeaturePreferences | null; desk: StaffSection[] }) {
  const preview = prefs && prefs.show_preview_features !== null;

  return (
    <div className="grid items-start gap-12 lg:grid-cols-2">
      {preview && (
        <section aria-labelledby="settings-preview">
          <SectionHeading title={<span id="settings-preview">Preview</span>} />
          <PreviewSwitch initial={prefs} />
        </section>
      )}
      <section aria-labelledby="settings-desk">
        <SectionHeading title={<span id="settings-desk">On the desk</span>} />
        <p className="mt-3 max-w-[60ch] text-dim-foreground">
          Settings for the whole club, and for other members, live on the desk.
        </p>
        <ul className="mt-5 flex flex-col gap-3.5">
          {desk.map((s) => (
            <li key={s.key}>
              <Link href={s.href} className={headingLinkClass}>
                {s.key === "features" ? "Feature Flags" : s.label}
                <ArrowRight aria-hidden />
              </Link>
            </li>
          ))}
          <li>
            <Link href="/admin" className={headingLinkClass}>
              The whole desk
              <ArrowRight aria-hidden />
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
