import { GoogleGenerativeAI } from '@google/generative-ai';

export type TranslateLang = 'da' | 'ps' | 'en';

export interface TrilingualTranslationResult {
  da: string;
  fa: string;
  ps: string;
  en: string;
  translatedText?: string;
  provider: 'gemini' | 'groq' | 'openrouter' | 'mymemory' | 'dictionary';
}

export interface BatchTranslationResult {
  da: Record<string, string>;
  fa: Record<string, string>;
  ps: Record<string, string>;
  en: Record<string, string>;
  provider: 'gemini' | 'groq' | 'openrouter' | 'mymemory' | 'dictionary';
}

const PASHTO_CHAR_REGEX = /[ځڅډړږښګڼېۍ]/;
const LATIN_CHAR_REGEX = /[A-Za-z]/;
const PERSIAN_ARABIC_REGEX = /[\u0600-\u06FF]/;

/**
 * Normalizes incoming language aliases (`fa`, `dari`, `ps`, `en`) into `'da' | 'ps' | 'en'`.
 */
export function normalizeSourceLang(lang?: string | null): TranslateLang | 'auto' {
  if (!lang) return 'auto';
  const normalized = lang.trim().toLowerCase();
  if (normalized === 'fa' || normalized === 'da' || normalized === 'dari') return 'da';
  if (normalized === 'ps' || normalized === 'pashto') return 'ps';
  if (normalized === 'en' || normalized === 'english') return 'en';
  return 'auto';
}

/**
 * Heuristically detects Dari/Persian (`da`), Pashto (`ps`), or English (`en`) from text characters.
 */
export function detectLanguageFromText(text: string): TranslateLang {
  const trimmed = (text || '').trim();
  if (!trimmed) return 'da';
  if (PASHTO_CHAR_REGEX.test(trimmed)) return 'ps';
  if (LATIN_CHAR_REGEX.test(trimmed) && !PERSIAN_ARABIC_REGEX.test(trimmed)) return 'en';
  return 'da';
}

/**
 * Comprehensive built-in Afghan Dari -> Pashto & English dictionary fallback
 * so auto-translation still works smoothly without external AI keys or offline.
 */
const AFGHAN_DICTIONARY: Record<string, { da: string; ps: string; en: string }> = {
  // Brand & Core Identity
  'آریا لینک': { da: 'آریا لینک', ps: 'آریا لېنک', en: 'Arya Link' },
  'آریالینک': { da: 'آریالینک', ps: 'آریالېنک', en: 'AryaLink' },
  'کارت ویزیت هوشمند': { da: 'کارت ویزیت هوشمند', ps: 'سمارټ ویزټ کارټ', en: 'Smart Business Card' },
  'کارت ویزیت دیجیتال': { da: 'کارت ویزیت دیجیتال', ps: 'ډیجیټل ویزټ کارټ', en: 'Digital Business Card' },
  'پروفایل دیجیتال': { da: 'پروفایل دیجیتال', ps: 'ډیجیټل پروفایل', en: 'Digital Profile' },
  'هویت دیجیتال': { da: 'هویت دیجیتال', ps: 'ډیجیټل هویت', en: 'Digital Identity' },
  'کارت هوشمند': { da: 'کارت هوشمند', ps: 'سمارټ کارټ', en: 'Smart Card' },
  'لینک بیو': { da: 'لینک بیو', ps: 'بیو لېنک', en: 'Bio Link' },
  'مینی‌سایت': { da: 'مینی‌سایت', ps: 'کوچنی سایټ', en: 'Mini-Site' },
  'شبکه اجتماعی': { da: 'شبکه اجتماعی', ps: 'ټولنیزه شبکه', en: 'Social Network' },

  // Hero & Marketing Phrases
  'هوشمند': { da: 'هوشمند', ps: 'سمارټ', en: 'Smart' },
  'لمسی': { da: 'لمسی', ps: 'لمسي', en: 'Contactless' },
  'دیجیتال': { da: 'دیجیتال', ps: 'ډیجیټل', en: 'Digital' },
  'حرفه‌ای': { da: 'حرفه‌ای', ps: 'مسلکي', en: 'Professional' },
  'مدرن': { da: 'مدرن', ps: 'عصري', en: 'Modern' },
  'پیشرفته': { da: 'پیشرفته', ps: 'پرمختللی', en: 'Advanced' },
  'سریع': { da: 'سریع', ps: 'چټک', en: 'Fast' },
  'امن': { da: 'امن', ps: 'خوندي', en: 'Secure' },
  'رایگان': { da: 'رایگان', ps: 'وړیا', en: 'Free' },
  'تخفیف ویژه': { da: 'تخفیف ویژه', ps: 'ځانګړی تخفیف', en: 'Special Discount' },
  'پشتیبانی': { da: 'پشتیبانی', ps: 'ملاتړ', en: 'Support' },
  'تضمین کیفیت': { da: 'تضمین کیفیت', ps: 'د کیفیت تضمین', en: 'Quality Guarantee' },
  'افغانستان': { da: 'افغانستان', ps: 'افغانستان', en: 'Afghanistan' },
  'کابل': { da: 'کابل', ps: 'کابل', en: 'Kabul' },
  'هرات': { da: 'هرات', ps: 'هرات', en: 'Herat' },
  'مزار شریف': { da: 'مزار شریف', ps: 'مزار شریف', en: 'Mazar-i-Sharif' },
  'کندهار': { da: 'کندهار', ps: 'کندهار', en: 'Kandahar' },
  'افغانی': { da: 'افغانی', ps: 'افغانۍ', en: 'AFN' },

  // Plans & CTAs
  'پروفایل پایه': { da: 'پروفایل پایه', ps: 'اساسي پروفایل', en: 'Basic Profile' },
  'پروفایل حرفه‌ای': { da: 'پروفایل حرفه‌ای', ps: 'مسلکي پروفایل', en: 'Pro Profile' },
  'پکیج سازمانی': { da: 'پکیج سازمانی', ps: 'سازماني بسته', en: 'Enterprise Plan' },
  'شروع رایگان': { da: 'شروع رایگان', ps: 'وړیا پیل وکړئ', en: 'Start Free' },
  'همین حالا شروع کنید': { da: 'همین حالا شروع کنید', ps: 'همدا اوس پیل وکړئ', en: 'Get Started Now' },
  'سفارش کارت': { da: 'سفارش کارت', ps: 'د کارټ فرمایش', en: 'Order Card' },
  'خرید اشتراک': { da: 'خرید اشتراک', ps: 'ګډون واخلئ', en: 'Subscribe Now' },
  'بیشتر بدانید': { da: 'بیشتر بدانید', ps: 'نور معلومات', en: 'Learn More' },
  'تماس با ما': { da: 'تماس با ما', ps: 'موږ سره اړیکه', en: 'Contact Us' },
  'پرفروش‌ترین': { da: 'پرفروش‌ترین', ps: 'تر ټولو مشهور', en: 'Best Seller' },
  'محبوب‌ترین': { da: 'محبوب‌ترین', ps: 'تر ټولو غوره', en: 'Most Popular' },
  'ویژه': { da: 'ویژه', ps: 'ځانګړی', en: 'Featured' },

  // Materials
  'کارت فلزی': { da: 'کارت فلزی', ps: 'فلزي کارټ', en: 'Metal Card' },
  'کارت چوبی': { da: 'کارت چوبی', ps: 'لرګین کارټ', en: 'Wooden Card' },
  'استیل ضد زنگ': { da: 'استیل ضد زنگ', ps: 'د زنګ ضد فولاد', en: 'Stainless Steel' },
  'حکاکی لیزری': { da: 'حکاکی لیزری', ps: 'لیزري نقاشي', en: 'Laser Engraving' },
  'ضد آب': { da: 'ضد آب', ps: 'د اوبو ضد', en: 'Waterproof' },

  // Profiles & Professions
  'مدیر عامل': { da: 'مدیر عامل', ps: 'اجراییه رییس', en: 'CEO' },
  'بنیان‌گذار': { da: 'بنیان‌گذار', ps: 'بنسټګر', en: 'Founder' },
  'توسعه‌دهنده وب': { da: 'توسعه‌دهنده وب', ps: 'د وېب پراختیا ورکوونکی', en: 'Web Developer' },
  'برنامه‌نویس': { da: 'برنامه‌نویس', ps: 'پروګرامر', en: 'Software Developer' },
  'طراح گرافیک': { da: 'طراح گرافیک', ps: 'ګرافیک ډیزاینر', en: 'Graphic Designer' },
  'داکتر': { da: 'داکتر', ps: 'ډاکټر', en: 'Doctor' },
  'انجینر': { da: 'انجینر', ps: 'انجنیر', en: 'Engineer' },
  'وکیل مدافع': { da: 'وکیل مدافع', ps: 'مدافع وکیل', en: 'Attorney at Law' },
  'تاجر': { da: 'تاجر', ps: 'سوداګر', en: 'Businessperson' },
  'صراف': { da: 'صراف', ps: 'صراف', en: 'Currency Exchanger' },
  'فروشنده': { da: 'فروشنده', ps: 'پلورونکی', en: 'Merchant' },
  'استاد': { da: 'استاد', ps: 'استاد', en: 'Professor' },
  'مشاور': { da: 'مشاور', ps: 'سلاکار', en: 'Consultant' },
  'عکاس': { da: 'عکاس', ps: 'انځورګر', en: 'Photographer' },
  'رستورانت': { da: 'رستورانت', ps: 'رستورانت', en: 'Restaurant' },
  'شفاخانه': { da: 'شفاخانه', ps: 'روغتون', en: 'Hospital' },
  'شرکت': { da: 'شرکت', ps: 'شرکت', en: 'Company' },
  'فروشگاه': { da: 'فروشگاه', ps: 'پلورنځی', en: 'Store' },
  'درباره من': { da: 'درباره من', ps: 'زما په اړه', en: 'About Me' },
  'خوش آمدید': { da: 'خوش آمدید', ps: 'ښه راغلاست', en: 'Welcome' },
  'خدمات ما': { da: 'خدمات ما', ps: 'زموږ خدمتونه', en: 'Our Services' },
  'تجربه': { da: 'تجربه', ps: 'تجربه', en: 'Experience' },
  'کیفیت': { da: 'کیفیت', ps: 'کیفیت', en: 'Quality' },
  'مشتری': { da: 'مشتری', ps: 'پیرودونکی', en: 'Customer' },
  'ارتباط مستقیم': { da: 'ارتباط مستقیم', ps: 'مستقیمه اړیکه', en: 'Direct Contact' },
};

function stripCodeFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function parseJsonObject(raw: string): Record<string, any> | null {
  try {
    return JSON.parse(stripCodeFences(raw));
  } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function buildSinglePrompt(text: string, sourceLang: TranslateLang): string {
  const sourceLabel =
    sourceLang === 'da'
      ? 'Afghan Dari / Persian (دری افغانستان)'
      : sourceLang === 'ps'
      ? 'Pashto (پښتو)'
      : 'English';

  return [
    'You are a professional Afghan multilingual copywriter and translator for Arya Link (آریا لینک), an Afghan smart NFC digital business card & mini-site platform.',
    `Translate the following ${sourceLabel} text accurately and naturally into all three languages:`,
    '- "da": Native Afghan Dari (ادبیات بومی افغانستان — use Afghan terms like داکتر، انجینر، نمبر تماس، شفاخانه، رستورانت where relevant; avoid Iranian slang).',
    '- "ps": Natural modern standard Pashto (پښتو).',
    '- "en": Natural concise English.',
    'Rules:',
    '1. Preserve any HTML tags, URLs, emojis, numbers, and brand names (Arya Link / آریا لینک / آریا لېنک) verbatim.',
    '2. Keep proper person names naturally transliterated (do not invent unrelated words).',
    '3. Return ONLY a strict JSON object with keys "da", "ps", and "en", and string values.',
    '',
    `Source text:\n"""\n${text}\n"""`,
  ].join('\n');
}

function buildBatchPrompt(fields: Record<string, string>, sourceLang: TranslateLang): string {
  const sourceLabel =
    sourceLang === 'da'
      ? 'Afghan Dari / Persian'
      : sourceLang === 'ps'
      ? 'Pashto'
      : 'English';

  return [
    'You are a professional Afghan multilingual copywriter for Arya Link (آریا لینک).',
    `Translate every field in the input JSON from ${sourceLabel} into Afghan Dari ("da"), natural Pashto ("ps"), and English ("en").`,
    'Use native Afghan vocabulary ("da"), preserve HTML/URLs/brand names/placeholders, and return ONLY valid JSON in this exact shape:',
    '{ "da": { ... }, "ps": { ... }, "en": { ... } }',
    '',
    'Input JSON:',
    JSON.stringify(fields, null, 2),
  ].join('\n');
}

async function translateWithGemini(prompt: string): Promise<Record<string, any> | null> {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '').trim();
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.25,
        },
      });
      const result = await model.generateContent(prompt);
      const raw = result.response.text();
      const parsed = parseJsonObject(raw);
      if (parsed) return parsed;
    } catch (err) {
      console.warn(`[AutoTranslate] Gemini model ${modelName} failed:`, (err as Error)?.message);
    }
  }
  return null;
}

async function translateWithGroq(prompt: string): Promise<Record<string, any> | null> {
  const apiKey = (process.env.GROQ_API_KEY || '').trim();
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You output strict valid JSON only without markdown fences or explanation.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.25,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    return parseJsonObject(content);
  } catch (err) {
    console.warn('[AutoTranslate] Groq failed:', (err as Error)?.message);
    return null;
  }
}

async function translateWithOpenRouter(prompt: string): Promise<Record<string, any> | null> {
  const apiKey = (process.env.OPENROUTER_API_KEY || '').trim();
  if (!apiKey) return null;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: 'You output strict valid JSON only without markdown fences or explanation.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.25,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    return parseJsonObject(content);
  } catch (err) {
    console.warn('[AutoTranslate] OpenRouter failed:', (err as Error)?.message);
    return null;
  }
}

async function fetchMyMemoryPair(
  text: string,
  fromLang: TranslateLang,
  toLang: TranslateLang
): Promise<string | null> {
  if (!text.trim() || fromLang === toLang) return text;
  const fromCode = fromLang === 'da' ? 'fa' : fromLang;
  const toCode = toLang === 'da' ? 'fa' : toLang;

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text.slice(0, 500)
    )}&langpair=${fromCode}|${toCode}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.responseStatus === 200 && data?.responseData?.translatedText) {
      const candidate = String(data.responseData.translatedText).trim();
      if (candidate && !candidate.toUpperCase().includes('MYMEMORY WARNING')) {
        return candidate;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function translateOfflineSingle(
  text: string,
  sourceLang: TranslateLang,
  targetLang: TranslateLang
): string {
  const clean = text.trim();
  if (!clean) return '';
  if (sourceLang === targetLang) return clean;

  // 1. Direct match on any language column
  for (const [key, entry] of Object.entries(AFGHAN_DICTIONARY)) {
    if (
      clean.toLowerCase() === key.toLowerCase() ||
      clean.toLowerCase() === entry.da.toLowerCase() ||
      clean.toLowerCase() === entry.ps.toLowerCase() ||
      clean.toLowerCase() === entry.en.toLowerCase()
    ) {
      return entry[targetLang];
    }
  }

  // 2. Multi-phrase substitution (longest keys first)
  let result = clean;
  const entries = Object.entries(AFGHAN_DICTIONARY).sort(
    ([a], [b]) => b.length - a.length
  );

  let matchedAny = false;
  for (const [, entry] of entries) {
    const needle = entry[sourceLang];
    if (needle && needle.length > 2 && result.toLowerCase().includes(needle.toLowerCase())) {
      const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(escaped, 'gi'), entry[targetLang]);
      matchedAny = true;
    }
  }

  return matchedAny ? result : clean;
}

/**
 * Translates a single piece of text into Afghan Dari (`da`/`fa`), Pashto (`ps`), and English (`en`).
 */
export async function autoTranslateText(
  rawText: string,
  requestedSourceLang?: string | null,
  requestedTargetLang?: string | null
): Promise<TrilingualTranslationResult> {
  const text = (rawText || '').trim();
  const normalizedSrc = normalizeSourceLang(requestedSourceLang);
  const sourceLang: TranslateLang =
    normalizedSrc === 'auto' ? detectLanguageFromText(text) : normalizedSrc;
  const normalizedTarget = normalizeSourceLang(requestedTargetLang);

  if (!text) {
    return { da: '', fa: '', ps: '', en: '', translatedText: '', provider: 'dictionary' };
  }

  const prompt = buildSinglePrompt(text, sourceLang);

  // 1. AI Provider Chain: Gemini -> Groq -> OpenRouter
  const aiAttempts: Array<{
    provider: 'gemini' | 'groq' | 'openrouter';
    fn: () => Promise<Record<string, any> | null>;
  }> = [
    { provider: 'gemini', fn: () => translateWithGemini(prompt) },
    { provider: 'groq', fn: () => translateWithGroq(prompt) },
    { provider: 'openrouter', fn: () => translateWithOpenRouter(prompt) },
  ];

  for (const attempt of aiAttempts) {
    const parsed = await attempt.fn();
    if (parsed && (parsed.da || parsed.fa || parsed.ps || parsed.en)) {
      const da = String(parsed.da || parsed.fa || (sourceLang === 'da' ? text : '') || text).trim();
      const ps = String(parsed.ps || (sourceLang === 'ps' ? text : '') || '').trim();
      const en = String(parsed.en || (sourceLang === 'en' ? text : '') || '').trim();
      const out = {
        da,
        fa: da,
        ps: ps || translateOfflineSingle(text, sourceLang, 'ps'),
        en: en || translateOfflineSingle(text, sourceLang, 'en'),
        provider: attempt.provider,
      };
      return {
        ...out,
        translatedText:
          normalizedTarget !== 'auto' ? out[normalizedTarget] : out.ps || out.en,
      };
    }
  }

  // 2. MyMemory Fallback (only runs for needed targets when text <= 480 chars)
  const needsDa = sourceLang !== 'da' && (normalizedTarget === 'auto' || normalizedTarget === 'da');
  const needsPs = sourceLang !== 'ps' && (normalizedTarget === 'auto' || normalizedTarget === 'ps');
  const needsEn = sourceLang !== 'en' && (normalizedTarget === 'auto' || normalizedTarget === 'en');

  const [mmDa, mmPs, mmEn] = await Promise.all([
    needsDa ? fetchMyMemoryPair(text, sourceLang, 'da') : Promise.resolve(sourceLang === 'da' ? text : null),
    needsPs ? fetchMyMemoryPair(text, sourceLang, 'ps') : Promise.resolve(sourceLang === 'ps' ? text : null),
    needsEn ? fetchMyMemoryPair(text, sourceLang, 'en') : Promise.resolve(sourceLang === 'en' ? text : null),
  ]);

  const usedMyMemory = Boolean(
    (needsDa && mmDa) || (needsPs && mmPs) || (needsEn && mmEn)
  );

  const da = (sourceLang === 'da' ? text : mmDa || translateOfflineSingle(text, sourceLang, 'da')).trim();
  const ps = (sourceLang === 'ps' ? text : mmPs || translateOfflineSingle(text, sourceLang, 'ps')).trim();
  const en = (sourceLang === 'en' ? text : mmEn || translateOfflineSingle(text, sourceLang, 'en')).trim();

  const out: TrilingualTranslationResult = {
    da,
    fa: da,
    ps,
    en,
    provider: usedMyMemory ? 'mymemory' : 'dictionary',
  };

  out.translatedText =
    normalizedTarget !== 'auto' ? out[normalizedTarget] : out.ps || out.en;

  return out;
}

/**
 * Batch translates a dictionary of field names -> strings into `{ da, fa, ps, en }`.
 */
export async function autoTranslateFields(
  fields: Record<string, string>,
  requestedSourceLang?: string | null
): Promise<BatchTranslationResult> {
  const nonEmptyEntries = Object.entries(fields || {}).filter(
    ([, val]) => typeof val === 'string' && val.trim().length > 0
  );

  if (nonEmptyEntries.length === 0) {
    return { da: {}, fa: {}, ps: {}, en: {}, provider: 'dictionary' };
  }

  const cleanFields = Object.fromEntries(
    nonEmptyEntries.map(([k, v]) => [k, v.trim()])
  );

  const normalizedSrc = normalizeSourceLang(requestedSourceLang);
  const firstSample = nonEmptyEntries[0][1];
  const sourceLang: TranslateLang =
    normalizedSrc === 'auto' ? detectLanguageFromText(firstSample) : normalizedSrc;

  const prompt = buildBatchPrompt(cleanFields, sourceLang);

  const aiAttempts: Array<{
    provider: 'gemini' | 'groq' | 'openrouter';
    fn: () => Promise<Record<string, any> | null>;
  }> = [
    { provider: 'gemini', fn: () => translateWithGemini(prompt) },
    { provider: 'groq', fn: () => translateWithGroq(prompt) },
    { provider: 'openrouter', fn: () => translateWithOpenRouter(prompt) },
  ];

  for (const attempt of aiAttempts) {
    const parsed = await attempt.fn();
    if (parsed && (parsed.ps || parsed.en || parsed.da || parsed.fa)) {
      const daMap: Record<string, string> = {};
      const psMap: Record<string, string> = {};
      const enMap: Record<string, string> = {};

      for (const [key, original] of Object.entries(cleanFields)) {
        const daVal = parsed.da?.[key] || parsed.fa?.[key] || (sourceLang === 'da' ? original : original);
        const psVal = parsed.ps?.[key] || (sourceLang === 'ps' ? original : translateOfflineSingle(original, sourceLang, 'ps'));
        const enVal = parsed.en?.[key] || (sourceLang === 'en' ? original : translateOfflineSingle(original, sourceLang, 'en'));
        daMap[key] = String(daVal).trim();
        psMap[key] = String(psVal).trim();
        enMap[key] = String(enVal).trim();
      }

      return {
        da: daMap,
        fa: daMap,
        ps: psMap,
        en: enMap,
        provider: attempt.provider,
      };
    }
  }

  // Fallback: translate field by field via autoTranslateText (MyMemory / dictionary)
  const daMap: Record<string, string> = {};
  const psMap: Record<string, string> = {};
  const enMap: Record<string, string> = {};
  let finalProvider: BatchTranslationResult['provider'] = 'dictionary';

  await Promise.all(
    Object.entries(cleanFields).map(async ([key, val]) => {
      const res = await autoTranslateText(val, sourceLang);
      daMap[key] = res.da;
      psMap[key] = res.ps;
      enMap[key] = res.en;
      if (res.provider === 'mymemory') finalProvider = 'mymemory';
    })
  );

  return {
    da: daMap,
    fa: daMap,
    ps: psMap,
    en: enMap,
    provider: finalProvider,
  };
}
