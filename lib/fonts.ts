import {
  Dancing_Script,
  Caveat,
  Sacramento,
  Playfair_Display,
  Cormorant_Garamond,
  IM_Fell_English,
  Jost,
  Love_Ya_Like_A_Sister,
  DM_Sans,
} from "next/font/google";

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

export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

export const imFellEnglish = IM_Fell_English({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-fell",
});

export const jost = Jost({
  subsets: ["latin"],
  weight: ["200", "300", "400"],
  variable: "--font-jost",
});

export const loveYaLikeASister = Love_Ya_Like_A_Sister({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-love-ya",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
});

export const FONT_CLASSNAMES = {
  dancing_script: dancingScript.className,
  caveat: caveat.className,
  sacramento: sacramento.className,
} as const;
