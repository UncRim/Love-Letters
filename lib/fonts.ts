import { Dancing_Script, Caveat, Sacramento } from "next/font/google";

export const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-dancing",
});

export const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-caveat",
});

export const sacramento = Sacramento({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-sacramento",
});

export const FONT_CLASSNAMES = {
  dancing_script: dancingScript.className,
  caveat: caveat.className,
  sacramento: sacramento.className,
} as const;
