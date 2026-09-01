/**
 * AURAMINATOR ANTI-CIRCUMVENTION & CONTACT EVASION FILTER
 *
 * Strict multi-layer detection engine to prevent off-platform contact sharing
 * (phone numbers, WhatsApp, emails, social handles, UPI handles, external meet links)
 * before escrow payment is deposited.
 */

// Transliterated number words in English and Hindi/Hinglish
const NUMBER_WORDS_MAP: Record<string, string> = {
  // English
  zero: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  // Hindi / Hinglish
  shunya: "0",
  sunya: "0",
  ek: "1",
  aik: "1",
  do: "2",
  teen: "3",
  tin: "3",
  char: "4",
  chaar: "4",
  panch: "5",
  paanch: "5",
  che: "6",
  chhe: "6",
  saat: "7",
  sat: "7",
  aath: "8",
  ath: "8",
  nau: "9",
  no: "9",
};

export interface ContactDetectionResult {
  isBlocked: boolean;
  reason?: string;
  detectedType?: "phone" | "whatsapp" | "email" | "social" | "upi_direct" | "meeting_link";
  evasionDetected?: boolean;
}

export function detectContactInformation(rawText: string): ContactDetectionResult {
  if (!rawText || typeof rawText !== "string") {
    return { isBlocked: false };
  }

  const text = rawText.trim().toLowerCase();

  // -------------------------------------------------------------
  // 1. Direct Email & Obfuscated Email Patterns
  // -------------------------------------------------------------
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
  if (emailRegex.test(text)) {
    return {
      isBlocked: true,
      reason: "Direct email addresses cannot be shared before escrow payment.",
      detectedType: "email",
    };
  }

  // Obfuscated emails: e.g. "alex [at] gmail [dot] com", "alex at gmail dot com", "alex(at)yahoo.in"
  const obfuscatedEmailRegex =
    /[a-zA-Z0-9._%+-]+\s*(\[at\]|\(at\)|\bat\b|@)\s*[a-zA-Z0-9.-]+\s*(\[dot\]|\(dot\)|\bdot\b|\.)\s*(com|in|co|net|org|io|ai|xyz|dev|app)/i;
  if (obfuscatedEmailRegex.test(text)) {
    return {
      isBlocked: true,
      reason: "Obfuscated email address detected. Email sharing is locked until escrow deposit.",
      detectedType: "email",
      evasionDetected: true,
    };
  }

  // Specific common webmail mentions with intent (e.g. "my mail is alex at gmail", "mail me on gmail")
  if (
    /(mail\s*me|email\s*me|send\s*mail|send\s*email)\s*(at|on|to)?\s*([a-zA-Z0-9._-]+)?\s*(gmail|yahoo|outlook|hotmail|proton)/i.test(
      text
    )
  ) {
    return {
      isBlocked: true,
      reason: "Direct email contact attempt blocked.",
      detectedType: "email",
      evasionDetected: true,
    };
  }

  // -------------------------------------------------------------
  // 2. WhatsApp & External Chat Platform Triggers
  // -------------------------------------------------------------
  const whatsappTriggers = [
    /\bwa\.me\b/i,
    /\bapi\.whatsapp\.com\b/i,
    /\b(whats\s*app|whtsapp|watsapp|wtsapp|w-app|w\/app|wp\s*me|ping\s*on\s*wa|msg\s*on\s*wa)\b/i,
  ];
  for (const regex of whatsappTriggers) {
    if (regex.test(text)) {
      return {
        isBlocked: true,
        reason: "WhatsApp mentions and direct links are blocked before escrow deposit.",
        detectedType: "whatsapp",
      };
    }
  }

  // Telegram, Discord, Skype, Social chat platform triggers
  const chatPlatformTriggers = [
    /\bt\.me\/[a-zA-Z0-9_]+/i,
    /\btelegram\b/i,
    /\bdiscord(\.gg|\s*tag|\s*id|\s*server)\b/i,
    /\b(dm\s*me\s*on\s*insta|insta\s*id|ig\s*handle|dm\s*on\s*instagram|instagram\.com\/[a-zA-Z0-9_.]+)/i,
    /\b(skype|zoom\.us|meet\.google\.com|teams\.microsoft\.com)\b/i,
  ];
  for (const regex of chatPlatformTriggers) {
    if (regex.test(text)) {
      return {
        isBlocked: true,
        reason: "External communication and social chat links are blocked before escrow deposit.",
        detectedType: "social",
      };
    }
  }

  // -------------------------------------------------------------
  // 3. Direct UPI / Off-Platform Payment Evasion
  // -------------------------------------------------------------
  // e.g. "gpay me", "paytm karo", "my upi is user@okaxis"
  const upiRegex = /[a-zA-Z0-9._-]+@(okhdfcbank|okicici|oksbi|okaxis|paytm|ybl|ibl|upi|axl|apl|barodampay|federal|idfcbank)/i;
  if (upiRegex.test(text)) {
    return {
      isBlocked: true,
      reason: "Direct UPI IDs are strictly prohibited. All payments must be locked via Auraminator Escrow.",
      detectedType: "upi_direct",
    };
  }

  const directPaymentKeywords = [
    /\b(gpay|google\s*pay|phonepe|phone\s*pe|paytm)\s*(pe\s*bhejo|me\s*bhejo|pe\s*karo|karo|transfer|number|no)\b/i,
    /\b(direct\s*payment|offline\s*payment|cash\s*deal|out\s*of\s*platform)\b/i,
  ];
  for (const regex of directPaymentKeywords) {
    if (regex.test(text)) {
      return {
        isBlocked: true,
        reason: "Direct payment requests outside escrow violate platform safety rules.",
        detectedType: "upi_direct",
      };
    }
  }

  // -------------------------------------------------------------
  // 4. Phone Numbers & Obfuscation / Evasion Normalization
  // -------------------------------------------------------------

  // Step 4A: Check direct digits sequences (7+ digits)
  // Clean punctuation and emoji noise to extract only raw digits
  const rawDigitsOnly = text.replace(/[^0-9]/g, "");

  // If there is a contiguous sequence of 10 digits (Standard Indian mobile / global phone)
  // or +91 followed by 10 digits
  if (rawDigitsOnly.length >= 10 && rawDigitsOnly.length <= 13) {
    // Check if it looks like a phone number (e.g. starting with 6, 7, 8, 9 for India or 91...)
    const phoneCandidates = [
      /(\+?91[\-\s\.]?)?[6789]\d{9}/,
      /\b[6789]\d{9}\b/,
      /\b\d{3}[\-\s\.]\d{3}[\-\s\.]\d{4}\b/,
      /\b\d{5}[\-\s\.]\d{5}\b/,
    ];
    for (const pRegex of phoneCandidates) {
      if (pRegex.test(text.replace(/[\s\-\.\(\)]/g, ""))) {
        return {
          isBlocked: true,
          reason: "Direct mobile/phone numbers cannot be shared before escrow payment.",
          detectedType: "phone",
        };
      }
    }

    // Even if separated by letters, emojis, or symbols (e.g. 9🔥8🔥7... or 9a8b7c6d5e4f3g2h1i0)
    // If rawDigits contains a valid 10-digit mobile number pattern
    if (/[6789]\d{9}/.test(rawDigitsOnly)) {
      return {
        isBlocked: true,
        reason: "Obfuscated phone number detected. Mobile numbers are locked until escrow deposit.",
        detectedType: "phone",
        evasionDetected: true,
      };
    }
  }

  // Step 4B: Spelled-out word numbers (English + Hindi)
  // e.g. "nine eight seven six five four three two one zero" or "nau aath saat..."
  const words = text.toLowerCase().split(/[\s,_\-\.\+\/\*🔥❤️✨#@!~;:]+/);
  let consecutiveNumberWords = 0;
  let decodedDigits = "";

  for (const word of words) {
    if (NUMBER_WORDS_MAP[word]) {
      consecutiveNumberWords++;
      decodedDigits += NUMBER_WORDS_MAP[word];
    } else if (/^\d+$/.test(word)) {
      consecutiveNumberWords += word.length;
      decodedDigits += word;
    } else {
      // Reset if interrupted by normal non-number word (unless short filler)
      if (!["and", "aur", "number", "no", "is", "hai"].includes(word)) {
        if (consecutiveNumberWords >= 7) {
          break;
        }
        consecutiveNumberWords = 0;
        decodedDigits = "";
      }
    }
  }

  if (consecutiveNumberWords >= 7 || (decodedDigits.length >= 10 && /[6789]\d{9}/.test(decodedDigits))) {
    return {
      isBlocked: true,
      reason: "Spelled-out contact number detected. All communication must remain in the deal room.",
      detectedType: "phone",
      evasionDetected: true,
    };
  }

  // Step 4C: Phrased Intent + Number (e.g. "my num is 987...", "call on 98...", "reach at 98...")
  const callIntentRegex =
    /(call\s*me|call\s*karo|call\s*krna|mera\s*no|mera\s*number|my\s*num|contact\s*me\s*at|reach\s*me\s*at|ph\s*no|mob\s*no)\s*[:=\-]?\s*([0-9\s\.\-]{6,})/i;
  if (callIntentRegex.test(text)) {
    return {
      isBlocked: true,
      reason: "Contact sharing intent detected before payment.",
      detectedType: "phone",
    };
  }

  return { isBlocked: false };
}
