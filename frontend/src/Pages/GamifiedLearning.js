import { useState, useEffect, useRef, useCallback } from "react";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import { blendshapesToMap, calculateEngagement, classifyEmotion } from "../utils/engagementEngine";
import {
  saveGamifiedSession, saveFaceReaction, sendFaceReactionBatch,
  checkAndEarnGamifiedAchievements, getGamifiedStats,
  getGameLetters, getGameWords, getConnectSets as fetchConnectSets,
  getImageUrl,
} from "../services/apiService";

import useAdaptiveLearning from "../hooks/useAdaptiveLearning";
import AdaptationOverlay from "../Components/AdaptationOverlay";
import AchievementToast from "../Components/AchievementToast";
import { useNavigate } from "react-router-dom";


// ─── PAGE LOAD INTRO SOUND ─────────────────────────────────────────────────────
const introAudio = new Audio('/sounds/3.m4a');

function playIntroSound() {
  try {
    introAudio.currentTime = 0;
    introAudio.play().catch((err) => {
      console.warn('Intro sound (3.m4a) could not play:', err);
    });
  } catch (e) {
    console.warn('Intro sound error:', e);
  }
}

const PAGE_TRANSLATIONS={en:{badge:"Gamified Learning System",heroTitle1:"Play Your Way to",heroTitle2:"Mastery",heroItalic:"Sinhala",heroDesc:"Seven uniquely crafted games — letters first, then words. Build recognition, spelling, and confidence through play.",quickPlay:"Quick Play →",tryPuzzle:"Try Letter Puzzle",chooseGame:"Choose Your Game",chooseDesc:"Eight games across two skill levels — letters first, then words",letterGames:"Letter Games",wordGames:"Word Games",newLabel:"New",yourProgress:"Your Progress",progressDesc:"Track improvement across all games",totalScore:"Total Score",starsEarned:"Stars Earned",badges:"Badges",scoreTrend:"Score Trend",last7:"Last 7 sessions",achievTitle:"Achievements Unlocked",masterTitle:"Master Learner",masterDesc:"Earned 500+ points",activeToday:"Active today",gamesAvail:"7 Games Available",wordGamesLabel:"Word Games: Builder · Unscramble · Missing Letter · Line Connect",bestScore:"Best possible score",diffLabel:"Difficulty",diffValue:"Easy — Medium",lettersLabel:"Letters covered",play:"Play",pts:"pts",moodHistory:"Mood History",recentMood:"Recent reactions",streakLabel:"Day streak",difficulty:{Easy:"Easy",Medium:"Medium",Hard:"Hard"},tags:{Pairs:"Pairs",Timed:"Timed",Search:"Search",Puzzle:"Puzzle",Build:"Build",Fill:"Fill",Match:"Match"}},si:{badge:"ක්‍රීඩා ඉගෙනීමේ පද්ධතිය",heroTitle1:"ක්‍රීඩාවෙන් ඉගෙනගන්න",heroTitle2:"ප්‍රවීණත්වය",heroItalic:"සිංහල",heroDesc:"විශේෂයෙන් නිර්මාණය කළ ක්‍රීඩා හතක් — අකුරු මුලින්, ඉන් පසු වචන.",quickPlay:"ඉක්මන් ක්‍රීඩාව →",tryPuzzle:"ලිය ප්‍රහේලිකාව අත්හදා බලන්න",chooseGame:"ඔබේ ක්‍රීඩාව තෝරන්න",chooseDesc:"කුසලතා මට්ටම් දෙකක ක්‍රීඩා අටක් — අකුරු මුලින්, ඉන් පසු වචන",letterGames:"අකුරු ක්‍රීඩා",wordGames:"වචන ක්‍රීඩා",newLabel:"නව",yourProgress:"ඔබේ ප්‍රගතිය",progressDesc:"සියලු ක්‍රීඩාවල දියුණුව නිරීක්ෂණය කරන්න",totalScore:"මුළු ලකුණු",starsEarned:"ලබාගත් තරු",badges:"සම්මාන",scoreTrend:"ලකුණු ප්‍රවණතාව",last7:"අවසාන සැසි 7",achievTitle:"ලබාගත් ජය",masterTitle:"ප්‍රධාන ඉගෙන්නා",masterDesc:"ලකුණු 500+ ලබා ගත්තා",activeToday:"අද ක්‍රියාත්මකයි",gamesAvail:"ක්‍රීඩා 8ක් ඇත",wordGamesLabel:"වචන ක්‍රීඩා: ගොඩනැගිල්ල · ව්‍යාකූල · අස්ථාන · රේඛා සම්බන්ධ",bestScore:"හොඳම ලකුණු",diffLabel:"දුෂ්කරතාව",diffValue:"පහසු — මධ්‍යම",lettersLabel:"ආවරණය කළ අකුරු",play:"ක්‍රීඩා කරන්න",pts:"ල.",moodHistory:"හැඟීම් ඉතිහාසය",recentMood:"මෑත ප්‍රතික්‍රියා",streakLabel:"දින අඛණ්ඩතාව",difficulty:{Easy:"පහසු",Medium:"මධ්‍යම",Hard:"අමාරු"},tags:{Pairs:"යුගල",Timed:"කාලය",Search:"සෙවීම",Puzzle:"ප්‍රහේලිකා",Build:"ගොඩනැඟීම",Fill:"පිරවීම",Match:"ගැලපීම"}},ta:{badge:"விளையாட்டு கற்றல் அமைப்பு",heroTitle1:"விளையாடி கற்றுக்கொள்",heroTitle2:"தேர்ச்சி",heroItalic:"சிங்களம்",heroDesc:"சிறப்பாக வடிவமைக்கப்பட்ட ஏழு விளையாட்டுகள் — முதலில் எழுத்துக்கள், பிறகு வார்த்தைகள்.",quickPlay:"விரைவு விளையாட்டு →",tryPuzzle:"எழுத்து புதிரை முயற்சி செய்",chooseGame:"உங்கள் விளையாட்டைத் தேர்ந்தெடுக்கவும்",chooseDesc:"இரண்டு திறன் நிலைகளில் எட்டு விளையாட்டுகள்",letterGames:"எழுத்து விளையாட்டுகள்",wordGames:"வார்த்தை விளையாட்டுகள்",newLabel:"புதியது",yourProgress:"உங்கள் முன்னேற்றம்",progressDesc:"அனைத்து விளையாட்டுகளிலும் முன்னேற்றத்தை கண்காணிக்கவும்",totalScore:"மொத்த மதிப்பெண்",starsEarned:"பெற்ற நட்சத்திரங்கள்",badges:"பதக்கங்கள்",scoreTrend:"மதிப்பெண் போக்கு",last7:"கடைசி 7 அமர்வுகள்",achievTitle:"சாதனைகள் திறக்கப்பட்டன",masterTitle:"மாஸ்டர் கற்பவர்",masterDesc:"500+ புள்ளிகள் சம்பாதித்தார்",activeToday:"இன்று செயலில்",gamesAvail:"8 விளையாட்டுகள் கிடைக்கின்றன",wordGamesLabel:"வார்த்தை விளையாட்டுகள்: கட்டமைப்பு · குழப்பம் · காணாமல் போன · கோடு இணைப்பு",bestScore:"சிறந்த மதிப்பெண்",diffLabel:"சிரமம்",diffValue:"எளிது — நடுத்தரம்",lettersLabel:"உள்ளடக்கிய எழுத்துக்கள்",play:"விளையாடு",pts:"புள்.",moodHistory:"மனநிலை வரலாறு",recentMood:"சமீபத்திய எதிர்வினைகள்",streakLabel:"நாள் தொடர்",difficulty:{Easy:"எளிது",Medium:"நடுத்தரம்",Hard:"கடினம்"},tags:{Pairs:"ஜோடிகள்",Timed:"நேரம்",Search:"தேடல்",Puzzle:"புதிர்",Build:"கட்டமைப்பு",Fill:"நிரப்பு",Match:"பொருத்தம்"}}};
const RESULT_TRANSLATIONS={en:{results:"Results",playAgain:"Play Again →",excellent:"Excellent Work",wellDone:"Well Done",keepPract:"Keep Practicing",pointsEarned:"points earned",time:"Time",moves:"Moves",answered:"Answered",allGames:"← All Games",scanReaction:"📷 Scan My Reaction",yourReaction:"Your Reaction",confidence:"Confidence",saveReaction:"Save Reaction",skipReaction:"skip →",scanTitle:"How did that feel?",loadingModels:"Loading face detection...",cameraReady:"Camera ready — look at the screen!",scanning:"Scanning your reaction...",reactionDone:"Reaction captured!",cameraError:"Camera error. Please allow camera access.",close:"Close",detectedExpr:"Detected expression"},si:{results:"ප්‍රතිඵල",playAgain:"නැවත ක්‍රීඩා කරන්න →",excellent:"විශිෂ්ට කාර්යය",wellDone:"ශාබාෂ්",keepPract:"පුහුණු වෙමින් සිටින්න",pointsEarned:"ලකුණු ලබා ගත්තා",time:"කාලය",moves:"ගමන්",answered:"පිළිතුරු දුන්නා",allGames:"← සියලු ක්‍රීඩා",scanReaction:"📷 ප්‍රතික්‍රියාව scan කරන්න",yourReaction:"ඔබේ ප්‍රතික්‍රියාව",confidence:"නිරවද්‍යතාව",saveReaction:"ප්‍රතික්‍රියාව සුරකින්න",skipReaction:"මඟ හරිනවා →",scanTitle:"ඔබට කොහොමද දැනෙන්නේ?",loadingModels:"Face detection load වෙනවා...",cameraReady:"Camera සූදානම් — screen එක බලන්න!",scanning:"ඔබේ ප්‍රතික්‍රියාව scan වෙනවා...",reactionDone:"ප්‍රතික්‍රියාව ලැබුණා!",cameraError:"Camera error. Camera access allow කරන්න.",close:"වසන්න",detectedExpr:"හඳුනාගත් ප්‍රතික්‍රියාව"},ta:{results:"முடிவுகள்",playAgain:"மீண்டும் விளையாடு →",excellent:"சிறந்த வேலை",wellDone:"நன்றாக செய்தீர்கள்",keepPract:"தொடர்ந்து பயிற்சி செய்யுங்கள்",pointsEarned:"புள்ளிகள் சம்பாதித்தது",time:"நேரம்",moves:"நகர்வுகள்",answered:"பதிலளித்தது",allGames:"← அனைத்து விளையாட்டுகள்",scanReaction:"📷 எதிர்வினையை ஸ்கேன் செய்யவும்",yourReaction:"உங்கள் எதிர்வினை",confidence:"நம்பகத்தன்மை",saveReaction:"எதிர்வினையை சேமிக்கவும்",skipReaction:"தவிர் →",scanTitle:"எப்படி உணர்கிறீர்கள்?",loadingModels:"முக கண்டறிதல் ஏற்றுகிறது...",cameraReady:"கேமரா தயார் — திரையைப் பாருங்கள்!",scanning:"உங்கள் எதிர்வினையை ஸ்கேன் செய்கிறது...",reactionDone:"எதிர்வினை கைப்பற்றப்பட்டது!",cameraError:"கேமரா பிழை. கேமரா அணுகலை அனுமதிக்கவும்.",close:"மூடு",detectedExpr:"கண்டறியப்பட்ட வெளிப்பாடு"}};
const EXPRESSION_MAP={happy:{emoji:"😄",si:"සතුටුයි",ta:"மகிழ்ச்சி",en:"Happy"},surprised:{emoji:"😮",si:"පුදුමයි",ta:"ஆச்சரியம்",en:"Surprised"},neutral:{emoji:"😐",si:"සාමාන්‍යයි",ta:"சாதாரணம்",en:"Neutral"},sad:{emoji:"😢",si:"දුකයි",ta:"சோகம்",en:"Sad"},angry:{emoji:"😠",si:"තරහයි",ta:"கோபம்",en:"Angry"},fearful:{emoji:"😨",si:"බියයි",ta:"பயம்",en:"Fearful"},disgusted:{emoji:"🤢",si:"පිළිකුලයි",ta:"வெறுப்பு",en:"Disgusted"},confused:{emoji:"😕",si:"අවුලෙන්",ta:"குழப்பம்",en:"Confused"},frustrated:{emoji:"😤",si:"කලකිරීම",ta:"விரக்தி",en:"Frustrated"}};
const CATEGORY_COLOR_MAP={"ස්වර (Vowels)":"#e11d48","ක වර්ගය":"#7c3aed","ච වර්ගය":"#0891b2","ට වර්ගය":"#08b24c","ත වර්ගය":"#110688","ප වර්ගය":"#b45309","අවර්ගීය":"#be185d"};
const SINHALA_FONT="'Noto Sans Sinhala','Iskoola Pota',serif";
const MAX_SCORES={"memory-match":120,"speed-quiz":150,"letter-hunt":200,"letter-puzzle":250,"word-builder":360,"missing-letter":360,"line-connect":360};
const GAMES_CONFIG=[{id:"memory-match",title:{en:"Memory Match",si:"මතක ගැලපීම",ta:"நினைவக பொருத்தம்"},subtitle:{en:"Match each letter with its name",si:"සෑම අකුරක්ම එහි නමට ගලපන්න",ta:"ஒவ்வொரு எழுத்தையும் அதன் பெயரோடு பொருத்துங்கள்"},difficulty:"Easy",points:120,tag:"Pairs",section:"Letters"},{id:"speed-quiz",title:{en:"Speed Quiz",si:"වේග ප්‍රශ්නාවලිය",ta:"வேக வினாடி வினா"},subtitle:{en:"10-second timer per question",si:"ප්‍රශ්නයකට තත්පර 10 ක ටයිමරයක්",ta:"ஒவ்வொரு கேள்விக்கும் 10 வினாடி டைமர்"},difficulty:"Medium",points:150,tag:"Timed",section:"Letters"},{id:"letter-hunt",title:{en:"Letter Hunt",si:"අකුරු සෙවීම",ta:"எழுத்து வேட்டை"},subtitle:{en:"Find the correct letter in the grid",si:"ජාලකයේ නිවැරදි අකුර සොයන්න",ta:"கட்டத்தில் சரியான எழுத்தை கண்டுபிடிக்கவும்"},difficulty:"Easy",points:200,tag:"Search",section:"Letters"},{id:"letter-puzzle",title:{en:"Letter Puzzle",si:"අකුරු ප්‍රහේලිකාව",ta:"எழுத்து புதிர்"},subtitle:{en:"Assemble letter pieces into the slot",si:"අකුරු කෑලි ස්ථානයට එකලස් කරන්න",ta:"எழுத்து துண்டுகளை இடத்தில் பொருத்துங்கள்"},difficulty:"Medium",points:250,tag:"Puzzle",section:"Letters"},{id:"word-builder",title:{en:"Word Builder",si:"වචන ගොඩනැගිල්ල",ta:"வார்த்தை கட்டமைப்பாளர்"},subtitle:{en:"Drag syllables to build the correct word",si:"නිවැරදි වචනය ගොඩනැගීමට සිලේබල් ඇදගන්න",ta:"சரியான வார்த்தையை கட்ட எழுத்துக்களை இழுக்கவும்"},difficulty:"Medium",points:360,tag:"Build",section:"Words"},{id:"missing-letter",title:{en:"Missing Letter",si:"අස්ථාන අකුර",ta:"காணாமல் போன எழுத்து"},subtitle:{en:"Fill the blank — chain streaks for bonus",si:"හිස්ව ඇති ස්ථානය පිරවීම — ශ්‍රේණිය ලකුණු",ta:"வெற்றிடத்தை நிரப்புங்கள் — தொடர் போனஸ்"},difficulty:"Medium",points:360,tag:"Fill",section:"Words"},{id:"line-connect",title:{en:"Line Connect",si:"රේඛා සම්බන්ධ කිරීම",ta:"கோடு இணைப்பு"},subtitle:{en:"Draw lines to match words — just like class!",si:"ගුරු පන්තිය මෙන් රේඛා ඇදගෙන ගලපන්න!",ta:"வார்த்தைகளை பொருத்த கோடுகளை வரையுங்கள்!"},difficulty:"Easy",points:360,tag:"Match",section:"Words"}];

const shuffle=(arr)=>[...arr].sort(()=>Math.random()-0.5);
const randFrom=(arr)=>arr[Math.floor(Math.random()*arr.length)];
const pickN=(arr,n)=>shuffle(arr).slice(0,n);

const Ico=({d,size=20,fill="none",className=""})=>(<svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{(Array.isArray(d)?d:[d]).map((p,i)=><path key={i} d={p}/>)}</svg>);
const TrophyIco=({s=20})=><Ico size={s} d={["M6 9H4.5a2.5 2.5 0 0 1 0-5H6","M18 9h1.5a2.5 2.5 0 0 0 0-5H18","M4 22h16","M10 14.66V17a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2.34","M14 14.66V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2.34","M18 2H6v7a6 6 0 0 0 12 0V2z"]}/>;
const StarIco=({s=20,fill="none"})=><Ico size={s} fill={fill} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>;
const ZapIco=({s=20})=><Ico size={s} d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>;
const TargetIco=({s=20})=><Ico size={s} d={["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"]}/>;
const BrainIco=({s=48})=><Ico size={s} d={["M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.66z","M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.66z"]}/>;
const PuzzleIco=({s=48})=><Ico size={s} d="M20.5 10a2.5 2.5 0 0 1-2.5-2.5V5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H8a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3a1 1 0 0 1 1-1h3a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z"/>;
const ChevronIco=({s=16,up=false})=><Ico size={s} d={up?"M18 15l-6-6-6 6":"M6 9l6 6 6-6"}/>;
const Gamepad2Ico=({s=64})=><Ico size={s} d={["M6 11l4-4 4 4","M14 13l4 4-4 4","M6 13l-4 4 4 4","M10 11l4 4-4 4","M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"]}/>;
const TypeIco=({s=48})=><Ico size={s} d={["M4 7V4h16v3","M9 20h6","M12 4v16"]}/>;
const KeyIco=({s=48})=><Ico size={s} d={["M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"]}/>;
const LinkIco=({s=48})=><Ico size={s} d={["M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71","M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"]}/>;

// ═══════════════════════════════════════════════════════════════════
// KIDS DECOR — colourful floating shapes for the empty side margins
// Plain geometric SVGs (stars/balloons/clouds/hearts/flowers/moons) —
// no characters or IP, just shapes+colour so the play screens feel
// alive for ages 1-5. Purely decorative: aria-hidden, no pointer
// events, hidden on small screens so it never covers the game itself.
// ═══════════════════════════════════════════════════════════════════
const DECO_PATHS={
  star:"M12 2l2.6 5.9 6.4.6-4.8 4.4 1.4 6.3L12 16l-5.6 3.2 1.4-6.3-4.8-4.4 6.4-.6z",
  balloon:"M12 2C7.6 2 4.5 5.9 4.5 10c0 4 2.7 7.4 6.2 8.2l-.9 3.3h1.6l.6-2.2c.3 0 .7.1 1 .1s.7 0 1-.1l.6 2.2h1.6l-.9-3.3c3.5-.8 6.2-4.2 6.2-8.2C19.5 5.9 16.4 2 12 2z",
  cloud:"M6.5 18a4.5 4.5 0 0 1-1-8.9 5.5 5.5 0 0 1 10.6-2A5 5 0 0 1 21 12a4 4 0 0 1-4 6H6.5z",
  heart:"M12 21s-7.5-4.6-10-9.3C.4 8 2.4 4.5 6 4.5c2.1 0 3.7 1.2 6 3.9 2.3-2.7 3.9-3.9 6-3.9 3.6 0 5.6 3.5 4 7.2C19.5 16.4 12 21 12 21z",
  moon:"M20 12.5A8.5 8.5 0 1 1 11.5 4a7 7 0 0 0 8.5 8.5z",
};
function DecoShape({kind="star",color="#f59e0b",size=40}){
  if(kind==="flower")return(
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="6" r="3.4" fill={color}/><circle cx="12" cy="18" r="3.4" fill={color}/>
      <circle cx="6" cy="12" r="3.4" fill={color}/><circle cx="18" cy="12" r="3.4" fill={color}/>
      <circle cx="12" cy="12" r="3" fill="#fff"/>
    </svg>
  );
  return(<svg width={size} height={size} viewBox="0 0 24 24"><path d={DECO_PATHS[kind]||DECO_PATHS.star} fill={color}/></svg>);
}
// ═══════════════════════════════════════════════════════════════════
// SIDE TIMER — big countdown numbers on both sides for timed games
// (Speed Quiz, Letter Hunt), plus a short beep for the final 5 seconds.
// ═══════════════════════════════════════════════════════════════════
function SideTimer({value,danger}){
  const color=danger?"#ef4444":"#e5e7eb";
  return(
    <div aria-hidden="true" className="hidden lg:flex" style={{position:"fixed",top:0,bottom:0,left:0,right:0,pointerEvents:"none",zIndex:1,alignItems:"center",justifyContent:"space-between",padding:"0 3%"}}>
      <span style={{fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:"9vw",lineHeight:1,color,transition:"color .3s",animation:danger?"timerPulse .6s ease-in-out infinite":"none"}}>{value}</span>
      <span style={{fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:"9vw",lineHeight:1,color,transition:"color .3s",animation:danger?"timerPulse .6s ease-in-out infinite":"none"}}>{value}</span>
    </div>
  );
}
let _beepCtx=null;
function playBeep(){
  try{
    if(!_beepCtx)_beepCtx=new(window.AudioContext||window.webkitAudioContext)();
    const osc=_beepCtx.createOscillator(),gain=_beepCtx.createGain();
    osc.type="sine";osc.frequency.value=880;
    gain.gain.setValueAtTime(0.15,_beepCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001,_beepCtx.currentTime+0.15);
    osc.connect(gain);gain.connect(_beepCtx.destination);
    osc.start();osc.stop(_beepCtx.currentTime+0.15);
  }catch{/* audio not available — ignore silently */}
}
function SideDecor({items=[]}){
  return(
    <div aria-hidden="true" className="hidden lg:block" style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,overflow:"hidden"}}>
      {items.map((it,i)=>(
        <div key={i} style={{position:"absolute",left:it.side==="left"?it.pos:undefined,right:it.side==="right"?it.pos:undefined,top:it.top,opacity:it.opacity??0.9,animation:`floaty ${it.dur||5}s ease-in-out infinite`,animationDelay:`${it.delay||0}s`}}>
          <DecoShape kind={it.kind} color={it.color} size={it.size||44}/>
        </div>
      ))}
    </div>
  );
}
// Each game gets its own colourful mix — 3 shapes floating on the left, 3 on the right.
const GAME_DECOR={
  "memory-match":[
    {kind:"star",color:"#f59e0b",side:"left",pos:"4%",top:"24%",size:42,dur:5,delay:0},
    {kind:"balloon",color:"#ef4444",side:"left",pos:"9%",top:"52%",size:52,dur:6.5,delay:.6},
    {kind:"cloud",color:"#7dd3fc",side:"left",pos:"3%",top:"76%",size:60,dur:7,delay:.3},
    {kind:"flower",color:"#a78bfa",side:"right",pos:"5%",top:"22%",size:44,dur:5.5,delay:.4},
    {kind:"heart",color:"#fb7185",side:"right",pos:"10%",top:"50%",size:40,dur:6,delay:1},
    {kind:"moon",color:"#fbbf24",side:"right",pos:"4%",top:"78%",size:46,dur:6.8,delay:.2},
  ],
  "speed-quiz":[
    {kind:"star",color:"#22c55e",side:"left",pos:"5%",top:"22%",size:40,dur:4.5,delay:.2},
    {kind:"cloud",color:"#93c5fd",side:"left",pos:"3%",top:"50%",size:58,dur:7,delay:.8},
    {kind:"balloon",color:"#fb923c",side:"left",pos:"9%",top:"78%",size:48,dur:6,delay:0},
    {kind:"heart",color:"#f472b6",side:"right",pos:"5%",top:"24%",size:38,dur:5,delay:.5},
    {kind:"flower",color:"#facc15",side:"right",pos:"10%",top:"52%",size:42,dur:5.8,delay:.1},
    {kind:"star",color:"#38bdf8",side:"right",pos:"4%",top:"80%",size:44,dur:6.4,delay:1.1},
  ],
  "letter-hunt":[
    {kind:"balloon",color:"#a855f7",side:"left",pos:"4%",top:"20%",size:50,dur:6,delay:.3},
    {kind:"star",color:"#f97316",side:"left",pos:"9%",top:"48%",size:40,dur:5,delay:.9},
    {kind:"cloud",color:"#86efac",side:"left",pos:"3%",top:"74%",size:56,dur:7,delay:0},
    {kind:"moon",color:"#facc15",side:"right",pos:"5%",top:"22%",size:44,dur:5.6,delay:.5},
    {kind:"heart",color:"#fb7185",side:"right",pos:"10%",top:"50%",size:38,dur:6.2,delay:.2},
    {kind:"flower",color:"#60a5fa",side:"right",pos:"4%",top:"78%",size:42,dur:6.6,delay:.8},
  ],
  "letter-puzzle":[
    {kind:"star",color:"#e11d48",side:"left",pos:"3%",top:"20%",size:40,dur:5.2,delay:.1},
    {kind:"cloud",color:"#7dd3fc",side:"left",pos:"7%",top:"48%",size:58,dur:7,delay:.7},
    {kind:"flower",color:"#c084fc",side:"left",pos:"2%",top:"78%",size:44,dur:5.8,delay:.3},
    {kind:"balloon",color:"#fb923c",side:"right",pos:"3%",top:"22%",size:50,dur:6.4,delay:0},
    {kind:"heart",color:"#fb7185",side:"right",pos:"7%",top:"50%",size:38,dur:5,delay:.9},
    {kind:"moon",color:"#facc15",side:"right",pos:"2%",top:"80%",size:44,dur:6.8,delay:.4},
  ],
  "word-builder":[
    {kind:"flower",color:"#f472b6",side:"left",pos:"4%",top:"22%",size:44,dur:5.4,delay:.2},
    {kind:"star",color:"#38bdf8",side:"left",pos:"9%",top:"50%",size:40,dur:6,delay:.8},
    {kind:"balloon",color:"#4ade80",side:"left",pos:"3%",top:"76%",size:50,dur:6.6,delay:0},
    {kind:"cloud",color:"#a5b4fc",side:"right",pos:"5%",top:"20%",size:58,dur:7,delay:.5},
    {kind:"heart",color:"#fb7185",side:"right",pos:"10%",top:"48%",size:38,dur:5.6,delay:1},
    {kind:"star",color:"#facc15",side:"right",pos:"4%",top:"78%",size:42,dur:6.2,delay:.3},
  ],
  "word-unscramble":[
    {kind:"balloon",color:"#f97316",side:"left",pos:"4%",top:"20%",size:50,dur:6,delay:.4},
    {kind:"moon",color:"#facc15",side:"left",pos:"9%",top:"48%",size:44,dur:6.6,delay:0},
    {kind:"heart",color:"#f472b6",side:"left",pos:"3%",top:"76%",size:38,dur:5.4,delay:.8},
    {kind:"star",color:"#4ade80",side:"right",pos:"5%",top:"22%",size:42,dur:5,delay:.2},
    {kind:"cloud",color:"#93c5fd",side:"right",pos:"10%",top:"50%",size:58,dur:7,delay:.6},
    {kind:"flower",color:"#c084fc",side:"right",pos:"4%",top:"78%",size:44,dur:6.4,delay:.1},
  ],
  "missing-letter":[
    {kind:"star",color:"#fb7185",side:"left",pos:"4%",top:"20%",size:40,dur:5,delay:.5},
    {kind:"flower",color:"#facc15",side:"left",pos:"9%",top:"48%",size:44,dur:5.8,delay:0},
    {kind:"cloud",color:"#7dd3fc",side:"left",pos:"3%",top:"76%",size:58,dur:7,delay:.9},
    {kind:"balloon",color:"#a855f7",side:"right",pos:"5%",top:"22%",size:50,dur:6.2,delay:.3},
    {kind:"moon",color:"#fb923c",side:"right",pos:"10%",top:"50%",size:44,dur:6.6,delay:.7},
    {kind:"heart",color:"#4ade80",side:"right",pos:"4%",top:"78%",size:38,dur:5.4,delay:.1},
  ],
  "line-connect":[
    {kind:"cloud",color:"#a5b4fc",side:"left",pos:"3%",top:"18%",size:56,dur:7,delay:.2},
    {kind:"star",color:"#fb923c",side:"left",pos:"7%",top:"46%",size:40,dur:5.2,delay:.8},
    {kind:"heart",color:"#f472b6",side:"left",pos:"2%",top:"74%",size:38,dur:5.8,delay:0},
    {kind:"flower",color:"#facc15",side:"right",pos:"3%",top:"20%",size:44,dur:5.6,delay:.5},
    {kind:"balloon",color:"#4ade80",side:"right",pos:"7%",top:"48%",size:50,dur:6.4,delay:1},
    {kind:"moon",color:"#38bdf8",side:"right",pos:"2%",top:"76%",size:44,dur:6.8,delay:.3},
  ],
};

function AnimatedCounter({value,suffix=""}){const[count,setCount]=useState(0);useEffect(()=>{let start=0;const step=Math.ceil(value/40);const timer=setInterval(()=>{start+=step;if(start>=value){setCount(value);clearInterval(timer);}else setCount(start);},30);return()=>clearInterval(timer);},[value]);return <span>{count}{suffix}</span>;}

// ═══════════════════════════════════════════════════════════════════
// FACE REACTION SCANNER — MediaPipe Face Landmarker (continuous engagement)
// ═══════════════════════════════════════════════════════════════════
const SAMPLE_WINDOW_MS = 3000;      // aggregate raw detections into 1 data point every 3s
const DETECTION_INTERVAL_MS = 400;  // ~2.5 detections/sec is plenty for engagement tracking

function FaceReactionScanner({onResult,onClose,lang="en",autoStart=false,gameEnded=false}){
  const videoRef=useRef(null),streamRef=useRef(null),landmarkerRef=useRef(null),detectionIntervalRef=useRef(null);
  const windowSamplesRef=useRef([]),windowStartRef=useRef(0);
  const[status,setStatus]=useState("loading"),[modelsReady,setModelsReady]=useState(false);
  const t=RESULT_TRANSLATIONS[lang]??RESULT_TRANSLATIONS.en;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{let cancelled=false;(async()=>{
    try{
      const fileset=await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
      const modelAssetPath="https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
      let landmarker;
      try{
        landmarker=await FaceLandmarker.createFromOptions(fileset,{baseOptions:{modelAssetPath,delegate:"GPU"},outputFaceBlendshapes:true,runningMode:"VIDEO",numFaces:1});
      }catch{
        landmarker=await FaceLandmarker.createFromOptions(fileset,{baseOptions:{modelAssetPath,delegate:"CPU"},outputFaceBlendshapes:true,runningMode:"VIDEO",numFaces:1});
      }
      if(cancelled)return;
      landmarkerRef.current=landmarker;setModelsReady(true);
    }catch(err){console.error("Face landmarker load failed:",err);if(!cancelled)setStatus("error");}
  })();return()=>{cancelled=true;stopAll();};},[]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{if(!modelsReady)return;startCamera();},[modelsReady]);

  const startCamera=async()=>{
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{width:320,height:240,facingMode:"user"},audio:false});
      streamRef.current=stream;
      if(videoRef.current){
        videoRef.current.srcObject=stream;
        videoRef.current.onloadedmetadata=()=>{
          videoRef.current.play();setStatus("ready");
          windowStartRef.current=performance.now();
          detectionIntervalRef.current=setInterval(runDetection,DETECTION_INTERVAL_MS);
        };
      }
    }catch{setStatus("error");}
  };

  const runDetection=()=>{
    const video=videoRef.current,landmarker=landmarkerRef.current;
    if(!video||!landmarker||video.readyState<2)return;
    let result;
    try{result=landmarker.detectForVideo(video,performance.now());}catch{return;}
    if(result?.faceBlendshapes?.length>0){
      const map=blendshapesToMap(result.faceBlendshapes[0].categories);
      const{score}=calculateEngagement(map);
      const{label,confidence}=classifyEmotion(map);
      windowSamplesRef.current.push({score,label,confidence});
    }
    if(performance.now()-windowStartRef.current>=SAMPLE_WINDOW_MS){flushWindow();windowStartRef.current=performance.now();}
  };

  const flushWindow=()=>{
    const samples=windowSamplesRef.current;windowSamplesRef.current=[];
    if(samples.length===0)return;
    const avgScore=Math.round(samples.reduce((a,s)=>a+s.score,0)/samples.length);
    const counts={};samples.forEach(s=>{counts[s.label]=(counts[s.label]||0)+1;});
    const dominantLabel=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];
    const avgConfidence=samples.reduce((a,s)=>a+s.confidence,0)/samples.length;
    const mapped=EXPRESSION_MAP[dominantLabel]??EXPRESSION_MAP.neutral;
    onResult&&onResult({...mapped,rawName:dominantLabel,confidence:avgConfidence,engagementScore:avgScore});
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{
    if(!autoStart||!gameEnded||!modelsReady)return;
    clearInterval(detectionIntervalRef.current);
    flushWindow();
    setStatus("done");stopCamera();
    setTimeout(()=>onClose&&onClose(),1500);
  },[gameEnded,autoStart,modelsReady]);

  const stopCamera=()=>{if(streamRef.current){streamRef.current.getTracks().forEach(tr=>tr.stop());streamRef.current=null;}};
  const stopAll=()=>{clearInterval(detectionIntervalRef.current);stopCamera();};
  const handleClose=()=>{stopAll();onClose&&onClose();};

  // Video element is required for MediaPipe to read frames, but it's kept
  // completely invisible to the student — showing a live self-view during
  // gameplay pulls their attention onto their own face instead of the game,
  // which both hurts UX and contaminates the engagement signal we're trying
  // to measure (self-conscious reaction ≠ natural reaction). A tiny discreet
  // dot is the only visible sign that the camera is active, kept for
  // transparency/consent — the child (and any adult nearby) can always tell
  // recording is happening, without a distracting video window.
  return(
    <div style={{position:"fixed",bottom:16,right:16,zIndex:9998,pointerEvents:"none"}}>
      <video
        ref={videoRef} muted playsInline
        style={{position:"fixed",width:2,height:2,opacity:0,pointerEvents:"none",left:-9999}}
      />
      {status==="ready"&&(
        <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(17,17,17,0.85)",borderRadius:20,padding:"6px 10px",pointerEvents:"none"}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:"#ef4444",animation:"pulse 1.5s ease-in-out infinite",flexShrink:0}}/>
          <span style={{color:"#e5e7eb",fontSize:10,fontFamily:"inherit"}}>{t.cameraReady}</span>
        </div>
      )}
      {status==="loading"&&(
        <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(17,17,17,0.85)",borderRadius:20,padding:"6px 10px",pointerEvents:"none"}}>
          <div style={{width:10,height:10,border:"2px solid #333",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.8s linear infinite",flexShrink:0}}/>
          <span style={{color:"#9ca3af",fontSize:10}}>{t.loadingModels}</span>
        </div>
      )}
      {status==="error"&&(
        <button
          onClick={handleClose}
          style={{pointerEvents:"auto",display:"flex",alignItems:"center",gap:6,background:"rgba(127,29,29,0.9)",border:"none",borderRadius:20,padding:"6px 10px",cursor:"pointer"}}
        >
          <span style={{fontSize:12}}>📷</span>
          <span style={{color:"#fca5a5",fontSize:10}}>{t.close}</span>
        </button>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}`}</style>
    </div>
  );
}

const CAMERA_CONSENT_TRANSLATIONS={
  en:{
    title:"Track Your Reaction?",
    message:"Would you like to track your facial reaction while playing this game?",
    yes:"Yes",
    no:"No"
  },
  si:{
    title:"ඔබේ ප්‍රතික්‍රියාව නිරීක්ෂණය කරන්නද?",
    message:"මෙම ක්‍රීඩාව කරන අතරතුර ඔබේ මුහුණේ ප්‍රතික්‍රියාව නිරීක්ෂණය කිරීමට කැමතිද?",
    yes:"ඔව්",
    no:"නැහැ"
  },
  ta:{
    title:"உங்கள் எதிர்வினையை கண்காணிக்கவா?",
    message:"இந்த விளையாட்டை விளையாடும் போது உங்கள் முக எதிர்வினையை கண்காணிக்க விரும்புகிறீர்களா?",
    yes:"ஆம்",
    no:"இல்லை"
  },
};

function GameWithAutoCamera({
  children,
  onReaction,
  lang,
  gameId,
  onBackToLobby
}){
  const [gameEnded,setGameEnded]=useState(false);
  const [scannerActive,setScannerActive]=useState(false);

  // null = user has not answered yet
  // true = user selected Yes
  // false = user selected No
  const [consented,setConsented]=useState(null);

  const {
    difficultyModifier,
    activeIntervention,
    ingest,
    dismissIntervention,
    reset
  }=useAdaptiveLearning({gameId,lang});

  const handleResult=useCallback((reaction)=>{
    onReaction&&onReaction(reaction);

    ingest({
      engagementScore:reaction.engagementScore,
      rawName:reaction.rawName,
      confidence:reaction.confidence
    });
  },[onReaction,ingest]);

  const handleClose=useCallback(()=>{
    setScannerActive(false);
  },[]);

  const signalGameEnd=useCallback(()=>{
    setGameEnded(true);
  },[]);

  // YES
  const handleYes=useCallback(()=>{
    setConsented(true);
    setScannerActive(true);
    reset();
  },[reset]);

  // NO
  const handleNo=useCallback(()=>{
    setConsented(false);
    setScannerActive(false);
  },[]);

  const renderedChildren=
    typeof children==="function"
      ? children({
          signalGameEnd,
          adaptiveState:{
            difficultyModifier,
            activeIntervention
          }
        })
      : children;

  const ct=
    CAMERA_CONSENT_TRANSLATIONS[lang] ??
    CAMERA_CONSENT_TRANSLATIONS.en;

  return(
    <>
      {renderedChildren}

      {/* CAMERA CONSENT POPUP */}
      {consented===null&&(
        <div
          style={{
            position:"fixed",
            inset:0,
            zIndex:10000,
            background:"rgba(0,0,0,0.45)",
            backdropFilter:"blur(3px)",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            padding:"20px"
          }}
        >
          <div
            style={{
              width:"100%",
              maxWidth:"430px",
              background:"#fff",
              borderRadius:"24px",
              padding:"32px",
              boxShadow:"0 25px 60px rgba(0,0,0,0.25)",
              textAlign:"center",
              fontFamily:"inherit",
              animation:"cameraConsentPop .25s ease-out"
            }}
          >
            {/* Camera icon */}
            <div
              style={{
                width:"64px",
                height:"64px",
                borderRadius:"50%",
                background:"#f3f4f6",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                margin:"0 auto 18px",
                fontSize:"30px"
              }}
            >
              📷
            </div>

            <h2
              style={{
                fontSize:"22px",
                fontWeight:700,
                color:"#111",
                marginBottom:"10px"
              }}
            >
              {ct.title}
            </h2>

            <p
              style={{
                fontSize:"14px",
                lineHeight:1.6,
                color:"#6b7280",
                marginBottom:"26px"
              }}
            >
              {ct.message}
            </p>

            <div
              style={{
                display:"flex",
                gap:"12px"
              }}
            >
              {/* NO */}
              <button
                onClick={handleNo}
                style={{
                  flex:1,
                  padding:"13px 18px",
                  borderRadius:"14px",
                  border:"1px solid #e5e7eb",
                  background:"#fff",
                  color:"#374151",
                  fontSize:"14px",
                  fontWeight:600,
                  cursor:"pointer"
                }}
              >
                {ct.no}
              </button>

              {/* YES */}
              <button
                onClick={handleYes}
                style={{
                  flex:1,
                  padding:"13px 18px",
                  borderRadius:"14px",
                  border:"none",
                  background:"#111",
                  color:"#fff",
                  fontSize:"14px",
                  fontWeight:600,
                  cursor:"pointer"
                }}
              >
                {ct.yes}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes cameraConsentPop {
              from {
                opacity: 0;
                transform: scale(0.92);
              }

              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      )}

      {/* Start face scanner only after YES */}
      {scannerActive&&(
        <FaceReactionScanner
          lang={lang}
          autoStart={true}
          gameEnded={gameEnded}
          onResult={handleResult}
          onClose={handleClose}
        />
      )}

      <AdaptationOverlay
        intervention={activeIntervention}
        lang={lang}
        onDismiss={dismissIntervention}
        onSuggestSwitch={onBackToLobby}
      />
    </>
  );
}

function ResultScreen({score,maxScore,time,moves,questionCount,onRetry,onBack,onReaction,lang="en",capturedReaction=null}){
  const t=RESULT_TRANSLATIONS[lang]??RESULT_TRANSLATIONS.en;
  const pct=Math.round((score/Math.max(maxScore,1))*100),stars=pct>=80?3:pct>=50?2:1,msg=pct>=80?t.excellent:pct>=50?t.wellDone:t.keepPract;
  const[savedReaction,setSavedReaction]=useState(capturedReaction??null);
  useEffect(()=>{if(capturedReaction)setSavedReaction(capturedReaction);},[capturedReaction]);
  const reactionLabel=savedReaction?(lang==="si"?savedReaction.si:lang==="ta"?savedReaction.ta:savedReaction.en):"";
  return(
    <div className="max-w-lg mx-auto px-6 py-20 pt-24 anim-scale-in">
      <div className="rounded-3xl border border-gray-100 overflow-hidden shadow-2xl">
        <div className="bg-black text-white px-8 py-5 flex items-center justify-between"><span className="font-body text-xs text-gray-400 uppercase tracking-widest">{t.results}</span><button onClick={onRetry} className="font-body text-xs text-gray-400 hover:text-white transition-colors">{t.playAgain}</button></div>
        <div className="p-10 text-center">
          <div className="relative w-32 h-32 mx-auto mb-6"><svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8"/><circle cx="50" cy="50" r="42" fill="none" stroke="black" strokeWidth="8" strokeDasharray={`${pct*2.64} 264`} strokeLinecap="round" style={{transition:"stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1)"}}/></svg><div className="absolute inset-0 flex items-center justify-center"><span className="font-display text-3xl font-bold">{pct}%</span></div></div>
          <h3 className="font-display text-3xl font-bold mb-2">{msg}</h3>
          <div className="flex justify-center gap-2 my-4">{[0,1,2].map(i=>(<svg key={i} viewBox="0 0 24 24" className="w-8 h-8 transition-all duration-500" fill={i<stars?"#111":"#e5e7eb"} style={{transitionDelay:`${i*120}ms`}}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>))}</div>
          <div className="font-display text-6xl font-bold mb-1">{score}</div>
          <div className="font-body text-sm text-gray-400 mb-6">{t.pointsEarned}</div>
          <div className="flex gap-3 text-center text-xs text-gray-400 font-body justify-center mb-6">
            {time!==undefined&&<span className="border border-gray-100 rounded-xl px-4 py-2"><span className="block font-display text-xl text-black">{time}s</span>{t.time}</span>}
            {moves!==undefined&&<span className="border border-gray-100 rounded-xl px-4 py-2"><span className="block font-display text-xl text-black">{moves}</span>{t.moves}</span>}
            {questionCount!==undefined&&<span className="border border-gray-100 rounded-xl px-4 py-2"><span className="block font-display text-xl text-black">{questionCount}</span>{t.answered}</span>}
          </div>
          {savedReaction&&(<div className="flex items-center gap-3 mb-6 p-4 rounded-2xl border border-gray-100 bg-gray-50 anim-scale-in"><span style={{fontSize:36}}>{savedReaction.emoji}</span><div className="text-left"><p className="font-body text-xs text-gray-400 uppercase tracking-wider">{t.yourReaction}</p><p className="font-display text-lg font-bold">{reactionLabel}</p></div>{savedReaction.confidence&&<div className="ml-auto text-right"><p className="font-body text-xs text-gray-400">{t.confidence}</p><p className="font-display text-sm font-bold">{Math.round(savedReaction.confidence*100)}%</p></div>}</div>)}
          <div className="flex gap-3"><button onClick={onRetry} className="font-body flex-1 bg-black text-white py-3 rounded-2xl text-sm hover:bg-gray-900 transition-all hover:shadow-lg">{t.playAgain}</button><button onClick={onBack} className="font-body flex-1 border border-gray-200 text-gray-600 py-3 rounded-2xl text-sm hover:border-black hover:text-black transition-all">{t.allGames}</button></div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAME 1 — MEMORY MATCH
// Jungle / kids-card UI inspired by the supplied reference image.
// Game logic, scoring, auto camera, completion callback and ResultScreen
// behaviour are preserved; only the in-game presentation is redesigned.
// ═══════════════════════════════════════════════════════════════════
function MemoryMatchGame({letters,onComplete,onBack,lang,onReaction}){
  const PAIRS=6;

  const makeCards=()=>{
    const chosen=pickN(letters,PAIRS);
    return shuffle([
      ...chosen.map((l,i)=>({uid:`L${i}`,type:"letter",content:l.letter,matchId:i})),
      ...chosen.map((l,i)=>({uid:`N${i}`,type:"name",content:l.name,matchId:i})),
    ]);
  };

  const[cards,setCards]=useState(makeCards);
  const[flipped,setFlipped]=useState([]);
  const[matched,setMatched]=useState(new Set());
  const[moves,setMoves]=useState(0);
  const[score,setScore]=useState(0);
  const[timer,setTimer]=useState(0);
  const[done,setDone]=useState(false);
  const[wrongPair,setWrongPair]=useState([]);
  const[mergeCards,setMergeCards]=useState(null);
  const cardRefs=useRef({});
  const capturedReactionRef=useRef(null),lockRef=useRef(false);

  useEffect(()=>{
    if(done)return;
    const id=setInterval(()=>setTimer(t=>t+1),1000);
    return()=>clearInterval(id);
  },[done]);

  // Memory Match feedback only:
  // - correct pair: short happy chime
  // - wrong pair: device vibration where the browser/device supports it
  const playCorrectMatchSound=()=>{
    try{
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(!AudioCtx)return;
      const ctx=new AudioCtx();
      const now=ctx.currentTime;

      const master=ctx.createGain();
      master.gain.setValueAtTime(0.0001,now);
      master.gain.exponentialRampToValueAtTime(0.22,now+0.04);
      master.gain.setValueAtTime(0.22,now+0.9);
      master.gain.exponentialRampToValueAtTime(0.0001,now+1.45);
      master.connect(ctx.destination);

      const playTone=(frequency,start,duration,volume,type="sine")=>{
        const osc=ctx.createOscillator();
        const gain=ctx.createGain();

        osc.type=type;
        osc.frequency.setValueAtTime(frequency,now+start);

        gain.gain.setValueAtTime(0.0001,now+start);
        gain.gain.exponentialRampToValueAtTime(volume,now+start+0.035);
        gain.gain.setValueAtTime(volume,now+start+Math.max(0.05,duration-0.16));
        gain.gain.exponentialRampToValueAtTime(0.0001,now+start+duration);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now+start);
        osc.stop(now+start+duration+0.03);
      };

      // Longer, softer success melody (~1.5s) instead of a short beep.
      playTone(523.25,0.00,0.42,0.55,"sine");      // C5
      playTone(659.25,0.18,0.46,0.50,"sine");      // E5
      playTone(783.99,0.38,0.50,0.46,"sine");      // G5
      playTone(1046.50,0.62,0.62,0.38,"triangle"); // C6
      playTone(783.99,0.88,0.48,0.24,"sine");      // G5 tail

      setTimeout(()=>{try{ctx.close();}catch{}},1800);
    }catch{
      // Sound is optional; silently continue if browser audio is unavailable.
    }
  };

  const vibrateWrongMatch=()=>{
    try{
      if(typeof navigator!=="undefined"&&typeof navigator.vibrate==="function"){
        navigator.vibrate([120,70,120]);
      }
    }catch{
      // Vibration is optional; silently continue if unsupported.
    }
  };

  const handleClick=(idx,signalGameEnd)=>{
    if(lockRef.current)return;
    const card=cards[idx];
    if(flipped.includes(idx)||matched.has(card.matchId)||flipped.length===2)return;

    const next=[...flipped,idx];
    setFlipped(next);

    if(next.length===2){
      lockRef.current=true;
      setMoves(m=>m+1);
      const[a,b]=next;

      if(cards[a].matchId===cards[b].matchId){
        playCorrectMatchSound();

        const rectA=cardRefs.current[a]?.getBoundingClientRect?.();
        const rectB=cardRefs.current[b]?.getBoundingClientRect?.();
        if(rectA&&rectB){
          setMergeCards([
            {card:cards[a],rect:{left:rectA.left,top:rectA.top,width:rectA.width,height:rectA.height},side:-1},
            {card:cards[b],rect:{left:rectB.left,top:rectB.top,width:rectB.width,height:rectB.height},side:1},
          ]);
          setTimeout(()=>setMergeCards(null),900);
        }

        const nm=new Set([...matched,cards[a].matchId]);
        setMatched(nm);
        setScore(s=>s+20);
        setFlipped([]);
        lockRef.current=false;

        if(nm.size===PAIRS){
          signalGameEnd&&signalGameEnd();
          setTimeout(()=>{
            setDone(true);
            onComplete(score+20,{timeSeconds:timer,movesCount:moves+1});
          },900);
        }
      }else{
        vibrateWrongMatch();
        setWrongPair([a,b]);
        setTimeout(()=>{
          setFlipped([]);
          setWrongPair([]);
          lockRef.current=false;
        },1000);
      }
    }
  };

  const restart=()=>{
    setCards(makeCards());
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setScore(0);
    setTimer(0);
    setDone(false);
    setWrongPair([]);
    setMergeCards(null);
    capturedReactionRef.current=null;
    lockRef.current=false;
  };

  const handleAutoReaction=useCallback((reaction)=>{
    capturedReactionRef.current=reaction;
    onReaction&&onReaction(reaction);
  },[onReaction]);

  if(done)return(
    <ResultScreen
      score={score}
      maxScore={PAIRS*20}
      time={timer}
      moves={moves}
      onRetry={restart}
      onBack={onBack}
      lang={lang}
      onReaction={onReaction}
      capturedReaction={capturedReactionRef.current}
    />
  );

  const gl={
    en:{
      back:"← Back",
      title:"Memory Match",
      hint:"Match the same letter and its name!",
      time:"Time",
      pairs:"Pairs found",
      moves:"Moves",
      footer:"Match the cards and sharpen your memory!",
    },
    si:{
      back:"← ආපසු",
      title:"මතක ගැලපීම",
      hint:"අකුර සහ එහි නම ගැලපෙන යුගල සොයන්න!",
      time:"වේලාව",
      pairs:"හමු වූ යුගල",
      moves:"චලන",
      footer:"සෙල්ලම් කර අකුරු මතකයේ තබා ගන්න!",
    },
    ta:{
      back:"← பின்னால்",
      title:"நினைவக பொருத்தம்",
      hint:"எழுத்தையும் அதன் பெயரையும் பொருத்துங்கள்!",
      time:"நேரம்",
      pairs:"கண்ட ஜோடிகள்",
      moves:"நகர்வுகள்",
      footer:"அட்டைகளை பொருத்தி நினைவாற்றலை வளர்த்துக் கொள்ளுங்கள்!",
    },
  }[lang]??{
    back:"← Back",
    title:"Memory Match",
    hint:"Match the same letter and its name!",
    time:"Time",
    pairs:"Pairs found",
    moves:"Moves",
    footer:"Match the cards and sharpen your memory!",
  };

  const formatTime=(seconds)=>{
    const m=Math.floor(seconds/60).toString().padStart(2,"0");
    const s=(seconds%60).toString().padStart(2,"0");
    return `${m}:${s}`;
  };

  const frontPalette=["#ef2f66","#1280c9","#5aaf22","#9228c7","#f07820","#e83f96"];

  const StatWood=({icon,label,value})=>(
    <div className="mm-wood-stat">
      <div className="mm-stat-icon" aria-hidden="true">{icon}</div>
      <div className="mm-stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );

  return(
    <GameWithAutoCamera
      onReaction={handleAutoReaction}
      lang={lang}
      gameId="memory-match"
      onBackToLobby={onBack}
    >
      {({signalGameEnd})=>(
        <div className="mm-scene">
          <style>{`
            .mm-scene{
              min-height:100vh;
              padding:76px 18px 24px;
              position:relative;
              overflow:hidden;
              background:
                radial-gradient(circle at 15% 22%,rgba(255,235,74,.45) 0 3%,transparent 9%),
                radial-gradient(circle at 86% 18%,rgba(92,225,255,.30) 0 4%,transparent 12%),
                linear-gradient(180deg,#69cbea 0%,#5bc0ca 13%,#3d9c72 35%,#1e6e3c 64%,#0f4d2f 100%);
              font-family:${SINHALA_FONT};
            }
            .mm-scene:before{
              content:"";
              position:absolute;
              inset:0;
              pointer-events:none;
              background:
                radial-gradient(ellipse at 6% 48%,rgba(24,101,39,.88) 0 8%,transparent 24%),
                radial-gradient(ellipse at 94% 44%,rgba(17,91,34,.88) 0 9%,transparent 25%),
                linear-gradient(90deg,rgba(8,68,31,.82),transparent 18%,transparent 82%,rgba(8,68,31,.82));
              opacity:.92;
            }
            .mm-canopy{
              position:absolute;
              left:-3%;right:-3%;top:54px;height:175px;
              pointer-events:none;
              background:
                radial-gradient(circle at 4% 42%,#1f7b32 0 44px,transparent 46px),
                radial-gradient(circle at 12% 18%,#2b9638 0 52px,transparent 54px),
                radial-gradient(circle at 22% 34%,#187c35 0 58px,transparent 60px),
                radial-gradient(circle at 34% 8%,#42a83e 0 62px,transparent 64px),
                radial-gradient(circle at 49% 27%,#247f30 0 62px,transparent 64px),
                radial-gradient(circle at 64% 8%,#3ca13b 0 58px,transparent 60px),
                radial-gradient(circle at 77% 34%,#207d32 0 60px,transparent 62px),
                radial-gradient(circle at 90% 16%,#39a33c 0 52px,transparent 54px),
                radial-gradient(circle at 98% 44%,#1d7932 0 46px,transparent 48px);
              filter:drop-shadow(0 12px 13px rgba(16,79,27,.28));
              opacity:.96;
            }
            .mm-flower-bed{
              position:absolute;
              left:0;right:0;bottom:0;height:124px;
              pointer-events:none;
              background:
                radial-gradient(circle at 5% 70%,#f34c80 0 8px,#ffd34d 9px 12px,transparent 13px),
                radial-gradient(circle at 13% 84%,#8b5cf6 0 8px,#ffd34d 9px 12px,transparent 13px),
                radial-gradient(circle at 24% 68%,#ff7c42 0 8px,#ffe36a 9px 12px,transparent 13px),
                radial-gradient(circle at 76% 80%,#4b8df8 0 8px,#ffd54e 9px 12px,transparent 13px),
                radial-gradient(circle at 88% 67%,#ef476f 0 8px,#ffd54e 9px 12px,transparent 13px),
                radial-gradient(circle at 96% 84%,#a855f7 0 8px,#ffd54e 9px 12px,transparent 13px),
                linear-gradient(0deg,#0b532b 0%,#17713a 44%,transparent 45%);
              opacity:.98;
            }
            .mm-deco{
              position:absolute;
              z-index:2;
              user-select:none;
              pointer-events:none;
              filter:drop-shadow(0 4px 3px rgba(0,0,0,.22));
              animation:mmFloat 4.8s ease-in-out infinite;
            }
            .mm-butterfly{right:4%;top:82px;font-size:42px;animation-delay:.5s;}
            .mm-flower-left{left:2.5%;top:35%;font-size:42px;animation-delay:1s;}
            .mm-flower-right{right:2.5%;top:34%;font-size:42px;animation-delay:.2s;}
            .mm-owl{left:2%;bottom:104px;font-size:88px;transform-origin:center bottom;animation:mmOwl 3.4s ease-in-out infinite;}
            .mm-trophy{right:2.5%;bottom:92px;font-size:82px;animation-delay:.8s;}
            @keyframes mmFloat{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-9px) rotate(3deg)}}
            @keyframes mmOwl{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg) translateY(-4px)}}

            .mm-shell{
              position:relative;
              z-index:4;
              width:min(1080px,94vw);
              margin:0 auto;
            }
            .mm-topbar{
              display:grid;
              grid-template-columns:1fr auto 1fr;
              align-items:center;
              gap:12px;
              margin-bottom:12px;
            }
            .mm-back{
              justify-self:start;
              border:2px solid rgba(255,255,255,.78);
              color:#fff;
              background:rgba(22,85,44,.72);
              box-shadow:0 5px 0 rgba(8,69,31,.45),0 8px 18px rgba(0,0,0,.18);
              backdrop-filter:blur(6px);
              border-radius:18px;
              padding:9px 15px;
              font-size:13px;
              font-weight:800;
              cursor:pointer;
              transition:.2s ease;
            }
            .mm-back:hover{transform:translateY(-2px);background:rgba(20,99,48,.88)}
            .mm-title{
              color:white;
              text-align:center;
              font-weight:900;
              font-size:clamp(18px,2.6vw,31px);
              text-shadow:0 3px 0 #155e35,0 5px 10px rgba(0,0,0,.35);
              letter-spacing:.01em;
            }
            .mm-score-pill{
              justify-self:end;
              color:#fff7c3;
              font-weight:900;
              background:rgba(99,55,10,.78);
              border:2px solid rgba(255,224,135,.72);
              padding:8px 13px;
              border-radius:16px;
              box-shadow:0 5px 0 rgba(64,34,4,.45);
              white-space:nowrap;
            }
            .mm-hint{
              width:max-content;
              max-width:92%;
              margin:0 auto 14px;
              padding:7px 20px;
              border-radius:999px;
              color:#f9fff2;
              background:rgba(25,101,50,.68);
              border:1px solid rgba(255,255,255,.5);
              text-align:center;
              font-size:13px;
              font-weight:700;
              text-shadow:0 2px 3px rgba(0,0,0,.28);
              box-shadow:0 6px 16px rgba(0,0,0,.12);
              backdrop-filter:blur(5px);
            }
            .mm-board{
              padding:12px;
              border-radius:30px;
              background:rgba(239,255,212,.12);
              border:2px solid rgba(229,255,190,.26);
              box-shadow:inset 0 0 30px rgba(255,255,255,.08),0 14px 40px rgba(3,54,30,.18);
              backdrop-filter:blur(2px);
            }
            .mm-grid{
              display:grid;
              grid-template-columns:repeat(6,minmax(0,1fr));
              gap:12px;
            }
            .mm-card{
              appearance:none;
              border:none;
              padding:0;
              background:transparent;
              cursor:pointer;
              aspect-ratio:.82/1;
              perspective:900px;
              min-width:0;
              border-radius:19px;
              transition:transform .2s ease,filter .2s ease;
            }
            .mm-card:hover:not(:disabled){transform:translateY(-4px) scale(1.025);filter:brightness(1.04)}
            .mm-card:disabled{cursor:default;}
            .mm-card-inner{
              display:block;
              width:100%;height:100%;
              position:relative;
              transform-style:preserve-3d;
              transition:transform .46s cubic-bezier(.2,.78,.25,1.08);
            }
            .mm-card.is-flipped .mm-card-inner{transform:rotateY(180deg)}
            .mm-face{
              position:absolute;
              inset:0;
              border-radius:19px;
              backface-visibility:hidden;
              overflow:hidden;
              display:flex;
              align-items:center;
              justify-content:center;
              border:4px solid #fff8d8;
              box-shadow:
                0 5px 0 #bb8f2a,
                0 8px 12px rgba(0,0,0,.22),
                inset 0 0 0 2px rgba(255,255,255,.48);
            }
            .mm-back-face{
              background:
                radial-gradient(circle at 22% 25%,rgba(255,255,255,.15) 0 3px,transparent 4px),
                radial-gradient(circle at 75% 70%,rgba(255,255,255,.10) 0 4px,transparent 5px),
                linear-gradient(145deg,#38a8ec 0%,#1379c9 54%,#1168b3 100%);
            }
            .mm-back-face:before{
              content:"★";
              color:#0870c5;
              -webkit-text-stroke:2px #5ac5ff;
              font-size:clamp(40px,5.2vw,70px);
              line-height:1;
              text-shadow:0 4px 0 rgba(0,64,130,.35);
            }
            .mm-back-face:after{
              content:"";
              position:absolute;
              inset:8px;
              border-radius:13px;
              border:1px solid rgba(255,255,255,.22);
              pointer-events:none;
            }
            .mm-front-face{
              transform:rotateY(180deg);
              background:
                radial-gradient(circle at 15% 20%,rgba(255,255,255,.30) 0 9px,transparent 10px),
                radial-gradient(circle at 85% 75%,rgba(255,173,47,.18) 0 15px,transparent 16px),
                linear-gradient(145deg,#fffbd0 0%,#ffe77a 54%,#ffd34d 100%);
            }
            .mm-front-face:after{
              content:"";
              position:absolute;
              inset:8px;
              border-radius:13px;
              border:1px solid rgba(255,255,255,.55);
              pointer-events:none;
            }
            .mm-card-text{
              position:relative;
              z-index:1;
              padding:8px;
              max-width:100%;
              text-align:center;
              font-family:${SINHALA_FONT};
              font-weight:900;
              line-height:1.12;
              color:var(--mm-card-color,#e83261);
              -webkit-text-stroke:1px rgba(255,255,255,.95);
              paint-order:stroke fill;
              text-shadow:0 3px 0 rgba(104,64,0,.18),0 4px 8px rgba(86,54,0,.18);
              overflow-wrap:anywhere;
            }
            .mm-card-text.letter{font-size:clamp(38px,5.2vw,69px)}
            .mm-card-text.name{font-size:clamp(17px,2.1vw,29px)}
            .mm-card.is-matched .mm-front-face{
              box-shadow:0 5px 0 #4e9f29,0 0 0 4px #a6ef67,0 9px 18px rgba(0,0,0,.22),inset 0 0 22px rgba(132,255,72,.22);
              animation:mmMatched .56s ease both;
            }
            .mm-card.is-wrong .mm-front-face{animation:mmWrong .36s ease-in-out 2;box-shadow:0 5px 0 #b94e31,0 0 0 4px #ff8b6d,0 9px 18px rgba(0,0,0,.22)}
            @keyframes mmMatched{0%{transform:rotateY(180deg) scale(.9)}65%{transform:rotateY(180deg) scale(1.08)}100%{transform:rotateY(180deg) scale(1)}}
            @keyframes mmWrong{0%,100%{transform:rotateY(180deg) translateX(0)}25%{transform:rotateY(180deg) translateX(-5px)}75%{transform:rotateY(180deg) translateX(5px)}}

            .mm-merge-layer{
              position:fixed;
              inset:0;
              z-index:9997;
              pointer-events:none;
              overflow:hidden;
            }
            .mm-merge-card{
              position:fixed;
              margin:0;
              border:0;
              padding:0;
              background:transparent;
              perspective:900px;
              border-radius:19px;
              animation:mmMergeToCenter .88s cubic-bezier(.22,.8,.2,1) forwards;
              will-change:transform,opacity;
            }
            .mm-merge-card .mm-card-inner{
              transform:rotateY(180deg);
            }
            .mm-merge-card .mm-front-face{
              box-shadow:
                0 5px 0 #4e9f29,
                0 0 0 4px #a6ef67,
                0 10px 22px rgba(0,0,0,.26),
                inset 0 0 22px rgba(132,255,72,.22);
            }
            @keyframes mmMergeToCenter{
              0%{
                opacity:1;
                transform:translate3d(0,0,0) scale(1);
              }
              58%{
                opacity:1;
                transform:
                  translate3d(var(--mm-move-x),var(--mm-move-y),0)
                  scale(1.06);
              }
              72%{
                opacity:1;
                transform:
                  translate3d(var(--mm-move-x),var(--mm-move-y),0)
                  scale(.96);
              }
              100%{
                opacity:0;
                transform:
                  translate3d(var(--mm-move-x),var(--mm-move-y),0)
                  scale(.18);
              }
            }

            .mm-stats{
              position:relative;
              z-index:5;
              display:flex;
              justify-content:center;
              gap:15px;
              margin:16px auto 12px;
              flex-wrap:wrap;
            }
            .mm-wood-stat{
              min-width:176px;
              height:76px;
              display:flex;
              align-items:center;
              gap:11px;
              padding:8px 16px 8px 11px;
              color:#fff;
              border:3px solid #6c3a0b;
              border-radius:15px;
              background:
                repeating-linear-gradient(0deg,rgba(92,44,5,.18) 0 2px,transparent 2px 17px),
                linear-gradient(90deg,#9a5516,#c17824 18%,#a95d16 52%,#c87924 82%,#8f4b11);
              box-shadow:inset 0 2px 0 rgba(255,226,150,.36),0 6px 0 #5d330b,0 9px 14px rgba(0,0,0,.26);
              text-shadow:0 2px 2px rgba(59,27,0,.5);
            }
            .mm-stat-icon{
              width:52px;height:52px;
              flex:0 0 52px;
              display:flex;
              align-items:center;
              justify-content:center;
              border-radius:50%;
              font-size:31px;
              background:linear-gradient(145deg,#fff8c8,#ffd14a);
              border:3px solid #70400c;
              box-shadow:inset 0 2px 0 #fff,0 3px 0 rgba(70,37,4,.45);
              text-shadow:none;
            }
            .mm-stat-copy{display:flex;flex-direction:column;line-height:1.05;min-width:0;}
            .mm-stat-copy span{font-size:11px;font-weight:800;color:#ffe7aa;white-space:nowrap;}
            .mm-stat-copy strong{font-family:Arial,sans-serif;font-size:25px;letter-spacing:.02em;color:#fff;white-space:nowrap;}

            .mm-ribbon-wrap{
              position:relative;
              z-index:5;
              width:min(700px,82vw);
              margin:9px auto 0;
              filter:drop-shadow(0 6px 3px rgba(0,0,0,.3));
            }
            .mm-ribbon{
              position:relative;
              padding:12px 28px;
              color:#fff;
              text-align:center;
              font-size:clamp(16px,2.2vw,24px);
              font-weight:900;
              border:3px solid #4e136c;
              border-radius:8px;
              background:linear-gradient(180deg,#8e2ac6,#6d159d 55%,#59117f);
              text-shadow:0 2px 0 #3c095a;
              box-shadow:inset 0 2px 0 rgba(255,255,255,.22);
            }
            .mm-ribbon:before,.mm-ribbon:after{
              content:"";
              position:absolute;
              top:9px;
              width:42px;height:calc(100% - 3px);
              background:#57117e;
              border:2px solid #3e085e;
              z-index:-1;
            }
            .mm-ribbon:before{left:-31px;transform:skewY(16deg)}
            .mm-ribbon:after{right:-31px;transform:skewY(-16deg)}

            @media(max-width:980px){
              .mm-scene{padding-top:72px;padding-bottom:18px;}
              .mm-shell{width:min(850px,96vw)}
              .mm-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;}
              .mm-owl,.mm-trophy{font-size:58px;opacity:.9}
              .mm-wood-stat{min-width:160px;height:68px}
            }
            @media(max-width:640px){
              .mm-scene{padding:68px 10px 18px;overflow:auto;}
              .mm-topbar{grid-template-columns:auto 1fr auto;gap:6px;}
              .mm-title{font-size:17px;}
              .mm-back{padding:7px 10px;font-size:11px;}
              .mm-score-pill{padding:7px 9px;font-size:11px;}
              .mm-hint{font-size:11px;margin-bottom:9px;padding:6px 12px;}
              .mm-board{padding:9px;border-radius:20px;}
              .mm-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;}
              .mm-card{border-radius:14px;}
              .mm-face{border-width:3px;border-radius:14px;}
              .mm-card-text.letter{font-size:38px}
              .mm-card-text.name{font-size:16px}
              .mm-stats{gap:8px;margin-top:12px;}
              .mm-wood-stat{min-width:0;width:31%;height:60px;padding:6px 7px;gap:6px;border-width:2px;}
              .mm-stat-icon{width:38px;height:38px;flex-basis:38px;font-size:22px;border-width:2px;}
              .mm-stat-copy span{font-size:8px;}
              .mm-stat-copy strong{font-size:18px;}
              .mm-ribbon-wrap{width:82vw;margin-top:9px;}
              .mm-ribbon{padding:10px 10px;font-size:14px;}
              .mm-owl,.mm-trophy,.mm-flower-left,.mm-flower-right{display:none;}
              .mm-butterfly{font-size:28px;right:2%;top:74px;}
            }
          `}</style>

          <div className="mm-canopy" aria-hidden="true"/>
          <div className="mm-flower-bed" aria-hidden="true"/>
          <div className="mm-deco mm-butterfly" aria-hidden="true">🦋</div>
          <div className="mm-deco mm-flower-left" aria-hidden="true">🌺</div>
          <div className="mm-deco mm-flower-right" aria-hidden="true">🌸</div>
          <div className="mm-deco mm-owl" aria-hidden="true">🦉</div>
          <div className="mm-deco mm-trophy" aria-hidden="true">🏆</div>

          {mergeCards&&(
            <div className="mm-merge-layer" aria-hidden="true">
              {mergeCards.map(({card,rect,side},i)=>{
                const textColor=frontPalette[card.matchId%frontPalette.length];
                const targetLeft=(window.innerWidth/2)-(rect.width/2)+(side*rect.width*.18);
                const targetTop=(window.innerHeight/2)-(rect.height/2);
                return(
                  <div
                    key={`${card.uid}-${i}`}
                    className="mm-merge-card"
                    style={{
                      left:rect.left,
                      top:rect.top,
                      width:rect.width,
                      height:rect.height,
                      "--mm-move-x":`${targetLeft-rect.left}px`,
                      "--mm-move-y":`${targetTop-rect.top}px`,
                    }}
                  >
                    <span className="mm-card-inner">
                      <span className="mm-face mm-back-face"/>
                      <span className="mm-face mm-front-face">
                        <span
                          className={`mm-card-text ${card.type==="letter"?"letter":"name"}`}
                          style={{"--mm-card-color":textColor}}
                        >
                          {card.content}
                        </span>
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mm-shell">
            <div className="mm-topbar">
              <button className="mm-back" onClick={onBack}>{gl.back}</button>
              <div className="mm-title">{gl.title}</div>
              <div className="mm-score-pill">⭐ {score}</div>
            </div>

            <div className="mm-hint">{gl.hint}</div>

            <div className="mm-board">
              <div className="mm-grid">
                {cards.map((card,idx)=>{
                  const isMatched=matched.has(card.matchId);
                  if(isMatched)return null;

                  const isFlipped=flipped.includes(idx);
                  const isWrong=wrongPair.includes(idx);
                  const textColor=frontPalette[card.matchId%frontPalette.length];

                  return(
                    <button
                      key={card.uid}
                      ref={el=>{if(el)cardRefs.current[idx]=el;else delete cardRefs.current[idx];}}
                      type="button"
                      onClick={()=>handleClick(idx,signalGameEnd)}
                      aria-label={isFlipped?card.content:"Hidden memory card"}
                      className={`mm-card ${isFlipped?"is-flipped":""} ${isWrong?"is-wrong":""}`}
                    >
                      <span className="mm-card-inner">
                        <span className="mm-face mm-back-face"/>
                        <span className="mm-face mm-front-face">
                          <span
                            className={`mm-card-text ${card.type==="letter"?"letter":"name"}`}
                            style={{"--mm-card-color":textColor}}
                          >
                            {card.content}
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mm-stats">
              <StatWood icon="⏱️" label={gl.time} value={formatTime(timer)}/>
              <StatWood icon="⭐" label={gl.pairs} value={`${String(matched.size).padStart(2,"0")} / ${String(PAIRS).padStart(2,"0")}`}/>
              <StatWood icon="💡" label={gl.moves} value={String(moves).padStart(2,"0")}/>
            </div>

            <div className="mm-ribbon-wrap">
              <div className="mm-ribbon">{gl.footer}</div>
            </div>
          </div>
        </div>
      )}
    </GameWithAutoCamera>
  );
}


// ═══════════════════════════════════════════════════════════════════
// SHARED KIDS ADVENTURE THEME — Games 2–8
// Keeps each game's original logic, scoring, timers, DB data and camera flow.
// Only the visual layer is changed to match the colourful Memory Match style.
// ═══════════════════════════════════════════════════════════════════
const KIDS_ADVENTURE_CSS = `
  .kids-game{
    --kg-accent:#f59e0b;
    --kg-deep:#14532d;
    --kg-light:#fef3c7;
    position:relative;
    min-height:100vh;
    overflow:hidden;
    isolation:isolate;
    background:
      radial-gradient(circle at 15% 14%,rgba(255,236,111,.58) 0 5%,transparent 16%),
      radial-gradient(circle at 82% 10%,rgba(89,214,255,.55) 0 7%,transparent 18%),
      radial-gradient(circle at 50% 38%,rgba(255,255,255,.18),transparent 34%),
      linear-gradient(180deg,#55cbe8 0%,#65c998 31%,#238b4e 62%,#0b5f31 100%);
    font-family:'Noto Sans Sinhala','Iskoola Pota',system-ui,sans-serif;
  }
  .kids-game:before,.kids-game:after{
    position:fixed;z-index:0;pointer-events:none;filter:drop-shadow(0 8px 8px rgba(0,0,0,.22));
    animation:kgFloat 4.8s ease-in-out infinite;
  }
  .kids-game:before{content:'🌳';font-size:clamp(70px,9vw,145px);left:1.2%;bottom:5%;}
  .kids-game:after{content:'🏆';font-size:clamp(54px,7vw,104px);right:2.2%;bottom:6%;animation-delay:.7s;}
  .kids-speed:after{content:'⚡';}.kids-hunt:after{content:'🔎';}.kids-puzzle:after{content:'🧩';}
  .kids-builder:after{content:'🧱';}.kids-unscramble:after{content:'🔤';}.kids-missing:after{content:'❓';}.kids-connect:after{content:'🔗';}
  .kids-game > *{position:relative;z-index:2;}
  /* Top game header — same visual language as Memory Match */
  .kids-game > .border-b{
    width:min(1080px,94vw)!important;
    max-width:none!important;
    margin:14px auto 0!important;
    border:0!important;
    border-radius:0!important;
    background:transparent!important;
    background-color:transparent!important;
    background-image:none!important;
    box-shadow:none!important;
    backdrop-filter:none!important;
    -webkit-backdrop-filter:none!important;
    position:relative!important;
    top:auto!important;
    overflow:visible!important;
  }
  /* Force the shared game header strip itself to stay fully transparent.
     Buttons/stat pills keep their own backgrounds. */
  .kids-game > div.border-b.bg-white,
  .kids-game > div.border-b.sticky,
  .kids-game > div.border-b{
    background:transparent!important;
    background-color:transparent!important;
    background-image:none!important;
    border-color:transparent!important;
    box-shadow:none!important;
  }
  .kids-game > .border-b > div{
    width:100%!important;
    max-width:none!important;
    margin:0!important;
    padding:0!important;
    display:grid!important;
    grid-template-columns:1fr auto 1fr!important;
    align-items:center!important;
    gap:12px!important;
  }
  .kids-game > .border-b button{
    justify-self:start!important;
    border:2px solid rgba(255,255,255,.78)!important;
    color:#fff!important;
    background:rgba(22,85,44,.72)!important;
    box-shadow:0 5px 0 rgba(8,69,31,.45),0 8px 18px rgba(0,0,0,.18)!important;
    backdrop-filter:blur(6px)!important;
    border-radius:18px!important;
    padding:9px 15px!important;
    font-size:13px!important;
    font-weight:800!important;
    text-shadow:0 2px 2px rgba(0,0,0,.35)!important;
    white-space:nowrap!important;
  }
  .kids-game > .border-b button:hover{
    transform:translateY(-2px)!important;
    background:rgba(20,99,48,.88)!important;
  }
  .kids-game > .border-b > div > span{
    justify-self:center!important;
    color:#fff!important;
    text-align:center!important;
    font-weight:900!important;
    font-size:clamp(18px,2.6vw,31px)!important;
    line-height:1.1!important;
    letter-spacing:.01em!important;
    text-transform:none!important;
    text-shadow:0 3px 0 #155e35,0 5px 10px rgba(0,0,0,.35)!important;
    white-space:nowrap!important;
  }
  .kids-game > .border-b > div > div{
    justify-self:end!important;
    display:flex!important;
    align-items:center!important;
    gap:10px!important;
    color:#fff7c3!important;
    font-weight:900!important;
    background:rgba(99,55,10,.78)!important;
    border:2px solid rgba(255,224,135,.72)!important;
    padding:8px 13px!important;
    border-radius:16px!important;
    box-shadow:0 5px 0 rgba(64,34,4,.45)!important;
    white-space:nowrap!important;
  }
  .kids-game > .border-b > div > div span{
    color:#fff7c3!important;
    text-shadow:0 2px 2px rgba(0,0,0,.35)!important;
    font-weight:900!important;
  }
  @media(max-width:760px){
    .kids-game > .border-b{width:96vw!important;}
    .kids-game > .border-b > div{grid-template-columns:auto 1fr auto!important;gap:6px!important;}
    .kids-game > .border-b button{padding:7px 10px!important;font-size:11px!important;}
    .kids-game > .border-b > div > span{font-size:17px!important;}
    .kids-game > .border-b > div > div{padding:7px 9px!important;font-size:11px!important;gap:6px!important;}
  }
  .kids-game > .max-w-2xl,.kids-game > .max-w-3xl,.kids-game > .max-w-xl,.kids-game > .max-w-6xl{
    background:linear-gradient(180deg,rgba(255,255,255,.25),rgba(255,255,255,.12));
    border:2px solid rgba(255,255,255,.32);border-radius:34px;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 16px 42px rgba(5,70,36,.2);
    backdrop-filter:blur(4px);margin-top:24px;margin-bottom:100px;
  }
  .kids-game .bg-gray-50{background:linear-gradient(145deg,#fff7c7,#ffe08a)!important;}
  .kids-game .bg-white{background:linear-gradient(145deg,#fffdf2,#fff5c7)!important;}
  .kids-game .border-gray-100,.kids-game .border-gray-200,.kids-game .border-gray-300{border-color:#f0c45f!important;}
  .kids-game .text-gray-300,.kids-game .text-gray-400{color:#49675a!important;}
  .kids-game .bg-black{background:linear-gradient(180deg,#2faa59,#14723a)!important;color:white!important;border-color:#0d5d31!important;}
  .kids-game .rounded-3xl{box-shadow:0 7px 0 rgba(112,69,18,.22),0 14px 24px rgba(0,0,0,.10);}
  .kids-game .rounded-2xl{box-shadow:0 4px 0 rgba(120,78,25,.16);}
  .kids-game button{font-family:'Noto Sans Sinhala','Iskoola Pota',system-ui,sans-serif;}
  .kids-game button:not(:disabled){transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;}
  .kids-game button:not(:disabled):hover{transform:translateY(-2px) scale(1.015);filter:saturate(1.08);}
  .kids-game button:not(:disabled):active{transform:translateY(2px) scale(.99);}

  /* SPEED QUIZ — bright quiz-show board */
  .kids-speed{
    --kg-accent:#ff9f1c;
    background:
      radial-gradient(circle at 16% 13%,rgba(255,255,255,.52) 0 5%,transparent 17%),
      radial-gradient(circle at 84% 11%,rgba(255,232,105,.50) 0 7%,transparent 19%),
      radial-gradient(circle at 52% 39%,rgba(255,255,255,.16),transparent 35%),
      linear-gradient(180deg,#64d7ff 0%,#4ebcf1 28%,#7896ee 58%,#6554c8 100%);
  }
  .kids-speed > .max-w-2xl > .rounded-3xl{background:linear-gradient(145deg,#fff4a8,#ffd85f)!important;border:4px solid #fff0ad!important;box-shadow:0 8px 0 #cb8a19,0 16px 28px rgba(75,45,8,.2)!important;}
  .kids-speed > .max-w-2xl .grid button{background:linear-gradient(145deg,#2d9cff,#0c6ec7)!important;color:white!important;border:3px solid #bfe7ff!important;box-shadow:0 6px 0 #075ca9,0 10px 20px rgba(0,0,0,.14)!important;text-shadow:0 2px 1px rgba(0,0,0,.25);}
  .kids-speed > .max-w-2xl .grid button:nth-child(2n){background:linear-gradient(145deg,#2d9cff,#0c6ec7)!important;border-color:#bfe7ff!important;box-shadow:0 6px 0 #075ca9,0 10px 20px rgba(0,0,0,.14)!important;}
  .kids-speed > .max-w-2xl .grid button.bg-black{background:linear-gradient(145deg,#4fd36f,#159447)!important;border-color:#c8ffd4!important;box-shadow:0 6px 0 #0d7435!important;}
  .kids-speed > .max-w-2xl .grid button.bg-red-50{background:linear-gradient(145deg,#ff7c7c,#df3d3d)!important;border-color:#ffd0d0!important;color:white!important;box-shadow:0 6px 0 #ad2626!important;}

  /* LETTER HUNT — explorer tiles */
  .kids-hunt{
    --kg-accent:#22c55e;
    background:
      radial-gradient(circle at 14% 15%,rgba(255,244,143,.50) 0 5%,transparent 16%),
      radial-gradient(circle at 85% 12%,rgba(255,255,255,.36) 0 7%,transparent 18%),
      radial-gradient(circle at 50% 42%,rgba(255,255,255,.14),transparent 34%),
      linear-gradient(180deg,#8ee8d2 0%,#59cbbd 29%,#43a99b 58%,#267d73 100%);
  }
  .kids-hunt > .max-w-2xl .grid button{background:linear-gradient(145deg,#fff6a4,#ffc94d)!important;border:3px solid #fff3b5!important;box-shadow:0 5px 0 #c88b16,0 9px 16px rgba(0,0,0,.12)!important;color:#146bb2!important;text-shadow:0 1px 0 white;}
  .kids-hunt > .max-w-2xl .grid button.bg-black{background:linear-gradient(145deg,#4fd36f,#159447)!important;color:white!important;box-shadow:0 5px 0 #0a7030!important;}
  .kids-hunt > .max-w-2xl > .bg-gray-50{background:linear-gradient(145deg,#e8ffd6,#b7f28d)!important;border:3px solid #efffce!important;}

  /* LETTER PUZZLE — workshop / toy-table */
  .kids-puzzle{
    --kg-accent:#8b5cf6;
    background:
      radial-gradient(circle at 15% 14%,rgba(255,221,246,.58) 0 5%,transparent 17%),
      radial-gradient(circle at 83% 11%,rgba(217,201,255,.54) 0 7%,transparent 19%),
      radial-gradient(circle at 51% 40%,rgba(255,255,255,.18),transparent 35%),
      linear-gradient(180deg,#efb7ff 0%,#d58ef2 29%,#aa70dd 59%,#7850b3 100%);
  }
  .kids-puzzle > .max-w-6xl{background:rgba(255,255,255,.18)!important;padding:18px!important;}
  .kids-puzzle > .max-w-6xl > div:first-child{background:linear-gradient(180deg,#fff6cf,#f5d67b)!important;border:3px solid #fff0b6!important;box-shadow:0 7px 0 #b9872b,0 13px 24px rgba(0,0,0,.14)!important;}
  .kids-puzzle > .max-w-6xl > div:last-child{background:linear-gradient(145deg,rgba(255,255,255,.97),rgba(238,231,255,.98))!important;border:4px solid #e7d5ff!important;box-shadow:0 8px 0 #8053b6,0 16px 26px rgba(0,0,0,.14)!important;}

  /* WORD BUILDER — construction play */
  .kids-builder{
    --kg-accent:#3b82f6;
    background:
      radial-gradient(circle at 14% 14%,rgba(255,247,174,.56) 0 5%,transparent 17%),
      radial-gradient(circle at 84% 12%,rgba(255,255,255,.38) 0 7%,transparent 19%),
      radial-gradient(circle at 50% 40%,rgba(255,255,255,.15),transparent 35%),
      linear-gradient(180deg,#ffd86f 0%,#ffbb55 29%,#f39a4b 59%,#d9783f 100%);
  }
  .kids-builder > .max-w-2xl .rounded-3xl{border:3px solid #ffe6a0!important;}
  .kids-builder > .max-w-2xl button{border-width:3px!important;box-shadow:0 5px 0 #996516,0 9px 17px rgba(0,0,0,.13)!important;}

  /* WORD UNSCRAMBLE — colourful letter lab */
  .kids-unscramble{
    --kg-accent:#f97316;
    background:
      radial-gradient(circle at 15% 13%,rgba(255,232,247,.55) 0 5%,transparent 17%),
      radial-gradient(circle at 84% 11%,rgba(255,255,255,.40) 0 7%,transparent 19%),
      radial-gradient(circle at 50% 40%,rgba(255,255,255,.16),transparent 35%),
      linear-gradient(180deg,#ffb8d9 0%,#f58abb 29%,#df6aa8 59%,#b84d91 100%);
  }
  .kids-unscramble > .max-w-xl button{background:linear-gradient(145deg,#4b9cff,#176bc3)!important;color:white!important;border:3px solid #bfe4ff!important;box-shadow:0 5px 0 #0b58a6,0 9px 16px rgba(0,0,0,.13)!important;}
  .kids-unscramble > .max-w-xl button.bg-black{background:linear-gradient(145deg,#9a63ef,#6931b9)!important;border-color:#e0caff!important;box-shadow:0 5px 0 #522394!important;}

  /* MISSING LETTER — clue-board */
  .kids-missing{
    --kg-accent:#ef4444;
    background:
      radial-gradient(circle at 15% 14%,rgba(255,247,171,.56) 0 5%,transparent 17%),
      radial-gradient(circle at 84% 11%,rgba(255,255,255,.40) 0 7%,transparent 19%),
      radial-gradient(circle at 50% 40%,rgba(255,255,255,.16),transparent 35%),
      linear-gradient(180deg,#ffe878 0%,#ffd259 29%,#f3b844 59%,#d99a32 100%);
  }
  .kids-missing > .max-w-xl > .rounded-3xl{background:linear-gradient(145deg,#fff7bd,#ffd968)!important;border:4px solid #fff0ac!important;box-shadow:0 8px 0 #c3871a,0 15px 25px rgba(0,0,0,.14)!important;}
  .kids-missing > .max-w-xl > .grid button{background:linear-gradient(145deg,#aa61ef,#7430bd)!important;color:white!important;border:3px solid #ead2ff!important;box-shadow:0 6px 0 #572092,0 10px 17px rgba(0,0,0,.14)!important;}
  .kids-missing > .max-w-xl > .grid button.bg-black{background:linear-gradient(145deg,#49d36b,#159244)!important;border-color:#ccffd5!important;box-shadow:0 6px 0 #0d7132!important;}
  .kids-missing > .max-w-xl > .grid button.bg-red-50{background:linear-gradient(145deg,#ff7777,#db3838)!important;border-color:#ffd0d0!important;color:white!important;box-shadow:0 6px 0 #aa2323!important;}

  /* USER-FRIENDLY LIGHT CORRECT / SELECTED STATES ONLY */
  /* Speed Quiz — light lavender / blue */
  .kids-speed > .max-w-2xl .grid button.speed-correct{
    background:linear-gradient(145deg,#eef2ff,#ddd6fe)!important;
    color:#4338ca!important;
    border-color:#c4b5fd!important;
    box-shadow:0 6px 0 #a5b4fc,0 10px 20px rgba(67,56,202,.12)!important;
    text-shadow:none!important;
  }

  /* Letter Hunt — light mint */
  .kids-hunt > .max-w-2xl .grid button.hunt-found{
    background:linear-gradient(145deg,#ecfdf5,#bbf7d0)!important;
    color:#166534!important;
    border-color:#86efac!important;
    box-shadow:0 5px 0 #6ee7b7,0 9px 16px rgba(22,101,52,.10)!important;
    text-shadow:none!important;
  }

  /* Word Builder — light sky-blue */
  .kids-builder .builder-filled{
    background:linear-gradient(145deg,#e0f2fe,#bae6fd)!important;
    color:#075985!important;
    border-color:#7dd3fc!important;
    box-shadow:0 5px 0 #7dd3fc,0 9px 17px rgba(3,105,161,.10)!important;
  }
  .kids-builder .builder-complete{
    background:linear-gradient(145deg,#f0f9ff,#dbeafe)!important;
    border-color:#93c5fd!important;
    color:#0c4a6e!important;
    box-shadow:0 7px 0 #bfdbfe,0 14px 24px rgba(3,105,161,.10)!important;
  }

  /* Missing Letter — soft pastel peach / pink */
  .kids-missing .missing-blank-correct,
  .kids-missing > .max-w-xl > .grid button.missing-correct{
    background:linear-gradient(145deg,#fff1f2,#ffe4e6)!important;
    color:#9f1239!important;
    border-color:#fda4af!important;
    box-shadow:0 6px 0 #fecdd3,0 10px 17px rgba(159,18,57,.10)!important;
    text-shadow:none!important;
  }

  /* LINE CONNECT — classroom matching board */
  .kids-connect{
    --kg-accent:#14b8a6;
    background:
      radial-gradient(circle at 15% 14%,rgba(226,231,255,.58) 0 5%,transparent 17%),
      radial-gradient(circle at 84% 11%,rgba(255,255,255,.38) 0 7%,transparent 19%),
      radial-gradient(circle at 50% 40%,rgba(255,255,255,.16),transparent 35%),
      linear-gradient(180deg,#9fc5ff 0%,#7ea5ed 29%,#6687d5 59%,#4c68b5 100%);
  }
  .kids-connect > .max-w-3xl > .rounded-3xl{background:linear-gradient(145deg,#e9ffdc,#bdeea0)!important;border:3px solid #f1ffd9!important;}
  .kids-connect .connect-left,.kids-connect .connect-right{background:linear-gradient(145deg,#fff8c9,#ffe58a)!important;border:3px solid #e6b84a!important;box-shadow:0 4px 0 #b98527!important;}
  .kids-connect svg path{filter:drop-shadow(0 1px 1px rgba(0,0,0,.2));stroke-width:4!important;}

  @keyframes kgFloat{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-12px) rotate(3deg)}}
  @media(max-width:900px){
    .kids-game:before,.kids-game:after{opacity:.45;font-size:58px;}
    .kids-game > .border-b{margin-left:12px!important;margin-right:12px!important;}
    .kids-game > .max-w-2xl,.kids-game > .max-w-3xl,.kids-game > .max-w-xl,.kids-game > .max-w-6xl{margin-left:12px;margin-right:12px;}
  }
  @media(max-width:640px){
    .kids-game:before,.kids-game:after{display:none;}
    .kids-game > .border-b{top:auto!important;border-radius:16px!important;}
    .kids-game > .border-b > div{gap:8px;flex-wrap:wrap;justify-content:center;}
  }
`;

// ═══════════════════════════════════════════════════════════════════
// GAME 2 — SPEED QUIZ
// ═══════════════════════════════════════════════════════════════════
function SpeedQuizGame({letters,onComplete,onBack,lang,onReaction}){
  const TOTAL_Q=10,Q_TIME=10;
  const makeQ=useCallback(()=>{const correct=randFrom(letters);const opts=shuffle([correct,...pickN(letters.filter(l=>l.letter!==correct.letter),3)]);return{correct,options:opts.map(l=>l.name)};},[letters]);
  const[q,setQ]=useState(()=>makeQ()),[qNum,setQNum]=useState(1),[score,setScore]=useState(0),[timeLeft,setTimeLeft]=useState(Q_TIME);
  const[answered,setAnswered]=useState(null),[done,setDone]=useState(false),[ansCount,setAnsCount]=useState(0);
  const capturedReactionRef=useRef(null),timerRef=useRef(null),signalRef=useRef(null);
  const playCorrectTick=()=>{
    try{
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(!AudioCtx)return;
      const ctx=new AudioCtx();
      const now=ctx.currentTime;
      const osc=ctx.createOscillator();
      const gain=ctx.createGain();

      osc.type="sine";
      osc.frequency.setValueAtTime(760,now);
      osc.frequency.exponentialRampToValueAtTime(980,now+0.11);

      gain.gain.setValueAtTime(0.0001,now);
      gain.gain.exponentialRampToValueAtTime(0.17,now+0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001,now+0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now+0.17);

      setTimeout(()=>{try{ctx.close();}catch{}},300);
    }catch{
      // Correct-answer sound is optional if browser audio is unavailable.
    }
  };

  const vibrateWrongAnswer=()=>{
    try{
      if(typeof navigator!=="undefined"&&typeof navigator.vibrate==="function"){
        navigator.vibrate([120,70,120]);
      }
    }catch{
      // Vibration is optional if the device/browser does not support it.
    }
  };
  const next=useCallback((signal)=>{if(qNum>=TOTAL_Q){signal&&signal();setTimeout(()=>setDone(true),300);return;}setQ(makeQ());setQNum(n=>n+1);setAnswered(null);setTimeLeft(Q_TIME);},[qNum,makeQ]);
  useEffect(()=>{if(done||answered!==null)return;timerRef.current=setInterval(()=>{setTimeLeft(t=>{if(t<=1){clearInterval(timerRef.current);setAnswered("__timeout__");setAnsCount(c=>c+1);setTimeout(()=>next(signalRef.current),800);return 0;}const nt=t-1;if(nt<=5&&nt>=1)playBeep();return nt;});},1000);return()=>clearInterval(timerRef.current);},[q,answered,done,next]);
  const answer=(opt,signal)=>{clearInterval(timerRef.current);setAnswered(opt);setAnsCount(c=>c+1);if(opt===q.correct.name){playCorrectTick();setScore(s=>s+(timeLeft>=7?15:timeLeft>=4?10:5));}else{vibrateWrongAnswer();}setTimeout(()=>next(signal),800);};
  const restart=()=>{setQ(makeQ());setQNum(1);setScore(0);setTimeLeft(Q_TIME);setAnswered(null);setDone(false);setAnsCount(0);capturedReactionRef.current=null;};
  const handleAutoReaction=useCallback((reaction)=>{capturedReactionRef.current=reaction;onReaction&&onReaction(reaction);},[onReaction]);
  // NOTE: this useEffect MUST stay above the `if(done)return` below — a hook
  // placed after an early return is only called on SOME renders, which
  // violates the Rules of Hooks and breaks the app (this was the bug in
  // the previous version).
  useEffect(()=>{if(done)onComplete(score,{questionCount:ansCount});},[done]); // eslint-disable-line react-hooks/exhaustive-deps
  if(done)return<ResultScreen score={score} maxScore={TOTAL_Q*15} questionCount={ansCount} onRetry={restart} onBack={onBack} lang={lang} onReaction={onReaction} capturedReaction={capturedReactionRef.current}/>;
  const gl={en:{back:"← Back",title:"Speed Quiz",question:"What is the name of this letter?"},si:{back:"← ආපසු",title:"වේග ප්‍රශ්නාවලිය",question:"මෙම අකුරේ නම කුමක්ද?"},ta:{back:"← பின்னால்",title:"வேக வினாடி வினா",question:"இந்த எழுத்தின் பெயர் என்ன?"}}[lang]??{back:"← Back",title:"Speed Quiz",question:"Name this letter?"};
  const timePct=(timeLeft/Q_TIME)*100;
  return(
    <GameWithAutoCamera onReaction={handleAutoReaction} lang={lang} gameId="speed-quiz" onBackToLobby={onBack}>
      {({signalGameEnd})=>{signalRef.current=signalGameEnd;return(
        <div className="min-h-screen pt-16 kids-game kids-speed">
          <style>{KIDS_ADVENTURE_CSS}</style>
          <SideDecor items={GAME_DECOR["speed-quiz"]}/>
          <SideTimer value={timeLeft} danger={timeLeft<=5}/>
          <div className="border-b border-gray-100 bg-white sticky top-16 z-10"><div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between"><button onClick={onBack} className="font-body text-sm text-gray-400 hover:text-black transition-colors">{gl.back}</button><span className="font-body text-xs text-gray-400 uppercase tracking-widest">{gl.title}</span><div className="flex gap-5 font-body text-sm"><span className={timeLeft<=4?"text-red-500 font-semibold":"text-gray-400"}>{timeLeft}s</span><span className="font-semibold">{score} {lang==="si"?"ල.":lang==="ta"?"புள்.":"pts"}</span></div></div></div>
          <div className="max-w-2xl mx-auto px-6 py-10">
            <div className="flex items-center gap-3 mb-8"><span className="font-body text-xs text-gray-400">{qNum}/{TOTAL_Q}</span><div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-black rounded-full transition-all duration-500" style={{width:`${(qNum/TOTAL_Q)*100}%`}}/></div></div>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-8"><div className="h-1 rounded-full transition-all duration-1000" style={{width:`${timePct}%`,background:timePct>60?"#111":timePct>30?"#f59e0b":"#ef4444"}}/></div>
            <div className="rounded-3xl border border-gray-100 bg-gray-50 px-8 py-12 text-center mb-8"><p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-4">{gl.question}</p><div className="font-display" style={{fontFamily:SINHALA_FONT,fontSize:96,lineHeight:1,color:"#111"}}>{q.correct.letter}</div></div>
            <div className="grid grid-cols-2 gap-4 kids-answer-grid">{q.options.map((opt,i)=>{let cls="border-gray-100 bg-white text-gray-800 hover:border-gray-300 hover:shadow-md";if(answered!==null){if(opt===q.correct.name)cls="speed-correct border-2 shadow-lg scale-[1.02]";else if(opt===answered)cls="border-red-200 bg-red-50 text-red-600";else cls="border-gray-100 bg-gray-50 text-gray-300";}return(<button key={i} onClick={()=>answer(opt,signalGameEnd)} disabled={answered!==null} style={{fontFamily:SINHALA_FONT}} className={`${cls} border-2 font-bold text-2xl py-6 rounded-2xl transition-all duration-200 disabled:cursor-default`}>{opt}</button>);})}</div>
          </div>
        </div>
      );}}
    </GameWithAutoCamera>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAME 3 — LETTER HUNT
// ═══════════════════════════════════════════════════════════════════
function LetterHuntGame({letters,onComplete,onBack,lang,onReaction}){
  const TOTAL_ROUNDS=5,ROUND_TIME=15;
  const makeRound=useCallback(()=>{const target=randFrom(letters);const targetCount=3+Math.floor(Math.random()*3);const grid=[];for(let i=0;i<targetCount;i++)grid.push({...target,isTarget:true,id:`t${i}`,found:false});const others=letters.filter(l=>l.letter!==target.letter);while(grid.length<16)grid.push({...randFrom(others),isTarget:false,id:`o${grid.length}`,found:false});return{target,grid:shuffle(grid),targetCount};},[letters]);
  const[round,setRound]=useState(0),[data,setData]=useState(()=>makeRound()),[score,setScore]=useState(0),[timeLeft,setTimeLeft]=useState(ROUND_TIME);
  const[done,setDone]=useState(false),[flash,setFlash]=useState(null),[roundComplete,setRoundComplete]=useState(false);
  const capturedReactionRef=useRef(null),signalRef=useRef(null);

  const playLetterHuntCompleteSound=()=>{
    try{
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(!AudioCtx)return;

      const ctx=new AudioCtx();
      const now=ctx.currentTime;
      const master=ctx.createGain();

      master.gain.setValueAtTime(0.0001,now);
      master.gain.exponentialRampToValueAtTime(0.16,now+0.035);
      master.gain.setValueAtTime(0.16,now+0.75);
      master.gain.exponentialRampToValueAtTime(0.0001,now+1.18);
      master.connect(ctx.destination);

      const playTone=(frequency,start,duration,volume,type="sine")=>{
        const osc=ctx.createOscillator();
        const gain=ctx.createGain();

        osc.type=type;
        osc.frequency.setValueAtTime(frequency,now+start);

        gain.gain.setValueAtTime(0.0001,now+start);
        gain.gain.exponentialRampToValueAtTime(volume,now+start+0.025);
        gain.gain.setValueAtTime(volume,now+start+Math.max(0.06,duration-0.16));
        gain.gain.exponentialRampToValueAtTime(0.0001,now+start+duration);

        osc.connect(gain);
        gain.connect(master);
        osc.start(now+start);
        osc.stop(now+start+duration+0.03);
      };

      // Soft, cheerful "level complete" melody.
      playTone(523.25,0.00,0.30,0.48,"sine");
      playTone(659.25,0.16,0.34,0.44,"sine");
      playTone(783.99,0.33,0.38,0.40,"sine");
      playTone(987.77,0.52,0.46,0.34,"triangle");
      playTone(1046.50,0.70,0.44,0.28,"sine");

      setTimeout(()=>{try{ctx.close();}catch{}},1450);
    }catch{
      // Sound is optional if browser audio is unavailable.
    }
  };
  const advanceRound=useCallback((signal)=>{if(round+1>=TOTAL_ROUNDS){signal&&signal();setTimeout(()=>setDone(true),300);return;}setRound(r=>r+1);setData(makeRound());setTimeLeft(ROUND_TIME);setRoundComplete(false);},[round,makeRound]);
  useEffect(()=>{if(done||roundComplete)return;const id=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(id);advanceRound(signalRef.current);return 0;}const nt=t-1;if(nt<=5&&nt>=1)playBeep();return nt;}),1000);return()=>clearInterval(id);},[round,roundComplete,done,advanceRound]);
  const handleClick=(cell,signalGameEnd)=>{if(cell.found)return;if(cell.isTarget){setData(prev=>({...prev,grid:prev.grid.map(c=>c.id===cell.id?{...c,found:true}:c)}));setScore(s=>s+10);setFlash("correct");setTimeout(()=>setFlash(null),400);const remaining=data.grid.filter(c=>c.isTarget&&!c.found&&c.id!==cell.id);if(remaining.length===0){playLetterHuntCompleteSound();setRoundComplete(true);setTimeout(()=>advanceRound(signalGameEnd),900);}}else{setScore(s=>Math.max(0,s-3));setFlash("wrong");setTimeout(()=>setFlash(null),400);}};
  const restart=()=>{setRound(0);setData(makeRound());setScore(0);setTimeLeft(ROUND_TIME);setDone(false);setRoundComplete(false);capturedReactionRef.current=null;};
  const handleAutoReaction=useCallback((reaction)=>{capturedReactionRef.current=reaction;onReaction&&onReaction(reaction);},[onReaction]);
  useEffect(()=>{if(done)onComplete(score,{});},[done]); // eslint-disable-line react-hooks/exhaustive-deps
  if(done)return<ResultScreen score={score} maxScore={TOTAL_ROUNDS*40} onRetry={restart} onBack={onBack} lang={lang} onReaction={onReaction} capturedReaction={capturedReactionRef.current}/>;
  const gl={en:{back:"← Back",title:"Letter Hunt",findAll:"Find all of this letter",found:"Found",roundComplete:"Round Complete — Loading next…"},si:{back:"← ආපසු",title:"අකුරු සෙවීම",findAll:"මෙම අකුරේ සියල්ල සොයන්න",found:"හමු විය",roundComplete:"වාරය සම්පූර්ණ — මීළඟ පූරණය…"},ta:{back:"← பின்னால்",title:"எழுத்து வேட்டை",findAll:"இந்த எழுத்தை எல்லாம் கண்டுபிடிக்கவும்",found:"கண்டுபிடிக்கப்பட்டது",roundComplete:"சுற்று முடிந்தது — அடுத்தது ஏற்றுகிறது…"}}[lang]??{back:"← Back",title:"Letter Hunt",findAll:"Find all",found:"Found",roundComplete:"Next round…"};
  const found=data.grid.filter(c=>c.isTarget&&c.found).length,timePct=(timeLeft/ROUND_TIME)*100;
  return(
    <GameWithAutoCamera onReaction={handleAutoReaction} lang={lang} gameId="letter-hunt" onBackToLobby={onBack}>
      {({signalGameEnd})=>{signalRef.current=signalGameEnd;return(
        <div className="min-h-screen pt-16 kids-game kids-hunt">
          <style>{KIDS_ADVENTURE_CSS}</style>
          <SideDecor items={GAME_DECOR["letter-hunt"]}/>
          <SideTimer value={timeLeft} danger={timeLeft<=5}/>
          <div className="border-b border-gray-100 bg-white sticky top-16 z-10"><div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between"><button onClick={onBack} className="font-body text-sm text-gray-400 hover:text-black transition-colors">{gl.back}</button><span className="font-body text-xs text-gray-400 uppercase tracking-widest">{gl.title}</span><div className="flex gap-5 font-body text-sm"><span className="text-gray-400">{lang==="si"?"වාරය":lang==="ta"?"சுற்று":"Round"} {round+1}/{TOTAL_ROUNDS}</span><span className={timeLeft<=5?"text-red-500 font-semibold":"text-gray-400"}>{timeLeft}s</span><span className="font-semibold">{score} {lang==="si"?"ල.":lang==="ta"?"புள்.":"pts"}</span></div></div></div>
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-6"><div className="h-1 rounded-full transition-all duration-1000" style={{width:`${timePct}%`,background:timePct>50?"#111":timePct>25?"#f59e0b":"#ef4444"}}/></div>
            <div className={`bg-gray-50 rounded-3xl border p-6 mb-6 flex items-center gap-6 transition-all duration-200 ${flash==="correct"?"border-black":flash==="wrong"?"border-red-200":"border-gray-100"}`}>
              <div className="w-20 h-20 bg-black text-white rounded-2xl flex items-center justify-center text-4xl font-bold flex-shrink-0" style={{fontFamily:SINHALA_FONT}}>{data.target.letter}</div>
              <div><p className="font-body text-xs text-gray-400 mb-1 uppercase tracking-wider">{gl.findAll}</p><p className="font-display text-2xl font-bold" style={{fontFamily:SINHALA_FONT}}>{data.target.name}</p><p className="font-body text-sm text-gray-400 mt-1">{gl.found}: {found}/{data.targetCount}</p></div>
              <div className="ml-auto text-right font-body text-xs text-gray-300"><p>+10 correct</p><p className="text-red-300">−3 wrong</p></div>
            </div>
            <div className="grid grid-cols-4 gap-3 kids-hunt-grid">{data.grid.map(cell=>(<button key={cell.id} onClick={()=>handleClick(cell,signalGameEnd)} disabled={cell.found} style={{fontFamily:SINHALA_FONT}} className={`aspect-square rounded-2xl text-3xl font-bold transition-all hover:scale-105 border ${cell.found?"hunt-found scale-95 cursor-default":"bg-white text-gray-800 hover:shadow-md border-gray-100 hover:border-gray-300"}`}>{cell.found?"✓":cell.letter}</button>))}</div>
            {roundComplete&&<div className="mt-6 text-center bg-gray-50 rounded-2xl p-4 border border-gray-100"><p className="font-display text-xl font-bold">{gl.roundComplete}</p></div>}
          </div>
        </div>
      );}}
    </GameWithAutoCamera>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAME 4 — LETTER PUZZLE
// ═══════════════════════════════════════════════════════════════════
const TILE=120;
function buildPuzzle(letterObj,color){return{letter:letterObj.letter,name:`${letterObj.letter} — ${letterObj.sound}`,color,gridCols:2,gridRows:2,pieces:[{id:"tl",gridCol:1,gridRow:1,gridColSpan:1,gridRowSpan:1,clip:[0,0,100,100]},{id:"tr",gridCol:2,gridRow:1,gridColSpan:1,gridRowSpan:1,clip:[100,0,100,100]},{id:"bl",gridCol:1,gridRow:2,gridColSpan:1,gridRowSpan:1,clip:[0,100,100,100]},{id:"br",gridCol:2,gridRow:2,gridColSpan:1,gridRowSpan:1,clip:[100,100,100,100]}]};}
function LetterTile({letter,color,clip,tileW,tileH,opacity=1}){const[cx,cy,cw,ch]=clip;return(<svg width={tileW} height={tileH} viewBox={`${cx} ${cy} ${cw} ${ch}`} style={{display:"block"}}><text x="100" y="155" textAnchor="middle" fontSize="160" fontFamily={SINHALA_FONT} fill={color} fontWeight="900" opacity={opacity}>{letter}</text></svg>);}
function DragGhost({piece,letter,color,x,y}){if(!piece)return null;const tileW=TILE*piece.gridColSpan,tileH=TILE*piece.gridRowSpan;return(<div style={{position:"fixed",left:x-tileW/2,top:y-tileH/2,width:tileW,height:tileH,borderRadius:14,border:`2px solid ${color}88`,background:`${color}22`,pointerEvents:"none",zIndex:9999,opacity:0.85,overflow:"hidden",transform:"scale(1.08)",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}}><LetterTile letter={letter} color={color} clip={piece.clip} tileW={tileW} tileH={tileH}/></div>);}
function PieceTile({piece,letter,color,isDragging,onPointerDown}){const tileW=TILE*piece.gridColSpan,tileH=TILE*piece.gridRowSpan;return(<div onPointerDown={onPointerDown} className="hover-lift" style={{width:tileW,height:tileH,borderRadius:14,border:`2px solid ${color}44`,background:`${color}11`,cursor:"grab",opacity:isDragging?0.3:1,overflow:"hidden",userSelect:"none",flexShrink:0,touchAction:"none"}}><LetterTile letter={letter} color={color} clip={piece.clip} tileW={tileW} tileH={tileH}/></div>);}
function SlotTile({piece,letter,color,filled,slotRef,isWrong}){const tileW=TILE*piece.gridColSpan,tileH=TILE*piece.gridRowSpan;return(<div ref={slotRef} data-slot-id={piece.id} style={{width:tileW,height:tileH,borderRadius:14,position:"relative",overflow:"hidden",border:filled?`2px solid ${color}88`:isWrong?"2px solid #fca5a5":"2px dashed #e5e7eb",background:filled?`${color}11`:isWrong?"#fef2f2":"#f9fafb",transition:"all 0.3s"}}><LetterTile letter={letter} color={color} clip={piece.clip} tileW={tileW} tileH={tileH} opacity={filled?1:0.1}/>{!filled&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}><span style={{fontSize:20,color:"#d1d5db",fontWeight:"bold"}}>?</span></div>}{filled&&<div style={{position:"absolute",top:8,right:8,width:20,height:20,borderRadius:"50%",background:"#111",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"white",pointerEvents:"none"}}>✓</div>}</div>);}

// ← letterCategories prop — DB ෙලින් load කළ data receive කරනවා
function LetterPuzzleGame({onBack,onComplete,lang,onReaction,letterCategories=[]}){
  const defaultLetter=letterCategories[0]?.letters[0]??{letter:"අ",name:"අ",sound:"a"};
  const defaultColor=letterCategories[0]?.color??"#e11d48";
  const[selectedLetter,setSelectedLetter]=useState(defaultLetter),[currentColor,setCurrentColor]=useState(defaultColor);
  const[pz,setPz]=useState(()=>buildPuzzle(defaultLetter,defaultColor)),[score,setScore]=useState(0);
  const[pool,setPool]=useState([]),[placed,setPlaced]=useState({}),[dragging,setDragging]=useState(null);
  const[ghostPos,setGhostPos]=useState({x:0,y:0}),[celebrating,setCelebrating]=useState(false);
  const[completedLetters,setCompleted]=useState(new Set()),[mistakes,setMistakes]=useState(0);
  const[timer,setTimer]=useState(0),[wrongSlot,setWrongSlot]=useState(null),[openCat,setOpenCat]=useState(0);
  const[sessionSaved,setSessionSaved]=useState(false);
  const capturedReactionRef=useRef(null),timerRef=useRef(null),slotRefs=useRef({}),signalRef=useRef(null);

  // When letterCategories loads from DB, init puzzle with first letter
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{
    if(letterCategories.length>0){
      const firstLetter=letterCategories[0].letters[0];
      const firstColor=letterCategories[0].color;
      if(firstLetter){setSelectedLetter(firstLetter);setCurrentColor(firstColor);const newPz=buildPuzzle(firstLetter,firstColor);setPz(newPz);setPool(shuffle(newPz.pieces.map(p=>p.id)));setPlaced({});setSessionSaved(false);}
    }
  },[letterCategories.length]);

  const initPuzzle=useCallback((letterObj,color)=>{const newPz=buildPuzzle(letterObj,color);setPz(newPz);setPool(shuffle(newPz.pieces.map(p=>p.id)));setPlaced({});setCelebrating(false);setMistakes(0);setTimer(0);setWrongSlot(null);setSessionSaved(false);},[]);
  useEffect(()=>{clearInterval(timerRef.current);if(celebrating)return;timerRef.current=setInterval(()=>setTimer(t=>t+1),1000);return()=>clearInterval(timerRef.current);},[pz,celebrating]);
  const handleSelectLetter=(letterObj,catColor)=>{setSelectedLetter(letterObj);setCurrentColor(catColor);initPuzzle(letterObj,catColor);};
  const handlePointerDown=useCallback((pid,e)=>{e.preventDefault();const piece=pz.pieces.find(p=>p.id===pid);setDragging({pid,piece});const clientX=e.touches?e.touches[0].clientX:e.clientX,clientY=e.touches?e.touches[0].clientY:e.clientY;setGhostPos({x:clientX,y:clientY});},[pz.pieces]);
  const getSlotUnderPointer=useCallback((clientX,clientY)=>{const els=document.elementsFromPoint(clientX,clientY);for(const el of els){const sid=el.dataset?.slotId;if(sid)return sid;}return null;},[]);
  const handlePointerMove=useCallback((e)=>{if(!dragging)return;const clientX=e.touches?e.touches[0].clientX:e.clientX,clientY=e.touches?e.touches[0].clientY:e.clientY;setGhostPos({x:clientX,y:clientY});},[dragging]);
  const handlePointerUp=useCallback((e)=>{
    if(!dragging)return;
    const clientX=e.changedTouches?e.changedTouches[0].clientX:e.clientX,clientY=e.changedTouches?e.changedTouches[0].clientY:e.clientY;
    const slotId=getSlotUnderPointer(clientX,clientY);
    if(slotId){
      if(dragging.pid===slotId){
        setPlaced(prev=>{const newPlaced={...prev,[slotId]:true};const earned=Math.max(5,25-mistakes*4);setScore(s=>s+earned);
          if(Object.keys(newPlaced).length===pz.pieces.length){clearInterval(timerRef.current);setCelebrating(true);setCompleted(c=>new Set([...c,pz.letter]));signalRef.current&&signalRef.current();if(!sessionSaved){setSessionSaved(true);onComplete&&onComplete(earned,{movesCount:mistakes});}}
          return newPlaced;});
        setPool(p=>p.filter(id=>id!==dragging.pid));
      }else{setMistakes(m=>m+1);setWrongSlot(slotId);setTimeout(()=>setWrongSlot(null),700);}
    }
    setDragging(null);
  },[dragging,getSlotUnderPointer,mistakes,pz.pieces.length,pz.letter,onComplete,sessionSaved]);

  useEffect(()=>{if(!dragging)return;window.addEventListener("pointermove",handlePointerMove);window.addEventListener("pointerup",handlePointerUp);window.addEventListener("touchmove",handlePointerMove,{passive:false});window.addEventListener("touchend",handlePointerUp);return()=>{window.removeEventListener("pointermove",handlePointerMove);window.removeEventListener("pointerup",handlePointerUp);window.removeEventListener("touchmove",handlePointerMove);window.removeEventListener("touchend",handlePointerUp);};},[dragging,handlePointerMove,handlePointerUp]);
  const handleAutoReaction=useCallback((reaction)=>{capturedReactionRef.current=reaction;onReaction&&onReaction(reaction);},[onReaction]);
  const gl={en:{back:"← Back",title:"Letter Puzzle",done:"done",mistakes:"mistakes",selectLetter:"Select Letter",complete:"complete",dragHint:"Drag pieces onto matching slots",allPlaced:"All placed!",hint:"Hint",resetPuzzle:"Reset Puzzle",nextHint:"Pick the next letter →"},si:{back:"← ආපසු",title:"අකුරු ප්‍රහේලිකාව",done:"සම්පූර්ණ",mistakes:"වැරදි",selectLetter:"අකුර තෝරන්න",complete:"සම්පූර්ණ",dragHint:"කෑලි ගලපන ස්ථානයට ඇදගන්න",allPlaced:"සියල්ල තැබිණ!",hint:"ඉඟිය",resetPuzzle:"ප්‍රහේලිකාව නැවත සකසන්න",nextHint:"ඊළඟ අකුර තෝරන්න →"},ta:{back:"← பின்னால்",title:"எழுத்து புதிர்",done:"முடிந்தது",mistakes:"தவறுகள்",selectLetter:"எழுத்து தேர்ந்தெடு",complete:"முடிந்தது",dragHint:"துண்டுகளை பொருத்தமான இடங்களில் இழுக்கவும்",allPlaced:"அனைத்தும் வைக்கப்பட்டன!",hint:"குறிப்பு",resetPuzzle:"புதிரை மீட்டமை",nextHint:"அடுத்த எழுத்தை தேர்ந்தெடுக்கவும் →"}}[lang]??{back:"← Back",title:"Letter Puzzle",done:"done",mistakes:"mistakes",selectLetter:"Select Letter",complete:"complete",dragHint:"Drag pieces",allPlaced:"All placed!",hint:"Hint",resetPuzzle:"Reset",nextHint:"Next →"};
  const boardW=pz.gridCols*TILE,boardH=pz.gridRows*TILE;
  const allLettersCount=letterCategories.reduce((acc,cat)=>acc+cat.letters.length,0);

  return(
    <GameWithAutoCamera onReaction={handleAutoReaction} lang={lang} gameId="letter-puzzle" onBackToLobby={onBack}>
      {({signalGameEnd})=>{signalRef.current=signalGameEnd;return(
        <div className="min-h-screen pt-16 kids-game kids-puzzle" style={{touchAction:"none"}}>
          <style>{KIDS_ADVENTURE_CSS}</style>
          <style>{`
            @keyframes puzzleLetterPopup {
              0% { opacity:0; transform:translate(-50%,-50%) scale(.25) rotate(-8deg); }
              18% { opacity:1; transform:translate(-50%,-50%) scale(1.28) rotate(3deg); }
              38% { opacity:1; transform:translate(-50%,-50%) scale(1) rotate(0deg); }
              72% { opacity:1; transform:translate(-50%,-50%) scale(1.08) rotate(0deg); }
              100% { opacity:0; transform:translate(-50%,-50%) scale(1.65) rotate(0deg); }
            }
            @keyframes puzzleLetterGlow {
              0% { opacity:0; transform:translate(-50%,-50%) scale(.35); }
              22% { opacity:.75; transform:translate(-50%,-50%) scale(1); }
              75% { opacity:.48; transform:translate(-50%,-50%) scale(1.15); }
              100% { opacity:0; transform:translate(-50%,-50%) scale(1.55); }
            }
          `}</style>
          <SideDecor items={GAME_DECOR["letter-puzzle"]}/>
          {celebrating&&(
            <>
              <div
                aria-hidden="true"
                style={{
                  position:"fixed",left:"50%",top:"50%",width:"min(46vw,520px)",height:"min(46vw,520px)",
                  borderRadius:"50%",background:`radial-gradient(circle, ${currentColor}24 0%, ${currentColor}12 42%, transparent 72%)`,
                  zIndex:9997,pointerEvents:"none",animation:"puzzleLetterGlow 2.2s ease-out forwards"
                }}
              />
              <div
                aria-live="polite"
                style={{
                  position:"fixed",left:"50%",top:"50%",zIndex:9998,pointerEvents:"none",
                  fontFamily:SINHALA_FONT,fontSize:"clamp(150px,24vw,360px)",fontWeight:900,lineHeight:1,
                  color:currentColor,textShadow:"0 8px 0 rgba(255,255,255,.95), 0 18px 34px rgba(0,0,0,.22)",
                  WebkitTextStroke:"3px rgba(255,255,255,.88)",
                  animation:"puzzleLetterPopup 2.2s cubic-bezier(.2,.8,.2,1) forwards"
                }}
              >
                {pz.letter}
              </div>
            </>
          )}
          {dragging&&<DragGhost piece={dragging.piece} letter={pz.letter} color={currentColor} x={ghostPos.x} y={ghostPos.y}/>}
          <div className="border-b border-gray-100 bg-white sticky top-16 z-10"><div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between"><button onClick={onBack} className="font-body text-sm text-gray-400 hover:text-black transition-colors">{gl.back}</button><span className="font-body text-xs text-gray-400 uppercase tracking-widest">{gl.title}</span><div className="flex gap-5 font-body text-sm"><span className="text-gray-400">{completedLetters.size} {gl.done}</span><span className="text-gray-400">{timer}s</span><span className={mistakes>0?"text-red-500":"text-gray-400"}>{mistakes} {gl.mistakes}</span><span className="font-semibold">{score} {lang==="si"?"ල.":lang==="ta"?"புள்.":"pts"}</span></div></div></div>
          <div className="max-w-6xl mx-auto px-6 py-8 flex gap-6" style={{alignItems:"flex-start"}}>
            {/* Sidebar — DB ෙලින් load කළ letterCategories */}
            <div className="w-52 flex-shrink-0 rounded-3xl border border-gray-100 overflow-hidden" style={{maxHeight:"calc(100vh - 120px)",display:"flex",flexDirection:"column"}}>
              <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0"><p className="font-body text-xs text-gray-400 uppercase tracking-widest">{gl.selectLetter}</p><p className="font-body text-xs text-gray-400 mt-1">{completedLetters.size}/{allLettersCount} {gl.complete}</p></div>
              <div style={{overflowY:"auto",flex:1,paddingBottom:8}}>
                {letterCategories.length===0&&<div style={{padding:16,textAlign:"center",color:"#9ca3af",fontSize:12}}>Loading…</div>}
                {letterCategories.map((cat,ci)=>(<div key={ci}><button onClick={()=>setOpenCat(openCat===ci?-1:ci)} className="w-full px-4 py-2.5 flex items-center justify-between border-b border-gray-50 font-body text-xs font-semibold transition-all" style={{background:openCat===ci?"#f9fafb":"white",color:openCat===ci?"#111":"#9ca3af"}}><span>{cat.name}</span><ChevronIco s={12} up={openCat===ci}/></button>
                  {openCat===ci&&<div className="flex flex-wrap gap-1.5 p-3">{cat.letters.map((l,li)=>{const isSel=selectedLetter?.letter===l.letter,isDone=completedLetters.has(l.letter);return(<button key={li} onClick={()=>handleSelectLetter(l,cat.color)} style={{fontFamily:SINHALA_FONT,border:isSel?`2px solid ${cat.color}`:isDone?"2px solid #22c55e":"1px solid #e5e7eb",background:isSel?`${cat.color}15`:isDone?"#f0fdf4":"white",color:isSel?cat.color:isDone?"#16a34a":"#374151",transform:isSel?"scale(1.1)":"scale(1)"}} className="w-9 h-9 rounded-xl text-base flex items-center justify-center transition-all relative">{l.letter}{isDone&&<span style={{position:"absolute",top:-3,right:-3,width:9,height:9,background:"#22c55e",borderRadius:"50%",fontSize:6,color:"white",display:"flex",alignItems:"center",justifyContent:"center"}}>✓</span>}</button>);})}</div>}
                </div>))}
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-6 min-w-0">
              <div className="text-center"><p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-2">{gl.dragHint}</p><div className="font-bold mb-1" style={{fontFamily:SINHALA_FONT,fontSize:64,color:currentColor,lineHeight:1}}>{pz.letter}</div><p className="font-body text-sm text-gray-400">{pz.name}</p>{celebrating&&<p className="font-display text-lg font-bold mt-2" style={{color:currentColor}}>{lang==="si"?"සම්පූර්ණයි!":lang==="ta"?"முடிந்தது!":"Complete!"} {gl.nextHint}</p>}</div>
              <div className="flex gap-8 items-start justify-center flex-wrap">
                <div className="flex flex-col items-center gap-3">
                  <p className="font-body text-xs text-gray-400 uppercase tracking-widest">{lang==="si"?"එකලස් කිරීමේ බෝඩ්":lang==="ta"?"கூட்டு பலகை":"Assembly Board"}</p>
                  <div className={`rounded-3xl border p-4 transition-all ${celebrating?"border-black bg-gray-50":"border-gray-100 bg-gray-50"}`}>
                    {celebrating?(<div className="anim-scale-in flex items-center justify-center" style={{width:boardW,height:boardH}}><svg width={boardW} height={boardH} viewBox="0 0 200 200"><text x="100" y="155" textAnchor="middle" fontSize="160" fontFamily={SINHALA_FONT} fill={currentColor} fontWeight="900">{pz.letter}</text></svg></div>
                    ):(<div style={{display:"grid",gridTemplateColumns:`repeat(${pz.gridCols},${TILE}px)`,gridTemplateRows:`repeat(${pz.gridRows},${TILE}px)`,gap:4}}>{pz.pieces.map(slot=>(<div key={slot.id} style={{gridColumn:`${slot.gridCol}/span ${slot.gridColSpan}`,gridRow:`${slot.gridRow}/span ${slot.gridRowSpan}`}}><SlotTile piece={slot} letter={pz.letter} color={currentColor} filled={!!placed[slot.id]} isWrong={wrongSlot===slot.id} slotRef={el=>{slotRefs.current[slot.id]=el;}}/></div>))}</div>)}
                  </div>
                </div>
                <div className="flex flex-col gap-4 flex-1 min-w-52">
                  <p className="font-body text-xs text-gray-400 uppercase tracking-widest text-center">{lang==="si"?"අකුරු කෑලි":lang==="ta"?"எழுத்து துண்டுகள்":"Letter Pieces"}</p>
                  <div className="bg-gray-50 rounded-3xl border border-gray-100 p-4 min-h-36 flex flex-wrap gap-3 justify-center items-center">
                    {celebrating?(<div className="text-center py-2"><div className="font-display text-2xl font-bold mb-1">{lang==="si"?"සම්පූර්ණයි!":lang==="ta"?"முடிந்தது!":"Complete!"}</div><p className="font-body text-xs text-gray-400">{lang==="si"?"පැති ෙප්ලෙන් තෝරන්න":"Pick another from sidebar"}</p></div>
                    ):pool.length===0?(<div className="text-center py-2"><p className="font-display text-lg font-bold">{gl.allPlaced}</p></div>
                    ):pool.map(pid=>{const piece=pz.pieces.find(p=>p.id===pid);return<PieceTile key={pid} piece={piece} letter={pz.letter} color={currentColor} isDragging={dragging?.pid===pid} onPointerDown={(e)=>handlePointerDown(pid,e)}/>;})
                    }
                  </div>
                  <div className="rounded-2xl border border-gray-100 p-4 text-center bg-gray-50"><p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-2">{gl.hint}</p><div className="mx-auto" style={{width:80,height:80}}><svg width={80} height={80} viewBox="10 10 180 180"><text x="100" y="155" textAnchor="middle" fontSize="160" fontFamily={SINHALA_FONT} fill={currentColor} fontWeight="900" opacity="0.6">{pz.letter}</text></svg></div></div>
                  <button onClick={()=>initPuzzle(selectedLetter,currentColor)} className="font-body w-full border border-gray-200 text-gray-500 py-2.5 rounded-xl text-xs hover:border-gray-400 hover:text-black transition-all">{gl.resetPuzzle}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );}}
    </GameWithAutoCamera>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAME 5 — WORD BUILDER (uses DB words via prop)
// ═══════════════════════════════════════════════════════════════════
function WordBuilderGame({onComplete,onBack,lang,onReaction,words=[]}){
  const TOTAL=8;
  const makeRound=useCallback(()=>{
    if(words.length===0)return null;
    const word=words[Math.floor(Math.random()*words.length)];
    const allSyllables=words.flatMap(w=>w.syllables);
    const decoys=shuffle(allSyllables.filter(s=>!word.syllables.includes(s))).slice(0,2);
    const pool=shuffle([...word.syllables.map((s,i)=>({id:`c${i}`,text:s,correct:true,correctIdx:i})),...decoys.map((s,i)=>({id:`d${i}`,text:s,correct:false,correctIdx:-1}))]);
    return{word,pool,slots:Array(word.syllables.length).fill(null)};
  },[words]);

  const[round,setRound]=useState(0),[data,setData]=useState(null),[score,setScore]=useState(0),[done,setDone]=useState(false);
  const[celebrate,setCelebrate]=useState(false),[wrongSlot,setWrongSlot]=useState(null);
  const[completedWordPopup,setCompletedWordPopup]=useState(null);

  const playWordBuilderPopupSound=()=>{
    try{
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(!AudioCtx)return;

      const ctx=new AudioCtx();
      const now=ctx.currentTime;
      const master=ctx.createGain();

      master.gain.setValueAtTime(0.0001,now);
      master.gain.exponentialRampToValueAtTime(0.14,now+0.03);
      master.gain.setValueAtTime(0.14,now+0.82);
      master.gain.exponentialRampToValueAtTime(0.0001,now+1.22);
      master.connect(ctx.destination);

      const tone=(frequency,start,duration,volume,type="triangle")=>{
        const osc=ctx.createOscillator();
        const gain=ctx.createGain();

        osc.type=type;
        osc.frequency.setValueAtTime(frequency,now+start);

        gain.gain.setValueAtTime(0.0001,now+start);
        gain.gain.exponentialRampToValueAtTime(volume,now+start+0.02);
        gain.gain.setValueAtTime(volume,now+start+Math.max(0.05,duration-0.12));
        gain.gain.exponentialRampToValueAtTime(0.0001,now+start+duration);

        osc.connect(gain);
        gain.connect(master);
        osc.start(now+start);
        osc.stop(now+start+duration+0.025);
      };

      // Different playful "ding-dong sparkle" pattern for the completed-word popup.
      tone(880.00,0.00,0.22,0.36,"triangle");
      tone(659.25,0.16,0.26,0.30,"sine");
      tone(987.77,0.34,0.24,0.34,"triangle");
      tone(1174.66,0.50,0.28,0.28,"sine");
      tone(1567.98,0.70,0.42,0.20,"sine");

      setTimeout(()=>{try{ctx.close();}catch{}},1500);
    }catch{
      // Sound is optional if browser audio is unavailable.
    }
  };

  const[usedIds,setUsedIds]=useState(new Set()),[dragging,setDragging]=useState(null);
  const capturedReactionRef=useRef(null),isDraggingRef=useRef(false);
  const[ghostPos,setGhostPos]=useState({x:0,y:0}),slotRefs=useRef({}),signalRef=useRef(null);

  // Init when words load from DB
  useEffect(()=>{if(words.length>0&&!data){setData(makeRound());}},[words,data,makeRound]);

  const advanceRound=useCallback((signal)=>{
    if(round+1>=TOTAL){signal&&signal();setTimeout(()=>setDone(true),300);return;}
    setRound(r=>r+1);setData(makeRound());setCelebrate(false);setUsedIds(new Set());setWrongSlot(null);
  },[round,makeRound]);

  const resolveDropAt=useCallback((clientX,clientY,signal)=>{
    if(!isDraggingRef.current||celebrate)return;const currentDrag=isDraggingRef.current;
    const els=document.elementsFromPoint(clientX,clientY);let droppedSlotIdx=null;
    for(const el of els){const idx=el.dataset?.slotIdx;if(idx!==undefined){droppedSlotIdx=parseInt(idx,10);break;}}
    if(droppedSlotIdx===null){setDragging(null);isDraggingRef.current=null;return;}
    if(currentDrag.correctIdx===droppedSlotIdx){
      setData(d=>{const newSlots=[...d.slots];newSlots[droppedSlotIdx]=currentDrag.text;return{...d,slots:newSlots};});
      setUsedIds(prev=>new Set([...prev,currentDrag.id]));setScore(s=>s+15);
      setTimeout(()=>{setData(d=>{
        if(d&&d.slots.every(s=>s!==null)){
          setCelebrate(true);
          playWordBuilderPopupSound();
        setCompletedWordPopup(d.word.word);
          setTimeout(()=>{
            setCompletedWordPopup(null);
            advanceRound(signal);
          },1800);
        }
        return d;
      });},0);
    }else{setWrongSlot(droppedSlotIdx);setScore(s=>Math.max(0,s-3));setTimeout(()=>setWrongSlot(null),600);}
    setDragging(null);isDraggingRef.current=null;
  },[celebrate,advanceRound]);

  const handlePointerMove=useCallback((e)=>{if(!isDraggingRef.current)return;if(e.cancelable)e.preventDefault();const clientX=e.touches?e.touches[0].clientX:e.clientX,clientY=e.touches?e.touches[0].clientY:e.clientY;setGhostPos({x:clientX,y:clientY});},[]);
  const handlePointerUp=useCallback((e)=>{if(!isDraggingRef.current)return;const clientX=e.changedTouches?e.changedTouches[0].clientX:e.clientX,clientY=e.changedTouches?e.changedTouches[0].clientY:e.clientY;resolveDropAt(clientX,clientY,signalRef.current);},[resolveDropAt]);
  useEffect(()=>{if(!dragging)return;window.addEventListener("pointermove",handlePointerMove,{passive:false});window.addEventListener("pointerup",handlePointerUp);window.addEventListener("touchmove",handlePointerMove,{passive:false});window.addEventListener("touchend",handlePointerUp);return()=>{window.removeEventListener("pointermove",handlePointerMove);window.removeEventListener("pointerup",handlePointerUp);window.removeEventListener("touchmove",handlePointerMove);window.removeEventListener("touchend",handlePointerUp);};},[dragging,handlePointerMove,handlePointerUp]);
  const handlePiecePointerDown=(piece,e)=>{if(usedIds.has(piece.id)||celebrate)return;e.preventDefault();isDraggingRef.current=piece;setDragging(piece);const clientX=e.touches?e.touches[0].clientX:e.clientX,clientY=e.touches?e.touches[0].clientY:e.clientY;setGhostPos({x:clientX,y:clientY});};
  const restart=()=>{setRound(0);setData(makeRound());setScore(0);setDone(false);setCelebrate(false);setCompletedWordPopup(null);setUsedIds(new Set());setWrongSlot(null);setDragging(null);isDraggingRef.current=null;capturedReactionRef.current=null;};
  const handleAutoReaction=useCallback((reaction)=>{capturedReactionRef.current=reaction;onReaction&&onReaction(reaction);},[onReaction]);

  const gl={en:{back:"← Back",title:"Word Builder",buildWord:"Build this word",dragHint:"Drag the correct syllables in order",correct:"නිවැරදියි! ✓",scoreHint:"+15 correct · −3 wrong placement"},si:{back:"← ආපසු",title:"වචන ගොඩනැගිල්ල",buildWord:"මෙම වචනය ගොඩනගන්න",dragHint:"නිවැරදි සිලේබල් ඇදගෙන අනුපිළිවෙලට තබන්න",correct:"නිවැරදියි! ✓",scoreHint:"+15 නිවැරදි · −3 වැරදි ස්ථානය"},ta:{back:"← பின்னால்",title:"வார்த்தை கட்டமைப்பாளர்",buildWord:"இந்த வார்த்தையை கட்டுங்கள்",dragHint:"சரியான எழுத்துக்களை வரிசையாக இழுக்கவும்",correct:"சரி! ✓",scoreHint:"+15 சரி · −3 தவறான இடம்"}}[lang]??{back:"← Back",title:"Word Builder",buildWord:"Build this word",dragHint:"Drag syllables in order",correct:"Correct! ✓",scoreHint:"+15 correct · −3 wrong"};

  useEffect(()=>{if(done)onComplete(score,{});},[done]); // eslint-disable-line react-hooks/exhaustive-deps
  if(done)return<ResultScreen score={score} maxScore={TOTAL*45} onRetry={restart} onBack={onBack} lang={lang} onReaction={onReaction} capturedReaction={capturedReactionRef.current}/>;
  if(!data)return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#9ca3af"}}>Loading words…</div>;

  const progress=(round/TOTAL)*100;
  return(
    <GameWithAutoCamera onReaction={handleAutoReaction} lang={lang} gameId="word-builder" onBackToLobby={onBack}>
      {({signalGameEnd})=>{signalRef.current=signalGameEnd;return(
        <div className="min-h-screen pt-16 kids-game kids-builder">
          <style>{KIDS_ADVENTURE_CSS}</style>
          <SideDecor items={GAME_DECOR["word-builder"]}/>
          {completedWordPopup&&(<div style={{position:"fixed",inset:0,zIndex:9997,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",background:"rgba(255,255,255,0.10)",backdropFilter:"blur(2px)"}}><div style={{minWidth:260,maxWidth:"80vw",padding:"34px 54px",borderRadius:32,background:"linear-gradient(135deg,#fff7d6 0%,#ffe7f2 48%,#e8f5ff 100%)",border:"4px solid rgba(255,255,255,.95)",boxShadow:"0 22px 60px rgba(66,45,120,.28),0 7px 0 rgba(181,136,255,.22)",textAlign:"center",animation:"wordBuilderPop 1.8s cubic-bezier(.2,.8,.2,1) both"}}><div style={{fontSize:22,marginBottom:8}}>✨ 🎉 ✨</div><div style={{fontFamily:SINHALA_FONT,fontSize:"clamp(54px,9vw,110px)",fontWeight:900,lineHeight:1.1,color:"#6d28d9",textShadow:"0 4px 0 #fff,0 8px 22px rgba(109,40,217,.20)"}}>{completedWordPopup}</div><div style={{marginTop:10,fontFamily:SINHALA_FONT,fontSize:lang==="si"?18:15,fontWeight:800,color:"#7c3aed"}}>{lang==="si"?"ශාබාෂ්! වචනය සම්පූර්ණයි!":lang==="ta"?"சிறப்பு! வார்த்தை முடிந்தது!":"Great job! Word complete!"}</div></div><style>{`@keyframes wordBuilderPop{0%{opacity:0;transform:scale(.45) rotate(-4deg)}18%{opacity:1;transform:scale(1.10) rotate(2deg)}34%{transform:scale(.98) rotate(0deg)}72%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.18)}}`}</style></div>)}
          {dragging&&<div style={{position:"fixed",left:ghostPos.x-36,top:ghostPos.y-36,width:72,height:72,borderRadius:16,border:"2px solid #111",background:"#111",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontFamily:SINHALA_FONT,fontWeight:"bold",pointerEvents:"none",zIndex:9999,opacity:0.9,transform:"scale(1.1)"}}>{dragging.text}</div>}
          <div className="border-b border-gray-100 bg-white sticky top-16 z-10"><div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between"><button onClick={onBack} className="font-body text-sm text-gray-400 hover:text-black transition-colors">{gl.back}</button><span className="font-body text-xs text-gray-400 uppercase tracking-widest">{gl.title}</span><div className="flex gap-5 font-body text-sm"><span className="text-gray-400">{round+1}/{TOTAL}</span><span className="font-semibold">{score} {lang==="si"?"ල.":lang==="ta"?"புள்.":"pts"}</span></div></div></div>
          <div className="max-w-2xl mx-auto px-6 py-10">
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-10"><div className="h-1 bg-black rounded-full transition-all duration-700" style={{width:`${progress}%`}}/></div>
            <div className={`rounded-3xl border bg-gray-50 p-8 text-center mb-8 transition-all duration-300 ${celebrate?"builder-complete":"border-gray-100"}`}>
              {data.word.imageUrl?(<img src={getImageUrl(data.word.imageUrl)} alt={data.word.word} className="mx-auto mb-3 rounded-2xl object-cover" style={{width:300,height:300}} onError={(e)=>{console.error("Word image failed to load:",e.target.src);e.target.style.display="none";e.target.nextSibling.style.display="block";}}/>):null}
              <div className="text-6xl mb-3" style={{display:data.word.imageUrl?"none":"block"}}>🖼️</div>
              <p className="font-body text-xs uppercase tracking-widest mb-1 text-gray-400">{gl.buildWord}</p>
              <p className={`font-display text-2xl font-bold mb-1 ${celebrate?"text-sky-900":"text-black"}`}>{data.word.meaning}</p>
              {celebrate&&<p className="font-body text-sm text-sky-800 mt-2 anim-fade-up">{gl.correct} — {data.word.word}</p>}
            </div>
            <div className="flex gap-3 justify-center mb-10">
              {data.word.syllables.map((_,slotIdx)=>{const filled=data.slots[slotIdx],isWrong=wrongSlot===slotIdx;return(<div key={slotIdx} ref={el=>{slotRefs.current[slotIdx]=el;}} data-slot-idx={slotIdx} className={`flex-1 min-w-0 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center ${filled?"builder-filled":isWrong?"border-red-300 bg-red-50":"border-dashed border-gray-200 bg-white"}`} style={{height:80}}>{filled?<span className="font-bold text-3xl" style={{fontFamily:SINHALA_FONT}}>{filled}</span>:<span className="font-body text-xs text-gray-300">{slotIdx+1}</span>}</div>);})}
            </div>
            <div className="mb-4">
              <p className="font-body text-xs text-gray-400 uppercase tracking-widest text-center mb-5">{gl.dragHint}</p>
              <div className="flex gap-4 justify-center flex-wrap">
                {data.pool.map(piece=>{const isUsed=usedIds.has(piece.id),isDragging=dragging?.id===piece.id;return(<div key={piece.id} onPointerDown={e=>handlePiecePointerDown(piece,e)} className={`select-none transition-all duration-200 rounded-2xl border-2 flex items-center justify-center font-bold ${isUsed?"border-gray-100 bg-gray-50 text-gray-200 cursor-default":isDragging?"border-gray-200 bg-gray-50 text-gray-200 opacity-40 cursor-grabbing scale-95":"border-gray-200 bg-white text-gray-800 cursor-grab hover:border-black hover:shadow-lg hover:-translate-y-1"}`} style={{width:72,height:72,fontSize:26,fontFamily:SINHALA_FONT,touchAction:isUsed?"auto":"none"}}>{isUsed?"✓":piece.text}</div>);})}
              </div>
            </div>
            <p className="font-body text-xs text-center text-gray-300">{gl.scoreHint}</p>
          </div>
        </div>
      );}}
    </GameWithAutoCamera>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAME 6 — WORD UNSCRAMBLE (uses DB words via prop)
// ═══════════════════════════════════════════════════════════════════
function WordUnscrambleGame({onComplete,onBack,lang,onReaction,words=[]}){
  const TOTAL=10;
  const makeRound=useCallback(()=>{
    if(words.length===0)return null;
    const word=words[Math.floor(Math.random()*words.length)];
    const scrambled=shuffle([...word.syllables].map((s,i)=>({id:`s${i}_${Math.random()}`,text:s,origIdx:i})));
    return{word,scrambled,selected:[]};
  },[words]);

  const[round,setRound]=useState(0),[data,setData]=useState(null),[score,setScore]=useState(0),[done,setDone]=useState(false);
  const[status,setStatus]=useState(null),[bonusFlash,setBonusFlash]=useState(null),[timer,setTimer]=useState(0);
  const capturedReactionRef=useRef(null),timerRef=useRef(null),signalRef=useRef(null);

  useEffect(()=>{if(words.length>0&&!data){setData(makeRound());}},[words,data,makeRound]);
  useEffect(()=>{timerRef.current=setInterval(()=>setTimer(t=>t+1),1000);return()=>clearInterval(timerRef.current);},[round]);

  const advanceRound=useCallback((signal)=>{if(round+1>=TOTAL){signal&&signal();setTimeout(()=>setDone(true),300);return;}setRound(r=>r+1);setData(makeRound());setStatus(null);setBonusFlash(null);setTimer(0);},[round,makeRound]);
  const handleTile=(tile,signal)=>{if(status||!data||data.selected.find(s=>s.id===tile.id))return;const newSelected=[...data.selected,tile];setData(d=>({...d,selected:newSelected}));if(newSelected.length===data.word.syllables.length){const formed=newSelected.map(s=>s.text).join("");if(formed===data.word.word){const bonus=Math.max(0,20-timer),pts=20+bonus;setScore(s=>s+pts);setStatus("correct");setBonusFlash(`+${pts}`);setTimeout(()=>advanceRound(signal),1000);}else{setStatus("wrong");setScore(s=>Math.max(0,s-5));setTimeout(()=>{setData(d=>d?{...d,selected:[]}:d);setStatus(null);},700);}}};
  const deselect=(tile)=>{if(status||!data)return;setData(d=>d?{...d,selected:d.selected.filter(s=>s.id!==tile.id)}:d);};
  const restart=()=>{setRound(0);setData(makeRound());setScore(0);setDone(false);setStatus(null);setBonusFlash(null);setTimer(0);capturedReactionRef.current=null;};
  const handleAutoReaction=useCallback((reaction)=>{capturedReactionRef.current=reaction;onReaction&&onReaction(reaction);},[onReaction]);
  const gl={en:{back:"← Back",title:"Word Unscramble",unscramble:"Unscramble to spell",tapHint:"Tap syllables below to build the word",scrambledHint:"Scrambled syllables — tap to place",scoreHint:"+20 base · bonus for speed · −5 wrong order"},si:{back:"← ආපසු",title:"වචන ව්‍යාකූලතාව",unscramble:"අකුරු සකසා ලියන්න",tapHint:"පහත සිලේබල් තද කර වචනය ගොඩනගන්න",scrambledHint:"ව්‍යාකූල සිලේබල් — තද කර තබන්න",scoreHint:"+20 මූලික · වේගය සඳහා බෝනස් · −5 වැරදි"},ta:{back:"← பின்னால்",title:"வார்த்தை குழப்பம்",unscramble:"எழுத்துக்களை சரியாக வரிசைப்படுத்துங்கள்",tapHint:"வார்த்தை கட்ட கீழே உள்ள எழுத்துக்களை தட்டவும்",scrambledHint:"குழப்பமான எழுத்துக்கள் — தட்டி வைக்கவும்",scoreHint:"+20 அடிப்படை · வேகத்திற்கு போனஸ் · −5 தவறான வரிசை"}}[lang]??{back:"← Back",title:"Word Unscramble",unscramble:"Unscramble",tapHint:"Tap syllables",scrambledHint:"Scrambled syllables",scoreHint:"+20 correct"};

  useEffect(()=>{if(done)onComplete(score,{});},[done]); // eslint-disable-line react-hooks/exhaustive-deps
  if(done)return<ResultScreen score={score} maxScore={TOTAL*30} time={timer} onRetry={restart} onBack={onBack} lang={lang} onReaction={onReaction} capturedReaction={capturedReactionRef.current}/>;
  if(!data)return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#9ca3af"}}>Loading words…</div>;

  const progress=(round/TOTAL)*100;
  return(
    <GameWithAutoCamera onReaction={handleAutoReaction} lang={lang} gameId="word-unscramble" onBackToLobby={onBack}>
      {({signalGameEnd})=>{signalRef.current=signalGameEnd;return(
        <div className="min-h-screen pt-16 kids-game kids-unscramble">
          <style>{KIDS_ADVENTURE_CSS}</style>
          <SideDecor items={GAME_DECOR["word-unscramble"]}/>
          <div className="border-b border-gray-100 bg-white sticky top-16 z-10"><div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between"><button onClick={onBack} className="font-body text-sm text-gray-400 hover:text-black transition-colors">{gl.back}</button><span className="font-body text-xs text-gray-400 uppercase tracking-widest">{gl.title}</span><div className="flex gap-5 font-body text-sm"><span className="text-gray-400">{round+1}/{TOTAL}</span><span className="text-gray-400">{timer}s</span><span className="font-semibold">{score} {lang==="si"?"ල.":lang==="ta"?"புள்.":"pts"}</span></div></div></div>
          <div className="max-w-xl mx-auto px-6 py-10">
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-10"><div className="h-1 bg-black rounded-full transition-all duration-700" style={{width:`${progress}%`}}/></div>
            <div className={`rounded-3xl border p-8 text-center mb-8 transition-all duration-300 ${status==="correct"?"border-black bg-black text-white":status==="wrong"?"border-red-200 bg-red-50":"border-gray-100 bg-gray-50"}`}>
              {data.word.imageUrl?(<img src={getImageUrl(data.word.imageUrl)} alt={data.word.word} className="mx-auto mb-3 rounded-2xl object-cover" style={{width:80,height:80}} onError={(e)=>{console.error("Word image failed to load:",e.target.src);e.target.style.display="none";e.target.nextSibling.style.display="block";}}/>):null}
              <div className="text-5xl mb-3" style={{display:data.word.imageUrl?"none":"block"}}>🖼️</div>
              <p className="font-body text-xs uppercase tracking-widest mb-2 text-gray-400">{gl.unscramble}</p>
              <p className={`font-display text-3xl font-bold ${status==="correct"?"text-white":status==="wrong"?"text-red-600":"text-black"}`}>{data.word.meaning}</p>
              {bonusFlash&&<div className="mt-3 inline-block font-display text-2xl font-bold text-white anim-fade-up">{bonusFlash} {lang==="si"?"ල.":lang==="ta"?"புள்.":"pts"}!</div>}
            </div>
            <div className="mb-2">
              <p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-3 text-center">{lang==="si"?"ඔබේ පිළිතුර":lang==="ta"?"உங்கள் பதில்":"Your answer"}</p>
              <div className="flex gap-3 justify-center min-h-[72px] items-center flex-wrap">
                {data.selected.length===0?<span className="font-body text-sm text-gray-200">{gl.tapHint}</span>:data.selected.map((tile)=>(<button key={tile.id} onClick={()=>deselect(tile)} className={`rounded-2xl border-2 flex items-center justify-center font-bold transition-all duration-200 ${status==="correct"?"border-black bg-black text-white cursor-default":status==="wrong"?"border-red-300 bg-red-100 text-red-600 cursor-default":"border-black bg-black text-white hover:opacity-80 cursor-pointer"}`} style={{width:68,height:68,fontSize:24,fontFamily:SINHALA_FONT}}>{tile.text}</button>))}
              </div>
            </div>
            <div className="mt-8">
              <p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-5 text-center">{gl.scrambledHint}</p>
              <div className="flex gap-4 justify-center flex-wrap">
                {data.scrambled.map(tile=>{const isSelected=!!data.selected.find(s=>s.id===tile.id);return(<button key={tile.id} onClick={()=>handleTile(tile,signalGameEnd)} disabled={isSelected||!!status} className={`rounded-2xl border-2 flex items-center justify-center font-bold transition-all duration-200 ${isSelected?"border-gray-100 bg-gray-50 text-gray-200 cursor-default scale-90":"border-gray-200 bg-white text-gray-800 hover:border-black hover:shadow-lg hover:-translate-y-1 cursor-pointer"}`} style={{width:72,height:72,fontSize:26,fontFamily:SINHALA_FONT}}>{tile.text}</button>);})}
              </div>
            </div>
            <p className="font-body text-xs text-center text-gray-300 mt-8">{gl.scoreHint}</p>
          </div>
        </div>
      );}}
    </GameWithAutoCamera>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAME 7 — MISSING LETTER (uses DB words via prop)
// ═══════════════════════════════════════════════════════════════════
function MissingLetterGame({letters,onComplete,onBack,lang,onReaction,words=[]}){
  const TOTAL=12;
  const makeQ=useCallback(()=>{
    if(words.length===0||letters.length===0)return null;
    const word=words[Math.floor(Math.random()*words.length)];
    const blankIdx=Math.floor(Math.random()*word.syllables.length);
    const correct=word.syllables[blankIdx];
    const wrongs=shuffle(letters.filter(l=>l.letter!==correct)).slice(0,3).map(l=>l.letter);
    const options=shuffle([correct,...wrongs]);
    return{word,blankIdx,correct,options};
  },[words,letters]);

  const[qNum,setQNum]=useState(1),[q,setQ]=useState(null),[score,setScore]=useState(0);
  const[answered,setAnswered]=useState(null),[done,setDone]=useState(false);
  const[streak,setStreak]=useState(0),[streakFlash,setStreakFlash]=useState(false);
  const capturedReactionRef=useRef(null),signalRef=useRef(null);

  useEffect(()=>{if(words.length>0&&letters.length>0&&!q){setQ(makeQ());}},[words,letters,q,makeQ]);

  const next=useCallback((signal)=>{if(qNum>=TOTAL){signal&&signal();setTimeout(()=>setDone(true),300);return;}setQNum(n=>n+1);setQ(makeQ());setAnswered(null);},[qNum,makeQ]);
  const answer=(opt,signal)=>{if(answered||!q)return;setAnswered(opt);if(opt===q.correct){const newStreak=streak+1;setStreak(newStreak);const bonus=newStreak>=3?10:0;setScore(s=>s+20+bonus);if(newStreak>=3)setStreakFlash(true);setTimeout(()=>{next(signal);setStreakFlash(false);},900);}else{setStreak(0);setStreakFlash(false);setScore(s=>Math.max(0,s-5));setTimeout(()=>{setAnswered(null);},900);}};
  const restart=()=>{setQNum(1);setQ(makeQ());setScore(0);setAnswered(null);setDone(false);setStreak(0);setStreakFlash(false);capturedReactionRef.current=null;};
  const handleAutoReaction=useCallback((reaction)=>{capturedReactionRef.current=reaction;onReaction&&onReaction(reaction);},[onReaction]);
  const gl={en:{back:"← Back",title:"Missing Letter",fillBlank:"fill the missing part",streakBonus:"🔥 Streak Bonus +10!",scoreHint:"+20 correct · +10 bonus on 3× streak · −5 wrong"},si:{back:"← ආපසු",title:"අස්ථාන අකුර",fillBlank:"නැතිවූ කොටස පිරවන්න",streakBonus:"🔥 ලකුණු අනුලකුණු +10!",scoreHint:"+20 නිවැරදි · 3× ශ්‍රේණිය +10 · −5 වැරදි"},ta:{back:"← பின்னால்",title:"காணாமல் போன எழுத்து",fillBlank:"காணாத பகுதியை நிரப்பவும்",streakBonus:"🔥 தொடர் போனஸ் +10!",scoreHint:"+20 சரி · 3× தொடர் +10 · −5 தவறு"}}[lang]??{back:"← Back",title:"Missing Letter",fillBlank:"fill the blank",streakBonus:"🔥 Streak +10!",scoreHint:"+20 correct"};

  useEffect(()=>{if(done)onComplete(score,{questionCount:qNum});},[done]); // eslint-disable-line react-hooks/exhaustive-deps
  if(done)return<ResultScreen score={score} maxScore={TOTAL*30} questionCount={qNum} onRetry={restart} onBack={onBack} lang={lang} onReaction={onReaction} capturedReaction={capturedReactionRef.current}/>;
  if(!q)return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#9ca3af"}}>Loading…</div>;

  const progress=((qNum-1)/TOTAL)*100;
  return(
    <GameWithAutoCamera onReaction={handleAutoReaction} lang={lang} gameId="missing-letter" onBackToLobby={onBack}>
      {({signalGameEnd})=>{signalRef.current=signalGameEnd;return(
        <div className="min-h-screen pt-16 kids-game kids-missing">
          <style>{KIDS_ADVENTURE_CSS}</style>
          <SideDecor items={GAME_DECOR["missing-letter"]}/>
          <div className="border-b border-gray-100 bg-white sticky top-16 z-10"><div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between"><button onClick={onBack} className="font-body text-sm text-gray-400 hover:text-black transition-colors">{gl.back}</button><span className="font-body text-xs text-gray-400 uppercase tracking-widest">{gl.title}</span><div className="flex gap-4 font-body text-sm items-center">{streak>=3&&<span className={`text-xs font-bold px-3 py-1 rounded-full border border-gray-200 ${streakFlash?"bg-black text-white border-black":"text-gray-600"} transition-all duration-300`}>🔥 {streak} streak</span>}<span className="text-gray-400">{qNum}/{TOTAL}</span><span className="font-semibold">{score} {lang==="si"?"ල.":lang==="ta"?"புள்.":"pts"}</span></div></div></div>
          <div className="max-w-xl mx-auto px-6 py-10">
            <div className="flex items-center gap-3 mb-10"><div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden"><div className="h-1 bg-black rounded-full transition-all duration-500" style={{width:`${progress}%`}}/></div></div>
            <div className="rounded-3xl border border-gray-100 bg-gray-50 px-6 py-10 text-center mb-8">
              {q.word.imageUrl?(<img src={getImageUrl(q.word.imageUrl)} alt={q.word.word} className="mx-auto mb-4 rounded-2xl object-cover" style={{width:300,height:300}} onError={(e)=>{console.error("Word image failed to load:",e.target.src);e.target.style.display="none";e.target.nextSibling.style.display="block";}}/>):null}
              <div className="text-5xl mb-4" style={{display:q.word.imageUrl?"none":"block"}}>🖼️</div>
              <p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-6">{q.word.meaning} — {gl.fillBlank}</p>
              <div className="flex gap-3 justify-center items-center flex-wrap">
                {q.word.syllables.map((syl,i)=>(<div key={i} className="flex flex-col items-center gap-1">
                  {i===q.blankIdx?(<div className={`rounded-2xl border-2 border-dashed flex items-center justify-center font-bold transition-all duration-300 ${answered===null?"border-gray-300 bg-white":answered===q.correct?"missing-blank-correct":"border-red-300 bg-red-50"}`} style={{width:72,height:72,fontSize:28,fontFamily:SINHALA_FONT}}>{answered!==null?<span>{answered}</span>:<span className="text-3xl text-gray-200">_</span>}</div>
                  ):(<div className="rounded-2xl border border-gray-200 bg-white flex items-center justify-center font-bold" style={{width:72,height:72,fontSize:28,fontFamily:SINHALA_FONT,color:"#111"}}>{syl}</div>)}
                </div>))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6 kids-answer-grid">
              {q.options.map((opt,i)=>{let cls="border-gray-100 bg-white text-gray-800 hover:border-gray-300 hover:shadow-md cursor-pointer";if(answered!==null){if(opt===q.correct)cls="missing-correct shadow-lg";else if(opt===answered)cls="border-red-200 bg-red-50 text-red-500";else cls="border-gray-100 bg-gray-50 text-gray-300 cursor-default";}return(<button key={i} onClick={()=>answer(opt,signalGameEnd)} disabled={!!answered} style={{fontFamily:SINHALA_FONT}} className={`border-2 rounded-2xl py-5 text-3xl font-bold transition-all duration-200 disabled:cursor-default ${cls}`}>{opt}</button>);})}
            </div>
            {streakFlash&&<div className="text-center anim-fade-up"><span className="font-display text-lg font-bold">{gl.streakBonus}</span></div>}
            <p className="font-body text-xs text-center text-gray-300 mt-4">{gl.scoreHint}</p>
          </div>
        </div>
      );}}
    </GameWithAutoCamera>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAME 8 — LINE CONNECT (uses DB connectSets via prop)
// ═══════════════════════════════════════════════════════════════════
function LineConnectGame({onComplete,onBack,lang,onReaction,connectSets=[]}){
  const ROUNDS=connectSets.length;
  const[roundIdx,setRoundIdx]=useState(0),[score,setScore]=useState(0),[done,setDone]=useState(false);
  const capturedReactionRef=useRef(null),signalRef=useRef(null);

  const makeRound=useCallback((idx)=>{
    if(connectSets.length===0||idx>=connectSets.length)return null;
    const set=connectSets[idx];
    const shuffledRight=shuffle([...set.pairs.map((p,i)=>({...p,origIdx:i,id:`r${i}`}))]);
    return{set,leftItems:set.pairs.map((p,i)=>({...p,id:`l${i}`,origIdx:i})),rightItems:shuffledRight,connections:{}};
  },[connectSets]);

  const[round,setRound]=useState(null);
  useEffect(()=>{if(connectSets.length>0&&!round){setRound(makeRound(0));}},[connectSets,round,makeRound]);

  const svgRef=useRef(null),leftRefs=useRef({}),rightRefs=useRef({}),boardRef=useRef(null);
  const[dragging,setDragging]=useState(null),[hoveredRight,setHoveredRight]=useState(null),[showResult,setShowResult]=useState(false),[timer,setTimer]=useState(0);
  const timerRef=useRef(null),draggingRef=useRef(null),hoveredRightRef=useRef(null),activePointerIdRef=useRef(null);

  useEffect(()=>{draggingRef.current=dragging;},[dragging]);
  useEffect(()=>{hoveredRightRef.current=hoveredRight;},[hoveredRight]);
  useEffect(()=>{timerRef.current=setInterval(()=>setTimer(t=>t+1),1000);return()=>clearInterval(timerRef.current);},[roundIdx]);

  const getAnchor=(el,side)=>{
    if(!el||!svgRef.current)return{x:0,y:0};
    const svgRect=svgRef.current.getBoundingClientRect();
    const elRect=el.getBoundingClientRect();
    return{
      x:side==="right"?elRect.right-svgRect.left:elRect.left-svgRect.left,
      y:elRect.top+elRect.height/2-svgRect.top
    };
  };

  // Finds the right-side answer even when the finger/pointer is over a
  // child element such as the text <span> or the small connection dot.
  const getRightTargetAtPoint=useCallback((clientX,clientY)=>{
    const hit=document.elementFromPoint(clientX,clientY);
    const target=hit?.closest?.("[data-rid]");
    if(!target||!boardRef.current?.contains(target))return null;
    return target.dataset.rid||null;
  },[]);

  const connectPair=useCallback((leftId,rightId)=>{
    if(!leftId||!rightId)return;
    setRound(r=>{
      if(!r)return r;
      const newConn={...r.connections};

      // A right answer can belong to only one left item.
      Object.keys(newConn).forEach(k=>{
        if(newConn[k]===rightId)delete newConn[k];
      });

      newConn[leftId]=rightId;
      return{...r,connections:newConn};
    });
  },[]);

  const clearDrag=useCallback(()=>{
    draggingRef.current=null;
    hoveredRightRef.current=null;
    activePointerIdRef.current=null;
    setDragging(null);
    setHoveredRight(null);
  },[]);

  // Pointer Events work with mouse, touch and pen using one code path.
  const handleLeftPointerDown=useCallback((e,leftId)=>{
    if(showResult)return;
    if(e.pointerType==="mouse"&&e.button!==0)return;
    if(!svgRef.current||!boardRef.current)return;

    e.preventDefault();

    const el=leftRefs.current[leftId];
    if(!el)return;

    const{x,y}=getAnchor(el,"right");
    const svgRect=svgRef.current.getBoundingClientRect();
    const newDrag={
      fromId:leftId,
      x1:x,
      y1:y,
      curX:e.clientX-svgRect.left,
      curY:e.clientY-svgRect.top
    };

    activePointerIdRef.current=e.pointerId;
    draggingRef.current=newDrag;
    hoveredRightRef.current=null;
    setDragging(newDrag);
    setHoveredRight(null);

    // Keep receiving pointermove/pointerup even if the finger moves over
    // child elements or slightly outside the starting box.
    try{boardRef.current.setPointerCapture(e.pointerId);}catch{}
  },[showResult]);

  const handleBoardPointerMove=useCallback((e)=>{
    const currentDrag=draggingRef.current;
    if(!currentDrag||!svgRef.current)return;
    if(activePointerIdRef.current!==null&&e.pointerId!==activePointerIdRef.current)return;

    e.preventDefault();

    const svgRect=svgRef.current.getBoundingClientRect();
    const updated={
      ...currentDrag,
      curX:e.clientX-svgRect.left,
      curY:e.clientY-svgRect.top
    };

    draggingRef.current=updated;
    setDragging(updated);

    const rid=getRightTargetAtPoint(e.clientX,e.clientY);
    hoveredRightRef.current=rid;
    setHoveredRight(rid);
  },[getRightTargetAtPoint]);

  const handleBoardPointerUp=useCallback((e)=>{
    const currentDrag=draggingRef.current;
    if(!currentDrag)return;
    if(activePointerIdRef.current!==null&&e.pointerId!==activePointerIdRef.current)return;

    e.preventDefault();

    // Re-check the exact release point. This makes quick taps/drags reliable
    // even when the browser did not fire a final pointermove first.
    const releaseTarget=getRightTargetAtPoint(e.clientX,e.clientY)??hoveredRightRef.current;
    if(releaseTarget)connectPair(currentDrag.fromId,releaseTarget);

    try{
      if(boardRef.current?.hasPointerCapture?.(e.pointerId)){
        boardRef.current.releasePointerCapture(e.pointerId);
      }
    }catch{}

    clearDrag();
  },[clearDrag,connectPair,getRightTargetAtPoint]);

  const handleBoardPointerCancel=useCallback((e)=>{
    try{
      if(boardRef.current?.hasPointerCapture?.(e.pointerId)){
        boardRef.current.releasePointerCapture(e.pointerId);
      }
    }catch{}
    clearDrag();
  },[clearDrag]);

  const handleConfirm=(signal)=>{
    if(!round||Object.keys(round.connections).length<round.leftItems.length)return;
    setShowResult(true);clearInterval(timerRef.current);
    let correct=0;round.leftItems.forEach(li=>{const ri=round.rightItems.find(r=>r.id===round.connections[li.id]);if(ri&&ri.origIdx===li.origIdx)correct++;});
    const pts=correct*20;setScore(s=>s+pts);
    setTimeout(()=>{if(roundIdx+1>=ROUNDS){signal&&signal();setTimeout(()=>{setDone(true);onComplete(score+pts,{});},300);}else{setRoundIdx(r=>r+1);setRound(makeRound(roundIdx+1));setShowResult(false);setTimer(0);timerRef.current=setInterval(()=>setTimer(t=>t+1),1000);}},2200);
  };

  const restart=()=>{
    setRoundIdx(0);
    setRound(makeRound(0));
    setScore(0);
    setDone(false);
    setShowResult(false);
    setTimer(0);
    setDragging(null);
    setHoveredRight(null);
    draggingRef.current=null;
    hoveredRightRef.current=null;
    activePointerIdRef.current=null;
    capturedReactionRef.current=null;
    clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setTimer(t=>t+1),1000);
  };

  const handleAutoReaction=useCallback((reaction)=>{capturedReactionRef.current=reaction;onReaction&&onReaction(reaction);},[onReaction]);
  const gl={en:{back:"← Back",title:"Line Connect",connected:"connected",clearLines:"Clear Lines",checkAnswers:"Check Answers →",checking:"Checking…",connectRemaining:(n)=>`Connect all ${n} remaining`,scoreHint:"Drag from left word → right answer · +20 per correct pair"},si:{back:"← ආපසු",title:"රේඛා සම්බන්ධ කිරීම",connected:"සම්බන්ධ",clearLines:"රේඛා ඉවත් කරන්න",checkAnswers:"පිළිතුරු පරීක්ෂා කරන්න →",checking:"පරීක්ෂා කිරීම…",connectRemaining:(n)=>`ඉතිරි ${n} සම්බන්ධ කරන්න`,scoreHint:"වාම වචනයේ සිට දකුණු පිළිතුරට ඇදගන්න · +20 සෑම නිවැරදි යුගලයකට"},ta:{back:"← பின்னால்",title:"கோடு இணைப்பு",connected:"இணைக்கப்பட்டது",clearLines:"கோடுகளை அழிக்கவும்",checkAnswers:"விடைகளை சரிபார்க்கவும் →",checking:"சரிபார்க்கிறது…",connectRemaining:(n)=>`மீதமுள்ள ${n} ஐ இணைக்கவும்`,scoreHint:"இடது வார்த்தையிலிருந்து வலது பதிலுக்கு இழுக்கவும் · +20 ஒவ்வொரு சரியான ஜோடிக்கும்"}}[lang]??{back:"← Back",title:"Line Connect",connected:"connected",clearLines:"Clear",checkAnswers:"Check →",checking:"Checking…",connectRemaining:(n)=>`Connect ${n} more`,scoreHint:"+20 per correct pair"};

  if(done)return<ResultScreen score={score} maxScore={ROUNDS*(round?.leftItems?.length??6)*20} time={timer} onRetry={restart} onBack={onBack} lang={lang} onReaction={onReaction} capturedReaction={capturedReactionRef.current}/>;
  if(!round)return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#9ca3af"}}>Loading connect sets…</div>;

  const allConnected=Object.keys(round.connections).length>=round.leftItems.length,progress=(roundIdx/Math.max(ROUNDS,1))*100;
  const lineColor=(leftId)=>{if(!showResult)return dragging?.fromId===leftId?"#111":"#9ca3af";const ri=round.rightItems.find(r=>r.id===round.connections[leftId]);const li=round.leftItems.find(l=>l.id===leftId);return ri&&ri.origIdx===li.origIdx?"#16a34a":"#ef4444";};

  return(
    <GameWithAutoCamera onReaction={handleAutoReaction} lang={lang} gameId="line-connect" onBackToLobby={onBack}>
      {({signalGameEnd})=>{signalRef.current=signalGameEnd;return(
        <div className="min-h-screen pt-16 kids-game kids-connect" style={{userSelect:"none"}}>
          <style>{KIDS_ADVENTURE_CSS}</style>
          <SideDecor items={GAME_DECOR["line-connect"]}/>
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;700&display=swap');.connect-left:hover{border-color:#111 !important;}.connect-right:hover{border-color:#111 !important;}`}</style>
          <div className="border-b border-gray-100 bg-white sticky top-16 z-10"><div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between"><button onClick={onBack} className="font-body text-sm text-gray-400 hover:text-black transition-colors">{gl.back}</button><span className="font-body text-xs text-gray-400 uppercase tracking-widest">{gl.title}</span><div className="flex gap-5 font-body text-sm"><span className="text-gray-400">{lang==="si"?"වාරය":lang==="ta"?"சுற்று":"Round"} {roundIdx+1}/{ROUNDS}</span><span className="text-gray-400">{timer}s</span><span className="font-semibold">{score} {lang==="si"?"ල.":lang==="ta"?"புள்.":"pts"}</span></div></div></div>
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-8"><div className="h-1 bg-black rounded-full transition-all duration-700" style={{width:`${progress}%`}}/></div>
            <div className="rounded-3xl border border-gray-100 bg-gray-50 px-8 py-5 mb-6 flex items-center justify-between"><div><p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-1">{round.set.hint}</p><p className="font-display text-xl font-bold" style={{fontFamily:SINHALA_FONT}}>{round.set.title}</p></div><div className="font-body text-xs text-gray-400">{Object.keys(round.connections).length}/{round.leftItems.length} {gl.connected}</div></div>

            <div
              ref={boardRef}
              className="rounded-3xl border-2 border-gray-100 bg-white overflow-hidden relative"
              style={{touchAction:"none",WebkitUserSelect:"none",userSelect:"none"}}
              onPointerMove={handleBoardPointerMove}
              onPointerUp={handleBoardPointerUp}
              onPointerCancel={handleBoardPointerCancel}
            >
              <div className="flex" style={{minHeight:440}}>
                <div className="flex flex-col justify-around py-6 px-6" style={{width:"40%",gap:0}}>
                  {round.leftItems.map((item)=>{
                    const isConnected=!!round.connections[item.id],lineCol=showResult?lineColor(item.id):null;
                    return(
                      <div
                        key={item.id}
                        ref={el=>{leftRefs.current[item.id]=el;}}
                        onPointerDown={e=>handleLeftPointerDown(e,item.id)}
                        className="connect-left flex items-center gap-3 rounded-2xl border-2 px-4 py-3 cursor-crosshair transition-all duration-200 select-none"
                        style={{
                          borderColor:showResult&&lineCol?lineCol:isConnected?"#111":"#e5e7eb",
                          background:showResult&&lineCol==="#16a34a"?"#f0fdf4":showResult&&lineCol==="#ef4444"?"#fef2f2":"white",
                          marginBottom:6,
                          touchAction:"none"
                        }}
                      >
                        <span style={{fontFamily:SINHALA_FONT,fontSize:20,fontWeight:700,color:"#111",lineHeight:1.3}}>{item.left}</span>
                        <span className="font-body text-xs text-gray-300">{item.leftMeaning}</span>
                        <div className="ml-auto w-3 h-3 rounded-full border-2 flex-shrink-0 transition-all" style={{borderColor:isConnected?"#111":"#d1d5db",background:isConnected?"#111":"white"}}/>
                      </div>
                    );
                  })}
                </div>

                <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex:10}}>
                  {round.leftItems.map(li=>{
                    const rid=round.connections[li.id];
                    if(!rid)return null;
                    const p1=getAnchor(leftRefs.current[li.id],"right"),p2=getAnchor(rightRefs.current[rid],"left");
                    const col=showResult?lineColor(li.id):"#111";
                    const cx1=p1.x+(p2.x-p1.x)*0.45,cx2=p1.x+(p2.x-p1.x)*0.55;
                    return<path key={li.id} d={`M ${p1.x} ${p1.y} C ${cx1} ${p1.y}, ${cx2} ${p2.y}, ${p2.x} ${p2.y}`} fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" style={{transition:showResult?"stroke 0.3s":"none"}}/>;
                  })}
                  {dragging&&(()=>{
                    const cx1=dragging.x1+(dragging.curX-dragging.x1)*0.45,cx2=dragging.x1+(dragging.curX-dragging.x1)*0.55;
                    return<path d={`M ${dragging.x1} ${dragging.y1} C ${cx1} ${dragging.y1}, ${cx2} ${dragging.curY}, ${dragging.curX} ${dragging.curY}`} fill="none" stroke="#111" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round"/>;
                  })()}
                </svg>

                <div className="flex flex-col justify-around py-6 px-6 ml-auto" style={{width:"40%",gap:0}}>
                  {round.rightItems.map((item)=>{
                    const isTarget=hoveredRight===item.id,isConnected=Object.values(round.connections).includes(item.id);
                    const lineCol=showResult?(()=>{const li=round.leftItems.find(l=>round.connections[l.id]===item.id);return li?lineColor(li.id):null;})():null;
                    return(
                      <div
                        key={item.id}
                        ref={el=>{rightRefs.current[item.id]=el;}}
                        data-rid={item.id}
                        className="connect-right flex items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-all duration-200 select-none"
                        style={{
                          borderColor:isTarget?"#111":showResult&&lineCol?lineCol:isConnected?"#111":"#e5e7eb",
                          background:isTarget?"#f9fafb":showResult&&lineCol==="#16a34a"?"#f0fdf4":showResult&&lineCol==="#ef4444"?"#fef2f2":"white",
                          cursor:"default",
                          marginBottom:6,
                          touchAction:"none"
                        }}
                      >
                        <div className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{borderColor:isTarget||isConnected?"#111":"#d1d5db",background:isTarget||isConnected?"#111":"white"}}/>
                        <span style={{fontFamily:SINHALA_FONT,fontSize:20,fontWeight:700,color:"#111",lineHeight:1.3}}>{item.right}</span>
                        <span className="font-body text-xs text-gray-300">{item.rightMeaning}</span>
                        {showResult&&lineCol&&<span className="ml-auto text-lg">{lineCol==="#16a34a"?"✓":"✗"}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={()=>{setRound(r=>r?{...makeRound(roundIdx),connections:{}}:r);setShowResult(false);clearDrag();}} disabled={showResult} className="font-body flex-1 py-3 rounded-2xl text-sm font-bold transition-all disabled:cursor-not-allowed" style={{background:"linear-gradient(135deg,#fbbf24,#f59e0b)",color:"#78350f",border:"2px solid #fde68a",boxShadow:"0 5px 0 #d97706,0 8px 16px rgba(217,119,6,.20)",opacity:showResult?.62:1}}>{gl.clearLines}</button>
              <button onClick={()=>handleConfirm(signalGameEnd)} disabled={!allConnected||showResult} className="font-body flex-1 py-3 rounded-2xl text-sm font-bold transition-all disabled:cursor-not-allowed" style={{background:"linear-gradient(135deg,#4ade80,#16a34a)",color:"#ffffff",border:"2px solid #bbf7d0",boxShadow:"0 5px 0 #15803d,0 8px 16px rgba(21,128,61,.22)",textShadow:"0 1px 2px rgba(0,0,0,.18)",opacity:(!allConnected||showResult)?.62:1}}>{showResult?gl.checking:allConnected?gl.checkAnswers:gl.connectRemaining(round.leftItems.length-Object.keys(round.connections).length)}</button>
            </div>
            <p className="font-body text-xs text-center text-gray-300 mt-4">{gl.scoreHint}</p>
          </div>
        </div>
      );}}
    </GameWithAutoCamera>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN LOBBY — GamifiedLearning
// ═══════════════════════════════════════════════════════════════════
export default function GamifiedLearning({lang="en"}){
  useEffect(() => {
    playIntroSound();
  }, []);

  const t=PAGE_TRANSLATIONS[lang]??PAGE_TRANSLATIONS.en;
  const navigate = useNavigate();

  // ── Stats state ───────────────────────────────────────────────
  const[selected,setSelected]      =useState(null);
  const[totalScore,setTotal]       =useState(0);
  const[totalStars,setStars]       =useState(0);
  // NOTE: `achievements` now holds FULL objects from PlayerStatsResponse.AchievementItem
  // ({achievementType, achievementTitle, description, titleSi, descriptionSi, icon, tier, earned, earnedAt})
  // — not just string codes like before.
  const[achievements,setAchiev]    =useState([]);
  const[streakDays,setStreakDays]  =useState(0);
  const[unlockQueue,setUnlockQueue]=useState([]); // achievements just unlocked — feeds AchievementToast
  const[heroVisible,setHeroVisible]=useState(false);
  const[showStats,setShowStats]    =useState(false);
  const[last7Scores,setLast7Scores]=useState([]);
  const[moodHistory,setMoodHistory]=useState(()=>{try{return JSON.parse(localStorage.getItem("sinhala_mood_history")||"[]");}catch{return[];}});

  // ── DB game data state ────────────────────────────────────────
  // Letters — used by MemoryMatch, SpeedQuiz, LetterHunt, LetterPuzzle, MissingLetter
  const[sinhalaLetters,setSinhalaLetters]=useState([]);
  // Words — used by WordBuilder, WordUnscramble, MissingLetter
  const[sinhalaWords,setSinhalaWords]    =useState([]);
  // Connect sets — used by LineConnect
  const[connectSetsDB,setConnectSetsDB]  =useState([]);
  // Letter categories — used by LetterPuzzle sidebar
  const[letterCategories,setLetterCategories]=useState([]);
  const[dataLoading,setDataLoading]      =useState(true);
  const reactionBufferRef=useRef({}); // { [gameId]: [dataPoint, ...] } — buffers continuous engagement points before batch-sending

  // ── Existing useEffects ───────────────────────────────────────
  useEffect(()=>{
    setTimeout(()=>setHeroVisible(true),100);
    setTimeout(()=>setShowStats(true),600);
  },[]);

  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});},[selected]);

  useEffect(()=>{
    try{localStorage.setItem("sinhala_mood_history",JSON.stringify(moodHistory));}catch{}
  },[moodHistory]);

  // ── Load stats from DB ────────────────────────────────────────
  useEffect(()=>{
    const loadStats=async()=>{
      try{
        const stats=await getGamifiedStats();
        if(!stats)return;
        if(stats.totalScore!=null)  setTotal(stats.totalScore);
        if(stats.totalStars!=null)  setStars(stats.totalStars);
        if(stats.achievements)      setAchiev(stats.achievements); // full objects now — icon/titleSi/tier/etc.
        if(stats.currentStreakDays!=null) setStreakDays(stats.currentStreakDays);
        if(stats.moodHistory?.length)  setMoodHistory(stats.moodHistory);
        if(stats.last7Scores?.length)  setLast7Scores(stats.last7Scores);
      }catch(err){console.error("Failed to load stats:",err);}
    };
    loadStats();
  },[]);

  // ── Load game data from DB (Letters, Words, Connect Sets) ─────
  useEffect(()=>{
    const loadGameData=async()=>{
      try{
        const[lettersRaw,wordsRaw,setsRaw]=await Promise.all([
          getGameLetters(),
          getGameWords(),
          fetchConnectSets(),
        ]);

        // Letters flat array — shape: {letter, name, sound, category}
        const letters=lettersRaw.map(l=>({
          letter:l.letter, name:l.name, sound:l.sound, category:l.categoryName,
        }));
        setSinhalaLetters(letters);

        // Letter categories for LetterPuzzle sidebar
        const catMap={};
        lettersRaw.forEach(l=>{
          if(!catMap[l.categoryName]) catMap[l.categoryName]={name:l.categoryName,color:l.categoryColor??CATEGORY_COLOR_MAP[l.categoryName]??"#111",letters:[]};
          catMap[l.categoryName].letters.push({letter:l.letter,name:l.name,sound:l.sound});
        });
        setLetterCategories(Object.values(catMap));

        // Words — shape: {word, meaning, syllables[], imageUrl}
        setSinhalaWords(wordsRaw.map(w=>({
          word:w.word, meaning:w.meaning, syllables:w.syllables, imageUrl:w.imageUrl,
        })));

        // Connect sets — shape: {title, hint, pairs[{left,right,leftMeaning,rightMeaning}]}
        setConnectSetsDB(setsRaw.map(s=>({
          title:s.title, hint:s.hint,
          pairs:(s.pairs??[]).map(p=>({
            left:p.leftText, right:p.rightText,
            leftMeaning:p.leftMeaning, rightMeaning:p.rightMeaning,
          })),
        })));

      }catch(err){
        console.error("Failed to load game data:",err);
        // Fallback — use empty arrays, games will show "Loading…"
      }finally{
        setDataLoading(false);
      }
    };
    loadGameData();
  },[]);

  // ── Game complete handler ───────────────────────────────────────
  // Uses the REAL gamified endpoints (matches apiService.js exactly):
  //  1) saveGamifiedSession()          → POST /gamified/session/save
  //     (GameSession @PrePersist computes stars server-side)
  //  2) checkAndEarnGamifiedAchievements() → POST /gamified/achievements/check
  //     (data-driven AchievementDefinition rules, re-verified server-side)
  //  3) getGamifiedStats()             → GET  /gamified/stats
  //     (refresh totals/stars/streak/achievements from source of truth)
  //  4) any achievements returned in `earnedDetails` get queued for the toast
  // `extra` carries optional per-game fields (timeSeconds/movesCount/questionCount).
  const handleComplete=async(score,gameId,extra={})=>{
    const maxScore=MAX_SCORES[gameId]??100;
    try{
      const sessionRes=await saveGamifiedSession({
        gameId, score, maxScore,
        timeSeconds:extra.timeSeconds??null,
        movesCount:extra.movesCount??null,
        questionCount:extra.questionCount??null,
      });

      const achRes=await checkAndEarnGamifiedAchievements({
        gameType:gameId, score, totalScore:totalScore+score,
      });

      const stats=await getGamifiedStats();
      if(stats){
        setTotal(stats.totalScore??0);
        setStars(stats.totalStars??0);
        setAchiev(stats.achievements??[]);
        setStreakDays(stats.currentStreakDays??0);
        if(stats.last7Scores?.length) setLast7Scores(stats.last7Scores);
      }

      if(achRes?.earnedDetails?.length){
        setUnlockQueue(q=>[...q,...achRes.earnedDetails]);
      }

      return sessionRes?.starsEarned;
    }catch(err){
      console.error("Failed to save progress:",err);
      return null;
    }
  };

  // ── Reaction handler ──────────────────────────────────────────
  const handleReaction=useCallback((reaction,gameId)=>{
    setMoodHistory(prev=>{
      const entry={emoji:reaction.emoji,si:reaction.si,ta:reaction.ta,en:reaction.en,game:gameId,time:Date.now()};
      return[entry,...prev].slice(0,20);
    });

    // Single-snapshot endpoint — keeps mood-history / POSITIVE_MOOD achievement backend updated
    saveFaceReaction({
      gameId,rawExpression:reaction.rawName,emoji:reaction.emoji,
      labelEn:reaction.en,labelSi:reaction.si,labelTa:reaction.ta,confidence:reaction.confidence,
    }).catch(err=>console.error("Failed to save reaction:",err));

    // Continuous engagement pipeline — buffer this game's data points and
    // batch-send every 5 (~15s of gameplay) to /api/face-reactions/batch
    const buf=reactionBufferRef.current;
    if(!buf[gameId])buf[gameId]=[];
    buf[gameId].push({
      capturedAt:new Date().toISOString(),
      engagementScore:reaction.engagementScore,
      dominantEmotion:reaction.rawName,
      confidence:reaction.confidence,
    });

    if(buf[gameId].length>=5){
      const batch=buf[gameId];
      buf[gameId]=[];
      sendFaceReactionBatch({gameId,gameSessionId:null,dataPoints:batch})
        .catch(err=>console.error("Failed to send face reaction batch:",err));
    }
  },[]);

  // Flush any remaining buffered engagement points when the lobby unmounts
  useEffect(()=>{
    return()=>{
      const buf=reactionBufferRef.current;
      Object.entries(buf).forEach(([gameId,points])=>{
        if(points.length>0){
          sendFaceReactionBatch({gameId,gameSessionId:null,dataPoints:points}).catch(()=>{});
        }
      });
    };
  },[]);

  const handleBack=()=>setSelected(null);

  // ── Render selected game ──────────────────────────────────────
  const renderGame=()=>{
    const baseProps={
      letters:sinhalaLetters,
      onBack:handleBack,
      onComplete:(score,extra)=>handleComplete(score,selected,extra),
      onReaction:(reaction)=>handleReaction(reaction,selected),
      lang,
    };
    switch(selected){
      case "memory-match":   return <MemoryMatchGame    {...baseProps}/>;
      case "speed-quiz":     return <SpeedQuizGame      {...baseProps}/>;
      case "letter-hunt":    return <LetterHuntGame     {...baseProps}/>;
      case "letter-puzzle":  return <LetterPuzzleGame   onBack={handleBack} onComplete={(score,extra)=>handleComplete(score,selected,extra)} onReaction={(r)=>handleReaction(r,selected)} lang={lang} letterCategories={letterCategories}/>;
      case "word-builder":   return <WordBuilderGame    onBack={handleBack} onComplete={(score,extra)=>handleComplete(score,selected,extra)} onReaction={(r)=>handleReaction(r,selected)} lang={lang} words={sinhalaWords}/>;
      case "word-unscramble":return <WordUnscrambleGame onBack={handleBack} onComplete={(score,extra)=>handleComplete(score,selected,extra)} onReaction={(r)=>handleReaction(r,selected)} lang={lang} words={sinhalaWords}/>;
      case "missing-letter": return <MissingLetterGame  {...baseProps} words={sinhalaWords}/>;
      case "line-connect":   return <LineConnectGame    onBack={handleBack} onComplete={(score,extra)=>handleComplete(score,selected,extra)} onReaction={(r)=>handleReaction(r,selected)} lang={lang} connectSets={connectSetsDB}/>;
      default:return null;
    }
  };

  // ── Global CSS ────────────────────────────────────────────────
  const GLOBAL_CSS=`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&family=DM+Sans:wght@300;400;500&family=Baloo+2:wght@500;700;800&family=Fredoka:wght@500;600;700&family=Noto+Sans+Sinhala:wght@400;700;900&display=swap');
    .font-display{font-family:'Fredoka','Playfair Display',serif;}
    .font-body{font-family:'DM Sans',sans-serif;}
    .font-fun{font-family:'Baloo 2',cursive;}
    .sinhala{font-family:'Noto Sans Sinhala',serif;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(32px);}to{opacity:1;transform:translateY(0);}}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes scaleIn{from{opacity:0;transform:scale(0.94);}to{opacity:1;transform:scale(1);}}
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
    @keyframes floaty{0%,100%{transform:translateY(0) rotate(-4deg);}50%{transform:translateY(-14px) rotate(4deg);}}
    @keyframes timerPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.15);}}
    @keyframes wiggle{0%,100%{transform:rotate(-3deg);}50%{transform:rotate(3deg);}}
    @keyframes bounceSlow{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
    @keyframes popIn{0%{opacity:0;transform:scale(0.6) rotate(-8deg);}70%{transform:scale(1.05) rotate(2deg);}100%{opacity:1;transform:scale(1) rotate(0);}}
    @keyframes rainbow{0%{color:#f43f5e;}20%{color:#f59e0b;}40%{color:#22c55e;}60%{color:#0ea5e9;}80%{color:#a855f7;}100%{color:#f43f5e;}}
    @keyframes sparkleSpin{0%{transform:rotate(0deg) scale(1);}50%{transform:rotate(180deg) scale(1.2);}100%{transform:rotate(360deg) scale(1);}}
    @keyframes gradientShift{0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}
    .anim-fade-up{animation:fadeUp 0.7s cubic-bezier(.22,1,.36,1) both;}
    .anim-fade-in{animation:fadeIn 0.6s ease both;}
    .anim-scale-in{animation:scaleIn 0.5s cubic-bezier(.22,1,.36,1) both;}
    .anim-pop-in{animation:popIn 0.6s cubic-bezier(.22,1,.36,1) both;}
    .delay-1{animation-delay:0.10s;}.delay-2{animation-delay:0.22s;}
    .delay-3{animation-delay:0.38s;}.delay-4{animation-delay:0.54s;}
    .hover-lift{transition:transform 0.28s cubic-bezier(.22,1,.36,1),box-shadow 0.28s ease;}
    .hover-lift:hover{transform:translateY(-4px) scale(1.015);box-shadow:0 20px 60px rgba(0,0,0,0.13);}
    .kids-bg{background:linear-gradient(135deg,#fff7ed 0%,#fef9c3 20%,#ecfeff 45%,#fdf2f8 70%,#f5f3ff 100%);background-size:200% 200%;animation:gradientShift 18s ease-in-out infinite;}
    .game-card{transition:transform .34s cubic-bezier(.22,1,.36,1),box-shadow .34s ease,border-color .34s ease;position:relative;}
    .game-card:hover{transform:translateY(-8px) scale(1.018);box-shadow:0 26px 60px rgba(42,32,86,0.16);}
    .game-card .game-photo{transition:transform .65s cubic-bezier(.22,1,.36,1),filter .4s ease;}
    .game-card:hover .game-photo{transform:scale(1.055);filter:saturate(1.08) brightness(1.03);}
    .float-badge{animation:bounceSlow 3s ease-in-out infinite;}
    .rainbow-text{animation:rainbow 4s linear infinite;}
    @keyframes heroPhotoFloat{0%,100%{transform:translateY(0) rotate(-1deg);}50%{transform:translateY(-10px) rotate(1deg);}}
    @keyframes softBlob{0%,100%{transform:translate3d(0,0,0) scale(1);}50%{transform:translate3d(14px,-12px,0) scale(1.08);}}
    @keyframes sheen{0%{transform:translateX(-130%) rotate(12deg);}65%,100%{transform:translateX(180%) rotate(12deg);}}
    .hero-photo-card{animation:heroPhotoFloat 6s ease-in-out infinite;}
    .soft-blob{animation:softBlob 8s ease-in-out infinite;}
    .image-sheen:after{content:"";position:absolute;inset:-25% auto -25% -35%;width:22%;background:rgba(255,255,255,.34);filter:blur(8px);animation:sheen 5.5s ease-in-out infinite;pointer-events:none;}
    @media (prefers-reduced-motion:reduce){.game-card,.game-card .game-photo,.hero-photo-card,.soft-blob,.image-sheen:after{animation:none!important;transition:none!important;}}
  `;

  // ── Loading screen ─────────────────────────────────────────────
  if(dataLoading)return(
    <div className="kids-bg" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <style>{GLOBAL_CSS}</style>
      <div style={{fontSize:48}} className="float-badge">🌈</div>
      <div style={{width:44,height:44,border:"4px solid #fde68a",borderTop:"4px solid #f97316",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <p className="font-fun" style={{color:"#c2410c",fontSize:16,fontWeight:700}}>Loading game data…</p>
    </div>
  );

  // ── Game screen ───────────────────────────────────────────────
  if(selected)return(
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&family=DM+Sans:wght@300;400;500&family=Baloo+2:wght@500;700;800&family=Fredoka:wght@500;600;700&family=Noto+Sans+Sinhala:wght@400;700;900&display=swap');
        .font-display{font-family:'Fredoka','Playfair Display',serif;}.font-body{font-family:'DM Sans',sans-serif;}.font-fun{font-family:'Baloo 2',cursive;}.sinhala{font-family:'Noto Sans Sinhala',serif;}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.94);}to{opacity:1;transform:scale(1);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
        @keyframes floaty{0%,100%{transform:translateY(0) rotate(-4deg);}50%{transform:translateY(-14px) rotate(4deg);}}
        @keyframes timerPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.15);}}
        .anim-scale-in{animation:scaleIn 0.5s cubic-bezier(.22,1,.36,1) both;}
        .anim-fade-up{animation:fadeUp 0.4s cubic-bezier(.22,1,.36,1) both;}
        .hover-lift{transition:transform 0.28s cubic-bezier(.22,1,.36,1),box-shadow 0.28s ease;}
        .hover-lift:hover{transform:translateY(-3px) scale(1.015);box-shadow:0 16px 40px rgba(0,0,0,0.1);}
      `}</style>
      {renderGame()}
      <AchievementToast queue={unlockQueue} setQueue={setUnlockQueue} lang={lang} />
    </div>
  );

  // ── Stat cards ─────────────────────────────────────────────────
  const statCards=[
    {label:t.totalScore, value:totalScore,         suffix:` ${t.pts}`},
    {label:t.starsEarned,value:totalStars,          suffix:""},
    {label:t.badges,     value:achievements.length, suffix:""},
  ];
  const hasScoreHistory = last7Scores.length > 0;
const chartBars = hasScoreHistory
  ? last7Scores.map(s => Math.min(100, Math.round((s / 400) * 100)))
  : [];
  const moodCounts=Object.values(EXPRESSION_MAP).map(expr=>({
    emoji:expr.emoji,label:lang==="si"?expr.si:lang==="ta"?expr.ta:expr.en,
    count:moodHistory.filter(m=>m.emoji===expr.emoji).length,
  })).filter(m=>m.count>0).sort((a,b)=>b.count-a.count);
  const maxMoodCount=Math.max(...moodCounts.map(m=>m.count),1);

  // ── Lobby visuals: real educational photos instead of UI icons ──
  // Free Unsplash images selected for learning-through-play / alphabet / puzzle themes.
  const HERO_IMAGE="/images/games/main-image.png";
  const GAME_IMAGES={
    "memory-match":"/images/games/memory-match.png",
    "speed-quiz":"/images/games/speed-quiz.png",
    "letter-hunt":"/images/games/letter-hunt.png",
    "letter-puzzle":"/images/games/letter-puzzle.png",
    "word-builder":"/images/games/word-builder.png",
    "missing-letter":"/images/games/missing-letter.png",
    "line-connect":"/images/games/line-connect.jpg",
  };
  const GAME_STYLE={
    "memory-match":  {grad:"from-pink-400 via-rose-400 to-red-400",soft:"from-pink-50 to-rose-100",accent:"#ec4899",position:"center"},
    "speed-quiz":    {grad:"from-amber-400 via-orange-400 to-yellow-400",soft:"from-amber-50 to-orange-100",accent:"#f59e0b",position:"35% center"},
    "letter-hunt":   {grad:"from-emerald-400 via-green-400 to-teal-400",soft:"from-emerald-50 to-green-100",accent:"#22c55e",position:"35% center"},
    "letter-puzzle": {grad:"from-violet-400 via-purple-400 to-fuchsia-400",soft:"from-violet-50 to-purple-100",accent:"#8b5cf6",position:"center"},
    "word-builder":  {grad:"from-sky-400 via-blue-400 to-cyan-400",soft:"from-sky-50 to-blue-100",accent:"#3b82f6",position:"65% center"},
    "missing-letter":{grad:"from-red-400 via-rose-400 to-pink-400",soft:"from-red-50 to-rose-100",accent:"#ef4444",position:"center"},
    "line-connect":  {grad:"from-teal-400 via-cyan-400 to-lime-400",soft:"from-teal-50 to-lime-100",accent:"#14b8a6",position:"center"},
  };

  const renderGameCard=(game,gi)=>{
    const st=GAME_STYLE[game.id]??GAME_STYLE["memory-match"];
    return(
      <article
        key={game.id}
        onClick={()=>setSelected(game.id)}
        className={`game-card anim-pop-in delay-${(gi%4)+1} cursor-pointer rounded-[28px] border-4 border-white group relative overflow-hidden shadow-lg`}
        style={{height:"450px"}}
      >
        {/* Full-card game image */}
        <img
          src={GAME_IMAGES[game.id]??HERO_IMAGE}
          alt={`${game.title.en} learning activity`}
          className="game-photo absolute inset-0 w-full h-full object-cover"
          style={{objectPosition:st.position}}
          loading="lazy"
        />

        {/* Soft dark gradient so title/button stay readable without splitting the card */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(10,10,20,0.82) 0%, rgba(10,10,20,0.46) 28%, rgba(10,10,20,0.08) 58%, rgba(10,10,20,0.02) 100%)"
          }}
        />

        {/* Only game name + Play button */}
        <div className="absolute left-0 right-0 bottom-0 p-5 sm:p-6 flex items-end justify-between gap-4">
          <h3
            className="font-display text-2xl font-bold text-white leading-tight drop-shadow-md"
            style={{maxWidth:"70%"}}
          >
            {game.title[lang]??game.title.en}
          </h3>

          <button
            type="button"
            onClick={(e)=>{
              e.stopPropagation();
              setSelected(game.id);
            }}
            className="font-fun shrink-0 text-xs font-bold px-4 py-2.5 rounded-full text-white shadow-lg border border-white/30 backdrop-blur-sm transition-all duration-300 group-hover:translate-x-1 group-hover:scale-105"
            style={{background:st.accent}}
          >
            {t.play} →
          </button>
        </div>
      </article>
    );
  };

  return(
    <div className="min-h-screen kids-bg font-serif text-black selection:bg-pink-200 selection:text-black overflow-x-hidden">
      <style>{GLOBAL_CSS}</style>

      {/* Soft animated colour blobs — decorative, no iconography */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden" style={{zIndex:0}}>
        <div className="soft-blob absolute -top-24 -left-20 w-72 h-72 rounded-full bg-fuchsia-200/35 blur-3xl"/>
        <div className="soft-blob absolute top-[34%] -right-20 w-80 h-80 rounded-full bg-sky-200/35 blur-3xl" style={{animationDelay:"1.4s"}}/>
        <div className="soft-blob absolute bottom-0 left-[28%] w-72 h-72 rounded-full bg-amber-200/30 blur-3xl" style={{animationDelay:"2.6s"}}/>
      </div>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-white/80">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-rose-50/90 via-amber-50/80 to-violet-100/80"/>
        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-[0.92fr_1.08fr] gap-14 items-center">
          <div className={heroVisible?"anim-fade-up":"opacity-0"}>
            <span className="font-fun inline-block text-xs tracking-[0.15em] uppercase bg-white/80 border border-pink-200 text-fuchsia-700 rounded-full px-4 py-2 mb-7 anim-fade-in delay-1 shadow-sm">
              {t.badge}
            </span>

            {streakDays>0&&(
              <span className="font-fun inline-block text-xs tracking-[0.08em] uppercase bg-orange-100 border border-orange-200 text-orange-700 px-4 py-2 mb-7 ml-2 rounded-full anim-fade-in delay-1">
                {streakDays} {t.streakLabel}
              </span>
            )}

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] mb-6 anim-fade-up delay-2">
              {t.heroTitle1}{" "}
              <em className="not-italic rainbow-text font-extrabold">{t.heroItalic}</em>{" "}
              {t.heroTitle2}
            </h1>
            <p className="font-body text-gray-600 text-lg leading-relaxed mb-9 max-w-lg anim-fade-up delay-3">{t.heroDesc}</p>

            <div className="flex flex-wrap gap-4 anim-fade-up delay-4">
              <button
                onClick={()=>setSelected("speed-quiz")}
                className="font-fun bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-400 text-white px-7 py-3.5 rounded-2xl text-sm font-bold hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl shadow-lg"
              >
                {t.quickPlay}
              </button>
              <button
                onClick={()=>setSelected("letter-puzzle")}
                className="font-fun border-2 border-violet-300 text-violet-700 bg-white/90 px-7 py-3.5 rounded-2xl text-sm font-bold hover:border-violet-500 hover:-translate-y-1 transition-all duration-300 shadow-sm"
              >
                {t.tryPuzzle}
              </button>
            </div>
          </div>

          <div className={`relative ${heroVisible?"anim-scale-in delay-2":"opacity-0"}`}>
            <div className="hero-photo-card relative mx-auto w-full max-w-xl">
              <div className="relative rounded-[34px] overflow-hidden border-[6px] border-white shadow-2xl image-sheen">
                <img
                  src={HERO_IMAGE}
                  alt="Colourful alphabet learning blocks"
                  className="w-full h-[360px] sm:h-[430px] object-cover"
                  style={{objectPosition:"24% center"}}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-violet-950/55 via-transparent to-white/5"/>
                <div className="absolute left-6 right-6 bottom-6 text-white">
                  <div className="font-body text-xs uppercase tracking-[0.16em] text-white/75 mb-1">{t.activeToday}</div>
                  <div className="font-display text-2xl sm:text-3xl font-bold">{t.gamesAvail}</div>
                </div>
              </div>

              <div className="absolute -top-5 -right-2 sm:-right-7 bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-pink-100 px-5 py-3 font-body text-xs float-badge">
                <div className="text-gray-400 mb-0.5">{t.diffLabel}</div>
                <div className="font-semibold text-sm text-pink-600">{t.diffValue}</div>
              </div>

              <div className="absolute -bottom-5 left-3 sm:-left-7 bg-violet-700/95 backdrop-blur text-white rounded-2xl shadow-xl px-5 py-3 font-body text-xs">
                <div className="text-violet-200 mb-0.5">{t.lettersLabel}</div>
                <div className="font-semibold text-sm sinhala">
                  {sinhalaLetters.length>0?sinhalaLetters.length:41} {lang==="si"?"අකුරු":lang==="ta"?"எழுத்துக்கள்":"letters"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GAMES GRID ── */}
      <section className="relative max-w-[1400px] mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="font-fun text-xs uppercase tracking-[0.2em] text-fuchsia-600 mb-3">Learning through play</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">{t.chooseGame}</h2>
          <p className="font-body text-gray-500 text-base max-w-lg mx-auto">{t.chooseDesc}</p>
        </div>

        <div className="mb-16">
          <div className="flex items-center gap-4 mb-7">
            <span className="font-fun text-xs uppercase tracking-[0.2em] text-orange-700 bg-orange-100/90 border border-orange-200 rounded-full px-4 py-1.5">{t.letterGames}</span>
            <div className="flex-1 h-px bg-gradient-to-r from-orange-300 to-transparent"/>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GAMES_CONFIG.filter(g=>g.section==="Letters").map(renderGameCard)}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-4 mb-7">
            <span className="font-fun text-xs uppercase tracking-[0.2em] text-teal-700 bg-teal-100/90 border border-teal-200 rounded-full px-4 py-1.5">{t.wordGames}</span>
            <div className="flex-1 h-px bg-gradient-to-r from-teal-300 to-transparent"/>
            <span className="font-fun text-xs text-fuchsia-700 bg-fuchsia-100 border border-fuchsia-200 px-3 py-1 rounded-full uppercase tracking-wider">{t.newLabel}</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAMES_CONFIG.filter(g=>g.section==="Words").map(renderGameCard)}
          </div>
        </div>
      </section>

      {/* ── PROGRESS CTA ── */}
      <section className="relative max-w-7xl mx-auto px-6 pb-28">
        <div className="rounded-[34px] border border-white bg-white/72 backdrop-blur-xl p-8 sm:p-12 hover-lift shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-violet-100/70 via-fuchsia-50/60 to-orange-100/70"/>
          <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <p className="font-fun text-xs uppercase tracking-[0.18em] text-violet-600 mb-3">{t.progressDesc}</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-5">{t.yourProgress}</h2>

              <div className="grid grid-cols-3 gap-3 max-w-xl">
                {statCards.map((s,i)=>(
                  <div key={i} className="rounded-2xl bg-white/80 border border-white p-4 shadow-sm">
                    <span className="font-display text-xl sm:text-2xl font-bold text-gray-900 block">
                      <AnimatedCounter value={s.value} suffix={s.suffix}/>
                    </span>
                    <span className="font-body text-[10px] sm:text-xs uppercase tracking-wide text-gray-500">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate("/game-progress")}
              className="font-fun inline-flex justify-center items-center bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 text-white px-8 py-4 rounded-2xl text-sm font-bold hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl shadow-lg min-w-[180px]"
            >
              {t.yourProgress} →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}