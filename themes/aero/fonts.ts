import { Nunito, Nunito_Sans } from "next/font/google";

// Frutiger Aero type (OFL): Nunito, round and friendly, for headlines and
// numerals; Nunito Sans for body and labels, with its italic for a review's
// voice. Variable faces, one file per style. Not the default Theme, so
// nothing preloads: a Member pays for these only while wearing Aero.
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

// The classes that define the font variables theme.css reads.
export const aeroFonts = [nunito.variable, nunitoSans.variable].join(" ");
