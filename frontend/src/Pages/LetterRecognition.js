import { useState, useRef, useEffect } from "react";

// ─── TRANSLATIONS ──────────────────────────────────────────────────────────────
const UI_TRANSLATIONS = {
  en: {
    badge: "Sinhala Learning System",
    heroTitle1: "Learn Sinhala Letters &", heroTitleEm: "Train", heroTitle2: "Your Eye",
    heroDesc: "Click any letter to see example words, images and hear the pronunciation instantly. Upload a letter for AI recognition.",
    exploreBtn: "Explore All 60 Letters", uploadBtn: "Upload Image",
    chooseModeTitle: "Choose Your Practice Mode", chooseModeDesc: "Two powerful ways to sharpen your Sinhala letter recognition",
    exploreTitle: "Explore Letters", exploreDesc: "Click any Sinhala letter to see example words, images and hear the pronunciation instantly.", exploreAction: "Explore Letters →",
    uploadTitle: "Upload an Image", uploadDesc: "Upload a photo or scan of a handwritten Sinhala letter and receive detailed recognition feedback.", uploadAction: "Upload Image →",
    uploadMode: "Upload Mode", close: "Close ✕", practicing: "Practicing",
    clickOrDrag: "Click or drag & drop an image here", supportedFormats: "PNG, JPG, WEBP supported",
    recognizeBtn: "Recognize Letter →", recognizing: "Recognizing...",
    allLetters: "All Letters", howItWorks: "How It Works", clickToExplore: "Click to explore", howItWorksTitle: "How It Works",
    step1: "Upload a Sinhala letter image", step2: "AI analyses stroke patterns", step3: "See the result instantly",
    tip: "Tip", tipText: "Upload a clear, well-lit photo of the letter for best accuracy.",
    recognitionResult: "Recognition Result", tryAgain: "Try Again →", confidence: "Confidence",
    wasCorrect: "Was this correct?", yesCorrect: "✓ Yes, correct!", noTryAgain: "✕ No, try again", keepPractising: "Keep practising!",
    alternatives: "Alternatives", exploreThisLetter: "Explore this letter →",
    allSinhalaLetters: "All Sinhala Letters", alphabetDesc: "Click any letter to see word, image & hear pronunciation",
    showcase: "Showcase", compact: "Compact",
    yourProgress: "Your Progress", trackImprovement: "Track your improvement over time",
    accuracy: "Accuracy", sessions: "Sessions", streak: "Streak", streakSuffix: " days",
    accuracyTrend: "Accuracy Trend", lastSessions: "Last 7 sessions",
    todayLetter: "Today's letter", clickAnyLetter: "Click any letter to learn", letters60: "60 Letters",
    practiceStreak: "Practice streak", lettersToLearn: "Letters to learn", total60: "60 total letters", days7: "🔥 7 days",
    audioNotFound: "Audio not found",
  },
  si: {
    badge: "සිංහල ඉගෙනීමේ පද්ධතිය",
    heroTitle1: "සිංහල අකුරු ඉගෙනගෙන", heroTitleEm: "පුරුදු", heroTitle2: "කරගන්න",
    heroDesc: "ඕනෑම අකුරක් ක්ලික් කර උදාහරණ වචන, පින්තූර සහ උච්චාරණය වහාම දකින්න. AI හඳුනාගැනීම සඳහා අකුරක් upload කරන්න.",
    exploreBtn: "අකුරු 60 ම බලන්න", uploadBtn: "පින්තූරය upload කරන්න",
    chooseModeTitle: "ඔබේ පුහුණු ක්‍රමය තෝරන්න", chooseModeDesc: "සිංහල අකුරු හඳුනාගැනීම තියුණු කිරීමේ ක්‍රම දෙකක්",
    exploreTitle: "අකුරු ගවේෂණය කරන්න", exploreDesc: "ඕනෑම සිංහල අකුරක් ක්ලික් කර වචන, පින්තූර සහ උච්චාරණය දැනගන්න.", exploreAction: "අකුරු ගවේෂණය →",
    uploadTitle: "පින්තූරය upload කරන්න", uploadDesc: "අතින් ලියූ සිංහල අකුරක් upload කර AI හඳුනාගැනීමේ ප්‍රතිඵල ලබාගන්න.", uploadAction: "Upload කරන්න →",
    uploadMode: "Upload ආකාරය", close: "වසන්න ✕", practicing: "පුහුණු වෙමින්",
    clickOrDrag: "මෙහි ක්ලික් කරන්න හෝ ඇදගෙන දමන්න", supportedFormats: "PNG, JPG, WEBP සහාය දක්වයි",
    recognizeBtn: "අකුර හඳුනාගන්න →", recognizing: "හඳුනාගනිමින්...",
    allLetters: "සියලු අකුරු", howItWorks: "ක්‍රියා කරන ආකාරය", clickToExplore: "ගවේෂණය කිරීමට ක්ලික් කරන්න", howItWorksTitle: "ක්‍රියා කරන ආකාරය",
    step1: "සිංහල අකුර පින්තූරය upload කරන්න", step2: "AI අකුරේ හැඩය විශ්ලේෂණය කරයි", step3: "ප්‍රතිඵලය වහාම දකින්න",
    tip: "ඉඟිය", tipText: "හොඳ නිරවද්‍යතාවක් සඳහා පැහැදිලිව ලියූ අකුරක් upload කරන්න.",
    recognitionResult: "හඳුනාගැනීමේ ප්‍රතිඵලය", tryAgain: "නැවත උත්සාහ කරන්න →", confidence: "විශ්වාසය",
    wasCorrect: "මෙය නිවැරදිද?", yesCorrect: "✓ ඔව්, නිවැරදියි!", noTryAgain: "✕ නැහැ, නැවත උත්සාහ කරන්න", keepPractising: "දිගටම පුහුණු වෙන්න!",
    alternatives: "විකල්ප", exploreThisLetter: "මේ අකුර ගවේෂණය කරන්න →",
    allSinhalaLetters: "සියලු සිංහල අකුරු", alphabetDesc: "ඕනෑම අකුරක් ක්ලික් කර වචනය, පින්තූරය සහ උච්චාරණය දකින්න",
    showcase: "විදර්ශනය", compact: "සංක්ෂිප්ත",
    yourProgress: "ඔබේ ප්‍රගතිය", trackImprovement: "කාලයත් සමඟ ඔබේ දියුණුව නිරීක්ෂණය කරන්න",
    accuracy: "නිරවද්‍යතාව", sessions: "සැසි", streak: "දිනපෙළ", streakSuffix: " දින",
    accuracyTrend: "නිරවද්‍යතා ප්‍රවණතාව", lastSessions: "අවසාන සැසි 7",
    todayLetter: "අද අකුර", clickAnyLetter: "ඕනෑම අකුරක් ක්ලික් කර ඉගෙන්න", letters60: "අකුරු 60",
    practiceStreak: "පුහුණු දිනපෙළ", lettersToLearn: "ඉගෙනගත යුතු අකුරු", total60: "සම්පූර්ණ අකුරු 60", days7: "🔥 දිනය 7",
    audioNotFound: "හඬ ගොනුව හමු නොවීය",
  },
  ta: {
    badge: "சிங்கள கற்றல் அமைப்பு",
    heroTitle1: "சிங்கள எழுத்துகளை கற்று", heroTitleEm: "பயிற்சி", heroTitle2: "செய்யுங்கள்",
    heroDesc: "எந்த எழுத்தையும் கிளிக் செய்து உதாரண வார்த்தைகள், படங்கள் மற்றும் உச்சரிப்பை உடனடியாக பாருங்கள்.",
    exploreBtn: "60 எழுத்துகளையும் ஆராயுங்கள்", uploadBtn: "படத்தை பதிவேற்றுங்கள்",
    chooseModeTitle: "உங்கள் பயிற்சி முறையை தேர்வு செய்யுங்கள்", chooseModeDesc: "சிங்கள எழுத்து அடையாளத்தை கூர்மைப்படுத்த இரண்டு சக்திவாய்ந்த வழிகள்",
    exploreTitle: "எழுத்துகளை ஆராயுங்கள்", exploreDesc: "எந்த சிங்கள எழுத்தையும் கிளிக் செய்து வார்த்தைகள், படங்கள் மற்றும் உச்சரிப்பை அறியுங்கள்.", exploreAction: "எழுத்துகளை ஆராய →",
    uploadTitle: "படத்தை பதிவேற்றுங்கள்", uploadDesc: "கையால் எழுதிய சிங்கள எழுத்தை பதிவேற்றி AI அடையாள முடிவுகளை பெறுங்கள்.", uploadAction: "பதிவேற்று →",
    uploadMode: "பதிவேற்றும் முறை", close: "மூடு ✕", practicing: "பயிற்சி செய்கிறோம்",
    clickOrDrag: "இங்கே கிளிக் செய்யுங்கள் அல்லது இழுத்து விடுங்கள்", supportedFormats: "PNG, JPG, WEBP ஆதரிக்கப்படுகின்றன",
    recognizeBtn: "எழுத்தை அடையாளம் காண →", recognizing: "அடையாளம் காணுகிறது...",
    allLetters: "எல்லா எழுத்துகளும்", howItWorks: "எவ்வாறு செயல்படுகிறது", clickToExplore: "ஆராய கிளிக் செய்யுங்கள்", howItWorksTitle: "எவ்வாறு செயல்படுகிறது",
    step1: "சிங்கள எழுத்து படத்தை பதிவேற்றுங்கள்", step2: "AI வரி முறைகளை பகுப்பாய்வு செய்கிறது", step3: "முடிவை உடனடியாக பாருங்கள்",
    tip: "குறிப்பு", tipText: "சிறந்த துல்லியத்திற்கு தெளிவான, நன்கு வெளிச்சமான படத்தை பதிவேற்றுங்கள்.",
    recognitionResult: "அடையாள முடிவு", tryAgain: "மீண்டும் முயற்சிக்கவும் →", confidence: "நம்பகத்தன்மை",
    wasCorrect: "இது சரியா?", yesCorrect: "✓ ஆம், சரிதான்!", noTryAgain: "✕ இல்லை, மீண்டும் முயற்சிக்கவும்", keepPractising: "தொடர்ந்து பயிற்சி செய்யுங்கள்!",
    alternatives: "மாற்றுகள்", exploreThisLetter: "இந்த எழுத்தை ஆராயுங்கள் →",
    allSinhalaLetters: "அனைத்து சிங்கள எழுத்துகளும்", alphabetDesc: "எந்த எழுத்தையும் கிளிக் செய்து வார்த்தை, படம் மற்றும் உச்சரிப்பை பாருங்கள்",
    showcase: "காட்சி", compact: "சுருக்கமான",
    yourProgress: "உங்கள் முன்னேற்றம்", trackImprovement: "காலப்போக்கில் உங்கள் முன்னேற்றத்தை கண்காணியுங்கள்",
    accuracy: "துல்லியம்", sessions: "அமர்வுகள்", streak: "தொடர்", streakSuffix: " நாட்கள்",
    accuracyTrend: "துல்லிய போக்கு", lastSessions: "கடைசி 7 அமர்வுகள்",
    todayLetter: "இன்றைய எழுத்து", clickAnyLetter: "கற்க எந்த எழுத்தையும் கிளிக் செய்யுங்கள்", letters60: "60 எழுத்துகள்",
    practiceStreak: "பயிற்சி தொடர்", lettersToLearn: "கற்க வேண்டிய எழுத்துகள்", total60: "மொத்தம் 60 எழுத்துகள்", days7: "🔥 7 நாட்கள்",
    audioNotFound: "ஒலி கோப்பு கிடைக்கவில்லை",
  },
};

// ─── AUDIO MAP ─────────────────────────────────────────────────────────────────
const AUDIO_BASE_PATH = "/sounds01";
const LETTER_AUDIO_MAP = {
  "අ":"අ - අම්මා","ආ":"ආ - ආච්චි","ඇ":"ඇ - ඇපල්","ඈ":"ඈ - ඈයා","ඉ":"ඉ - ඉර","ඊ":"ඊ - ඊතලය","උ":"උ - උකුස්සා","ඌ":"ඌ - ඌරා",
  "එ":"එ - එලුවා","ඒ":"ඒ - ඒදන්ඩ","ඓ":"ඓ - ඓතිහාසික","ඔ":"o","ඕ":"ඕ - ඕලු","ඖ":"ඖ - ඖෂධ",
  "ක":"ක - කපුටා","ඛ":"ඛ - ඛනිජ","ග":"ග - ගස","ඝ":"ඝ - ඝෝෂාව","ඞ":"nga",
  "ච":"ච - චන්ද්‍රයා","ඡ":"ඡ ඡායාරූප","ජ":"ජ - ජලය්","ඣ":"ඣ - ඣාරය","ඤ":"ඤ - ඤාණය",
  "ට":"ට - ටයරය","ඨ":"ඨ - ඨෙරවාද","ඩ":"ඩ - ඩයිනෝසිරස්","ඪ":"ඪ - ඪෝල්කිය","ණ":"ණ - ණය",
  "ත":"ත - තාරාවා","ථ":"ථ - ථූපය","ද":"ද - දරුවා","ධ":"ධ - ධීවරයා","න":"න - නයා",
  "ප":"ප - පහන","ඵ":"ඵ - ඵලය","බ":"බ - බල්ලා","භ":"භ - භාජනය","ම":"ම - මල",
  "ය":"ය - යතුර","ර":"ර - රඹුටන්","ල":"ල - ලන්තෑරුම","ව":"ව - වදුරා","ශ":"ශ - ශබ්දය","ෂ":"ෂ - ෂඩ්රසය","ස":"ස - සමනලයා","හ":"හ - හාවා","ළ":"ළ - ළමයා","ෆ":"ෆ - ෆෝනය",
  "෦":"num_0","෧":"num_1","෨":"num_2","෩":"num_3","෪":"num_4",
  "෫":"num_5","෬":"num_6","෭":"num_7","෮":"num_8","෯":"num_9",
};

// ─── PAGE LOAD INTRO SOUND ─────────────────────────────────────────────────────
const introAudio = new Audio('/sounds/2.m4a');

function playIntroSound() {
  try {
    introAudio.currentTime = 0;
    introAudio.play().catch((err) => {
      console.warn('Intro sound (2.m4a) could not play:', err);
    });
  } catch (e) {
    console.warn('Intro sound error:', e);
  }
}

// ─── AUDIO ENGINE ──────────────────────────────────────────────────────────────
// ONE global slot. Every new play() call kills the previous one completely
// — including clearing oncanplaythrough so a still-loading file can never
// fire its callback after we've moved on or closed the modal.
let _activeAudio = null;

const stopAudio = () => {
  if (_activeAudio) {
    // Kill ALL callbacks so a buffering file cannot fire after stop.
    _activeAudio.oncanplaythrough = null;
    _activeAudio.onerror        = null;
    _activeAudio.onended        = null;
    _activeAudio.pause();
    _activeAudio.currentTime    = 0;
    _activeAudio                = null;
  }
};

const playLetterAudio = (letter, variant = "letter") =>
  new Promise((resolve, reject) => {
    const filename = LETTER_AUDIO_MAP[letter];
    if (!filename) { reject(new Error(`No mapping for "${letter}"`)); return; }

    const suffix = variant === "word" ? `${filename}_word` : filename;
    const src    = `${AUDIO_BASE_PATH}/${suffix}.m4a`;

    // Hard-stop whatever is running/loading right now.
    stopAudio();

    const audio  = new Audio(src);
    _activeAudio = audio;

    audio.oncanplaythrough = () => {
      // Guard: if stopAudio() was called while this file was buffering,
      // _activeAudio will be null (or a newer element). Do not play.
      if (_activeAudio !== audio) return;
      audio.play().then(resolve).catch(reject);
    };

    audio.onerror = () => {
      console.warn(`[Audio] missing: ${src}`);
      reject(new Error(`Audio missing: ${src}`));
    };

    audio.load();
  });

// ─── LETTER DATA ───────────────────────────────────────────────────────────────
const LETTER_CATEGORIES = [
  { name:"ස්වර", nameEn:"Vowels", color:"#e11d48", letters:[
    {letter:"අ",sound:"a",  word:"අම්මා",  meaning:"Mother",     image:"../images/mother.png"},
    {letter:"ආ",sound:"aa", word:"ආච්චි",  meaning:"Grand mother",image:"../images/grand.png"},
    {letter:"ඇ",sound:"ae", word:"ඇපල්",   meaning:"Apple",      image:"../images/apple.png"},
    {letter:"ඈ",sound:"aee",word:"ඈයා",    meaning:"Pangolin",   image:"../images/pangolin.png"},
    {letter:"ඉ",sound:"i",  word:"ඉර",     meaning:"Sun",        image:"../images/sun.png"},
    {letter:"ඊ",sound:"ii", word:"ඊතලය",   meaning:"Arrow",      image:"../images/arrow.png"},
    {letter:"උ",sound:"u",  word:"උකුස්සා",meaning:"Eagle",      image:"../images/eagle.png"},
    {letter:"ඌ",sound:"uu", word:"ඌරා",    meaning:"Pig",        image:"../images/pig.png"},
    {letter:"එ",sound:"e",  word:"එළුවා",  meaning:"Goat",       image:"../images/goat.png"},
    {letter:"ඒ",sound:"ee", word:"ඒදණ්ඩ", meaning:"Footbridge",  image:"../images/footbridge.png"},
    {letter:"ඓ",sound:"ai", word:"ඓතිහාසික",meaning:"Historical",image:"../images/Historical.png"},
    {letter:"ඔ",sound:"o",  word:"ඔටුන්න", meaning:"Crown",      image:"../images/crown.png"},
    {letter:"ඕ",sound:"oo", word:"ඕලු",    meaning:"Water lily", image:"../images/Water lily.png"},
    {letter:"ඖ",sound:"au", word:"ඖෂධ",    meaning:"Medicine",   image:"../images/medicine.png"},
  ]},
  { name:"ක වර්ගය", nameEn:"Ka group", color:"#7c3aed", letters:[
    {letter:"ක",sound:"ka", word:"කපුටා",  meaning:"Crow",        image:"../images/crow.png"},
    {letter:"ඛ",sound:"kha",word:"ඛනිජ",   meaning:"Mineral",     image:"../images/mineral.png"},
    {letter:"ග",sound:"ga", word:"ගස",     meaning:"Tree",        image:"../images/tree.png",wordEn:"gasa"},
    {letter:"ඝ",sound:"gha",word:"ඝෝෂාව", meaning:"Noise",       image:"../images/Noise.png"},
    {letter:"ඞ",sound:"nga",word:"ඞේ",     meaning:"Sound symbol",image:"/images/letters/nga_nge.jpg",wordEn:"nge"},
  ]},
  { name:"ච වර්ගය", nameEn:"Cha group", color:"#0891b2", letters:[
    {letter:"ච",sound:"cha", word:"චන්ද්‍රයා",meaning:"Moon",      image:"../images/moon.png"},
    {letter:"ඡ",sound:"chha",word:"ඡායාරූප", meaning:"Photograph",image:"../images/Photograph.png"},
    {letter:"ජ",sound:"ja",  word:"ජලය",      meaning:"Water",     image:"/images/water.png"},
    {letter:"ඣ",sound:"jha", word:"ඣාරය",     meaning:"Waterfall", image:"/images/letters/jha_jharaya.jpg",wordEn:"jharaya"},
    {letter:"ඤ",sound:"nya", word:"ඤාණය",     meaning:"Wisdom",    image:"/images/letters/nya_nyanaya.jpg",wordEn:"nyanaya"},
  ]},
  { name:"ට වර්ගය", nameEn:"Ta group (retroflex)", color:"#0369a1", letters:[
    {letter:"ට",sound:"ta", word:"ටයරය",       meaning:"Tire",     image:"../images/Tire.png"},
    {letter:"ඨ",sound:"tha",word:"ඨෙරවාද",     meaning:"Theravada",image:"/images/letters/tha_therawada.jpg",wordEn:"therawada"},
    {letter:"ඩ",sound:"da", word:"ඩයිනෝසිරස්", meaning:"Dinosaur", image:"../images/dino.png"},
    {letter:"ඪ",sound:"dha",word:"ඪෝල්කිය",    meaning:"Dholki",   image:"../images/Dholki.png"},
    {letter:"ණ",sound:"na", word:"ණය",          meaning:"Loan",     image:"/images/Loan.png"},
  ]},
  { name:"ත වර්ගය", nameEn:"Tha group (dental)", color:"#15803d", letters:[
    {letter:"ත",sound:"tha", word:"තාරාවා", meaning:"Duck",      image:"../images/Duck.png"},
    {letter:"ථ",sound:"thha",word:"ථූපය",   meaning:"Stupa",     image:"../images/Stupa.png"},
    {letter:"ද",sound:"da",  word:"දරුවා",  meaning:"Child",     image:"../images/child.png"},
    {letter:"ධ",sound:"dha", word:"ධීවරයා", meaning:"Fisherman", image:"../images/Fisherman.png"},
    {letter:"න",sound:"na",  word:"නයා",    meaning:"Snake",     image:"../images/Snake.png"},
  ]},
  { name:"ප වර්ගය", nameEn:"Pa group", color:"#b45309", letters:[
    {letter:"ප",sound:"pa", word:"පහන",   meaning:"Lamp",   image:"../images/lamp.png"},
    {letter:"ඵ",sound:"pha",word:"ඵලය",   meaning:"Fruit",  image:"../images/Fruit.png"},
    {letter:"බ",sound:"ba", word:"බල්ලා", meaning:"Dog",    image:"../images/Dog.png"},
    {letter:"භ",sound:"bha",word:"භාජනය", meaning:"Bowl",   image:"../images/Bowl.png"},
    {letter:"ම",sound:"ma", word:"මල",    meaning:"Flower", image:"../images/Flower.png"},
  ]},
  { name:"අවර්ගීය", nameEn:"Semi-vowels & Sibilants", color:"#be185d", letters:[
    {letter:"ය",sound:"ya",  word:"යතුර",    meaning:"Key",         image:"../images/key.png"},
    {letter:"ර",sound:"ra",  word:"රඹුටන්",  meaning:"Rambutan",    image:"/images/Rambutan.png"},
    {letter:"ල",sound:"la",  word:"ලන්තෑරුම",meaning:"Lantern",     image:"/images/Lantern.png"},
    {letter:"ව",sound:"va",  word:"වඳුරා",   meaning:"Monkey",      image:"../images/monkey.png"},
    {letter:"ශ",sound:"sha", word:"ශබ්දය",   meaning:"Sound",       image:"../images/Sound.png"},
    {letter:"ෂ",sound:"shha",word:"ෂඩ්රසය", meaning:"Six flavours", image:"/images/letters/shha_shadrasaya.jpg",wordEn:"shadrasaya"},
    {letter:"ස",sound:"sa",  word:"සමනලයා",  meaning:"Butterfly",   image:"/images/butterfly.png"},
    {letter:"හ",sound:"ha",  word:"හාවා",    meaning:"Rabbit",      image:"/images/Rabbit.png",wordEn:"haawa"},
    {letter:"ළ",sound:"lla", word:"ළමයා",    meaning:"Child",       image:"/images/letters/lla_lamaaya.jpg",wordEn:"lamaaya"},
    {letter:"ෆ",sound:"fa",  word:"ෆෝනය",    meaning:"Phone",       image:"/images/letters/fa_phonaya.jpg",wordEn:"phonaya"},
  ]},
  { name:"ගණනා අකුරු", nameEn:"Numerals", color:"#6d28d9", letters:[
    {letter:"෦",sound:"shoonya",word:"ශුන්‍ය",wordEn:"shoonya",meaning:"Zero", image:"/images/letters/num_0.jpg"},
    {letter:"෧",sound:"eka",    word:"එකය",   wordEn:"ekaya",  meaning:"One",  image:"/images/letters/num_1.jpg"},
    {letter:"෨",sound:"deka",   word:"දෙකය",  wordEn:"dekaya", meaning:"Two",  image:"/images/letters/num_2.jpg"},
    {letter:"෩",sound:"thuna",  word:"තුනය",  wordEn:"thunaya",meaning:"Three",image:"/images/letters/num_3.jpg"},
    {letter:"෪",sound:"hathara",word:"හතරය",  wordEn:"hatharaya",meaning:"Four",image:"/images/letters/num_4.jpg"},
    {letter:"෫",sound:"paha",   word:"පහය",   wordEn:"pahaya", meaning:"Five", image:"/images/letters/num_5.jpg"},
    {letter:"෬",sound:"haya",   word:"හය",    wordEn:"haya",   meaning:"Six",  image:"/images/letters/num_6.jpg"},
    {letter:"෭",sound:"hatha",  word:"හතය",   wordEn:"hathaya",meaning:"Seven",image:"/images/letters/num_7.jpg"},
    {letter:"෮",sound:"ata",    word:"අටය",   wordEn:"ataya",  meaning:"Eight",image:"/images/letters/num_8.jpg"},
    {letter:"෯",sound:"nawaya", word:"නවය",   wordEn:"nawaya", meaning:"Nine", image:"/images/letters/num_9.jpg"},
  ]},
];

const ALL_LETTERS = LETTER_CATEGORIES.flatMap((c) =>
  c.letters.map((l) => ({ ...l, catColor: c.color, catName: c.nameEn }))
);
const getLetterInfo = (char) => {
  for (const cat of LETTER_CATEGORIES) {
    const found = cat.letters.find((l) => l.letter === char);
    if (found) return { ...found, catColor: cat.color, catName: cat.nameEn, sinhalaName: cat.name };
  }
  return null;
};

// ─── SMALL AUDIO BUTTON (manual trigger only) ─────────────────────────────────
function AudioButton({ letter, label="🔈", playingLabel="🔊", className="", t }) {
  const [state, setState] = useState("idle");
  const handle = async (e) => {
    e.stopPropagation();
    if (state === "playing") { stopAudio(); setState("idle"); return; }
    setState("playing");
    try   { await playLetterAudio(letter); setTimeout(() => setState("idle"), 3000); }
    catch { setState("error"); setTimeout(() => setState("idle"), 2000); }
  };
  return (
    <button onClick={handle} title={state==="error" ? (t?.audioNotFound||"Audio not found") : `Play ${letter}`} className={className}>
      {state==="playing" ? playingLabel : state==="error" ? "⚠️" : label}
    </button>
  );
}

// ─── FULL AUDIO PLAY BUTTON (manual, supports word variant) ───────────────────
function AudioPlayButton({ letter, variant="letter", className, idleLabel, playingLabel, errorLabel }) {
  const [state, setState] = useState("idle");
  const handle = async (e) => {
    e.stopPropagation();
    if (state === "playing") { stopAudio(); setState("idle"); return; }
    setState("playing");
    try   { await playLetterAudio(letter, variant); setTimeout(() => setState("idle"), 3000); }
    catch { setState("error"); setTimeout(() => setState("idle"), 2000); }
  };
  return (
    <button onClick={handle} className={className}>
      {state==="playing" ? playingLabel : state==="error" ? errorLabel : idleLabel}
    </button>
  );
}

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix="" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let v = 0; const step = Math.ceil(value/40);
    const t = setInterval(() => { v+=step; if(v>=value){setCount(value);clearInterval(t);}else setCount(v); }, 30);
    return () => clearInterval(t);
  }, [value]);
  return <span>{count}{suffix}</span>;
}

// ─── LETTER DETAIL MODAL ──────────────────────────────────────────────────────
function LetterDetailModal({ letterInfo, catColor, onClose, t }) {
  const [imgError, setImgError] = useState(false);

  // ── THE ONLY PLACE audio auto-plays. ──────────────────────────────────────
  // Rules-of-Hooks: this is BEFORE the early return.
  // On unmount (modal close) the cleanup runs stopAudio(), which now also
  // clears oncanplaythrough so a still-buffering file cannot fire afterwards.
  useEffect(() => {
    if (!letterInfo) return;
    playLetterAudio(letterInfo.letter).catch(() => {});
    return () => stopAudio();          // clean kill on close
  }, [letterInfo?.letter]);

  if (!letterInfo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden anim-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="sinhala w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold"
              style={{ background:`${catColor}18`, color:catColor }}>
              {letterInfo.letter}
            </div>
            <div>
              <div className="font-display text-xl text-black">{letterInfo.letter}</div>
              <div className="text-sm text-gray-400">/{letterInfo.sound}/</div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-black transition-all">
            ✕
          </button>
        </div>

        {/* Image */}
        <div className="relative bg-gray-50 h-70 flex items-center justify-center overflow-hidden">
          {!imgError ? (
            <img src={letterInfo.image} alt={letterInfo.meaning}
              className="w-full h-full object-cover" onError={() => setImgError(true)} />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="sinhala text-7xl" style={{ color:`${catColor}40` }}>{letterInfo.letter}</div>
              <div className="text-xs text-gray-400">Add image: {letterInfo.image}</div>
            </div>
          )}
          {!imgError && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-5 py-4">
              <div className="sinhala text-white font-bold text-2xl">{letterInfo.word}</div>
              <div className="text-gray-300 text-sm">{letterInfo.meaning}</div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {imgError && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="sinhala text-3xl font-bold text-black">{letterInfo.word}</div>
                <div className="text-xs px-2 py-1 rounded-lg font-semibold"
                  style={{ background:`${catColor}14`, color:catColor }}>{letterInfo.catName}</div>
              </div>
              <div className="text-gray-500 text-sm">{letterInfo.meaning} · <span className="font-mono">{letterInfo.wordEn}</span></div>
            </div>
          )}
          {!imgError && (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Example Word</div>
                <div className="sinhala text-2xl font-bold text-black">{letterInfo.word}</div>
                <div className="text-sm text-gray-500">{letterInfo.wordEn} · {letterInfo.meaning}</div>
              </div>
              <div className="text-xs px-3 py-1.5 rounded-xl font-semibold"
                style={{ background:`${catColor}14`, color:catColor }}>{letterInfo.catName}</div>
            </div>
          )}
          {/* Manual replay buttons — user-triggered only */}
          <div className="flex gap-3">
            <AudioPlayButton letter={letterInfo.letter} variant="letter"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold bg-black text-white hover:bg-gray-900 transition-all"
              idleLabel="🔈 Hear Letter" playingLabel="🔊 Playing..." errorLabel="⚠️ No Audio" />
            <AudioPlayButton letter={letterInfo.letter} variant="word"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-black transition-all"
              idleLabel="🗣 Word" playingLabel="🔊..." errorLabel="⚠️" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CONFIDENCE BAR ───────────────────────────────────────────────────────────
function ConfidenceBar({ value }) {
  return (
    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-black rounded-full transition-all duration-700" style={{ width:`${value}%` }} />
    </div>
  );
}

// ─── LETTER GRID ─────────────────────────────────────────────────────────────
// No playLetterAudio() here — modal handles it.
function LetterGrid({ onSelect, selectedLetter, onLetterClick }) {
  const [openCat, setOpenCat] = useState(0);
  return (
    <div>
      {LETTER_CATEGORIES.map((cat, ci) => (
        <div key={ci} className="mb-1">
          <button onClick={() => setOpenCat(openCat===ci ? -1 : ci)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-left hover:bg-white"
            style={{ background: openCat===ci ? `${cat.color}14` : "transparent" }}>
            <span className="text-xs font-bold" style={{ color: openCat===ci ? cat.color : "#6b7280" }}>
              {cat.name} <span className="opacity-50 font-normal">({cat.nameEn})</span>
            </span>
            <span className="text-gray-400 text-xs">{openCat===ci ? "▲" : "▼"}</span>
          </button>
          {openCat===ci && (
            <div className="flex flex-wrap gap-2 px-2 pb-3 pt-1">
              {cat.letters.map((l, li) => {
                const isSel = selectedLetter===l.letter;
                return (
                  <button key={li}
                    onClick={() => {
                      onSelect?.(l.letter);
                      onLetterClick?.({ ...l, catColor:cat.color, catName:cat.nameEn });
                      // ✅ NO playLetterAudio() — modal useEffect is the only trigger
                    }}
                    title={`${l.letter} (${l.sound}) · ${l.meaning}`}
                    className="sinhala w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all duration-150 hover:scale-110"
                    style={{
                      border:     isSel ? `2px solid ${cat.color}` : "1.5px solid #e5e7eb",
                      background: isSel ? cat.color : "#f9fafb",
                      color:      isSel ? "#fff"    : "#374151",
                      transform:  isSel ? "scale(1.15)" : "scale(1)",
                    }}>
                    {l.letter}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── ALPHABET SHOWCASE ────────────────────────────────────────────────────────
// No playLetterAudio() here — modal handles it.
function AlphabetShowcase({ onLetterClick }) {
  return (
    <div className="space-y-8">
      {LETTER_CATEGORIES.map((cat, ci) => (
        <div key={ci}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gray-100" />
            <div className="sinhala text-sm font-semibold px-4 py-1.5 rounded-full"
              style={{ background:`${cat.color}14`, color:cat.color }}>
              {cat.name} · {cat.nameEn}
            </div>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-3">
            {cat.letters.map((l, li) => (
              <button key={li}
                onClick={() => {
                  onLetterClick({ ...l, catColor:cat.color, catName:cat.nameEn });
                  // ✅ NO playLetterAudio() — modal useEffect is the only trigger
                }}
                title={`${l.letter} (${l.sound}) - ${l.meaning}`}
                className="group relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-gray-100 bg-gray-50 hover:border-transparent hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <div className="sinhala text-2xl font-bold" style={{ color:cat.color }}>{l.letter}</div>
                <div className="text-xs text-gray-400 font-mono leading-none">{l.sound}</div>
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background:`${cat.color}08`, border:`1.5px solid ${cat.color}40` }} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LetterRecognition({ lang = "en" }) {
  const t = UI_TRANSLATIONS[lang] ?? UI_TRANSLATIONS.en;

  const [selectedLetter, setSelectedLetter] = useState(null);
  const [isRecognizing,  setRecognizing]    = useState(false);
  const [result,         setResult]         = useState(null);
  const [feedback,       setFeedback]       = useState(null);
  const [celebrating,    setCelebrating]    = useState(false);
  const [uploadPreview,  setUploadPreview]  = useState(null);
  const [hasDrawn,       setHasDrawn]       = useState(false);
  const [stats,          setStats]          = useState({ total:0, correct:0, streak:0, points:0 });
  const [showProgress,   setShowProgress]   = useState(false);
  const [heroVisible,    setHeroVisible]    = useState(false);
  const [showPanel,      setShowPanel]      = useState("letters");
  const [activeModal,    setActiveModal]    = useState(null);
  const [activeMode,     setActiveMode]     = useState(null);
  const [alphabetView,   setAlphabetView]   = useState("grid");

  const fileInputRef = useRef(null);
  const chartBars    = [40, 55, 48, 62, 70, 75, 85];
  const accuracy     = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  useEffect(() => {
    playIntroSound();
    setTimeout(() => setHeroVisible(true),  100);
    setTimeout(() => setShowProgress(true), 600);
  }, []);

  // Open modal — audio starts inside LetterDetailModal's useEffect (one place only)
  const handleLetterClick = (letterInfo) => setActiveModal(letterInfo);

  // Select a letter for upload practice — NO auto-play here
  const handleSelectLetter = (letter) => {
    setSelectedLetter(letter);
    setActiveMode("upload");
    setResult(null);
    setFeedback(null);
    setHasDrawn(false);
    // ✅ NO playLetterAudio() — user can press 🔈 in the banner if they want to hear it
  };

  const handleActivateMode = (mode) => {
    setActiveMode(mode);
    setResult(null);
    setFeedback(null);
  };

  const mockRecognize = (selLetter) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const conf = 70 + Math.floor(Math.random() * 28);
        const pool = selLetter ? ALL_LETTERS.filter((l) => l.letter===selLetter) : ALL_LETTERS;
        const top  = { ...pool[Math.floor(Math.random() * pool.length)], confidence:conf };
        const alts = ALL_LETTERS
          .filter((l) => l.catName===top.catName && l.letter!==top.letter)
          .slice(0, 3)
          .map((l, i) => ({ ...l, confidence: Math.max(10, conf-20-i*8) }));
        resolve({ top, alternatives:alts });
      }, 1400);
    });

  const handleRecognize = async () => {
    if (!hasDrawn && !uploadPreview) return;
    setRecognizing(true); setResult(null); setFeedback(null);
    const res = await mockRecognize(selectedLetter);
    setResult(res); setRecognizing(false);
    setStats((p) => ({ ...p, total:p.total+1 }));
  };

  const handleFeedback = (correct) => {
    setFeedback(correct ? "correct" : "wrong");
    if (correct) {
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 1800);
      setStats((p) => ({
        ...p, correct:p.correct+1, streak:p.streak+1,
        points:p.points + Math.max(5, Math.round((result?.top?.confidence??70)/10)),
      }));
    } else {
      setStats((p) => ({ ...p, streak:0 }));
    }
  };

  const handleReset = () => { setResult(null); setFeedback(null); setHasDrawn(false); setUploadPreview(null); };

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploadPreview(URL.createObjectURL(file));
    setHasDrawn(true); setResult(null); setFeedback(null);
  };

  const progressStats = [
    { label:t.accuracy, value:accuracy||78, suffix:"%" },
    { label:t.sessions, value:stats.total||24, suffix:"" },
    { label:t.streak,   value:stats.streak||7,  suffix:t.streakSuffix },
  ];

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Noto+Sans+Sinhala:wght@300;400;500;600&display=swap');
        * { font-family:'Nunito',sans-serif; }
        .sinhala { font-family:'Noto Sans Sinhala',sans-serif !important; font-weight:400; }
        .font-display { font-family:'Nunito',sans-serif; font-weight:800; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
        @keyframes popIn   { 0%{opacity:0;transform:scale(.7)} 60%{transform:scale(1.1)} 100%{opacity:1;transform:scale(1)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .anim-fade-up  { animation:fadeUp  0.7s cubic-bezier(.22,1,.36,1) both; }
        .anim-fade-in  { animation:fadeIn  0.6s ease both; }
        .anim-scale-in { animation:scaleIn 0.5s cubic-bezier(.22,1,.36,1) both; }
        .anim-pop      { animation:popIn   0.5s cubic-bezier(.36,.07,.19,.97) both; }
        .delay-1{animation-delay:0.10s} .delay-2{animation-delay:0.22s}
        .delay-3{animation-delay:0.38s} .delay-4{animation-delay:0.54s}
        .hover-lift { transition:transform 0.28s cubic-bezier(.22,1,.36,1),box-shadow 0.28s ease; }
        .hover-lift:hover { transform:translateY(-4px) scale(1.015); box-shadow:0 20px 60px rgba(0,0,0,.13); }
      `}</style>

      {/* MODAL */}
      {activeModal && (
        <LetterDetailModal
          letterInfo={activeModal}
          catColor={activeModal.catColor}
          onClose={() => setActiveModal(null)}
          t={t}
        />
      )}

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50"
            style={{ clipPath:"polygon(8% 0,100% 0,100% 100%,0 100%)" }} />
          <svg className="absolute bottom-0 left-0 opacity-5 w-96 h-96" viewBox="0 0 400 400" fill="none">
            <circle cx="200" cy="200" r="180" stroke="black" strokeWidth="1"/>
            <circle cx="200" cy="200" r="120" stroke="black" strokeWidth="1"/>
            <circle cx="200" cy="200" r="60"  stroke="black" strokeWidth="1"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
          <div className={heroVisible ? "anim-fade-up" : "opacity-0"}>
            <span className="inline-block text-xs tracking-[0.2em] uppercase border border-black px-3 py-1 mb-8 anim-fade-in delay-1">{t.badge}</span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.08] mb-6 anim-fade-up delay-2 text-black">
              {t.heroTitle1}{" "}
              <em className="not-italic underline decoration-2 underline-offset-4">{t.heroTitleEm}</em>{" "}
              {t.heroTitle2}
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md anim-fade-up delay-3">{t.heroDesc}</p>
            <div className="flex flex-wrap gap-4 anim-fade-up delay-4">
              <button onClick={() => document.getElementById("alphabet-section")?.scrollIntoView({behavior:"smooth"})}
                className="bg-black text-white px-7 py-3.5 rounded-2xl text-sm font-semibold hover:bg-gray-900 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
                {t.exploreBtn}
              </button>
              <button onClick={() => handleActivateMode("upload")}
                className="border border-black text-black px-7 py-3.5 rounded-2xl text-sm font-semibold hover:bg-black hover:text-white transition-all duration-300 hover:-translate-y-0.5">
                {t.uploadBtn}
              </button>
            </div>
          </div>

          <div className={`relative ${heroVisible ? "anim-scale-in delay-2" : "opacity-0"}`}>
            <div className="relative mx-auto w-full max-w-md">
              <div className="relative bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-2xl">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">{t.todayLetter}</div>
                    <div className="sinhala text-4xl font-semibold">ක</div>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap mb-4">
                  {["ක","ග","ජ","ත","ම"].map((l,i) => {
                    const info = getLetterInfo(l);
                    return (
                      <button key={i} onClick={() => handleLetterClick({...info,catColor:info?.catColor})}
                        className="sinhala w-11 h-11 rounded-xl flex items-center justify-center text-2xl font-bold hover:scale-110 transition-all"
                        style={{ background:`${info?.catColor}14`, color:info?.catColor }}>
                        {l}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-black"/>
                    <span className="text-xs text-gray-500">{t.clickAnyLetter}</span>
                  </div>
                  <div className="font-display text-xl">{t.letters60}</div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 text-xs">
                <div className="text-gray-400 mb-0.5">{t.practiceStreak}</div>
                <div className="font-semibold text-sm">{t.days7}</div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-black text-white rounded-2xl shadow-xl px-4 py-3 text-xs">
                <div className="text-gray-400 mb-0.5">{t.lettersToLearn}</div>
                <div className="font-semibold text-sm">{t.total60}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODE SELECTION ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl mb-4">{t.chooseModeTitle}</h2>
          <p className="text-gray-400 text-base max-w-md mx-auto">{t.chooseModeDesc}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            { id:"explore", title:t.exploreTitle, desc:t.exploreDesc, action:t.exploreAction,
              icon:<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg> },
            { id:"upload",  title:t.uploadTitle,  desc:t.uploadDesc,  action:t.uploadAction,
              icon:<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg> },
          ].map(({ id, title, desc, action, icon }) => {
            const isActive = activeMode===id;
            return (
              <div key={id}
                onClick={() => id==="explore"
                  ? document.getElementById("alphabet-section")?.scrollIntoView({behavior:"smooth"})
                  : handleActivateMode(id)}
                className={`hover-lift cursor-pointer rounded-3xl border-2 p-8 transition-all duration-300 ${isActive ? "border-black bg-black text-white" : "border-gray-100 bg-gray-50 hover:border-gray-300"}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${isActive ? "bg-white text-black" : "bg-black text-white"}`}>{icon}</div>
                <h3 className="font-display text-2xl mb-3">{title}</h3>
                <p className={`text-sm leading-relaxed mb-8 ${isActive ? "text-gray-300" : "text-gray-500"}`}>{desc}</p>
                <button className={`text-sm font-semibold px-6 py-3 rounded-xl transition-all ${isActive ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-900"}`}>{action}</button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── UPLOAD PRACTICE ───────────────────────────────────────────────────── */}
      {activeMode==="upload" && (
        <section className="max-w-7xl mx-auto px-6 pb-20 anim-fade-up">
          <div className="grid lg:grid-cols-[1fr_280px] gap-6">
            <div className="rounded-3xl border border-gray-100 bg-gray-50 overflow-hidden shadow-xl">
              <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gray-200"/>
                  <div className="w-3 h-3 rounded-full bg-gray-300"/>
                  <div className="w-3 h-3 rounded-full bg-gray-400"/>
                </div>
                <span className="text-xs text-gray-400 uppercase tracking-widest">{t.uploadMode}</span>
                <button onClick={() => setActiveMode(null)} className="text-xs text-gray-400 hover:text-black transition-colors">{t.close}</button>
              </div>
              <div className="p-8">
                {selectedLetter && (() => {
                  const info = getLetterInfo(selectedLetter);
                  return (
                    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-5 py-3.5 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="sinhala w-11 h-11 rounded-xl flex items-center justify-center text-2xl font-semibold"
                          style={{ background:`${info?.catColor}18`, color:info?.catColor }}>{selectedLetter}</div>
                        <div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider">{t.practicing}</div>
                          <div className="sinhala text-xl font-semibold leading-tight">{selectedLetter}</div>
                          <div className="text-xs text-gray-500">/{info?.sound}/ · {info?.catName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Manual-only play button in banner */}
                        <AudioButton letter={selectedLetter} t={t}
                          className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-black transition-all text-sm"/>
                        <button onClick={() => setSelectedLetter(null)}
                          className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-400 hover:border-red-200 transition-all text-sm">✕</button>
                      </div>
                    </div>
                  );
                })()}

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                  className="relative rounded-2xl border-2 border-dashed border-gray-200 bg-white cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 flex flex-col items-center justify-center min-h-64 overflow-hidden">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])}/>
                  {uploadPreview ? (
                    <>
                      <img src={uploadPreview} alt="uploaded" className="max-h-60 max-w-full object-contain rounded-xl"/>
                      <button onClick={(e) => { e.stopPropagation(); setUploadPreview(null); setHasDrawn(false); setResult(null); }}
                        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-gray-400 hover:text-red-400 transition-colors text-sm">✕</button>
                    </>
                  ) : (
                    <div className="text-center p-10">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                        </svg>
                      </div>
                      <p className="font-semibold text-gray-700 mb-1">{t.clickOrDrag}</p>
                      <p className="text-xs text-gray-400">{t.supportedFormats}</p>
                    </div>
                  )}
                </div>
                {uploadPreview && (
                  <button onClick={handleRecognize} disabled={isRecognizing}
                    className="w-full mt-5 bg-black text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-900 transition-all hover:shadow-lg disabled:bg-gray-200 disabled:text-gray-400">
                    {isRecognizing ? t.recognizing : t.recognizeBtn}
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-1 bg-gray-100 rounded-2xl p-1.5">
                {[{id:"letters",label:t.allLetters},{id:"howto",label:t.howItWorks}].map(({id,label}) => (
                  <button key={id} onClick={() => setShowPanel(id)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${showPanel===id ? "bg-black text-white" : "text-gray-500"}`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 flex-1 overflow-y-auto" style={{maxHeight:480}}>
                {showPanel==="letters" && (
                  <>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t.clickToExplore}</p>
                    <LetterGrid onSelect={handleSelectLetter} selectedLetter={selectedLetter} onLetterClick={handleLetterClick}/>
                  </>
                )}
                {showPanel==="howto" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">{t.howItWorksTitle}</h3>
                    {[t.step1,t.step2,t.step3].map((step,i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center font-bold text-xs text-white flex-shrink-0">{i+1}</div>
                        <p className="text-gray-600 text-sm leading-relaxed">{step}</p>
                      </div>
                    ))}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">{t.tip}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{t.tipText}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── RESULT ────────────────────────────────────────────────────────────── */}
      {result && (
        <section className="max-w-7xl mx-auto px-6 pb-20 anim-scale-in">
          <div className="rounded-3xl border border-gray-100 overflow-hidden shadow-xl max-w-4xl">
            <div className="bg-black text-white px-8 py-5 flex items-center justify-between">
              <h3 className="font-display text-xl">{t.recognitionResult}</h3>
              <button onClick={handleReset} className="text-xs text-gray-400 hover:text-white transition-colors font-semibold">{t.tryAgain}</button>
            </div>
            <div className="p-8 grid sm:grid-cols-[200px_1fr] gap-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center">
                <div className="relative w-24 h-24 mb-4">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="black" strokeWidth="8"
                      strokeDasharray={`${result.top.confidence*2.64} 264`} strokeLinecap="round"
                      style={{transition:"stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1)"}}/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-2xl">{result.top.confidence}%</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-4">{t.confidence}</div>
                <div className="flex items-center gap-2 mb-1">
                  <button onClick={() => handleLetterClick({...result.top,catColor:result.top.catColor||"#000"})}
                    className="sinhala text-5xl font-bold text-black hover:scale-110 transition-all cursor-pointer">
                    {result.top.letter}
                  </button>
                  <AudioButton letter={result.top.letter} t={t}
                    className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-sm hover:bg-gray-200 transition-all"/>
                </div>
                <div className="text-xs text-gray-500">/{result.top.sound}/ · {result.top.catName}</div>
                <div className="text-xs text-gray-400 mt-1">{result.top.meaning}</div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl p-5 border border-gray-200 bg-gray-50">
                  <div className="text-xs text-gray-400 mb-3 uppercase tracking-widest">{t.wasCorrect}</div>
                  {!feedback ? (
                    <div className="flex gap-3">
                      <button onClick={() => handleFeedback(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-all">
                        {t.yesCorrect}
                      </button>
                      <button onClick={() => handleFeedback(false)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-all">
                        {t.noTryAgain}
                      </button>
                    </div>
                  ) : feedback==="correct" ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center anim-pop">
                      <div className="text-2xl mb-1">🎉</div>
                      <div className="text-green-700 font-bold text-sm">
                        +{Math.max(5,Math.round(result.top.confidence/10))} pts! Streak: {stats.streak} 🔥
                      </div>
                    </div>
                  ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center anim-pop">
                      <div className="text-2xl mb-1">💪</div>
                      <div className="text-orange-700 font-bold text-sm">{t.keepPractising}</div>
                    </div>
                  )}
                </div>

                {result.alternatives.length > 0 && (
                  <div className="rounded-2xl p-5 border border-gray-200 bg-gray-50">
                    <div className="text-xs text-gray-400 mb-3 uppercase tracking-widest">{t.alternatives}</div>
                    <div className="space-y-3">
                      {result.alternatives.map((alt, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <button onClick={() => handleLetterClick({...alt,catColor:alt.catColor||"#888"})}
                            className="sinhala w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-lg flex-shrink-0 hover:scale-110 transition-all">
                            {alt.letter}
                          </button>
                          <AudioButton letter={alt.letter} t={t}
                            className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs hover:bg-gray-200 transition-all flex-shrink-0"/>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="sinhala text-sm font-bold">{alt.letter}</span>
                              <span className="text-xs text-gray-400 font-semibold">{alt.confidence}%</span>
                            </div>
                            <ConfidenceBar value={alt.confidence}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={() => handleLetterClick({...result.top,catColor:result.top.catColor||"#000"})}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-black bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-400 transition-all">
                  {t.exploreThisLetter}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── ALL LETTERS ───────────────────────────────────────────────────────── */}
      <section id="alphabet-section" className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="font-display text-2xl mb-1">{t.allSinhalaLetters}</h4>
              <p className="text-gray-400 text-sm">{t.alphabetDesc}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAlphabetView("showcase")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${alphabetView==="showcase" ? "bg-black text-white" : "text-gray-500 hover:text-black"}`}>
                {t.showcase}
              </button>
              <button onClick={() => setAlphabetView("grid")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${alphabetView==="grid" ? "bg-black text-white" : "text-gray-500 hover:text-black"}`}>
                {t.compact}
              </button>
            </div>
          </div>
          {alphabetView==="showcase"
            ? <AlphabetShowcase onLetterClick={handleLetterClick}/>
            : <LetterGrid onSelect={handleSelectLetter} selectedLetter={selectedLetter} onLetterClick={handleLetterClick}/>
          }
        </div>
      </section>

      {/* ── PROGRESS ──────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl mb-4">{t.yourProgress}</h2>
          <p className="text-gray-400 text-sm">{t.trackImprovement}</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          {progressStats.map((stat,i) => (
            <div key={i} className={`hover-lift rounded-3xl p-8 border ${i===0 ? "bg-black text-white border-black" : "bg-gray-50 border-gray-100"}`}>
              <div className="text-xs uppercase tracking-widest mb-4 text-gray-400">{stat.label}</div>
              <div className={`font-display text-5xl ${i===0 ? "text-white" : "text-black"}`}>
                {showProgress ? <AnimatedCounter value={stat.value} suffix={stat.suffix}/> : "0"}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-display text-lg">{t.accuracyTrend}</h4>
            <span className="text-xs text-gray-400">{t.lastSessions}</span>
          </div>
          <div className="flex items-end gap-3 h-36">
            {chartBars.map((h,i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full">
                  <div className="w-full bg-black rounded-t-lg transition-all duration-1000"
                    style={{ height:showProgress ? `${(h/100)*120}px` : "0px", transitionDelay:`${i*80}ms` }}/>
                </div>
                <span className="text-xs text-gray-400">{["M","T","W","T","F","S","S"][i]}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-300 font-semibold">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>
      </section>
    </div>
  );
}