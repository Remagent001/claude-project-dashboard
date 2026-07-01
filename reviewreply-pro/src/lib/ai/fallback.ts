import type { AIProvider } from "./provider";
import type { AIResponsePayload, GenerateRequest } from "../types";

// Offline, deterministic template generator used when NO API key is configured.
// It lets you demo the full UI/flow without spending on API calls. It returns
// the same JSON contract the real models do, so nothing downstream changes.
//
// It parses the structured request back out of the user prompt marker we embed
// below (see FALLBACK_MARKER) rather than re-parsing prose.

export const FALLBACK_MARKER = "<<<RRP_REQUEST_JSON>>>";

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function words(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function build(req: GenerateRequest): AIResponsePayload {
  const name = req.customerName?.trim();
  const staff = req.staffName?.trim();
  const loc =
    req.location && req.location !== "Unknown" ? req.location : undefined;
  const svc =
    req.serviceType && req.serviceType !== "Unknown"
      ? req.serviceType.toLowerCase()
      : undefined;
  const greet = name ? `${name}, ` : "";
  const seed = (req.reviewText.length + req.starRating) | 0;

  const positive = req.starRating >= 4;
  const neutral = req.starRating === 3;

  let short: string;
  let standard: string;
  let personalized: string;

  if (positive) {
    const opener = pick(
      [
        `${greet}it genuinely made our day to read this.`,
        `${greet}what a great note to come across.`,
        `${greet}this means a lot to the whole team.`,
      ],
      seed,
    );
    const svcLine = svc ? ` Glad the ${svc} landed just right.` : "";
    const staffLine = staff ? ` ${staff} will be thrilled to hear it.` : "";
    const locLine = loc ? ` We love taking care of our guests in ${loc}.` : "";
    const invite = pick(
      [
        "The chair's ready whenever you are.",
        "We'll have everything dialed in for your next visit.",
        "Looking forward to keeping you sharp.",
      ],
      seed + 1,
    );
    short = `${opener}${svcLine}${staffLine} ${invite}`.trim();
    standard =
      `${opener}${svcLine}${staffLine}${locLine} A great men's grooming experience is all in the details, and it's good to know we hit the mark for you. ${invite}`.trim();
    personalized =
      `${opener} There's nothing we take more seriously than sending a guest out feeling sharp.${svcLine}${staffLine}${locLine} As a premium men's salon, we put real care into every haircut and finish, so hearing that it showed for you is the best kind of feedback. ${invite} We appreciate you making us part of your routine.`.trim();
    if (req.starRating === 4) {
      const fifth = " We'd love the chance to earn that fifth star next time.";
      standard += fifth;
      personalized += fifth;
    }
  } else if (neutral) {
    const opener = pick(
      [
        `${greet}thank you for taking the time to share this.`,
        `${greet}we're grateful for the honest feedback.`,
      ],
      seed,
    );
    const svcLine = svc ? ` your ${svc}` : " your visit";
    short = `${opener} It sounds like${svcLine} may not have fully met expectations, and we'd like to make it right. Please contact the salon directly so we can look into it.`;
    standard = `${opener} It sounds like${svcLine} may not have fully lived up to what we aim for, and that matters to us. We'd welcome the chance to understand what happened and improve — please reach the salon directly and ask for the manager so we can address it properly.`;
    personalized = `${opener} We hold our men's grooming experience to a high standard, and it sounds like${svcLine} landed somewhere short of that. We're not interested in explanations here — just in making it right. Please contact the salon${
      loc ? ` in ${loc}` : ""
    } and ask for the manager, and we'll take care of you personally on your next visit.`;
  } else {
    const opener = pick(
      [
        `${greet}we're sorry your experience didn't meet expectations.`,
        `${greet}we sincerely apologize that we let you down.`,
      ],
      seed,
    );
    short = `${opener} That's not the standard we hold ourselves to. Please contact the salon directly so we can address this with you offline.`;
    standard = `${opener} This falls short of the experience every guest should have with us, and we take it seriously. We'd like to understand what happened and make it right — please contact the salon directly and ask for the manager so we can address it privately.`;
    personalized = `${opener} We know a men's salon lives or dies by trust, and it's clear we didn't earn yours this time. We won't make excuses. What we will do is listen — please reach the salon${
      loc ? ` in ${loc}` : ""
    } directly and ask for the manager so we can address this offline and do right by you.`;
  }

  const keywordsUsed: string[] = [];
  const hay = `${short} ${standard} ${personalized}`.toLowerCase();
  for (const k of [
    "men's salon",
    "men's grooming",
    "haircut",
    "beard trim",
    "straight razor shave",
    "facial",
    "gray blending",
    "barber",
    "Dallas",
    "Preston Hollow",
    "West Village",
  ]) {
    if (hay.includes(k.toLowerCase())) keywordsUsed.push(k);
  }

  return {
    short,
    standard,
    personalized,
    riskNotes:
      req.starRating <= 2
        ? "Negative review — keep it offline; do not disclose customer details or admit fault."
        : "",
    seoKeywordsUsed: keywordsUsed,
    duplicateRisk: "low",
  };
}

export class FallbackProvider implements AIProvider {
  name = "fallback (template — no API key)";

  async complete(_systemPrompt: string, userPrompt: string): Promise<string> {
    const idx = userPrompt.indexOf(FALLBACK_MARKER);
    if (idx === -1) {
      throw new Error("Fallback provider missing request marker.");
    }
    const json = userPrompt.slice(idx + FALLBACK_MARKER.length).trim();
    const req = JSON.parse(json) as GenerateRequest;
    const payload = build(req);
    // Keep word counts sane for the "short" bucket in case names inflate it.
    void words;
    return JSON.stringify(payload);
  }
}
