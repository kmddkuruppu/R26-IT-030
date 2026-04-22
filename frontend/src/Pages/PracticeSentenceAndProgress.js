import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── TRANSLATIONS ────────────────────────────────────────────────
const translations = {
  en: {
    pageTitle: "Practice & Progress",
    practiceTab: "Practice Sentences",
    progressTab: "My Progress",
    level: "Level",
    xp: "XP",
    streak: "Day Streak",
    totalSentences: "Sentences Done",
    accuracy: "Accuracy",
    points: "Points",
    checkAnswer: "Check Answer",
    nextSentence: "Next Sentence",
    showHint: "Show Hint",
    hideHint: "Hide Hint",
    typeHere: "Type the Sinhala sentence here...",
    correct: "Correct! 🎉",
    incorrect: "Not quite right 😊",
    yourAnswer: "Your answer:",
    correctAnswer: "Correct answer:",
    translation: "Translation",
    hint: "Hint",
    difficulty: "Difficulty",
    category: "Category",
    skip: "Skip",
    tryAgain: "Try Again",
    weeklyGoal: "Weekly Goal",
    sentencesThisWeek: "sentences this week",
    masteredWords: "Mastered Words",
    practiceHistory: "Practice History",
    achievements: "Achievements",
    locked: "Locked",
    unlocked: "Unlocked",
    noHistory: "No practice sessions yet. Start practising!",
    progressOverview: "Progress Overview",
    categoryBreakdown: "Category Breakdown",
    recentActivity: "Recent Activity",
    wordsLearned: "Words Learned",
    timeSpent: "Time Spent",
    avgScore: "Avg Score",
    levelProgress: "Level Progress",
    toNextLevel: "to next level",
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: "days ago",
    selectCategory: "Select Category",
    allCategories: "All Categories",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    score: "Score",
    session: "Session",
    mins: "mins",
    practiceNow: "Practice Now",
  },
  si: {
    pageTitle: "පුහුණුව සහ ප්‍රගතිය",
    practiceTab: "වාක්‍ය පුහුණුව",
    progressTab: "මගේ ප්‍රගතිය",
    level: "මට්ටම",
    xp: "XP",
    streak: "දිනක් ක්‍රමයෙන්",
    totalSentences: "වාක්‍ය සම්පූර්ණ",
    accuracy: "නිරවද්‍යතාව",
    points: "ලකුණු",
    checkAnswer: "පිළිතුර පරීක්ෂා කරන්න",
    nextSentence: "ඊළඟ වාක්‍යය",
    showHint: "ඉඟිය පෙන්වන්න",
    hideHint: "ඉඟිය සඟවන්න",
    typeHere: "සිංහල වාක්‍යය මෙහි ටයිප් කරන්න...",
    correct: "නිවැරදියි! 🎉",
    incorrect: "නිවැරදි නොවේ 😊",
    yourAnswer: "ඔබේ පිළිතුර:",
    correctAnswer: "නිවැරදි පිළිතුර:",
    translation: "පරිවර්තනය",
    hint: "ඉඟිය",
    difficulty: "දුෂ්කරතාව",
    category: "වර්ගය",
    skip: "මඟ හරින්න",
    tryAgain: "නැවත උත්සාහ",
    weeklyGoal: "සතිපතා ඉලක්කය",
    sentencesThisWeek: "මෙම සතිය",
    masteredWords: "ප්‍රගුණ වචන",
    practiceHistory: "පුහුණු ඉතිහාසය",
    achievements: "ජයග්‍රහණ",
    locked: "අගුලු දමා ඇත",
    unlocked: "අගුලු ඇරිය",
    noHistory: "තවම පුහුණු සැසි නැත.",
    progressOverview: "ප්‍රගති දළ විශ්ලේෂණය",
    categoryBreakdown: "වර්ග බිඳීම",
    recentActivity: "මෑත ක්‍රියාකාරකම්",
    wordsLearned: "ඉගෙනගත් වචන",
    timeSpent: "ගතකළ කාලය",
    avgScore: "සාමාන්‍ය ලකුණු",
    levelProgress: "මට්ටම් ප්‍රගතිය",
    toNextLevel: "ඊළඟ මට්ටමට",
    today: "අද",
    yesterday: "ඊයේ",
    daysAgo: "දිනකට පෙර",
    selectCategory: "වර්ගය තෝරන්න",
    allCategories: "සියලු වර්ග",
    easy: "පහසු",
    medium: "මධ්‍යම",
    hard: "දුෂ්කර",
    score: "ලකුණු",
    session: "සැසිය",
    mins: "මිනිත්තු",
    practiceNow: "දැන් පුහුණු වන්න",
  },
  ta: {
    pageTitle: "பயிற்சி மற்றும் முன்னேற்றம்",
    practiceTab: "வாக்கிய பயிற்சி",
    progressTab: "என் முன்னேற்றம்",
    level: "நிலை",
    xp: "XP",
    streak: "நாள் தொடர்ச்சி",
    totalSentences: "வாக்கியங்கள் முடிந்தன",
    accuracy: "துல்லியம்",
    points: "மதிப்பெண்கள்",
    checkAnswer: "பதிலை சரிபார்",
    nextSentence: "அடுத்த வாக்கியம்",
    showHint: "குறிப்பை காட்டு",
    hideHint: "குறிப்பை மறை",
    typeHere: "சிங்கள வாக்கியத்தை இங்கே தட்டச்சு செய்யுங்கள்...",
    correct: "சரியானது! 🎉",
    incorrect: "சரியில்லை 😊",
    yourAnswer: "உங்கள் பதில்:",
    correctAnswer: "சரியான பதில்:",
    translation: "மொழிபெயர்ப்பு",
    hint: "குறிப்பு",
    difficulty: "சிரமம்",
    category: "வகை",
    skip: "தவிர்",
    tryAgain: "மீண்டும் முயற்சி",
    weeklyGoal: "வாராந்திர இலக்கு",
    sentencesThisWeek: "இந்த வாரம்",
    masteredWords: "தேர்ந்த வார்த்தைகள்",
    practiceHistory: "பயிற்சி வரலாறு",
    achievements: "சாதனைகள்",
    locked: "பூட்டப்பட்டது",
    unlocked: "திறக்கப்பட்டது",
    noHistory: "இன்னும் பயிற்சி இல்லை.",
    progressOverview: "முன்னேற்ற கண்ணோட்டம்",
    categoryBreakdown: "வகை பிரிப்பு",
    recentActivity: "சமீபத்திய செயல்பாடு",
    wordsLearned: "கற்ற வார்த்தைகள்",
    timeSpent: "செலவிட்ட நேரம்",
    avgScore: "சராசரி மதிப்பெண்",
    levelProgress: "நிலை முன்னேற்றம்",
    toNextLevel: "அடுத்த நிலைக்கு",
    today: "இன்று",
    yesterday: "நேற்று",
    daysAgo: "நாட்களுக்கு முன்பு",
    selectCategory: "வகையை தேர்ந்தெடு",
    allCategories: "அனைத்து வகைகளும்",
    easy: "எளிது",
    medium: "நடுத்தரம்",
    hard: "கடினம்",
    score: "மதிப்பெண்",
    session: "அமர்வு",
    mins: "நிமிடங்கள்",
    practiceNow: "இப்போது பயிற்சி செய்",
  },
};

// ─── PRACTICE SENTENCES (Grammatically correct Sinhala) ──────────
// All sentences vetted for proper Sinhala grammar structure
const SENTENCES = [
  // ── Greetings & Basic ──
  {
    id: 1, category: "ආයුබෝවන් (Greetings)", difficulty: "Easy", color: "#10b981",
    sinhala: "ආයුබෝවන්, ඔබට කෙසේද?",
    translation: "Hello, how are you?",
    hint: "ආයුබෝවන් = Hello/Greetings",
    words: ["ආයුබෝවන්", "ඔබට", "කෙසේද"],
    grammar: "Subject + Indirect object + Question particle",
  },
  {
    id: 2, category: "ආයුබෝවන් (Greetings)", difficulty: "Easy", color: "#10b981",
    sinhala: "මට හොඳයි, ස්තූතියි.",
    translation: "I am fine, thank you.",
    hint: "මට = to me / I; හොඳයි = good/fine",
    words: ["මට", "හොඳයි", "ස්තූතියි"],
    grammar: "Dative subject + Predicate + Gratitude",
  },
  {
    id: 3, category: "ආයුබෝවන් (Greetings)", difficulty: "Easy", color: "#10b981",
    sinhala: "ඔබේ නම කුමක්ද?",
    translation: "What is your name?",
    hint: "ඔබේ = your; නම = name; කුමක්ද = what is",
    words: ["ඔබේ", "නම", "කුමක්ද"],
    grammar: "Possessive + Noun + Question",
  },
  {
    id: 4, category: "ආයුබෝවන් (Greetings)", difficulty: "Easy", color: "#10b981",
    sinhala: "මගේ නම කමල්.",
    translation: "My name is Kamal.",
    hint: "මගේ = my; නම = name",
    words: ["මගේ", "නම", "කමල්"],
    grammar: "Possessive + Noun + Predicate",
  },
  {
    id: 5, category: "ආයුබෝවන් (Greetings)", difficulty: "Medium", color: "#10b981",
    sinhala: "ඔබ කොහෙන් ආවාද?",
    translation: "Where did you come from?",
    hint: "කොහෙන් = from where; ආවාද = did come",
    words: ["ඔබ", "කොහෙන්", "ආවාද"],
    grammar: "Subject + Source + Past question verb",
  },

  // ── Family ──
  {
    id: 6, category: "පවුල (Family)", difficulty: "Easy", color: "#f59e0b",
    sinhala: "මගේ අම්මා ගෙදර ඉන්නවා.",
    translation: "My mother is at home.",
    hint: "අම්මා = mother; ගෙදර = at home; ඉන්නවා = is/stays",
    words: ["මගේ", "අම්මා", "ගෙදර", "ඉන්නවා"],
    grammar: "Possessive + Subject + Location + Verb",
  },
  {
    id: 7, category: "පවුල (Family)", difficulty: "Easy", color: "#f59e0b",
    sinhala: "අපේ තාත්තා ගුරුවරයෙක්.",
    translation: "Our father is a teacher.",
    hint: "අපේ = our; තාත්තා = father; ගුරුවරයෙක් = a teacher",
    words: ["අපේ", "තාත්තා", "ගුරුවරයෙක්"],
    grammar: "Possessive + Subject + Predicate noun",
  },
  {
    id: 8, category: "පවුල (Family)", difficulty: "Medium", color: "#f59e0b",
    sinhala: "මගේ මල්ලී පාසලට යනවා.",
    translation: "My younger brother goes to school.",
    hint: "මල්ලී = younger brother; පාසලට = to school; යනවා = goes",
    words: ["මගේ", "මල්ලී", "පාසලට", "යනවා"],
    grammar: "Possessive + Subject + Dative + Verb",
  },
  {
    id: 9, category: "පවුල (Family)", difficulty: "Medium", color: "#f59e0b",
    sinhala: "අපේ නංගී ගීතයක් ගායනා කරනවා.",
    translation: "Our younger sister sings a song.",
    hint: "නංගී = younger sister; ගීතයක් = a song; ගායනා කරනවා = sings",
    words: ["අපේ", "නංගී", "ගීතයක්", "ගායනා", "කරනවා"],
    grammar: "Possessive + Subject + Object + Verb",
  },
  {
    id: 10, category: "පවුල (Family)", difficulty: "Hard", color: "#f59e0b",
    sinhala: "මගේ සීයා ගෙදර ළඟ ඇවිදිනවා.",
    translation: "My grandfather walks near the house.",
    hint: "සීයා = grandfather; ළඟ = near/close; ඇවිදිනවා = walks",
    words: ["මගේ", "සීයා", "ගෙදර", "ළඟ", "ඇවිදිනවා"],
    grammar: "Possessive + Subject + Location + Proximity + Verb",
  },

  // ── School ──
  {
    id: 11, category: "පාසල (School)", difficulty: "Easy", color: "#3b82f6",
    sinhala: "ළමයි පාසලේ ඉගෙනගනිති.",
    translation: "Children learn at school.",
    hint: "ළමයි = children; පාසලේ = at school; ඉගෙනගනිති = learn",
    words: ["ළමයි", "පාසලේ", "ඉගෙනගනිති"],
    grammar: "Subject (plural) + Location + Verb (plural)",
  },
  {
    id: 12, category: "පාසල (School)", difficulty: "Easy", color: "#3b82f6",
    sinhala: "ගුරුතුමා පොතක් කියවනවා.",
    translation: "The teacher reads a book.",
    hint: "ගුරුතුමා = the teacher (honorific); පොතක් = a book; කියවනවා = reads",
    words: ["ගුරුතුමා", "පොතක්", "කියවනවා"],
    grammar: "Subject (honorific) + Object + Verb",
  },
  {
    id: 13, category: "පාසල (School)", difficulty: "Medium", color: "#3b82f6",
    sinhala: "ශිෂ්‍යයා ලිපිය ලිවීය.",
    translation: "The student wrote the essay.",
    hint: "ශිෂ්‍යයා = the student; ලිපිය = the essay; ලිවීය = wrote",
    words: ["ශිෂ්‍යයා", "ලිපිය", "ලිවීය"],
    grammar: "Subject + Object + Past tense verb",
  },
  {
    id: 14, category: "පාසල (School)", difficulty: "Medium", color: "#3b82f6",
    sinhala: "ඔවුන් ගණිතය ඉගෙනගත්හ.",
    translation: "They learned mathematics.",
    hint: "ඔවුන් = they; ගණිතය = mathematics; ඉගෙනගත්හ = learned (plural past)",
    words: ["ඔවුන්", "ගණිතය", "ඉගෙනගත්හ"],
    grammar: "Subject (plural) + Object + Past verb (plural)",
  },
  {
    id: 15, category: "පාසල (School)", difficulty: "Hard", color: "#3b82f6",
    sinhala: "ගුරුතුමිය දරුවන්ට සිංහල ඉගැන්වූවාය.",
    translation: "The teacher taught Sinhala to the children.",
    hint: "ගුරුතුමිය = female teacher; දරුවන්ට = to the children; ඉගැන්වූවාය = taught",
    words: ["ගුරුතුමිය", "දරුවන්ට", "සිංහල", "ඉගැන්වූවාය"],
    grammar: "Subject + Indirect object + Direct object + Past causative verb",
  },

  // ── Nature ──
  {
    id: 16, category: "ස්වභාවය (Nature)", difficulty: "Easy", color: "#8b5cf6",
    sinhala: "අද කාලය හොඳයි.",
    translation: "The weather is good today.",
    hint: "අද = today; කාලය = weather; හොඳයි = good",
    words: ["අද", "කාලය", "හොඳයි"],
    grammar: "Time adverb + Subject + Predicate",
  },
  {
    id: 17, category: "ස්වභාවය (Nature)", difficulty: "Easy", color: "#8b5cf6",
    sinhala: "මල් ගස සුන්දරයි.",
    translation: "The flower tree is beautiful.",
    hint: "මල් ගස = flower tree; සුන්දරයි = beautiful",
    words: ["මල්", "ගස", "සුන්දරයි"],
    grammar: "Compound noun + Predicate adjective",
  },
  {
    id: 18, category: "ස්වභාවය (Nature)", difficulty: "Medium", color: "#8b5cf6",
    sinhala: "ගඟේ ජලය සීතලයි.",
    translation: "The river water is cold.",
    hint: "ගඟේ = of the river; ජලය = water; සීතලයි = cold",
    words: ["ගඟේ", "ජලය", "සීතලයි"],
    grammar: "Genitive + Noun + Predicate",
  },
  {
    id: 19, category: "ස්වභාවය (Nature)", difficulty: "Medium", color: "#8b5cf6",
    sinhala: "කළු වලාකුළු ගහනලෙස ඉදිකරයි.",
    translation: "Dark clouds are forming densely.",
    hint: "කළු = dark/black; වලාකුළු = clouds; ගහනලෙස = densely",
    words: ["කළු", "වලාකුළු", "ගහනලෙස", "ඉදිකරයි"],
    grammar: "Adjective + Subject + Adverb + Verb",
  },
  {
    id: 20, category: "ස්වභාවය (Nature)", difficulty: "Hard", color: "#8b5cf6",
    sinhala: "ගිම්හාන ඍතුවේ දී වැසි නොලැබේ.",
    translation: "During summer, rain is not received.",
    hint: "ගිම්හාන ඍතුවේ = in the summer season; වැසි = rain; නොලැබේ = not received",
    words: ["ගිම්හාන", "ඍතුවේ", "දී", "වැසි", "නොලැබේ"],
    grammar: "Locative time phrase + Subject + Negative verb",
  },

  // ── Daily Activities ──
  {
    id: 21, category: "දෛනික ජීවිතය (Daily Life)", difficulty: "Easy", color: "#ec4899",
    sinhala: "මම උදේ කෑම කනවා.",
    translation: "I eat breakfast in the morning.",
    hint: "මම = I; උදේ = morning; කෑම = food; කනවා = eat",
    words: ["මම", "උදේ", "කෑම", "කනවා"],
    grammar: "Subject + Time + Object + Verb",
  },
  {
    id: 22, category: "දෛනික ජීවිතය (Daily Life)", difficulty: "Easy", color: "#ec4899",
    sinhala: "ඔහු බස් රථයෙන් යයි.",
    translation: "He goes by bus.",
    hint: "ඔහු = he; බස් රථයෙන් = by bus; යයි = goes",
    words: ["ඔහු", "බස්", "රථයෙන්", "යයි"],
    grammar: "Subject + Instrumental noun + Verb",
  },
  {
    id: 23, category: "දෛනික ජීවිතය (Daily Life)", difficulty: "Medium", color: "#ec4899",
    sinhala: "ඔවුහු රාත්‍රියේ කතාකරමින් ගෙදර ගියහ.",
    translation: "They went home talking at night.",
    hint: "රාත්‍රියේ = at night; කතාකරමින් = while talking; ගෙදර = home; ගියහ = went",
    words: ["ඔවුහු", "රාත්‍රියේ", "කතාකරමින්", "ගෙදර", "ගියහ"],
    grammar: "Subject + Time + Gerund + Destination + Past verb",
  },
  {
    id: 24, category: "දෛනික ජීවිතය (Daily Life)", difficulty: "Medium", color: "#ec4899",
    sinhala: "ඇය වෙළඳසල් දෙකෙන් බඩු ගත්තාය.",
    translation: "She bought goods from two shops.",
    hint: "ඇය = she; වෙළඳසල් දෙකෙන් = from two shops; බඩු = goods; ගත්තාය = bought",
    words: ["ඇය", "වෙළඳසල්", "දෙකෙන්", "බඩු", "ගත්තාය"],
    grammar: "Subject + Ablative source + Object + Past verb",
  },
  {
    id: 25, category: "දෛනික ජීවිතය (Daily Life)", difficulty: "Hard", color: "#ec4899",
    sinhala: "ළමුන් ක්‍රීඩාංගනයේ ක්‍රීඩා කරමින් සිටියහ.",
    translation: "The children were playing on the playground.",
    hint: "ළමුන් = children; ක්‍රීඩාංගනයේ = on the playground; ක්‍රීඩා කරමින් = while playing; සිටියහ = were",
    words: ["ළමුන්", "ක්‍රීඩාංගනයේ", "ක්‍රීඩා", "කරමින්", "සිටියහ"],
    grammar: "Subject + Location + Gerund phrase + Past continuous",
  },

  // ── Food ──
  {
    id: 26, category: "ආහාර (Food)", difficulty: "Easy", color: "#f97316",
    sinhala: "බත් රසයි.",
    translation: "Rice is delicious.",
    hint: "බත් = rice; රසයි = is delicious",
    words: ["බත්", "රසයි"],
    grammar: "Subject + Predicate",
  },
  {
    id: 27, category: "ආහාර (Food)", difficulty: "Easy", color: "#f97316",
    sinhala: "කිරි හොඳ ස්වාස්ථ්‍ය පානයකි.",
    translation: "Milk is a good healthy drink.",
    hint: "කිරි = milk; හොඳ = good; ස්වාස්ථ්‍ය = health; පානයකි = is a drink",
    words: ["කිරි", "හොඳ", "ස්වාස්ථ්‍ය", "පානයකි"],
    grammar: "Subject + Attributive phrase + Predicate noun",
  },
  {
    id: 28, category: "ආහාර (Food)", difficulty: "Medium", color: "#f97316",
    sinhala: "අම්මා රාත්‍රී ආහාරය පිළියෙළ කළාය.",
    translation: "Mother prepared the dinner.",
    hint: "අම්මා = mother; රාත්‍රී ආහාරය = dinner; පිළියෙළ කළාය = prepared",
    words: ["අම්මා", "රාත්‍රී", "ආහාරය", "පිළියෙළ", "කළාය"],
    grammar: "Subject + Attributive + Object + Past verb",
  },
  {
    id: 29, category: "ආහාර (Food)", difficulty: "Hard", color: "#f97316",
    sinhala: "ශ්‍රී ලාංකීය ආහාර සංස්කෘතිය ඉතා වෙනස්ය.",
    translation: "Sri Lankan food culture is very unique.",
    hint: "ශ්‍රී ලාංකීය = Sri Lankan; ආහාර සංස්කෘතිය = food culture; ඉතා = very; වෙනස්ය = is different/unique",
    words: ["ශ්‍රී", "ලාංකීය", "ආහාර", "සංස්කෘතිය", "ඉතා", "වෙනස්ය"],
    grammar: "Attributive phrase + Compound noun + Adverb + Predicate",
  },

  // ── Numbers / Time ──
  {
    id: 30, category: "ගණන් (Numbers)", difficulty: "Easy", color: "#06b6d4",
    sinhala: "ගෙදරේ දොළොස් දෙනෙකු ඉන්නවා.",
    translation: "There are twelve people at home.",
    hint: "ගෙදරේ = at home; දොළොස් = twelve; දෙනෙකු = people; ඉන්නවා = are/stay",
    words: ["ගෙදරේ", "දොළොස්", "දෙනෙකු", "ඉන්නවා"],
    grammar: "Locative + Numeral + Counter + Verb",
  },
  {
    id: 31, category: "ගණන් (Numbers)", difficulty: "Medium", color: "#06b6d4",
    sinhala: "ඔහු පස්වරු හතරට ආවේය.",
    translation: "He came at four in the afternoon.",
    hint: "පස්වරු = afternoon; හතරට = at four; ආවේය = came",
    words: ["ඔහු", "පස්වරු", "හතරට", "ආවේය"],
    grammar: "Subject + Time of day + Hour (dative) + Past verb",
  },

  // ── Feelings ──
  {
    id: 32, category: "හැඟීම් (Feelings)", difficulty: "Easy", color: "#84cc16",
    sinhala: "මමගේ ප්‍රිය මිතුරා.",
    translation: "He/She is my dear friend.",
    hint: "මමගේ = my; ප්‍රිය = dear; මිතුරා = friend",
    words: ["මමගේ", "ප්‍රිය", "මිතුරා"],
    grammar: "Possessive + Adjective + Noun predicate",
  },
  {
    id: 33, category: "හැඟීම් (Feelings)", difficulty: "Medium", color: "#84cc16",
    sinhala: "ඔහුට ඉතාම සතුටක් දැනුණා.",
    translation: "He felt very happy.",
    hint: "ඔහුට = to him; ඉතාම = very; සතුටක් = happiness; දැනුණා = felt",
    words: ["ඔහුට", "ඉතාම", "සතුටක්", "දැනුණා"],
    grammar: "Dative subject + Intensifier + Object + Past experiential verb",
  },
  {
    id: 34, category: "හැඟීම් (Feelings)", difficulty: "Hard", color: "#84cc16",
    sinhala: "ළමයාට අසාර්ථකත්වය ගැන දුකක් දැනෙනවා.",
    translation: "The child feels sad about the failure.",
    hint: "ළමයාට = to the child; අසාර්ථකත්වය = failure; ගැන = about; දුකක් = sadness; දැනෙනවා = feels",
    words: ["ළමයාට", "අසාර්ථකත්වය", "ගැන", "දුකක්", "දැනෙනවා"],
    grammar: "Dative subject + Noun + Postposition + Object + Verb",
  },

  // ── Places ──
  {
    id: 35, category: "ස්ථාන (Places)", difficulty: "Easy", color: "#a78bfa",
    sinhala: "කොළඹ ශ්‍රී ලංකාවේ ප්‍රධාන නගරය.",
    translation: "Colombo is the main city of Sri Lanka.",
    hint: "කොළඹ = Colombo; ප්‍රධාන = main; නගරය = city",
    words: ["කොළඹ", "ශ්‍රී", "ලංකාවේ", "ප්‍රධාන", "නගරය"],
    grammar: "Subject + Genitive + Attributive + Predicate noun",
  },
  {
    id: 36, category: "ස්ථාන (Places)", difficulty: "Medium", color: "#a78bfa",
    sinhala: "ඔවුහු ඊළඟ සතියේ ශ්‍රී පාද කන්ද වන්දනා කරනු ඇත.",
    translation: "They will visit Adam's Peak next week.",
    hint: "ඊළඟ සතියේ = next week; ශ්‍රී පාද = Adam's Peak; වන්දනා කරනු ඇත = will visit/worship",
    words: ["ඔවුහු", "ඊළඟ", "සතියේ", "ශ්‍රී", "පාද", "කන්ද", "වන්දනා", "කරනු", "ඇත"],
    grammar: "Subject + Future time phrase + Proper noun + Future tense verb",
  },
];

// ─── ACHIEVEMENTS DATA ────────────────────────────────────────────
const ACHIEVEMENTS_DATA = [
  { id: 'first_correct',  icon: '🌟', title: 'First Star',       desc: 'Get your first correct answer',     xpReq: 10,   color: '#f59e0b' },
  { id: 'streak_3',       icon: '🔥', title: 'On Fire',          desc: '3-day practice streak',              xpReq: 50,   color: '#ef4444' },
  { id: 'sentences_10',   icon: '📚', title: 'Bookworm',         desc: 'Complete 10 sentences',              xpReq: 100,  color: '#3b82f6' },
  { id: 'accuracy_80',    icon: '🎯', title: 'Sharp Shooter',    desc: 'Reach 80% accuracy',                 xpReq: 150,  color: '#10b981' },
  { id: 'sentences_25',   icon: '✍️', title: 'Sentence Master',  desc: 'Complete 25 sentences',              xpReq: 250,  color: '#8b5cf6' },
  { id: 'all_categories', icon: '🏆', title: 'All-Rounder',      desc: 'Practice all categories',            xpReq: 400,  color: '#f97316' },
  { id: 'streak_7',       icon: '💎', title: 'Diamond Streak',   desc: '7-day streak',                       xpReq: 600,  color: '#06b6d4' },
  { id: 'accuracy_95',    icon: '👑', title: 'Grammar King',     desc: '95% accuracy over 20 sentences',     xpReq: 900,  color: '#ec4899' },
];

// ─── INLINE ICONS ─────────────────────────────────────────────────
const Ico = ({ d, size = 20, fill = 'none', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const HomeIco     = ({ s = 20 }) => <Ico size={s} d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />;
const CheckIco    = ({ s = 20 }) => <Ico size={s} d={["M22 11.08V12a10 10 0 1 1-5.93-9.14","M22 4 12 14.01l-3-3"]} />;
const XIco        = ({ s = 20 }) => <Ico size={s} d="M18 6L6 18 M6 6l12 12" />;
const ArrowRIco   = ({ s = 20 }) => <Ico size={s} d="M5 12h14 M12 5l7 7-7 7" />;
const ZapIco      = ({ s = 20 }) => <Ico size={s} d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />;
const TrophyIco   = ({ s = 20 }) => <Ico size={s} d={["M6 9H4.5a2.5 2.5 0 0 1 0-5H6","M18 9h1.5a2.5 2.5 0 0 0 0-5H18","M4 22h16","M10 14.66V17a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2.34","M14 14.66V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2.34","M18 2H6v7a6 6 0 0 0 12 0V2z"]} />;
const StarIco     = ({ s = 20, fill = 'none' }) => <Ico size={s} fill={fill} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />;
const BookIco     = ({ s = 20 }) => <Ico size={s} d={["M4 19.5A2.5 2.5 0 0 1 6.5 17H20","M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"]} />;
const EyeIco      = ({ s = 20 }) => <Ico size={s} d={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"]} />;
const EyeOffIco   = ({ s = 20 }) => <Ico size={s} d={["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94","M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19","M1 1l22 22"]} />;
const RotateIco   = ({ s = 20 }) => <Ico size={s} d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8 M3 3v5h5" />;
const ClockIco    = ({ s = 20 }) => <Ico size={s} d={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z","M12 6v6l4 2"]} />;
const TargetIco   = ({ s = 20 }) => <Ico size={s} d={["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"]} />;
const LockIco     = ({ s = 20 }) => <Ico size={s} d={["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z","M7 11V7a5 5 0 0 1 10 0v4"]} />;
const UnlockIco   = ({ s = 20 }) => <Ico size={s} d={["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z","M7 11V7a5 5 0 0 1 9.9-1"]} />;
const FlameIco    = ({ s = 20 }) => <Ico size={s} d="M12 2c0 0-5.5 4-5.5 9a5.5 5.5 0 0 0 11 0C17.5 6 12 2 12 2z M12 12c-1 0-2-.5-2-1.5C10 9 12 7 12 7s2 2 2 3.5c0 1-1 1.5-2 1.5z" />;
const ChartIco    = ({ s = 20 }) => <Ico size={s} d={["M18 20V10","M12 20V4","M6 20v-6"]} />;
const CalendarIco = ({ s = 20 }) => <Ico size={s} d={["M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z","M16 2v4","M8 2v4","M3 10h18"]} />;
const AwardIco    = ({ s = 20 }) => <Ico size={s} d={["M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z","M8.21 13.89 7 23l5-3 5 3-1.21-9.12"]} />;
const FilterIco   = ({ s = 20 }) => <Ico size={s} d="M22 3H2l8 9.46V19l4 2V12.46z" />;
const SparkIco    = ({ s = 20 }) => <Ico size={s} d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />;

// ─── LEVEL SYSTEM ─────────────────────────────────────────────────
const getLevel = (xp) => {
  const levels = [
    { level: 1, name: 'Beginner',    minXP: 0,    maxXP: 100,  icon: '🌱', color: '#10b981' },
    { level: 2, name: 'Learner',     minXP: 100,  maxXP: 250,  icon: '📗', color: '#3b82f6' },
    { level: 3, name: 'Student',     minXP: 250,  maxXP: 500,  icon: '📘', color: '#8b5cf6' },
    { level: 4, name: 'Scholar',     minXP: 500,  maxXP: 850,  icon: '🎓', color: '#f59e0b' },
    { level: 5, name: 'Writer',      minXP: 850,  maxXP: 1300, icon: '✍️', color: '#ec4899' },
    { level: 6, name: 'Master',      minXP: 1300, maxXP: 1900, icon: '👑', color: '#ef4444' },
    { level: 7, name: 'Grand Master',minXP: 1900, maxXP: 9999, icon: '💎', color: '#06b6d4' },
  ];
  return levels.findLast(l => xp >= l.minXP) ?? levels[0];
};

// ─── NORMALISE (loose comparison) ────────────────────────────────
const normalise = (s) => s.trim().replace(/\s+/g, ' ').toLowerCase();

// ─── CATEGORIES UNIQUE LIST ───────────────────────────────────────
const CATEGORIES = ['All Categories', ...new Set(SENTENCES.map(s => s.category))];

// ─── RADIAL PROGRESS ─────────────────────────────────────────────
const RadialProgress = ({ pct, size = 88, stroke = 8, color = '#4f46e5', children }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
};

// ─── WEEK HEATMAP ─────────────────────────────────────────────────
const WeekHeatmap = ({ data }) => {
  const days = ['S','M','T','W','T','F','S'];
  return (
    <div className="flex gap-1.5 items-end">
      {days.map((d, i) => {
        const val = data[i] ?? 0;
        const h = Math.max(8, Math.round(val * 40));
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-7 rounded-md transition-all duration-500"
              style={{ height: h, background: val > 0 ? `linear-gradient(180deg,#818cf8,#4f46e5)` : '#e5e7eb', opacity: val > 0 ? 1 : 0.4 }} />
            <span className="text-xs text-gray-400 font-semibold">{d}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── MINI LINE CHART ──────────────────────────────────────────────
const MiniLineChart = ({ data, color = '#4f46e5', height = 60, width = 200 }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (v / max) * height;
        return <circle key={i} cx={x} cy={y} r="3.5" fill={color} />;
      })}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ── PRACTICE PANEL ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
function PracticePanel({ t, onSessionComplete }) {
  const [filterCat, setFilterCat]  = useState('All Categories');
  const [filterDiff, setFilterDiff]= useState('All');
  const [shuffled, setShuffled]    = useState(() => [...SENTENCES].sort(() => Math.random() - .5));
  const [idx, setIdx]              = useState(0);
  const [input, setInput]          = useState('');
  const [checked, setChecked]      = useState(false);
  const [isCorrect, setIsCorrect]  = useState(false);
  const [showHint, setShowHint]    = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal]   = useState(0);
  const [celebrating, setCelebrating]     = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const inputRef = useRef(null);

  const filtered = shuffled.filter(s =>
    (filterCat === 'All Categories' || s.category === filterCat) &&
    (filterDiff === 'All' || s.difficulty === filterDiff)
  );
  const sentence = filtered[idx % Math.max(filtered.length, 1)];

  const handleCheck = () => {
    if (!input.trim() || checked) return;
    const correct = normalise(input) === normalise(sentence.sinhala);
    setIsCorrect(correct);
    setChecked(true);
    setSessionTotal(n => n + 1);
    if (correct) {
      setSessionCorrect(n => n + 1);
      setSessionScore(s => s + (sentence.difficulty === 'Easy' ? 10 : sentence.difficulty === 'Medium' ? 20 : 30));
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 1500);
    }
  };

  const handleNext = () => {
    if (idx + 1 >= filtered.length) {
      // Session complete: rotate to new set
      setShuffled([...SENTENCES].sort(() => Math.random() - .5));
      setIdx(0);
    } else {
      setIdx(i => i + 1);
    }
    setInput('');
    setChecked(false);
    setIsCorrect(false);
    setShowHint(false);
    setShowAnswer(false);
    setTimeout(() => inputRef.current?.focus(), 100);
    onSessionComplete({ score: sessionScore, correct: sessionCorrect, total: sessionTotal });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !checked) handleCheck();
    if (e.key === 'Enter' && checked) handleNext();
  };

  const diffColor = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };

  if (!sentence) return (
    <div className="flex items-center justify-center h-64 text-gray-400 font-semibold">
      No sentences match the selected filters. Try changing the category or difficulty.
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Session stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '✅', label: t.score,    val: sessionScore,   color: '#4f46e5' },
          { icon: '🎯', label: t.accuracy, val: sessionTotal > 0 ? `${Math.round(sessionCorrect/sessionTotal*100)}%` : '—', color: '#10b981' },
          { icon: '📝', label: t.totalSentences, val: sessionTotal, color: '#f59e0b' },
        ].map(({ icon, label, val, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-xl mb-1">{icon}</p>
            <p className="font-black text-xl" style={{ color }}>{val}</p>
            <p className="text-xs text-gray-400 font-semibold">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        <FilterIco s={16} />
        <select
          value={filterCat}
          onChange={e => { setFilterCat(e.target.value); setIdx(0); }}
          className="text-sm font-semibold border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 flex-1 min-w-[160px]"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex gap-1.5">
          {['All', 'Easy', 'Medium', 'Hard'].map(d => (
            <button key={d} onClick={() => { setFilterDiff(d); setIdx(0); }}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200"
              style={{
                background: filterDiff === d ? (d === 'All' ? '#4f46e5' : diffColor[d] ?? '#4f46e5') : '#f3f4f6',
                color: filterDiff === d ? 'white' : '#6b7280',
              }}
            >
              {d === 'All' ? 'All' : t[d.toLowerCase()]}
            </button>
          ))}
        </div>
      </div>

      {/* Main sentence card */}
      <div className={`bg-white rounded-3xl shadow-xl border-2 overflow-hidden transition-all duration-300 ${celebrating ? 'border-green-400' : checked && isCorrect ? 'border-green-300' : checked ? 'border-orange-300' : 'border-gray-100'}`}>
        {/* Card header */}
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${sentence.color}15, ${sentence.color}05)`, borderBottom: `2px solid ${sentence.color}20` }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full text-white"
              style={{ background: sentence.color }}>
              {sentence.category}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: `${diffColor[sentence.difficulty]}20`, color: diffColor[sentence.difficulty] }}>
              {t[sentence.difficulty.toLowerCase()]}
            </span>
          </div>
          <span className="text-xs text-gray-400 font-semibold">#{sentence.id} / {filtered.length}</span>
        </div>

        <div className="p-6 space-y-5">
          {/* Translation (the prompt) */}
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t.translation}</p>
            <p className="text-xl font-bold text-gray-900 leading-relaxed">{sentence.translation}</p>
          </div>

          {/* Hint */}
          {showHint && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 fade-in">
              <p className="text-xs font-black text-amber-600 uppercase tracking-wider mb-1">{t.hint}</p>
              <p className="text-sm text-amber-800 font-semibold">{sentence.hint}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {sentence.words.map((w, i) => (
                  <span key={i} className="text-sm font-bold px-2.5 py-1 rounded-lg sinhala"
                    style={{ background: `${sentence.color}18`, color: sentence.color }}>
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => { if (!checked) setInput(e.target.value); }}
              onKeyDown={handleKeyDown}
              placeholder={t.typeHere}
              rows={2}
              className="w-full border-2 rounded-2xl px-4 py-3 text-lg sinhala font-semibold resize-none focus:outline-none transition-all duration-200"
              style={{
                borderColor: checked ? (isCorrect ? '#10b981' : '#f97316') : '#e5e7eb',
                background: checked ? (isCorrect ? '#f0fdf4' : '#fff7ed') : 'white',
                fontFamily: "'Noto Sans Sinhala', serif",
              }}
            />
            {celebrating && (
              <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
                {['🎉','⭐','✨','💫'].map((e, i) => (
                  <span key={i} className="absolute text-2xl"
                    style={{ top: `${20 + i * 20}%`, left: `${10 + i * 25}%`, animation: `floatUp 1s ease-out ${i*0.1}s both` }}>
                    {e}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Feedback */}
          {checked && (
            <div className={`rounded-2xl p-4 fade-in ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
              <p className={`font-black text-lg mb-2 ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                {isCorrect ? t.correct : t.incorrect}
              </p>
              {!isCorrect && (
                <>
                  <div className="mb-2">
                    <p className="text-xs font-bold text-gray-500 mb-1">{t.yourAnswer}</p>
                    <p className="text-sm font-semibold text-red-600 sinhala line-through">{input}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-1">{t.correctAnswer}</p>
                    <p className="text-lg font-bold text-green-700 sinhala">{sentence.sinhala}</p>
                  </div>
                </>
              )}
              {isCorrect && (
                <p className="text-green-600 font-bold sinhala text-lg">{sentence.sinhala}</p>
              )}
              <p className="text-xs text-gray-400 mt-2 font-semibold">
                Grammar: {sentence.grammar}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button onClick={() => setShowHint(h => !h)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all hover:scale-105"
              style={{ borderColor: '#e5e7eb', color: '#6b7280' }}>
              {showHint ? <EyeOffIco s={15}/> : <EyeIco s={15}/>}
              {showHint ? t.hideHint : t.showHint}
            </button>

            {!checked ? (
              <>
                <button onClick={() => { setShowAnswer(true); setChecked(true); setIsCorrect(false); setSessionTotal(n=>n+1); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-500 hover:border-gray-300 transition-all">
                  {t.skip}
                </button>
                <button onClick={handleCheck} disabled={!input.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:scale-105 hover:shadow-lg disabled:opacity-40 disabled:hover:scale-100"
                  style={{ background: input.trim() ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#9ca3af' }}>
                  <CheckIco s={15}/> {t.checkAnswer}
                </button>
              </>
            ) : (
              <button onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:scale-105 hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                {t.nextSentence} <ArrowRIco s={15}/>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Word bank hint */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Key Vocabulary</p>
        <div className="flex flex-wrap gap-2">
          {sentence.words.map((w, i) => (
            <span key={i} className="text-sm sinhala font-bold px-3 py-1.5 rounded-xl cursor-default hover:scale-105 transition-transform"
              style={{ background: `${sentence.color}15`, color: sentence.color, border: `1.5px solid ${sentence.color}30` }}>
              {w}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ── PROGRESS PANEL ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
function ProgressPanel({ t, stats, history, onPracticeNow }) {
  const levelInfo = getLevel(stats.xp);
  const nextLevel = getLevel(stats.xp + 1);
  const xpInLevel = stats.xp - levelInfo.minXP;
  const xpNeeded  = levelInfo.maxXP - levelInfo.minXP;
  const lvlPct    = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  const accuracy = stats.totalSentences > 0
    ? Math.round((stats.correct / stats.totalSentences) * 100)
    : 0;

  // Category breakdown
  const catStats = SENTENCES.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = { color: s.color, total: 0, done: 0 };
    acc[s.category].total += 1;
    return acc;
  }, {});
  Object.keys(catStats).forEach(cat => {
    catStats[cat].done = history.filter(h => h.category === cat).length;
  });

  // Accuracy history for mini chart
  const accHistory = history.slice(-7).map(h => h.accuracy ?? 0);

  // Weekly heatmap (last 7 days activity)
  const weekData = [0.4, 0.8, 0.3, 1, 0.6, 0.9, stats.streak > 0 ? 1 : 0];

  return (
    <div className="space-y-5">

      {/* Level hero card */}
      <div className="rounded-3xl p-6 text-white shadow-xl overflow-hidden relative"
        style={{ background: `linear-gradient(135deg, ${levelInfo.color}, ${levelInfo.color}bb)` }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
          style={{ background: 'white' }} />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-15"
          style={{ background: 'white' }} />
        <div className="relative flex items-center gap-5">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0">
            {levelInfo.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{t.level} {levelInfo.level}</p>
            <h2 className="text-3xl font-black mb-1">{levelInfo.name}</h2>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 h-2.5 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${lvlPct}%` }} />
              </div>
              <span className="text-xs font-bold text-white/80 whitespace-nowrap">{lvlPct}%</span>
            </div>
            <p className="text-white/60 text-xs font-semibold">
              {stats.xp} XP · {xpNeeded - xpInLevel} {t.toNextLevel}
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <TrophyIco s={18}/>,  label: t.points,          val: stats.points,           color: '#4f46e5' },
          { icon: <TargetIco s={18}/>,  label: t.accuracy,        val: `${accuracy}%`,         color: '#10b981' },
          { icon: <FlameIco  s={18}/>,  label: t.streak,          val: `${stats.streak}🔥`,    color: '#ef4444' },
          { icon: <BookIco   s={18}/>,  label: t.totalSentences,  val: stats.totalSentences,   color: '#f59e0b' },
        ].map(({ icon, label, val, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <div className="flex justify-center mb-2" style={{ color }}>{icon}</div>
            <p className="font-black text-2xl" style={{ color }}>{val}</p>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Weekly activity + accuracy chart */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm font-black text-gray-700 mb-4 flex items-center gap-2">
            <CalendarIco s={16} /> Weekly Activity
          </p>
          <WeekHeatmap data={weekData} />
          <p className="text-xs text-gray-400 mt-3 font-semibold">
            {t.weeklyGoal}: {Math.min(stats.totalSentences, 20)}/20 {t.sentencesThisWeek}
          </p>
          <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, stats.totalSentences/20*100)}%`, background: 'linear-gradient(90deg,#4f46e5,#7c3aed)' }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm font-black text-gray-700 mb-4 flex items-center gap-2">
            <ChartIco s={16} /> Accuracy Trend
          </p>
          {accHistory.length > 1 ? (
            <div className="flex justify-center">
              <MiniLineChart data={accHistory} color="#4f46e5" height={60} width={180} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-16 text-gray-300 text-sm font-semibold">
              Complete more sessions to see trend
            </div>
          )}
          <div className="flex justify-between mt-3">
            <span className="text-xs text-gray-400">Last 7 sessions</span>
            <span className="text-xs font-bold text-indigo-600">{t.avgScore}: {accuracy}%</span>
          </div>
        </div>
      </div>

      {/* Category progress */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-sm font-black text-gray-700 mb-4 flex items-center gap-2">
          <ZapIco s={16} /> {t.categoryBreakdown}
        </p>
        <div className="space-y-3">
          {Object.entries(catStats).map(([cat, data]) => {
            const pct = data.total > 0 ? Math.min(100, Math.round((data.done / data.total) * 100)) : 0;
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-600 truncate max-w-[60%]">{cat}</span>
                  <span className="text-xs font-bold" style={{ color: data.color }}>{pct}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${data.color}, ${data.color}aa)` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-sm font-black text-gray-700 mb-4 flex items-center gap-2">
          <AwardIco s={16} /> {t.achievements}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ACHIEVEMENTS_DATA.map(ach => {
            const earned = stats.xp >= ach.xpReq;
            return (
              <div key={ach.id}
                className={`rounded-2xl p-4 text-center transition-all duration-300 ${earned ? 'shadow-md hover:scale-105' : 'opacity-50'}`}
                style={{ background: earned ? `${ach.color}15` : '#f9fafb', border: `2px solid ${earned ? ach.color + '40' : '#e5e7eb'}` }}>
                <div className="text-3xl mb-2">{earned ? ach.icon : '🔒'}</div>
                <p className="text-xs font-black text-gray-800 leading-tight mb-1">{ach.title}</p>
                <p className="text-xs text-gray-400 leading-tight">{ach.desc}</p>
                {!earned && (
                  <p className="text-xs font-bold mt-1" style={{ color: ach.color }}>
                    {ach.xpReq} XP
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Session history */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-sm font-black text-gray-700 mb-4 flex items-center gap-2">
          <ClockIco s={16} /> {t.practiceHistory}
        </p>
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <BookIco s={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">{t.noHistory}</p>
            <button onClick={onPracticeNow}
              className="mt-4 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              {t.practiceNow}
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {[...history].reverse().slice(0, 20).map((h, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${h.accuracy >= 80 ? 'bg-green-500' : h.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-400'}`}>
                  {h.accuracy}%
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-700 truncate">{h.category}</p>
                  <p className="text-xs text-gray-400">{h.correct}/{h.total} correct · {h.score} pts</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex gap-0.5">
                    {[1,2,3].map(s => (
                      <StarIco key={s} s={13}
                        fill={s <= (h.accuracy >= 90 ? 3 : h.accuracy >= 60 ? 2 : 1) ? '#f59e0b' : 'none'}
                        className={s <= (h.accuracy >= 90 ? 3 : h.accuracy >= 60 ? 2 : 1) ? 'text-yellow-400' : 'text-gray-200'}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-300 mt-0.5">{h.timeAgo}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ── MAIN PAGE ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
export default function PracticeSentencesAndProgressPage({ lang = 'en' }) {
  const t = translations[lang] ?? translations.en;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('practice');

  // Global stats (in a real app this would be persisted)
  const [stats, setStats] = useState({
    xp: 120,
    points: 340,
    totalSentences: 14,
    correct: 11,
    streak: 3,
    wordsLearned: 47,
    timeSpent: 38, // mins
  });

  const [history, setHistory] = useState([
    { category: 'ආයුබෝවන් (Greetings)', correct: 3, total: 4, score: 35, accuracy: 75, timeAgo: 'Today' },
    { category: 'පවුල (Family)',          correct: 4, total: 5, score: 50, accuracy: 80, timeAgo: 'Yesterday' },
    { category: 'පාසල (School)',          correct: 4, total: 5, score: 55, accuracy: 80, timeAgo: '2 days ago' },
  ]);

  const handleSessionComplete = useCallback(({ score, correct, total }) => {
    if (total === 0) return;
    const acc = total > 0 ? Math.round(correct / total * 100) : 0;
    const xpGain = Math.round(score / 3);
    setStats(prev => ({
      xp: prev.xp + xpGain,
      points: prev.points + score,
      totalSentences: prev.totalSentences + total,
      correct: prev.correct + correct,
      streak: prev.streak,
      wordsLearned: prev.wordsLearned + correct * 2,
      timeSpent: prev.timeSpent + Math.round(total * 0.8),
    }));
    if (total > 0) {
      setHistory(prev => [
        ...prev,
        {
          category: 'Mixed Practice',
          correct, total, score,
          accuracy: acc,
          timeAgo: t.today,
        },
      ]);
    }
  }, [t.today]);

  const levelInfo = getLevel(stats.xp);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-sky-50 pt-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Noto+Sans+Sinhala:wght@400;700;900&display=swap');
        * { font-family: 'Nunito', sans-serif; }
        .sinhala { font-family: 'Noto Sans Sinhala', serif !important; }

        @keyframes slideUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes floatUp   { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-40px)} }
        @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes popIn     { 0%{opacity:0;transform:scale(.85)} 70%{transform:scale(1.05)} 100%{opacity:1;transform:scale(1)} }

        .slide-up  { animation: slideUp .4s ease-out both; }
        .fade-in   { animation: fadeIn .3s ease-out both; }
        .pop-in    { animation: popIn  .4s cubic-bezier(.36,.07,.19,.97) both; }

        .shimmer-text {
          background: linear-gradient(135deg, #4338ca, #7c3aed, #2563eb);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .glass {
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.9);
        }

        .tab-active {
          background: linear-gradient(135deg,#4f46e5,#7c3aed);
          color: white;
          box-shadow: 0 4px 14px rgba(79,70,229,0.35);
        }
        .tab-inactive {
          background: transparent;
          color: #6b7280;
        }
        .tab-inactive:hover { background: rgba(79,70,229,0.08); color: #4f46e5; }

        textarea:focus { box-shadow: 0 0 0 3px rgba(99,102,241,0.2); }

        .scroll-panel::-webkit-scrollbar { width: 4px; }
        .scroll-panel::-webkit-scrollbar-track { background: transparent; }
        .scroll-panel::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 2px; }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className="glass border-b border-indigo-100/60 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')}
              className="p-2 rounded-xl hover:bg-indigo-50 text-indigo-500 transition-colors flex-shrink-0">
              <HomeIco s={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-black shimmer-text leading-tight truncate">{t.pageTitle}</h1>
            </div>
          </div>

          {/* Level pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-black flex-shrink-0"
            style={{ background: levelInfo.color }}>
            <span>{levelInfo.icon}</span>
            <span className="hidden sm:inline">{levelInfo.name}</span>
            <span>{stats.xp} XP</span>
          </div>

          {/* Right stats */}
          <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
            {[
              { icon: <TrophyIco s={15}/>, val: stats.points,  color: 'text-indigo-600' },
              { icon: <FlameIco  s={15}/>, val: `${stats.streak}🔥`, color: 'text-red-500' },
            ].map(({ icon, val, color }) => (
              <div key={val} className={`font-black text-sm ${color} flex items-center gap-1 hidden sm:flex`}>
                {icon}{val}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* Tab selector */}
        <div className="glass rounded-2xl p-1.5 flex gap-1.5 mb-6 self-start w-fit">
          {[
            { id: 'practice', icon: <BookIco s={16}/>,   label: t.practiceTab },
            { id: 'progress', icon: <ChartIco s={16}/>,  label: t.progressTab },
          ].map(({ id, icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === id ? 'tab-active' : 'tab-inactive'}`}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div key={activeTab} className="slide-up">
          {activeTab === 'practice' ? (
            <PracticePanel t={t} onSessionComplete={handleSessionComplete} />
          ) : (
            <ProgressPanel
              t={t}
              stats={stats}
              history={history}
              onPracticeNow={() => setActiveTab('practice')}
            />
          )}
        </div>
      </div>

      {/* Ambient blobs */}
      <div className="fixed top-20 left-10 w-44 h-44 bg-indigo-300 rounded-full opacity-15 blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed bottom-20 right-10 w-52 h-52 bg-violet-300 rounded-full opacity-15 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '.3s' }} />
      <div className="fixed top-1/2 left-1/3 w-36 h-36 bg-sky-300 rounded-full opacity-10 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '.6s' }} />
    </div>
  );
}