import { TEMPLATES } from "./broadcastTemplates";

type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Assert<T extends true> = T;

const onboardingTemplate = TEMPLATES.find((template) => template.id === "onboarding");

if (!onboardingTemplate) {
  throw new Error("Onboarding broadcast template is required");
}

type OnboardingTemplate = Extract<(typeof TEMPLATES)[number], { id: "onboarding" }>;

type _AudienceIsNotOnboarded = Assert<Equals<OnboardingTemplate["audience"], "not_onboarded">>;
type _ButtonModeIsExternalLink = Assert<Equals<OnboardingTemplate["buttonMode"], "url">>;

if (onboardingTemplate.buttonUrl !== "https://t.me/speakuprobot?start=onboarding") {
  throw new Error("Onboarding template must open the bot onboarding flow");
}
