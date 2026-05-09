import { useState, useRef, useEffect, useCallback } from "react";

// ─── Translations ───────────────────────────────────────────────────────────
const t = {
  en: {
    badge: "Sinhala Learning System",
    heroTitle1: "Practice Sinhala Sentences &",
    heroTitle2: "Your Handwriting",
    heroTitleEm: "Improve",
    heroDesc: "Write, learn, and improve with smart feedback and progress tracking designed for young learners.",
    startGuided: "Start Guided Practice",
    tryFree: "Try Free Writing",
    tryPicture: "Picture Activity",
    todaySentence: "Today's sentence",
    canvasLabel: "Canvas",
    practiceStreak: "Practice streak",
    streakVal: "🔥 7 days",
    sessionsDone: "Sentences done",
    sessionsVal: "24 sessions",
    accuracy: "Handwriting accuracy",
    chooseModeTitle: "Choose Your Practice Mode",
    chooseModeDesc: "Three powerful ways to build your Sinhala handwriting skills",
    guidedTitle: "Practice Given Sentences",
    guidedDesc: "Write sentences provided by the system and improve handwriting accuracy with guided feedback.",
    guidedBtn: "Start Practice →",
    freeTitle: "Write Your Own Sentence",
    freeDesc: "Think and write your own Sinhala sentence freely and receive intelligent feedback on your work.",
    freeBtn: "Start Writing →",
    pictureTitle: "Picture Writing Activity",
    pictureDesc: "Look at the picture and write 5 Sinhala sentences about what you see. Complete all 5 to unlock the next picture!",
    pictureBtn: "Start Activity →",
    writeSentence: "Write this sentence",
    nextSentence: "Next sentence →",
    sentenceCounter: (cur, total) => `Sentence ${cur} of ${total}`,
    yourSpace: "Your writing space",
    guided: "Guided Practice",
    freeWriting: "Free Writing",
    pictureWriting: "Picture Activity",
    close: "Close ✕",
    clear: "Clear",
    submit: "Submit →",
    feedbackTitle: "Feedback Report",
    tryAgain: "Try Again →",
    hwAccuracy: "Handwriting Accuracy",
    grammarCheck: "Grammar Check",
    grammarOk: "වාක්‍යය සම්පූර්ණයි ✓",
    grammarFail: "වාක්‍යය සම්පූර්ණ නැහැ",
    suggestion: "Improvement Suggestion",
    charAnalysis: "Character Analysis",
    correct: "Correct",
    needsWork: "Needs work",
    progressTitle: "Your Progress",
    progressDesc: "Track your improvement over time",
    statLabels: ["Accuracy", "Sessions", "Streak"],
    statSuffixes: ["%", "", " days"],
    accuracyTrend: "Accuracy Trend",
    last7: "Last 7 sessions",
    freePlaceholder: "ඔබගේ වාක්‍යය මෙහි ලියන්න...",
    // Picture activity
    pictureActivityTitle: "🖼️ Picture Writing Activity",
    lookAtPicture: "Look at this picture carefully",
    writeSentencesAbout: "Write 5 sentences about what you see",
    sentenceProgress: (cur, total) => `Sentence ${cur} of ${total}`,
    pictureProgress: (cur, total) => `Picture ${cur} of ${total}`,
    sentencePlaceholder: "Write your Sinhala sentence here...",
    submitSentence: "Submit Sentence →",
    nextPicture: "Next Picture →",
    allDone: "🎉 All Done!",
    completedAll: "Amazing! You completed all picture activities!",
    sentenceDone: "✓ Sentence submitted!",
    writtenSentences: "Your sentences so far:",
    pictureComplete: "Picture Complete! 🌟",
    pictureCompleteMsg: "Great job! You wrote 5 sentences. Ready for the next picture?",
    restart: "Start Over",
    imageLabel: ["School Scene", "Family at Home", "Market Day", "Playground Fun", "Nature Walk"],
    imageSentences: [
      ["Write about what you see at school", "Describe the children in the picture", "What are the teachers doing?", "Describe the school building", "What time of day is it?"],
      ["Describe the family members", "What are they doing at home?", "What do you see in the room?", "Describe the mood of the family", "What activity are they doing?"],
      ["What items are being sold?", "Describe the people at the market", "What colors do you see?", "How many people are there?", "What time of day is it?"],
      ["What games are children playing?", "Describe the playground equipment", "How many children are there?", "What are they wearing?", "Describe how they feel"],
      ["What trees or plants do you see?", "Describe the animals if any", "What is the weather like?", "Who is walking in the picture?", "What sounds might you hear?"],
    ],
  },
  si: {
    badge: "සිංහල ඉගෙනීමේ පද්ධතිය",
    heroTitle1: "සිංහල වාක්‍ය පුහුණු වන්න &",
    heroTitle2: "ඔබේ අත් අකුරු",
    heroTitleEm: "වැඩිදියුණු කරන්න",
    heroDesc: "දෙමළ ළමුන් සඳහා නිර්මාණය කළ ස්මාර්ට් ප්‍රතිපෝෂණ සහ ප්‍රගති ලුහුබැඳීම සමඟ ලියන්න, ඉගෙන ගන්න.",
    startGuided: "මෙහෙයවන පුහුණුව ආරම්භ කරන්න",
    tryFree: "නිදහස් ලිවීම උත්සාහ කරන්න",
    tryPicture: "චිත්‍ර ක්‍රියාකාරකම",
    todaySentence: "අදේ වාක්‍යය",
    canvasLabel: "කළමනාකරණ පෙළ",
    practiceStreak: "පුහුණු දින පෙළ",
    streakVal: "🔥 දින 7",
    sessionsDone: "සම්පූර්ණ කළ වාරයන්",
    sessionsVal: "සැසි 24",
    accuracy: "අත් අකුරු නිරවද්‍යතාව",
    chooseModeTitle: "ඔබේ පුහුණු ආකාරය තෝරන්න",
    chooseModeDesc: "ඔබේ සිංහල අත් ලිවීමේ ශක්තිමත් ක්‍රම තුනක්",
    guidedTitle: "දෙන ලද වාක්‍ය පුහුණු වන්න",
    guidedDesc: "පද්ධතිය ලබා දෙන වාක්‍ය ලියා, මෙහෙයවන ප්‍රතිපෝෂණ සහිතව නිරවද්‍යතාව වැඩි කරන්න.",
    guidedBtn: "පුහුණුව ආරම්භ කරන්න →",
    freeTitle: "ඔබේම වාක්‍යයක් ලියන්න",
    freeDesc: "ඔබේ නිදහස් සිංහල වාක්‍යයක් ලිවීමෙන් බුද්ධිමත් ප්‍රතිපෝෂණ ලබා ගන්න.",
    freeBtn: "ලිවීම ආරම්භ කරන්න →",
    pictureTitle: "චිත්‍ර ලිවීමේ ක්‍රියාකාරකම",
    pictureDesc: "චිත්‍රය දෙස බලා සිංහල වාක්‍ය 5ක් ලියන්න. සියල්ල 5 ලිව්වොත් ඊළඟ චිත්‍රයට යා හැකිය!",
    pictureBtn: "ක්‍රියාකාරකම ආරම්භ කරන්න →",
    writeSentence: "මෙම වාක්‍යය ලියන්න",
    nextSentence: "ඊළඟ වාක්‍යය →",
    sentenceCounter: (cur, total) => `වාක්‍යය ${cur} / ${total}`,
    yourSpace: "ඔබේ ලිවීමේ ස්ථානය",
    guided: "මෙහෙයවන පුහුණුව",
    freeWriting: "නිදහස් ලිවීම",
    pictureWriting: "චිත්‍ර ක්‍රියාකාරකම",
    close: "වසන්න ✕",
    clear: "මකන්න",
    submit: "ඉදිරිපත් කරන්න →",
    feedbackTitle: "ප්‍රතිපෝෂණ වාර්තාව",
    tryAgain: "නැවත උත්සාහ කරන්න →",
    hwAccuracy: "අත් අකුරු නිරවද්‍යතාව",
    grammarCheck: "ව්‍යාකරණ පරීක්ෂාව",
    grammarOk: "වාක්‍යය සම්පූර්ණයි ✓",
    grammarFail: "වාක්‍යය සම්පූර්ණ නැහැ",
    suggestion: "වැඩිදියුණු කිරීමේ යෝජනා",
    charAnalysis: "අකුරු විශ්ලේෂණය",
    correct: "නිවැරදිය",
    needsWork: "වැඩ ඕනේ",
    progressTitle: "ඔබේ ප්‍රගතිය",
    progressDesc: "කාලයත් සමඟ ඔබේ වැඩිදියුණුව නිරීක්ෂණය කරන්න",
    statLabels: ["නිරවද්‍යතාව", "සැසි", "දින පෙළ"],
    statSuffixes: ["%", "", " දිනය"],
    accuracyTrend: "නිරවද්‍යතා ප්‍රවණතාව",
    last7: "අවසාන සැසි 7",
    freePlaceholder: "ඔබගේ වාක්‍යය මෙහි ලියන්න...",
    pictureActivityTitle: "🖼️ චිත්‍ර ලිවීමේ ක්‍රියාකාරකම",
    lookAtPicture: "මෙම චිත්‍රය හොඳින් දෙස බලන්න",
    writeSentencesAbout: "ඔබ දකින දේ ගැන වාක්‍ය 5ක් ලියන්න",
    sentenceProgress: (cur, total) => `වාක්‍යය ${cur} / ${total}`,
    pictureProgress: (cur, total) => `චිත්‍රය ${cur} / ${total}`,
    sentencePlaceholder: "ඔබේ සිංහල වාක්‍යය මෙහි ලියන්න...",
    submitSentence: "වාක්‍යය ඉදිරිපත් කරන්න →",
    nextPicture: "ඊළඟ චිත්‍රය →",
    allDone: "🎉 සම්පූර්ණයි!",
    completedAll: "ඔබ සියලු චිත්‍ර ක්‍රියාකාරකම් සම්පූර්ණ කළා!",
    sentenceDone: "✓ වාක්‍යය ඉදිරිපත් විය!",
    writtenSentences: "ඔබ ලිව් වාක්‍ය:",
    pictureComplete: "චිත්‍රය සම්පූර්ණ! 🌟",
    pictureCompleteMsg: "ඉතාමත් ලස්සනයි! ඊළඟ චිත්‍රයට සූදානම්ද?",
    restart: "නැවත ආරම්භ කරන්න",
    imageLabel: ["පාසල් දර්ශනය", "ගෙදර පවුල", "වෙළඳපොළ", "ක්‍රීඩා පිටිය", "ස්වභාව සංචාරය"],
    imageSentences: [
      ["පාසලේ ඔබ දකින දේ ලියන්න", "ළමුන් ගැන විස්තර කරන්න", "ගුරුවරු කරන්නේ කුමක්ද?", "පාසල් ගොඩනැගිල්ල විස්තර කරන්න", "දවසේ කුමන වේලාවක්ද?"],
      ["පවුලේ සාමාජිකයන් ගැන ලියන්න", "ඔවුන් ගෙදර කරන්නේ කුමක්ද?", "කාමරේ ඔබ දකින දේ", "පවුලේ ස්වභාවය ගැන ලියන්න", "ඔවුන් කරන ක්‍රියාව"],
      ["විකිණෙන දේ ලියන්න", "වෙළඳපොළේ මිනිසුන් ගැන ලියන්න", "ඔබ දකින වර්ණ", "කී දෙනෙක් ඉන්නවාද?", "දවසේ කුමන වේලාවක්ද?"],
      ["ළමයි කරන ක්‍රීඩා ලියන්න", "ක්‍රීඩා උපකරණ ගැන ලියන්න", "ළමයි කී දෙනෙක්?", "ඔවුන් ඇඳ ඇති ඇඳුම්", "ඔවුන් දැනෙන හැඟීම"],
      ["ගස් හෝ පැළෑටි ලියන්න", "සතුන් ගැන ලියන්න", "කාලගුණය කෙසේද?", "චිත්‍රේ ඇවිදින කවුද?", "ඇසෙන ශබ්ද ලියන්න"],
    ],
  },
  ta: {
    badge: "சிங்கள கற்றல் அமைப்பு",
    heroTitle1: "சிங்கள வாக்கியங்களை பயிற்சி செய்யுங்கள் &",
    heroTitle2: "உங்கள் கையெழுத்தை",
    heroTitleEm: "மேம்படுத்துங்கள்",
    heroDesc: "இளம் கற்பவர்களுக்காக வடிவமைக்கப்பட்ட ஸ்மார்ட் கருத்துக்களுடன் எழுதுங்கள், கற்றுக்கொள்ளுங்கள்.",
    startGuided: "வழிகாட்டப்பட்ட பயிற்சியைத் தொடங்குங்கள்",
    tryFree: "சுதந்திர எழுத்தை முயற்சிக்கவும்",
    tryPicture: "படம் செயல்பாடு",
    todaySentence: "இன்றைய வாக்கியம்",
    canvasLabel: "வரைபலகை",
    practiceStreak: "பயிற்சி தொடர்",
    streakVal: "🔥 7 நாட்கள்",
    sessionsDone: "முடிந்த வாக்கியங்கள்",
    sessionsVal: "24 அமர்வுகள்",
    accuracy: "கையெழுத்து துல்லியம்",
    chooseModeTitle: "உங்கள் பயிற்சி முறையை தேர்ந்தெடுக்கவும்",
    chooseModeDesc: "சிங்கள கையெழுத்து திறன்களை வளர்க்க மூன்று சக்திவாய்ந்த வழிகள்",
    guidedTitle: "கொடுக்கப்பட்ட வாக்கியங்களை பயிற்சி செய்யுங்கள்",
    guidedDesc: "கணினி வழங்கும் வாக்கியங்களை எழுதி வழிகாட்டப்பட்ட கருத்துடன் துல்லியத்தை மேம்படுத்துங்கள்.",
    guidedBtn: "பயிற்சியைத் தொடங்குங்கள் →",
    freeTitle: "உங்கள் சொந்த வாக்கியம் எழுதுங்கள்",
    freeDesc: "உங்கள் சொந்த சிங்கள வாக்கியத்தை சுதந்திரமாக எழுதி அறிவார்ந்த கருத்தைப் பெறுங்கள்.",
    freeBtn: "எழுத்தைத் தொடங்குங்கள் →",
    pictureTitle: "படம் எழுதும் செயல்பாடு",
    pictureDesc: "படத்தைப் பார்த்து 5 சிங்கள வாக்கியங்கள் எழுதுங்கள். அனைத்தும் முடித்தால் அடுத்த படம்!",
    pictureBtn: "செயல்பாட்டைத் தொடங்குங்கள் →",
    writeSentence: "இந்த வாக்கியத்தை எழுதுங்கள்",
    nextSentence: "அடுத்த வாக்கியம் →",
    sentenceCounter: (cur, total) => `வாக்கியம் ${cur} / ${total}`,
    yourSpace: "உங்கள் எழுத்து இடம்",
    guided: "வழிகாட்டப்பட்ட பயிற்சி",
    freeWriting: "சுதந்திர எழுத்து",
    pictureWriting: "படம் செயல்பாடு",
    close: "மூடு ✕",
    clear: "அழி",
    submit: "சமர்ப்பிக்கவும் →",
    feedbackTitle: "கருத்து அறிக்கை",
    tryAgain: "மீண்டும் முயற்சிக்கவும் →",
    hwAccuracy: "கையெழுத்து துல்லியம்",
    grammarCheck: "இலக்கண சோதனை",
    grammarOk: "வாக்கியம் முழுமையானது ✓",
    grammarFail: "வாக்கியம் முழுமையற்றது",
    suggestion: "மேம்பாட்டு பரிந்துரை",
    charAnalysis: "எழுத்து பகுப்பாய்வு",
    correct: "சரியானது",
    needsWork: "மேலும் தேவை",
    progressTitle: "உங்கள் முன்னேற்றம்",
    progressDesc: "காலப்போக்கில் உங்கள் முன்னேற்றத்தை கண்காணிக்கவும்",
    statLabels: ["துல்லியம்", "அமர்வுகள்", "தொடர்"],
    statSuffixes: ["%", "", " நாட்கள்"],
    accuracyTrend: "துல்லிய போக்கு",
    last7: "கடந்த 7 அமர்வுகள்",
    freePlaceholder: "ඔබගේ වාක්‍යය මෙහි ලියන්න...",
    pictureActivityTitle: "🖼️ படம் எழுதும் செயல்பாடு",
    lookAtPicture: "இந்த படத்தை கவனமாக பாருங்கள்",
    writeSentencesAbout: "நீங்கள் பார்ப்பதை பற்றி 5 வாக்கியங்கள் எழுதுங்கள்",
    sentenceProgress: (cur, total) => `வாக்கியம் ${cur} / ${total}`,
    pictureProgress: (cur, total) => `படம் ${cur} / ${total}`,
    sentencePlaceholder: "உங்கள் சிங்கள வாக்கியத்தை இங்கே எழுதுங்கள்...",
    submitSentence: "வாக்கியத்தை சமர்ப்பிக்கவும் →",
    nextPicture: "அடுத்த படம் →",
    allDone: "🎉 முடிந்தது!",
    completedAll: "அருமை! அனைத்து படம் செயல்பாடுகளும் முடிந்தது!",
    sentenceDone: "✓ வாக்கியம் சமர்ப்பிக்கப்பட்டது!",
    writtenSentences: "உங்கள் வாக்கியங்கள்:",
    pictureComplete: "படம் முடிந்தது! 🌟",
    pictureCompleteMsg: "சிறப்பு! 5 வாக்கியங்கள் எழுதினீர்கள். அடுத்த படத்திற்கு தயாரா?",
    restart: "மீண்டும் தொடங்கு",
    imageLabel: ["பள்ளி காட்சி", "வீட்டில் குடும்பம்", "சந்தை நாள்", "விளையாட்டு மைதானம்", "இயற்கை நடை"],
    imageSentences: [
      ["பள்ளியில் நீங்கள் பார்ப்பதை எழுதுங்கள்", "படத்தில் குழந்தைகளை விவரிக்கவும்", "ஆசிரியர்கள் என்ன செய்கிறார்கள்?", "பள்ளி கட்டிடத்தை விவரிக்கவும்", "எந்த நேரம் இது?"],
      ["குடும்ப உறுப்பினர்களை விவரிக்கவும்", "வீட்டில் அவர்கள் என்ன செய்கிறார்கள்?", "அறையில் நீங்கள் என்ன பார்க்கிறீர்கள்?", "குடும்பத்தின் மனநிலை", "அவர்கள் என்ன செய்கிறார்கள்?"],
      ["என்ன விற்கப்படுகிறது?", "சந்தையில் உள்ள மக்களை விவரிக்கவும்", "நீங்கள் என்ன நிறங்கள் பார்க்கிறீர்கள்?", "எத்தனை பேர் இருக்கிறார்கள்?", "எந்த நேரம் இது?"],
      ["குழந்தைகள் விளையாடும் விளையாட்டுகள்", "விளையாட்டு உபகரணங்களை விவரிக்கவும்", "எத்தனை குழந்தைகள்?", "அவர்கள் என்ன அணிந்திருக்கிறார்கள்?", "அவர்கள் எப்படி உணர்கிறார்கள்?"],
      ["என்ன மரங்கள் அல்லது தாவரங்கள்?", "விலங்குகளை விவரிக்கவும்", "வானிலை எப்படி உள்ளது?", "படத்தில் யார் நடக்கிறார்கள்?", "என்ன ஒலிகள் கேட்கலாம்?"],
    ],
  },
};

// ─── Picture placeholder scenes (SVG illustrations since no real images) ──────
const PictureScene = ({ index, label }) => {
  const scenes = [
    // School
    <svg key={0} viewBox="0 0 500 300" className="w-full h-full">
      <rect width="500" height="300" fill="#E8F4FD"/>
      {/* Sky */}
      <rect width="500" height="180" fill="#87CEEB"/>
      {/* Ground */}
      <rect y="200" width="500" height="100" fill="#90C67C"/>
      {/* School building */}
      <rect x="100" y="80" width="300" height="140" fill="#F5DEB3"/>
      <rect x="100" y="60" width="300" height="25" fill="#CD853F"/>
      <polygon points="100,60 250,20 400,60" fill="#8B4513"/>
      {/* Windows */}
      {[130,190,250,310].map((x,i)=><rect key={i} x={x} y="100" width="40" height="40" fill="#87CEEB" stroke="#8B4513" strokeWidth="2"/>)}
      {/* Door */}
      <rect x="215" y="160" width="70" height="60" fill="#8B4513"/>
      <circle cx="278" cy="191" r="4" fill="#FFD700"/>
      {/* Flag */}
      <line x1="370" y1="20" x2="370" y2="80" stroke="#333" strokeWidth="2"/>
      <rect x="370" y="20" width="30" height="20" fill="#FF4444"/>
      {/* Children */}
      {[80,420].map((x,i)=>(
        <g key={i}>
          <circle cx={x} cy="220" r="12" fill="#FDBCB4"/>
          <rect x={x-8} y="232" width="16" height="30" fill={i===0?"#4169E1":"#FF69B4"}/>
          <line x1={x-8} y1="240" x2={x-20} y2="260" stroke="#FDBCB4" strokeWidth="3"/>
          <line x1={x+8} y1="240" x2={x+20} y2="260" stroke="#FDBCB4" strokeWidth="3"/>
          <line x1={x-5} y1="262" x2={x-5} y2="285" stroke="#333" strokeWidth="3"/>
          <line x1={x+5} y1="262" x2={x+5} y2="285" stroke="#333" strokeWidth="3"/>
        </g>
      ))}
      {/* Sun */}
      <circle cx="440" cy="50" r="30" fill="#FFD700"/>
      {[...Array(8)].map((_,i)=>{
        const a = (i*45*Math.PI)/180;
        return <line key={i} x1={440+35*Math.cos(a)} y1={50+35*Math.sin(a)} x2={440+45*Math.cos(a)} y2={50+45*Math.sin(a)} stroke="#FFD700" strokeWidth="3"/>
      })}
      {/* Label */}
      <rect x="10" y="10" width="120" height="28" rx="6" fill="rgba(0,0,0,0.5)"/>
      <text x="70" y="29" textAnchor="middle" fill="white" fontSize="13" fontFamily="Nunito">{label}</text>
    </svg>,
    // Family home
    <svg key={1} viewBox="0 0 500 300" className="w-full h-full">
      <rect width="500" height="300" fill="#FFF8F0"/>
      <rect y="240" width="500" height="60" fill="#D2B48C"/>
      {/* Room walls */}
      <rect x="50" y="40" width="400" height="220" fill="#FFF5E6" stroke="#D2B48C" strokeWidth="3"/>
      {/* Floor */}
      <rect x="50" y="220" width="400" height="40" fill="#DEB887"/>
      {/* Window */}
      <rect x="350" y="60" width="80" height="80" fill="#87CEEB" stroke="#8B4513" strokeWidth="3"/>
      <line x1="390" y1="60" x2="390" y2="140" stroke="#8B4513" strokeWidth="2"/>
      <line x1="350" y1="100" x2="430" y2="100" stroke="#8B4513" strokeWidth="2"/>
      {/* Curtains */}
      <path d="M340 55 Q360 80 350 140" fill="#FF6B6B" opacity="0.7"/>
      <path d="M440 55 Q420 80 430 140" fill="#FF6B6B" opacity="0.7"/>
      {/* Sofa */}
      <rect x="80" y="180" width="200" height="45" rx="5" fill="#6B8E23"/>
      <rect x="75" y="160" width="210" height="25" rx="5" fill="#8FBC8F"/>
      <rect x="75" y="160" width="20" height="65" rx="3" fill="#8FBC8F"/>
      <rect x="265" y="160" width="20" height="65" rx="3" fill="#8FBC8F"/>
      {/* Family members */}
      {[110,160,210].map((x,i)=>(
        <g key={i}>
          <circle cx={x} cy="168" r={i===1?14:11} fill="#FDBCB4"/>
          <rect x={x-(i===1?10:8)} y={i===1?182:179} width={i===1?20:16} height={i===1?28:22} fill={["#4169E1","#FF69B4","#FF6347"][i]}/>
        </g>
      ))}
      {/* Table */}
      <rect x="310" y="180" width="120" height="15" rx="3" fill="#8B4513"/>
      <line x1="320" y1="195" x2="320" y2="225" stroke="#8B4513" strokeWidth="6"/>
      <line x1="420" y1="195" x2="420" y2="225" stroke="#8B4513" strokeWidth="6"/>
      {/* Items on table */}
      <rect x="330" y="165" width="25" height="15" fill="#FF6347" opacity="0.8"/>
      <circle cx="390" cy="172" r="8" fill="#FFD700"/>
      <rect x="10" y="10" width="140" height="28" rx="6" fill="rgba(0,0,0,0.5)"/>
      <text x="80" y="29" textAnchor="middle" fill="white" fontSize="13" fontFamily="Nunito">{label}</text>
    </svg>,
    // Market
    <svg key={2} viewBox="0 0 500 300" className="w-full h-full">
      <rect width="500" height="300" fill="#FFF9E6"/>
      <rect y="220" width="500" height="80" fill="#C8A96E"/>
      {/* Stalls */}
      {[30,170,310].map((x,i)=>(
        <g key={i}>
          <rect x={x} y="100" width="130" height="130" fill={["#FF9F43","#48DBFB","#FF6B6B"][i]} opacity="0.3"/>
          <polygon points={`${x},100 ${x+65},60 ${x+130},100`} fill={["#FF9F43","#48DBFB","#FF6B6B"][i]}/>
          <line x1={x} y1="100" x2={x} y2="230" stroke="#8B4513" strokeWidth="4"/>
          <line x1={x+130} y1="100" x2={x+130} y2="230" stroke="#8B4513" strokeWidth="4"/>
          {/* Items */}
          {[...Array(4)].map((_,j)=>(
            <circle key={j} cx={x+25+j*27} cy="165" r="14" fill={["#FF4444","#FFDD57","#4CAF50","#FF69B4"][j]} opacity="0.9"/>
          ))}
          {/* Vendor */}
          <circle cx={x+65} cy="195" r="11" fill="#FDBCB4"/>
          <rect x={x+57} y="206" width="16" height="25" fill={["#333","#6B48FF","#FF8C42"][i]}/>
        </g>
      ))}
      {/* Shoppers */}
      {[155,295].map((x,i)=>(
        <g key={i}>
          <circle cx={x} cy="200" r="10" fill="#FDBCB4"/>
          <rect x={x-7} y="210" width="14" height="22" fill={i===0?"#4169E1":"#FF69B4"}/>
        </g>
      ))}
      {/* Sun */}
      <circle cx="460" cy="50" r="25" fill="#FFD700"/>
      <rect x="10" y="10" width="110" height="28" rx="6" fill="rgba(0,0,0,0.5)"/>
      <text x="65" y="29" textAnchor="middle" fill="white" fontSize="13" fontFamily="Nunito">{label}</text>
    </svg>,
    // Playground
    <svg key={3} viewBox="0 0 500 300" className="w-full h-full">
      <rect width="500" height="300" fill="#E8F5E9"/>
      <rect width="500" height="180" fill="#87CEEB"/>
      <rect y="220" width="500" height="80" fill="#90C67C"/>
      <rect y="200" width="500" height="25" fill="#7CB342"/>
      {/* Slide */}
      <rect x="60" y="100" width="20" height="130" fill="#FF9800"/>
      <rect x="80" y="100" width="80" height="15" fill="#FF9800"/>
      <line x1="80" y1="115" x2="160" y2="210" stroke="#FF9800" strokeWidth="8"/>
      {/* Swing */}
      <line x1="250" y1="60" x2="350" y2="60" stroke="#8B4513" strokeWidth="5"/>
      <line x1="270" y1="60" x2="270" y2="160" stroke="#555" strokeWidth="3"/>
      <line x1="330" y1="60" x2="330" y2="160" stroke="#555" strokeWidth="3"/>
      <rect x="255" y="158" width="90" height="10" rx="3" fill="#8B4513"/>
      {/* Child on swing */}
      <circle cx="300" cy="145" r="12" fill="#FDBCB4"/>
      <rect x="292" y="157" width="16" height="22" fill="#FF69B4"/>
      {/* See-saw */}
      <circle cx="400" cy="218" r="8" fill="#777"/>
      <rect x="340" y="210" width="120" height="8" rx="4" fill="#FF5252" style={{transform:"rotate(-8deg)",transformOrigin:"400px 214px"}}/>
      <circle cx="345" cy="204" r="10" fill="#FDBCB4"/>
      <circle cx="455" cy="218" r="10" fill="#FDBCB4"/>
      {/* Children running */}
      {[30,450].map((x,i)=>(
        <g key={i}>
          <circle cx={x} cy="215" r="10" fill="#FDBCB4"/>
          <rect x={x-7} y="225" width="14" height="20" fill={i===0?"#4169E1":"#FF9800"}/>
        </g>
      ))}
      {/* Clouds */}
      {[[80,40],[220,25],[400,35]].map(([cx,cy],i)=>(
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx="40" ry="18" fill="white" opacity="0.9"/>
          <ellipse cx={cx-20} cy={cy+5} rx="25" ry="14" fill="white" opacity="0.9"/>
          <ellipse cx={cx+20} cy={cy+5} rx="25" ry="14" fill="white" opacity="0.9"/>
        </g>
      ))}
      <rect x="10" y="10" width="130" height="28" rx="6" fill="rgba(0,0,0,0.5)"/>
      <text x="75" y="29" textAnchor="middle" fill="white" fontSize="13" fontFamily="Nunito">{label}</text>
    </svg>,
    // Nature walk
    <svg key={4} viewBox="0 0 500 300" className="w-full h-full">
      <rect width="500" height="300" fill="#E8F5E9"/>
      <rect width="500" height="190" fill="#87CEEB"/>
      <rect y="220" width="500" height="80" fill="#558B2F"/>
      <rect y="200" width="500" height="25" fill="#66BB6A"/>
      {/* Mountains */}
      <polygon points="0,190 100,80 200,190" fill="#78909C"/>
      <polygon points="150,190 280,60 410,190" fill="#90A4AE"/>
      <polygon points="300,190 420,90 500,190" fill="#78909C"/>
      <polygon points="130,190 280,60 290,190" fill="white" opacity="0.4"/>
      {/* Trees */}
      {[30,70,400,440,470].map((x,i)=>(
        <g key={i}>
          <rect x={x-4} y={200-50} width="8" height="50" fill="#5D4037"/>
          <polygon points={`${x},${200-90} ${x-22},${200-45} ${x+22},${200-45}`} fill="#2E7D32"/>
          <polygon points={`${x},${200-110} ${x-16},${200-75} ${x+16},${200-75}`} fill="#388E3C"/>
        </g>
      ))}
      {/* Path */}
      <ellipse cx="250" cy="260" rx="30" ry="8" fill="#D7CCC8"/>
      <path d="M220,300 Q250,240 280,300" fill="#D7CCC8"/>
      {/* Person walking */}
      <circle cx="250" cy="215" r="13" fill="#FDBCB4"/>
      <rect x="242" y="228" width="16" height="28" fill="#4169E1"/>
      <line x1="242" y1="236" x2="228" y2="252" stroke="#FDBCB4" strokeWidth="3"/>
      <line x1="258" y1="236" x2="268" y2="245" stroke="#FDBCB4" strokeWidth="3"/>
      <line x1="244" y1="256" x2="238" y2="278" stroke="#333" strokeWidth="3"/>
      <line x1="254" y1="256" x2="262" y2="278" stroke="#333" strokeWidth="3"/>
      {/* Birds */}
      {[[120,50],[150,40],[180,55]].map(([x,y],i)=>(
        <path key={i} d={`M${x},${y} Q${x+8},${y-6} ${x+16},${y}`} stroke="#333" strokeWidth="1.5" fill="none"/>
      ))}
      {/* Butterfly */}
      <ellipse cx="340" cy="180" rx="12" ry="8" fill="#FF69B4" opacity="0.8" transform="rotate(-20,340,180)"/>
      <ellipse cx="352" cy="180" rx="12" ry="8" fill="#FF69B4" opacity="0.8" transform="rotate(20,352,180)"/>
      <line x1="346" y1="175" x2="346" y2="185" stroke="#333" strokeWidth="1.5"/>
      {/* Sun */}
      <circle cx="450" cy="45" r="28" fill="#FFD700"/>
      <rect x="10" y="10" width="130" height="28" rx="6" fill="rgba(0,0,0,0.5)"/>
      <text x="75" y="29" textAnchor="middle" fill="white" fontSize="13" fontFamily="Nunito">{label}</text>
    </svg>
  ];
  return scenes[index] || scenes[0];
};

// ─── Data ────────────────────────────────────────────────────────────────────
const sentences = [
  "අම්මා පාසලට යයි",
  "තාත්තා වැඩට යයි",
  "මම කිරි බොයි",
  "අපේ ගෙදර ලස්සනයි",
  "ළමයි ක්‍රීඩා කරයි",
];

const feedbackData = {
  accuracy: 85,
  grammar: true,
  suggestion: "ඔබේ ලිවීම සාමාන්‍ය මට්ටමේ ඇත. වැඩිපුර පුහුණු වී නිරවද්‍යතාව වැඩි කරන්න.",
};

// ─── Sub-components ──────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{count}{suffix}</span>;
}

function DrawingCanvas({ placeholder, onClearRef, onHasContentChange }) {
  const canvasRef = useRef(null);
  const [hasContent, setHasContent] = useState(false);
  const lastPos = useRef(null);
  const isDrawingRef = useRef(false);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    onHasContentChange?.(false);
  }, [onHasContentChange]);

  useEffect(() => {
    if (onClearRef) onClearRef.current = clearCanvas;
  }, [clearCanvas, onClearRef]);

  const startDraw = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas);
    isDrawingRef.current = true;
    setHasContent(true);
    onHasContentChange?.(true);
    lastPos.current = pos;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();
  }, [onHasContentChange]);

  const draw = useCallback((e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  }, []);

  const stopDraw = useCallback(() => { isDrawingRef.current = false; }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("touchstart", startDraw, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDraw);
    return () => {
      canvas.removeEventListener("touchstart", startDraw);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDraw);
    };
  }, [startDraw, draw, stopDraw]);

  return (
    <div className="relative bg-white rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden">
      {placeholder && !hasContent && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="sinhala text-2xl text-gray-200 select-none">{placeholder}</span>
        </div>
      )}
      <div className="guide-lines">
        <canvas
          ref={canvasRef}
          width={800}
          height={220}
          className="canvas-area w-full block"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
        />
      </div>
    </div>
  );
}

// ─── Picture Activity Component ──────────────────────────────────────────────
function PictureActivity({ tr, onClose }) {
  const TOTAL_PICTURES = 5;
  const SENTENCES_PER_PICTURE = 5;

  const [currentPicture, setCurrentPicture] = useState(0);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const [submittedSentences, setSubmittedSentences] = useState([]); // sentences for current picture
  const [allDone, setAllDone] = useState(false);
  const [pictureComplete, setPictureComplete] = useState(false);
  const [sentenceSubmitted, setSentenceSubmitted] = useState(false);

  const canvasClearRef = useRef(null);

  const handleSubmitSentence = () => {
    const newSentences = [...submittedSentences, `${tr.sentenceProgress(currentSentenceIdx + 1, SENTENCES_PER_PICTURE)}`];
    setSubmittedSentences(newSentences);
    setSentenceSubmitted(true);

    setTimeout(() => {
      setSentenceSubmitted(false);
      canvasClearRef.current?.();

      if (currentSentenceIdx + 1 >= SENTENCES_PER_PICTURE) {
        setPictureComplete(true);
      } else {
        setCurrentSentenceIdx(prev => prev + 1);
      }
    }, 900);
  };

  const handleNextPicture = () => {
    if (currentPicture + 1 >= TOTAL_PICTURES) {
      setAllDone(true);
    } else {
      setCurrentPicture(prev => prev + 1);
      setCurrentSentenceIdx(0);
      setSubmittedSentences([]);
      setPictureComplete(false);
    }
  };

  const handleRestart = () => {
    setCurrentPicture(0);
    setCurrentSentenceIdx(0);
    setSubmittedSentences([]);
    setPictureComplete(false);
    setAllDone(false);
  };

  const progressPercent = ((currentSentenceIdx) / SENTENCES_PER_PICTURE) * 100;

  if (allDone) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-gray-50 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-white">
          <span className="text-xs text-gray-400 uppercase tracking-widest">{tr.pictureWriting}</span>
          <button onClick={onClose} className="text-xs text-gray-400 hover:text-black transition-colors duration-200">{tr.close}</button>
        </div>
        <div className="p-12 flex flex-col items-center text-center">
          <div className="text-7xl mb-6 animate-bounce">🎉</div>
          <h3 className="font-display text-3xl mb-4">{tr.allDone}</h3>
          <p className="text-gray-500 text-lg mb-8 max-w-sm">{tr.completedAll}</p>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {[...Array(TOTAL_PICTURES)].map((_, i) => (
              <div key={i} className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-lg">⭐</div>
            ))}
          </div>
          <button onClick={handleRestart} className="bg-black text-white px-8 py-3.5 rounded-2xl text-sm font-semibold hover:bg-gray-900 transition-all">
            {tr.restart}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-gray-50 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-gray-200" />
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          <div className="w-3 h-3 rounded-full bg-gray-400" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 uppercase tracking-widest">{tr.pictureWriting}</span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">
            {tr.pictureProgress(currentPicture + 1, TOTAL_PICTURES)}
          </span>
        </div>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-black transition-colors duration-200">{tr.close}</button>
      </div>

      <div className="p-8">
        {/* Picture header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-400 uppercase tracking-widest">{tr.lookAtPicture}</span>
          <div className="flex gap-1">
            {[...Array(TOTAL_PICTURES)].map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i < currentPicture ? "bg-black" : i === currentPicture ? "bg-gray-600 scale-125" : "bg-gray-200"}`} />
            ))}
          </div>
        </div>

        {/* Picture */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg mb-6" style={{ height: "260px" }}>
          <PictureScene index={currentPicture} label={tr.imageLabel[currentPicture]} />
        </div>

        {pictureComplete ? (
          /* Picture complete screen */
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="text-5xl mb-4">🌟</div>
            <h4 className="font-display text-2xl mb-2">{tr.pictureComplete}</h4>
            <p className="text-gray-500 text-sm mb-6">{tr.pictureCompleteMsg}</p>
            {/* Show submitted sentences count */}
            <div className="flex justify-center gap-2 mb-6">
              {[...Array(SENTENCES_PER_PICTURE)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">{i + 1}</div>
              ))}
            </div>
            <button
              onClick={handleNextPicture}
              className="bg-black text-white px-8 py-3.5 rounded-2xl text-sm font-semibold hover:bg-gray-900 transition-all hover:shadow-lg"
            >
              {currentPicture + 1 >= TOTAL_PICTURES ? tr.allDone : tr.nextPicture}
            </button>
          </div>
        ) : (
          <>
            {/* Sentence prompt */}
            <div className="bg-white rounded-2xl border border-gray-200 px-6 py-4 mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400 uppercase tracking-widest">{tr.writeSentencesAbout}</span>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                  {tr.sentenceProgress(currentSentenceIdx + 1, SENTENCES_PER_PICTURE)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1 italic">{tr.imageSentences[currentPicture]?.[currentSentenceIdx]}</p>
            </div>

            {/* Sentence progress dots */}
            <div className="flex gap-2 mb-4">
              {[...Array(SENTENCES_PER_PICTURE)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i < currentSentenceIdx ? "bg-black" : i === currentSentenceIdx ? "bg-gray-400" : "bg-gray-200"}`}
                />
              ))}
            </div>

            {/* Canvas */}
            <DrawingCanvas
              key={`pic-${currentPicture}-sent-${currentSentenceIdx}`}
              placeholder={tr.sentencePlaceholder}
              onClearRef={canvasClearRef}
            />

            {/* Submit notification */}
            {sentenceSubmitted && (
              <div className="mt-3 text-center text-sm font-semibold text-green-600 bg-green-50 border border-green-200 rounded-xl py-2.5 anim-fade-in">
                {tr.sentenceDone}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => canvasClearRef.current?.()}
                className="flex-1 border border-gray-200 text-gray-500 py-3 rounded-xl text-sm font-semibold hover:border-gray-400 hover:text-black transition-all duration-200"
              >
                {tr.clear}
              </button>
              <button
                onClick={handleSubmitSentence}
                disabled={sentenceSubmitted}
                className="flex-2 bg-black text-white py-3 px-8 rounded-xl text-sm font-semibold hover:bg-gray-900 transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                style={{ flex: 2 }}
              >
                {tr.submitSentence}
              </button>
            </div>

            {/* Completed sentences list */}
            {submittedSentences.length > 0 && (
              <div className="mt-5 bg-white rounded-2xl border border-gray-100 p-4">
                <div className="text-xs text-gray-400 mb-3 uppercase tracking-widest">{tr.writtenSentences}</div>
                <div className="space-y-2">
                  {submittedSentences.map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-black rounded-full" style={{ width: "100%" }} />
                      </div>
                      <span className="text-xs text-gray-400">✓</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function SinhalaHandwriting({ lang = "en" }) {
  const tr = t[lang] ?? t.en;

  const [activeMode, setActiveMode] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [currentSentence, setCurrentSentence] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  const guidedClearRef = useRef(null);
  const freeClearRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
    setTimeout(() => setShowProgress(true), 600);
  }, []);

  const handleSubmit = () => setSubmitted(true);
  const handleReset = () => {
    setSubmitted(false);
    guidedClearRef.current?.();
    freeClearRef.current?.();
  };
  const nextSentence = () => { setCurrentSentence((p) => (p + 1) % sentences.length); handleReset(); };

  const progressStats = [
    { label: tr.statLabels[0], value: 78, suffix: tr.statSuffixes[0] },
    { label: tr.statLabels[1], value: 24, suffix: tr.statSuffixes[1] },
    { label: tr.statLabels[2], value: 7,  suffix: tr.statSuffixes[2] },
  ];

  const chartBars = [40, 55, 48, 62, 70, 75, 85];

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Noto+Sans+Sinhala:wght@300;400;500;600&display=swap');

        * { font-family: 'Nunito', sans-serif; }
        .sinhala { font-family: 'Noto Sans Sinhala', sans-serif; font-weight: 400; }
        .font-display { font-family: 'Nunito', sans-serif; font-weight: 800; }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
        .anim-fade-up  { animation: fadeUp  0.7s cubic-bezier(.22,1,.36,1) both; }
        .anim-fade-in  { animation: fadeIn  0.6s ease both; }
        .anim-scale-in { animation: scaleIn 0.5s cubic-bezier(.22,1,.36,1) both; }
        .delay-1 { animation-delay: 0.10s; }
        .delay-2 { animation-delay: 0.22s; }
        .delay-3 { animation-delay: 0.38s; }
        .delay-4 { animation-delay: 0.54s; }
        .canvas-area  { cursor: crosshair; touch-action: none; }
        .hover-lift   { transition: transform 0.28s cubic-bezier(.22,1,.36,1), box-shadow 0.28s ease; }
        .hover-lift:hover { transform: translateY(-4px) scale(1.015); box-shadow: 0 20px 60px rgba(0,0,0,0.13); }
        .guide-lines  { background-image: repeating-linear-gradient(transparent, transparent 39px, #e5e7eb 39px, #e5e7eb 40px); }
        .picture-card-hover { transition: transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease, border-color 0.2s; }
        .picture-card-hover:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 24px 64px rgba(0,0,0,0.15); }
      `}</style>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50" style={{clipPath:'polygon(8% 0,100% 0,100% 100%,0 100%)'}} />
          <svg className="absolute bottom-0 left-0 opacity-5 w-96 h-96" viewBox="0 0 400 400" fill="none">
            <circle cx="200" cy="200" r="180" stroke="black" strokeWidth="1"/>
            <circle cx="200" cy="200" r="120" stroke="black" strokeWidth="1"/>
            <circle cx="200" cy="200" r="60"  stroke="black" strokeWidth="1"/>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
          <div className={heroVisible ? "anim-fade-up" : "opacity-0"}>
            <span className="inline-block text-xs tracking-[0.2em] uppercase border border-black px-3 py-1 mb-8 anim-fade-in delay-1">
              {tr.badge}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.08] mb-6 anim-fade-up delay-2">
              {tr.heroTitle1}{" "}
              <em className="not-italic underline decoration-2 underline-offset-4">{tr.heroTitleEm}</em>{" "}
              {tr.heroTitle2}
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md anim-fade-up delay-3">
              {tr.heroDesc}
            </p>
            <div className="flex flex-wrap gap-4 anim-fade-up delay-4">
              <button
                onClick={() => { setActiveMode("guided"); setSubmitted(false); }}
                className="bg-black text-white px-7 py-3.5 rounded-2xl text-sm font-semibold hover:bg-gray-900 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                {tr.startGuided}
              </button>
              <button
                onClick={() => { setActiveMode("free"); setSubmitted(false); }}
                className="border border-black text-black px-7 py-3.5 rounded-2xl text-sm font-semibold hover:bg-black hover:text-white transition-all duration-300 hover:-translate-y-0.5"
              >
                {tr.tryFree}
              </button>
              <button
                onClick={() => { setActiveMode("picture"); setSubmitted(false); }}
                className="border-2 border-gray-300 text-gray-600 px-7 py-3.5 rounded-2xl text-sm font-semibold hover:border-black hover:text-black transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>🖼️</span> {tr.tryPicture}
              </button>
            </div>
          </div>

          {/* Illustration card */}
          <div className={`relative ${heroVisible ? "anim-scale-in delay-2" : "opacity-0"}`}>
            <div className="relative mx-auto w-full max-w-md">
              <div className="relative bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-2xl">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">{tr.todaySentence}</div>
                    <div className="sinhala text-xl">අම්මා පාසලට යයි</div>
                  </div>
                </div>
                <div className="guide-lines bg-white rounded-xl border border-gray-200 p-4 h-28 relative overflow-hidden">
                  <svg className="absolute inset-4 w-full opacity-20" viewBox="0 0 300 80" fill="none">
                    <path d="M10 40 Q40 20 70 40 Q100 60 130 40 Q160 20 190 40 Q220 60 250 40" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  </svg>
                  <div className="absolute bottom-3 right-3 text-xs text-gray-300">{tr.canvasLabel}</div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-black mt-1.5" />
                    <span className="text-xs text-gray-500">{tr.accuracy}</span>
                  </div>
                  <div className="font-display text-2xl">85%</div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 text-xs">
                <div className="text-gray-400 mb-0.5">{tr.practiceStreak}</div>
                <div className="font-semibold text-sm">{tr.streakVal}</div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-black text-white rounded-2xl shadow-xl px-4 py-3 text-xs">
                <div className="text-gray-400 mb-0.5">{tr.sessionsDone}</div>
                <div className="font-semibold text-sm">{tr.sessionsVal}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MODE SELECTION ─── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl mb-4">{tr.chooseModeTitle}</h2>
          <p className="text-gray-400 text-base max-w-md mx-auto">{tr.chooseModeDesc}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Guided */}
          <div
            onClick={() => { setActiveMode("guided"); setSubmitted(false); }}
            className={`hover-lift cursor-pointer rounded-3xl border-2 p-8 transition-all duration-300 ${activeMode === "guided" ? "border-black bg-black text-white" : "border-gray-100 bg-gray-50 hover:border-gray-300"}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${activeMode === "guided" ? "bg-white" : "bg-black"}`}>
              <svg className={`w-7 h-7 ${activeMode === "guided" ? "text-black" : "text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-display text-xl mb-3">{tr.guidedTitle}</h3>
            <p className={`text-sm leading-relaxed mb-8 ${activeMode === "guided" ? "text-gray-300" : "text-gray-500"}`}>{tr.guidedDesc}</p>
            <button className={`text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 ${activeMode === "guided" ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-900"}`}>
              {tr.guidedBtn}
            </button>
          </div>

          {/* Free */}
          <div
            onClick={() => { setActiveMode("free"); setSubmitted(false); }}
            className={`hover-lift cursor-pointer rounded-3xl border-2 p-8 transition-all duration-300 ${activeMode === "free" ? "border-black bg-black text-white" : "border-gray-100 bg-gray-50 hover:border-gray-300"}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${activeMode === "free" ? "bg-white" : "bg-black"}`}>
              <svg className={`w-7 h-7 ${activeMode === "free" ? "text-black" : "text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="font-display text-xl mb-3">{tr.freeTitle}</h3>
            <p className={`text-sm leading-relaxed mb-8 ${activeMode === "free" ? "text-gray-300" : "text-gray-500"}`}>{tr.freeDesc}</p>
            <button className={`text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 ${activeMode === "free" ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-900"}`}>
              {tr.freeBtn}
            </button>
          </div>

          {/* Picture Activity */}
          <div
            onClick={() => { setActiveMode("picture"); setSubmitted(false); }}
            className={`hover-lift cursor-pointer rounded-3xl border-2 p-8 transition-all duration-300 relative overflow-hidden ${activeMode === "picture" ? "border-black bg-black text-white" : "border-gray-100 bg-gray-50 hover:border-gray-300"}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-2xl transition-all duration-300 ${activeMode === "picture" ? "bg-white" : "bg-black"}`}>
              🖼️
            </div>
            <h3 className="font-display text-xl mb-3">{tr.pictureTitle}</h3>
            <p className={`text-sm leading-relaxed mb-8 ${activeMode === "picture" ? "text-gray-300" : "text-gray-500"}`}>{tr.pictureDesc}</p>
            <button className={`text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 ${activeMode === "picture" ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-900"}`}>
              {tr.pictureBtn}
            </button>
          </div>
        </div>
      </section>

      {/* ─── PRACTICE AREA ─── */}
      {activeMode && activeMode !== "picture" && (
        <section className="max-w-4xl mx-auto px-6 pb-20 anim-fade-up">
          <div className="rounded-3xl border border-gray-100 bg-gray-50 overflow-hidden shadow-xl">
            {/* Header bar */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <div className="w-3 h-3 rounded-full bg-gray-400" />
              </div>
              <span className="text-xs text-gray-400 uppercase tracking-widest">
                {activeMode === "guided" ? tr.guided : tr.freeWriting}
              </span>
              <button onClick={() => setActiveMode(null)} className="text-xs text-gray-400 hover:text-black transition-colors duration-200">
                {tr.close}
              </button>
            </div>

            <div className="p-8">
              {activeMode === "guided" && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400 uppercase tracking-widest">{tr.writeSentence}</span>
                    <button onClick={nextSentence} className="text-xs text-gray-400 hover:text-black transition-colors border border-gray-200 rounded-lg px-3 py-1.5">
                      {tr.nextSentence}
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 px-8 py-6 text-center">
                    <div className="sinhala text-4xl sm:text-5xl tracking-wide text-black mb-2">
                      {sentences[currentSentence]}
                    </div>
                    <div className="text-xs text-gray-300">{tr.sentenceCounter(currentSentence + 1, sentences.length)}</div>
                  </div>
                </div>
              )}

              {activeMode === "free" && (
                <div className="mb-4">
                  <span className="text-xs text-gray-400 uppercase tracking-widest">{tr.yourSpace}</span>
                </div>
              )}

              {activeMode === "guided" && <DrawingCanvas key="guided" onClearRef={guidedClearRef} />}
              {activeMode === "free"   && <DrawingCanvas key="free" placeholder={tr.freePlaceholder} onClearRef={freeClearRef} />}

              <div className="flex gap-3 mt-5">
                <button onClick={handleReset} className="flex-1 border border-gray-200 text-gray-500 py-3 rounded-xl text-sm font-semibold hover:border-gray-400 hover:text-black transition-all duration-200">
                  {tr.clear}
                </button>
                <button onClick={handleSubmit} className="flex-1 bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-900 transition-all duration-200 hover:shadow-lg">
                  {tr.submit}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── PICTURE ACTIVITY ─── */}
      {activeMode === "picture" && (
        <section className="max-w-4xl mx-auto px-6 pb-20 anim-fade-up">
          <PictureActivity tr={tr} onClose={() => setActiveMode(null)} />
        </section>
      )}

      {/* ─── FEEDBACK ─── */}
      {submitted && activeMode !== "picture" && (
        <section className="max-w-4xl mx-auto px-6 pb-20 anim-scale-in">
          <div className="rounded-3xl border border-gray-100 overflow-hidden shadow-xl">
            <div className="bg-black text-white px-8 py-5 flex items-center justify-between">
              <h3 className="font-display text-xl">{tr.feedbackTitle}</h3>
              <button onClick={handleReset} className="text-xs text-gray-400 hover:text-white transition-colors">{tr.tryAgain}</button>
            </div>

            <div className="p-8 grid sm:grid-cols-3 gap-6">
              {/* Accuracy ring */}
              <div className="sm:col-span-1 bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center">
                <div className="relative w-24 h-24 mb-4">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="black" strokeWidth="8"
                      strokeDasharray={`${feedbackData.accuracy * 2.64} 264`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1)" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-2xl">{feedbackData.accuracy}%</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-widest">{tr.hwAccuracy}</div>
              </div>

              {/* Grammar & Suggestions */}
              <div className="sm:col-span-2 space-y-4">
                <div className="rounded-2xl p-5 border border-gray-200 bg-gray-50 flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${feedbackData.grammar ? "bg-black" : "bg-gray-200"}`}>
                    {feedbackData.grammar
                      ? <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      : <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    }
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">{tr.grammarCheck}</div>
                    <div className="sinhala text-lg">{feedbackData.grammar ? tr.grammarOk : tr.grammarFail}</div>
                  </div>
                </div>

                <div className="rounded-2xl p-5 border border-gray-200 bg-gray-50">
                  <div className="text-xs text-gray-400 mb-2 uppercase tracking-widest">{tr.suggestion}</div>
                  <p className="sinhala text-sm text-gray-700 leading-relaxed">{feedbackData.suggestion}</p>
                </div>

                <div className="rounded-2xl p-5 border border-gray-200 bg-gray-50">
                  <div className="text-xs text-gray-400 mb-3 uppercase tracking-widest">{tr.charAnalysis}</div>
                  <div className="flex flex-wrap gap-2">
                    {["අ","ම්","මා"," ","පා","ස","ල","ට"," ","ය","යි"].map((char, i) => (
                      <span key={i} className={`sinhala text-lg px-2 py-1 rounded-lg border ${char === " " ? "w-2" : i % 4 === 0 ? "border-gray-300 bg-gray-200 text-gray-600" : "border-transparent bg-black text-white"}`}>
                        {char !== " " && char}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-black inline-block" />{tr.correct}</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-gray-200 inline-block" />{tr.needsWork}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── PROGRESS ─── */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl mb-4">{tr.progressTitle}</h2>
          <p className="text-gray-400 text-sm">{tr.progressDesc}</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          {progressStats.map((stat, i) => (
            <div key={i} className={`hover-lift rounded-3xl p-8 border ${i === 0 ? "bg-black text-white border-black" : "bg-gray-50 border-gray-100"}`}>
              <div className="text-xs uppercase tracking-widest mb-4 text-gray-400">{stat.label}</div>
              <div className={`font-display text-5xl ${i === 0 ? "text-white" : "text-black"}`}>
                {showProgress ? <AnimatedCounter value={stat.value} suffix={stat.suffix} /> : "0"}
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-display text-lg">{tr.accuracyTrend}</h4>
            <span className="text-xs text-gray-400">{tr.last7}</span>
          </div>
          <div className="flex items-end gap-3 h-36">
            {chartBars.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full">
                  <div className="w-full bg-black rounded-t-lg transition-all duration-1000"
                    style={{ height: showProgress ? `${(h / 100) * 120}px` : "0px", transitionDelay: `${i * 80}ms` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{["M","T","W","T","F","S","S"][i]}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-300">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>
      </section>
    </div>
  );
}