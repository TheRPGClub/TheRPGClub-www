import { Anton, Barlow, Barlow_Condensed } from "next/font/google";

// Monthly Issue type: Anton for headlines, Barlow Condensed for tracked-caps
// labels, Barlow for body. Barlow's italic is loaded too: a review's headings
// lean on it for their voice. This is the default Theme, so its fonts keep
// next/font's preload; every other Theme passes `preload: false`.
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

// The classes that define the font variables theme.css reads.
export const monthlyIssueFonts = [anton.variable, barlow.variable, barlowCondensed.variable].join(" ");
