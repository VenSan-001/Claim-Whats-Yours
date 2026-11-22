import type { Category, CourseStream, Profile, YearOfStudy } from "./types";

export const TN_DISTRICTS: string[] = [
  "Ariyalur",
  "Chengalpattu",
  "Chennai",
  "Coimbatore",
  "Cuddalore",
  "Dharmapuri",
  "Dindigul",
  "Erode",
  "Kallakurichi",
  "Kanchipuram",
  "Kanniyakumari",
  "Karur",
  "Krishnagiri",
  "Madurai",
  "Mayiladuthurai",
  "Nagapattinam",
  "Namakkal",
  "Nilgiris",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Ranipet",
  "Salem",
  "Sivaganga",
  "Tenkasi",
  "Thanjavur",
  "Theni",
  "Thoothukudi",
  "Tiruchirappalli",
  "Tirunelveli",
  "Tirupathur",
  "Tiruppur",
  "Tiruvallur",
  "Tiruvannamalai",
  "Tiruvarur",
  "Vellore",
  "Viluppuram",
  "Virudhunagar",
];

// Tamil spellings for each entry in TN_DISTRICTS. Keys must match TN_DISTRICTS exactly.
const TAMIL_DISTRICT_NAMES: Record<string, string> = {
  Ariyalur: "அரியலூர்",
  Chengalpattu: "செங்கல்பட்டு",
  Chennai: "சென்னை",
  Coimbatore: "கோயம்புத்தூர்",
  Cuddalore: "கடலூர்",
  Dharmapuri: "தர்மபுரி",
  Dindigul: "திண்டுக்கல்",
  Erode: "ஈரோடு",
  Kallakurichi: "கள்ளக்குறிச்சி",
  Kanchipuram: "காஞ்சிபுரம்",
  Kanniyakumari: "கன்னியாகுமரி",
  Karur: "கரூர்",
  Krishnagiri: "கிருஷ்ணகிரி",
  Madurai: "மதுரை",
  Mayiladuthurai: "மயிலாடுதுறை",
  Nagapattinam: "நாகப்பட்டினம்",
  Namakkal: "நாமக்கல்",
  Nilgiris: "நீலகிரி",
  Perambalur: "பெரம்பலூர்",
  Pudukkottai: "புதுக்கோட்டை",
  Ramanathapuram: "ராமநாதபுரம்",
  Ranipet: "ராணிப்பேட்டை",
  Salem: "சேலம்",
  Sivaganga: "சிவகங்கை",
  Tenkasi: "தென்காசி",
  Thanjavur: "தஞ்சாவூர்",
  Theni: "தேனி",
  Thoothukudi: "தூத்துக்குடி",
  Tiruchirappalli: "திருச்சிராப்பள்ளி",
  Tirunelveli: "திருநெல்வேலி",
  Tirupathur: "திருப்பத்தூர்",
  Tiruppur: "திருப்பூர்",
  Tiruvallur: "திருவள்ளூர்",
  Tiruvannamalai: "திருவண்ணாமலை",
  Tiruvarur: "திருவாரூர்",
  Vellore: "வேலூர்",
  Viluppuram: "விழுப்புரம்",
  Virudhunagar: "விருதுநகர்",
};

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

function parseLevel(text: string): Profile["level"] | undefined {
  if (matchesAny(text, [/class\s*10\b/, /\b10th\b/, /\bx\s*std\b/, /\bstd\s*10\b/])) {
    return "class10";
  }
  if (
    matchesAny(text, [
      /\bcollege\b/,
      /\bdegree\b/,
      /\bundergraduate\b/,
      /\bug\b/,
      /\bb\.e\b/,
      /\bb\.sc\b/,
      /\bb\.a\b/,
      /\bengineering\b/,
      /\barts and science\b/,
    ])
  ) {
    return "college";
  }
  if (matchesAny(text, [/class\s*1[12]\b/, /\b1[12]th\b/, /plus\s*two\b/, /\+2/])) {
    return "class11_12";
  }
  return undefined;
}

function parseCategory(text: string): Category | undefined {
  // Whole-word tokens; the lookarounds stop "b.sc" or "x.st" style matches.
  // MBC is checked before BC so "mbc" / "மிகவும் பிற்படுத்தப்பட்டோர்" never reads as BC.
  if (/(?<![\w.])mbc(?![\w.])|most backward|மிகவும்\s*பிற்படுத்தப்பட்டோர்/.test(text)) return "MBC";
  if (/(?<![\w.])obc(?![\w.])/.test(text)) return "OBC";
  if (/(?<![\w.])bc(?![\w.])|backward|பிற்படுத்தப்பட்டோர்/.test(text)) return "BC";
  if (/(?<![\w.])sc(?![\w.])|dalit|ஆதி\s*திராவிடர்/.test(text)) return "SC";
  if (/(?<![\w.])st(?![\w.])|tribal|adivasi|பழங்குடியினர்/.test(text)) return "ST";
  // OC (open category) maps to "General" because the Category type has no OC value.
  if (/(?<![\w.])general(?![\w.])|forward|(?<![\w.])oc(?![\w.])|open category|முன்னேறிய\s*வகுப்பு/.test(text)) {
    return "General";
  }
  return undefined;
}

function parseGender(text: string): Profile["gender"] | undefined {
  // "aan" / "penn" are whole-word Latin tokens. Tamil ஆண் must not be followed by a Tamil letter (ஆண்டு = year).
  if (/\b(girl|female|woman|daughter|she|ponnu|magal|penn)\b|பெண்|மகள்/.test(text)) return "female";
  if (/\b(boy|male|man|son|he|his|paiyan|magan|aan)\b|மகன்|(?<![\u0B80-\u0BFF])ஆண்(?![\u0B80-\u0BFF])/.test(text)) {
    return "male";
  }
  return undefined;
}

function normalizeTamilDigits(text: string): string {
  // Tamil digits U+0BE6 (௦) to U+0BEF (௯) map to ASCII 0-9.
  return text.replace(/[\u0BE6-\u0BEF]/g, (ch) => String(ch.charCodeAt(0) - 0x0be6));
}

function parseIncome(text: string): number | undefined {
  const lakh = /(\d+(?:\.\d+)?)\s*(?:lakh|latcham|லட்சம்)/.exec(text);
  if (lakh?.[1] !== undefined) return Math.round(parseFloat(lakh[1]) * 100000);

  const aayiram = /(\d+(?:\.\d+)?)\s*(?:aayiram|thousand|ஆயிரம்)/.exec(text);
  if (aayiram?.[1] !== undefined) return Math.round(parseFloat(aayiram[1]) * 1000);

  const crore = /(\d+(?:\.\d+)?)\s*crore/.exec(text);
  if (crore?.[1] !== undefined) return Math.round(parseFloat(crore[1]) * 10000000);

  const prefixed = /(?:rs\.?|inr|income|varumanam|varumaanam)\s*:?\s*((?:\d{1,3}(?:,\d{2,3})+|\d+)(?:\.\d+)?)/.exec(text);
  if (prefixed?.[1] !== undefined) {
    return Math.round(parseFloat(prefixed[1].replace(/,/g, "")));
  }

  const standalone = /\b(\d{1,3}(?:,\d{2,3})+|\d{4,})\b/.exec(text);
  if (standalone?.[1] !== undefined) {
    return Math.round(parseFloat(standalone[1].replace(/,/g, "")));
  }

  return undefined;
}

function parseDistrict(text: string): string | undefined {
  for (const district of TN_DISTRICTS) {
    const pattern = new RegExp(`\\b${district.toLowerCase()}\\b`);
    if (pattern.test(text)) return district;
    const tamil = TAMIL_DISTRICT_NAMES[district];
    // Tamil words have no \b support, so require a non-Tamil character (or edge) on each side.
    if (tamil !== undefined && new RegExp(`(?<![\\u0B80-\\u0BFF])${tamil}(?![\\u0B80-\\u0BFF])`).test(text)) {
      return district;
    }
  }
  return undefined;
}

function parseStayType(text: string): Profile["stay_type"] | undefined {
  if (/\bhostel\b|விடுதி/.test(text)) return "hostel";
  return undefined;
}

function parseYearOfStudy(text: string): YearOfStudy | undefined {
  // Full phrases only. Returns undefined when more than one year matches.
  const found: YearOfStudy[] = [];
  if (/முதலாம்\s*ஆண்டு/.test(text)) found.push("1st");
  if (/இரண்டாம்\s*ஆண்டு/.test(text)) found.push("2nd");
  if (/மூன்றாம்\s*ஆண்டு/.test(text)) found.push("3rd");
  if (/நான்காம்\s*ஆண்டு/.test(text)) found.push("4th");
  return found.length === 1 ? found[0] : undefined;
}

function parseCourseStream(text: string): CourseStream | undefined {
  // Returns undefined when more than one stream matches.
  const found: CourseStream[] = [];
  if (/\bengineering\b|இன்ஜினியரிங்/.test(text)) found.push("engineering");
  if (/\barts and science\b|கலை\s*அறிவியல்/.test(text)) found.push("arts_science");
  if (/மருத்துவம்/.test(text)) found.push("medical");
  if (/பாலிடெக்னிக்/.test(text)) found.push("polytechnic");
  if (/ஐடிஐ/.test(text)) found.push("iti");
  return found.length === 1 ? found[0] : undefined;
}

function parsePercentage(text: string): number | undefined {
  const patterns = [
    /(\d{1,3}(?:\.\d+)?)\s*%/g,
    /marks?\s*(\d{2,3}(?:\.\d+)?)/g,
    /got\s*(\d{2,3}(?:\.\d+)?)/g,
  ];
  for (const pattern of patterns) {
    for (const m of text.matchAll(pattern)) {
      const value = parseFloat(m[1] ?? "");
      if (!Number.isNaN(value) && value >= 0 && value <= 100) return value;
    }
  }
  return undefined;
}

function parseSchoolType(text: string): Profile["school_type"] | undefined {
  if (/\baided\b|உதவி\s*பெறும்|உதவி\s*பெறுகிற/.test(text)) return "government_aided";
  if (/\b(government|govt|gov|arasu)\b|அரசு/.test(text)) return "government";
  if (/\bprivate\b|தனியார்/.test(text)) return "private";
  return undefined;
}

function parseFirstGen(text: string): boolean | undefined {
  if (/first generation|first graduate|first-gen/.test(text)) return true;
  return undefined;
}

export function parseProfileFromText(text: string): Partial<Profile> {
  const lower = normalizeTamilDigits(text).toLowerCase();
  const result: Partial<Profile> = {};

  const level = parseLevel(lower);
  if (level !== undefined) result.level = level;

  const category = parseCategory(lower);
  if (category !== undefined) result.category = category;

  const gender = parseGender(lower);
  if (gender !== undefined) result.gender = gender;

  const income = parseIncome(lower);
  if (income !== undefined) result.annual_income_inr = income;

  const district = parseDistrict(lower);
  if (district !== undefined) result.district = district;

  const percentage = parsePercentage(lower);
  if (percentage !== undefined) {
    if (level === "college") {
      result.twelfth_percent = percentage;
    } else {
      result.latest_percent = percentage;
    }
  }

  const schoolType = parseSchoolType(lower);
  if (schoolType !== undefined) result.school_type = schoolType;

  const firstGen = parseFirstGen(lower);
  if (firstGen !== undefined) result.first_generation_graduate = firstGen;

  const stayType = parseStayType(lower);
  if (stayType !== undefined) result.stay_type = stayType;

  const yearOfStudy = parseYearOfStudy(lower);
  if (yearOfStudy !== undefined) result.year_of_study = yearOfStudy;

  const courseStream = parseCourseStream(lower);
  if (courseStream !== undefined) result.course_stream = courseStream;

  return result;
}
