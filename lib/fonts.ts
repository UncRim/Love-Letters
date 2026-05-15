import {
  Dancing_Script,
  Caveat,
  Loved_by_the_King,
  Lumanosimo,
  Long_Cang,
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

export const lovedByTheKing = Loved_by_the_King({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-loved-by-the-king",
});

export const lumanosimo = Lumanosimo({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-lumanosimo",
});

export const longCang = Long_Cang({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-long-cang",
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
  loved_by_the_king: lovedByTheKing.className,
  lumanosimo: lumanosimo.className,
  long_cang: longCang.className,
  love_ya_like_a_sister: loveYaLikeASister.className,
  caveat: caveat.className,
  dancing_script: dancingScript.className,
} as const;
