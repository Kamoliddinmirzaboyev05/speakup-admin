import type { BroadcastAudience } from "@/services/broadcast";

export const MINIAPP_FIND_URL = "https://speakupapi.webportfolio.uz?find=1";
export const TELEGRAM_ONBOARDING_URL = "https://t.me/speakuprobot?start=onboarding";

export type ButtonMode = "web_app" | "url";

export type BroadcastTemplate = {
  id: string;
  label: string;
  icon: string;
  title: string;
  body: string;
  buttonText: string;
  buttonUrl: string;
  buttonMode: ButtonMode;
  audience?: BroadcastAudience;
};

export const TEMPLATES = [
  {
    id: "practice",
    label: "Practice",
    icon: "🎙",
    title: "🎙 Bugun speaking practice qilamizmi?",
    body:
      "SpeakUp sizni real hamroh bilan tez ulaydi. 10 daqiqalik suhbat ham talaffuz, fluency va confidence uchun katta qadam.\n\nBugun bitta suhbat qilib, ingliz tilingizni jonli mashq qiling.",
    buttonText: "🎙 Hamroh topish",
    buttonUrl: MINIAPP_FIND_URL,
    buttonMode: "web_app",
  },
  {
    id: "onboarding",
    label: "Onboarding",
    icon: "🚀",
    title: "🚀 SpeakUp profilingizni 1 daqiqada tayyorlang",
    body:
      "Sizni real speaking hamrohlar bilan ulashimiz uchun avval qisqa onboardingdan o'tish kerak.\n\nDarajangiz va kontakt ma'lumotingiz tayyor bo'lsa, SpeakUp sizga mos suhbatdosh topadi va practice boshlash ancha osonlashadi.",
    buttonText: "🚀 Onboardingdan o'tish",
    buttonUrl: TELEGRAM_ONBOARDING_URL,
    buttonMode: "url",
    audience: "not_onboarded",
  },
  {
    id: "news",
    label: "Yangilik",
    icon: "✨",
    title: "✨ SpeakUp yangilandi",
    body:
      "Bugun botimizda yangi imkoniyatlar ishga tushdi. Endi speaking practice qilish yanada tezroq, qulayroq va jonliroq.\n\nIlovani ochib, o'zingiz sinab ko'ring.",
    buttonText: "🚀 Ilovani ochish",
    buttonUrl: MINIAPP_FIND_URL,
    buttonMode: "web_app",
  },
  {
    id: "promo",
    label: "Reklama",
    icon: "🔥",
    title: "🔥 Speaking uchun bugungi chaqiriq",
    body:
      "Ingliz tilida erkin gapirish kitob o'qish bilan emas, real suhbat bilan ochiladi.\n\nBugun SpeakUp orqali hamroh toping va kamida 10 daqiqa gapiring. Kichik odat katta natija beradi.",
    buttonText: "🔥 Boshlash",
    buttonUrl: MINIAPP_FIND_URL,
    buttonMode: "web_app",
  },
  {
    id: "reminder",
    label: "Eslatma",
    icon: "⏰",
    title: "⏰ Bugungi speaking vaqti keldi",
    body:
      "Agar bugun 10 daqiqa practice qilsangiz, kechagidan kuchliroq bo'lasiz.\n\nSpeakUp sizga darajangizga yaqin hamroh topishga yordam beradi.",
    buttonText: "🎯 Practice qilish",
    buttonUrl: MINIAPP_FIND_URL,
    buttonMode: "web_app",
  },
] as const satisfies readonly BroadcastTemplate[];
