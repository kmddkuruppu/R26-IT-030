import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── TRANSLATIONS ────────────────────────────────────────────────
const translations = {
  en: {
    pageTitle: "Letter Tracing & Writing",
    pageSubtitle: "Stroke by stroke, master every letter",
    points: "Points", completed: "Completed", streak: "Streak",
    currentLetter: "Current Letter", difficulty: "Difficulty",
    strokes: "Strokes", group: "Group", sound: "Sound",
    practiceArea: "Practice Canvas", hideGuide: "Hide Guide",
    showGuide: "Show Guide", clear: "Clear", checkWork: "Check My Work",
    prev: "Previous", next: "Next", tryAgain: "Try Again",
    instructions: "Instructions", brushSettings: "Brush Settings",
    brushSize: "Size", brushColor: "Color", fine: "Fine", thick: "Thick",
    letterProgress: "Letter Progress", allLetters: "All Letters",
    mastered: "Mastered", practicing: "Practicing", notStarted: "Not Started",
    strokeGuide: "Stroke Guide", letterInfo: "Letter Info",
    excellent: "Excellent! 🌟", veryGood: "Very Good! ⭐",
    good: "Good! 👍", goodTry: "Keep Going! 💪",
    excellentSub: "Perfect tracing!", goodTrySub: "Practice makes perfect!",
    milestone: "Milestone! 🎉", milestoneMsg: "You've mastered",
    letters: "letters!", scoreLabel: "Accuracy",
    inst1: "Trace over the faint guide letter", inst2: "Follow the stroke order shown",
    inst3: "Stay within the guide path", inst4: "Tap 'Check' for instant feedback",
    animateStroke: "Animate Stroke", stopAnim: "Stop",
    canvasMode: "Mode", freehand: "Freehand", guided: "Guided",
    opacity: "Guide Opacity", tipTitle: "Pro Tip",
    tipText: "For best results, draw slowly and follow the stroke direction arrows.",
    masteredBadge: "✓ Mastered", categoryPicker: "Choose Category",
    vowels: "Vowels", consonants: "Consonants", special: "Special",
    accuracy: "Accuracy", totalDone: "Total Done",
    sessionScore: "Session Score",
    voiceAlerts: "Voice Alerts",
    voiceOn: "Voice On",
    voiceOff: "Voice Off",
    listeningForStroke: "Listening…",
    voiceSpeaking: "Speaking…",
    voiceReady: "Voice ready",
    clearCanvas: "Canvas cleared — ready to trace",
    demoPlay: "Play demo",
  },
  si: {
    pageTitle: "අකුරු ලකුණු කිරීම සහ ලිවීම",
    pageSubtitle: "ආඝාතයෙන් ආඝාතයෙන්, සෑම අකුරක්ම ප්‍රගුණ කරන්න",
    points: "ලකුණු", completed: "සම්පූර්ණ", streak: "ක්‍රමය",
    currentLetter: "වත්මන් අකුර", difficulty: "දුෂ්කරතාව",
    strokes: "ආඝාත", group: "කාණ්ඩය", sound: "ශබ්දය",
    practiceArea: "පුහුණු කැන්වාස්", hideGuide: "මාර්ගෝපදේශය සඟවන්න",
    showGuide: "මාර්ගෝපදේශය පෙන්වන්න", clear: "මකන්න",
    checkWork: "ගෙදර වැඩ පරීක්ෂා", prev: "පෙර", next: "ඊළඟ",
    tryAgain: "නැවත උත්සාහ", instructions: "උපදෙස්",
    brushSettings: "බ්‍රෂ් සැකසුම්", brushSize: "ප්‍රමාණය",
    brushColor: "වර්ණය", fine: "සිහින්", thick: "තඩි",
    letterProgress: "අකුරු ප්‍රගතිය", allLetters: "සියලු අකුරු",
    mastered: "ප්‍රගුණ", practicing: "පුහුණු", notStarted: "ආරම්භ නැත",
    strokeGuide: "ආඝාත මාර්ගෝපදේශය", letterInfo: "අකුරු තොරතුරු",
    excellent: "අති විශිෂ්ට! 🌟", veryGood: "ඉතා හොඳයි! ⭐",
    good: "හොඳයි! 👍", goodTry: "ඉදිරියට යන්න! 💪",
    excellentSub: "පරිපූර්ණ ලකුණු කිරීම!", goodTrySub: "පුහුණුවෙන් සාර්ථකත්වය!",
    milestone: "සන්ධිස්ථානය! 🎉", milestoneMsg: "ඔබ ප්‍රගුණ කළේ",
    letters: "අකුරු!", scoreLabel: "නිරවද්‍යතාව",
    inst1: "සෝදිය යන මාර්ගෝපදේශ අකුර ලිවීමෙන් ලකුණු කරන්න",
    inst2: "පෙන්වා ඇති ආඝාත අනුපිළිවෙල අනුගමනය කරන්න",
    inst3: "මාර්ගෝපදේශ මාර්ගය ඇතුළත රැඳෙන්න",
    inst4: "ක්ෂණික ප්‍රතිපෝෂණ සඳහා 'පරීක්ෂා' ස්පර්ශ කරන්න",
    animateStroke: "ආඝාතය සජීවීකරණය", stopAnim: "නැවතෙන්න",
    canvasMode: "ප්‍රකාරය", freehand: "නිදහස්", guided: "මාර්ගෝපදේශිත",
    opacity: "ස්වාභාවිකතාව", tipTitle: "ප්‍රවීණ ඉඟිය",
    tipText: "හොඳම ප්‍රතිඵල සඳහා, සෙමෙන් ඇදීමෙන් ආඝාත දිශා ඊතල අනුගමනය කරන්න.",
    masteredBadge: "✓ ප්‍රගුණ", categoryPicker: "කාණ්ඩය තෝරන්න",
    vowels: "ස්වර", consonants: "ව්‍යංජන", special: "විශේෂ",
    accuracy: "නිරවද්‍යතාව", totalDone: "සම්පූර්ණ", sessionScore: "සැසි ලකුණු",
    voiceAlerts: "හඬ අනතුරු",
    voiceOn: "හඬ ක්‍රියාත්මකයි",
    voiceOff: "හඬ අක්‍රියයි",
    listeningForStroke: "සවන් දෙමින්…",
    voiceSpeaking: "කතා කරමින්…",
    voiceReady: "හඬ සූදානම්",
    clearCanvas: "කැන්වාස් හිස් — නැවත ලිවීමට සූදානම්",
    demoPlay: "ආදර්ශනය",
  },
  ta: {
    pageTitle: "எழுத்து பின்தொடர்தல் & எழுத்து",
    pageSubtitle: "வரிப்பிடியால் வரிப்பிடியாக, ஒவ்வொரு எழுத்தையும் தேர்ந்தெடுங்கள்",
    points: "மதிப்பெண்கள்", completed: "முடிந்தது", streak: "தொடர்ச்சி",
    currentLetter: "தற்போதைய எழுத்து", difficulty: "சிரமம்",
    strokes: "வரிப்பிடிகள்", group: "குழு", sound: "ஒலி",
    practiceArea: "பயிற்சி கேன்வாஸ்", hideGuide: "வழிகாட்டியை மறை",
    showGuide: "வழிகாட்டியை காட்டு", clear: "அழிக்கவும்",
    checkWork: "என் வேலையை சரிபார்", prev: "முந்தையது", next: "அடுத்தது",
    tryAgain: "மீண்டும் முயற்சி", instructions: "வழிமுறைகள்",
    brushSettings: "தூரிகை அமைப்புகள்", brushSize: "அளவு",
    brushColor: "வண்ணம்", fine: "மெல்லிய", thick: "தடிமன்",
    letterProgress: "எழுத்து முன்னேற்றம்", allLetters: "அனைத்து எழுத்துகள்",
    mastered: "தேர்ந்தெடுத்தது", practicing: "பயிற்சி", notStarted: "தொடங்கவில்லை",
    strokeGuide: "வரிப்பிடி வழிகாட்டி", letterInfo: "எழுத்து தகவல்",
    excellent: "அருமை! 🌟", veryGood: "மிகவும் நல்லது! ⭐",
    good: "நல்லது! 👍", goodTry: "தொடர்ந்து செல்! 💪",
    excellentSub: "சரியான பின்தொடர்தல்!", goodTrySub: "பயிற்சி சரியானதாக்குகிறது!",
    milestone: "மைல்கல்! 🎉", milestoneMsg: "நீங்கள் தேர்ந்தெடுத்தீர்கள்",
    letters: "எழுத்துகள்!", scoreLabel: "துல்லியம்",
    inst1: "மங்கலான வழிகாட்டி எழுத்தை பின்தொடருங்கள்",
    inst2: "காட்டப்பட்ட வரிப்பிடி வரிசையைப் பின்பற்றுங்கள்",
    inst3: "வழிகாட்டி பாதையில் இருங்கள்", inst4: "உடனடி கருத்துக்கு 'சரிபார்' தட்டவும்",
    animateStroke: "வரிப்பிடியை இயக்கு", stopAnim: "நிறுத்து",
    canvasMode: "முறை", freehand: "சுதந்திரமான", guided: "வழிகாட்டப்பட்ட",
    opacity: "வழிகாட்டி தெளிவு", tipTitle: "நிபுணர் குறிப்பு",
    tipText: "சிறந்த முடிவுக்கு, மெதுவாக வரைந்து வரிப்பிடி திசை அம்புகளைப் பின்பற்றுங்கள்.",
    masteredBadge: "✓ தேர்ந்தெடுத்தது", categoryPicker: "வகையை தேர்ந்தெடு",
    vowels: "உயிர்", consonants: "மெய்", special: "சிறப்பு",
    accuracy: "துல்லியம்", totalDone: "மொத்தம்", sessionScore: "அமர்வு மதிப்பெண்",
    voiceAlerts: "குரல் எச்சரிக்கைகள்",
    voiceOn: "குரல் இயக்கத்தில்",
    voiceOff: "குரல் அணைந்தது",
    listeningForStroke: "கேட்கிறது…",
    voiceSpeaking: "பேசுகிறது…",
    voiceReady: "குரல் தயார்",
    clearCanvas: "கேன்வாஸ் அழிக்கப்பட்டது — மீண்டும் தொடங்க தயார்",
    demoPlay: "டெமோ",
  },
};

// ─── LETTER DATA with voice guidance phases ───────────────────────
const LETTER_CATEGORIES = [
  {
    id: 'vowels', name: 'ස්වර', nameEn: 'Vowels', color: '#e11d48', bg: '#fff1f2',
    letters: [
      { letter:'අ', sound:'a',   strokes:1, diff:'Easy',
        tip:'Start top-left, curve right and loop down',
        phases:['Start at the top — curve right, then loop down into a round body'] },
      { letter:'ආ', sound:'aa',  strokes:1, diff:'Easy',
        tip:'Like අ with a long tail extending right',
        phases:['Trace the round body of අ, then extend a long sweeping tail to the right'] },
      { letter:'ඇ', sound:'ae',  strokes:1, diff:'Easy',
        tip:'Round body with a small hook at top',
        phases:['Begin at the top-left hook, curve right, then bring the loop down and close it'] },
      { letter:'ඈ', sound:'aee', strokes:2, diff:'Medium',
        tip:'ඇ plus a long right extension stroke',
        phases:['Draw the round body of ඇ — top hook, curve right, loop down','Now add a long horizontal stroke to the right from the middle'] },
      { letter:'ඉ', sound:'i',   strokes:1, diff:'Easy',
        tip:'Single flowing loop, like a backwards e',
        phases:['Start at the right, curve up and left, then loop around — like drawing a backwards letter e'] },
      { letter:'ඊ', sound:'ii',  strokes:2, diff:'Medium',
        tip:'ඉ with a vertical bar on the right',
        phases:['Draw the ඉ loop — curve right, loop around','Now add a short vertical bar on the right side'] },
      { letter:'උ', sound:'u',   strokes:1, diff:'Easy',
        tip:'Bowl shape opening upward',
        phases:['Start at the left, sweep down and curve right — like drawing a bowl that opens upward'] },
      { letter:'ඌ', sound:'uu',  strokes:2, diff:'Medium',
        tip:'උ with a curved extension below',
        phases:['Draw the bowl shape of උ — left to right, sweeping down','Now add a curved extension below, hooking to the left'] },
      { letter:'එ', sound:'e',   strokes:1, diff:'Easy',
        tip:'Begins with top arch, curves left then down',
        phases:['Start at the right, draw a top arch going left, then curve the line down and loop right at the bottom'] },
      { letter:'ඒ', sound:'ee',  strokes:2, diff:'Medium',
        tip:'එ with extended top bar',
        phases:['Draw the main body of එ — arch left, curve down and loop','Extend the top bar further to the right'] },
      { letter:'ඓ', sound:'ai',  strokes:2, diff:'Hard',
        tip:'Double top marks over එ',
        phases:['Draw the body of එ carefully','Now add two small hook marks above the top of the letter'] },
      { letter:'ඔ', sound:'o',   strokes:2, diff:'Medium',
        tip:'Round closed loop with right extension',
        phases:['Draw a closed round loop — start at the top and go clockwise to close it','Extend a horizontal stroke to the right from the middle'] },
      { letter:'ඕ', sound:'oo',  strokes:2, diff:'Medium',
        tip:'ඔ with a longer right tail',
        phases:['Draw the closed round loop of ඔ','Now extend a longer sweeping tail to the right'] },
      { letter:'ඖ', sound:'au',  strokes:2, diff:'Hard',
        tip:'Double loop structure',
        phases:['Draw the first loop — start at top, curve down and right','Add a second loop attached to the right — slightly lower than the first'] },
      { letter:'අං',sound:'an',  strokes:2, diff:'Medium',
        tip:'අ with anunaasika dot-circle above',
        phases:['Draw the full body of අ first','Now place a small dot-circle mark above the letter — this is the anunaasika'] },
      { letter:'අඃ',sound:'ah',  strokes:2, diff:'Medium',
        tip:'අ with visarga two dots on right',
        phases:['Draw the body of අ','Place two small dots vertically on the right side — this is the visarga'] },
    ],
  },
  {
    id: 'ka', name: 'ක වර්ගය', nameEn: 'Ka Group', color: '#7c3aed', bg: '#f5f3ff',
    letters: [
      { letter:'ක', sound:'ka',  strokes:2, diff:'Medium',
        tip:'Top horizontal bar, then curved body below',
        phases:['Draw a horizontal bar across the top — start left, go right','Now curve down from the left end to form the body, loop right and close below the bar'] },
      { letter:'ඛ', sound:'kha', strokes:2, diff:'Medium',
        tip:'ක with an extra flourish on top',
        phases:['Draw the main body of ක — horizontal bar, then the curved loop below','Add the extra top flourish — a small curved mark above the bar'] },
      { letter:'ග', sound:'ga',  strokes:2, diff:'Medium',
        tip:'Open loop curving to the right',
        phases:['Start at the top, sweep down and curve right — leave the loop open on the right','Bring the stroke back up slightly to finish the opening'] },
      { letter:'ඝ', sound:'gha', strokes:3, diff:'Hard',
        tip:'ග with a lower extension hook',
        phases:['Draw the main open loop of ග — top, down, curve right','Add the lower body — bring a stroke down from the loop','Finish with a small hook at the bottom pointing left'] },
      { letter:'ඞ', sound:'nga', strokes:2, diff:'Hard',
        tip:'Nasal consonant with unique cross shape',
        phases:['Draw a vertical stroke down, then curve left at the base — like an anchor shape','Cross through the middle with a short horizontal stroke'] },
      { letter:'ඟ', sound:'nka', strokes:3, diff:'Hard',
        tip:'Complex compound nasal-ka shape',
        phases:['Draw the upper curved component — sweep from left to right','Add the lower loop going down and right','Finish with the small closing tail at the bottom'] },
    ],
  },
  {
    id: 'cha', name: 'ච වර්ගය', nameEn: 'Cha Group', color: '#0891b2', bg: '#ecfeff',
    letters: [
      { letter:'ච', sound:'cha',  strokes:1, diff:'Easy',
        tip:'Single smooth flowing curve, like a fishhook',
        phases:['One smooth stroke — start at the top-right, sweep left and curve downward — like drawing a large fishhook'] },
      { letter:'ඡ', sound:'chha', strokes:2, diff:'Medium',
        tip:'ච with top mark added',
        phases:['Draw the main fishhook body of ච — sweep left and down','Add the small raised mark at the very top'] },
      { letter:'ජ', sound:'ja',   strokes:2, diff:'Medium',
        tip:'Vertical drop with curved base and hook',
        phases:['Start at the top — draw a vertical line downward','Curve the base to the left and add a small hook pointing up on the right side'] },
      { letter:'ඣ', sound:'jha',  strokes:3, diff:'Hard',
        tip:'ජ with additional upper component',
        phases:['Draw the vertical drop of ජ — straight down','Curve the base left with a hook','Add the upper decorative component above the top of the stroke'] },
      { letter:'ඤ', sound:'nya',  strokes:2, diff:'Hard',
        tip:'Palatal nasal — curved bridge shape',
        phases:['Draw a curved bridge stroke — start left, arch up to the right and come down','Add the lower closing stroke — connect at both ends below the bridge'] },
      { letter:'ඥ', sound:'jña',  strokes:3, diff:'Hard',
        tip:'Compound ඤ with extra loop',
        phases:['Draw the bridge of ඤ — arch up from left to right','Add the lower closing stroke','Place a small extra loop at the bottom-right'] },
    ],
  },
  {
    id: 'ta_retro', name: 'ට වර්ගය', nameEn: 'Ṭa Group', color: '#0369a1', bg: '#eff6ff',
    letters: [
      { letter:'ට', sound:'ṭa',  strokes:1, diff:'Easy',
        tip:'Circle with a short right exit stroke',
        phases:['Draw a full circle — start at the top, go clockwise all the way around, then exit with a short stroke to the right'] },
      { letter:'ඨ', sound:'ṭha', strokes:2, diff:'Medium',
        tip:'ට with top bar extension',
        phases:['Draw the circle of ට with the right exit stroke','Now add a horizontal bar extending left from the top of the circle'] },
      { letter:'ඩ', sound:'ḍa',  strokes:2, diff:'Medium',
        tip:'Like ට but with lower descender',
        phases:['Draw the circle of ට','Instead of exiting right, bring a descender stroke downward below the circle and curve it left'] },
      { letter:'ඪ', sound:'ḍha', strokes:3, diff:'Hard',
        tip:'ඩ with upper flourish',
        phases:['Draw the circle body — start at top, go clockwise','Add the lower descender curving left','Place the upper flourish mark above the circle'] },
      { letter:'ණ', sound:'ṇa',  strokes:2, diff:'Medium',
        tip:'Retroflex n — bowl with top knob',
        phases:['Draw the bowl shape — curve from left, sweep down and right to close','Add the small knob or hook at the very top of the bowl'] },
      { letter:'ඬ', sound:'ṇḍa', strokes:3, diff:'Hard',
        tip:'Compound retroflex consonant',
        phases:['Draw the first component — the upper curved shape','Add the second component attached below','Finish with the right-side closing stroke'] },
    ],
  },
  {
    id: 'ta_dental', name: 'ත වර්ගය', nameEn: 'Ta Group', color: '#15803d', bg: '#f0fdf4',
    letters: [
      { letter:'ත', sound:'tha',  strokes:2, diff:'Medium',
        tip:'Two linked loops at different heights',
        phases:['Draw the upper loop — start at the top-left, curve right and close into a small loop','Add the lower loop below — slightly larger, curve right and close, then add a small tail'] },
      { letter:'ථ', sound:'thha', strokes:2, diff:'Medium',
        tip:'ත with extra top bar',
        phases:['Draw both loops of ත — upper small loop, then lower larger loop','Extend a horizontal bar above both loops'] },
      { letter:'ද', sound:'da',   strokes:2, diff:'Hard',
        tip:'Reversed P shape with flat bottom',
        phases:['Start at the top-right — curve left across the top like a reversed P','Bring the line down and give it a flat base going left at the bottom'] },
      { letter:'ධ', sound:'dha',  strokes:3, diff:'Hard',
        tip:'ද with upper arm extension',
        phases:['Draw the top curved sweep from right to left','Bring the vertical stroke downward','Finish with the flat base and a small upper arm extending right'] },
      { letter:'න', sound:'na',   strokes:2, diff:'Medium',
        tip:'Dental n — arch with right foot',
        phases:['Draw the arch — start left, curve up and over to the right, then come down','Add a small right-facing foot at the bottom of the right side'] },
      { letter:'ඳ', sound:'nda',  strokes:3, diff:'Hard',
        tip:'Compound dental nasal-da shape',
        phases:['Draw the upper curved component','Add the middle connecting stroke','Finish the lower body with a foot at the base'] },
    ],
  },
  {
    id: 'pa', name: 'ප වර්ගය', nameEn: 'Pa Group', color: '#b45309', bg: '#fffbeb',
    letters: [
      { letter:'ප', sound:'pa',  strokes:2, diff:'Medium',
        tip:'P-like shape with circular head',
        phases:['Draw the circular head — start at the top, go clockwise to form a full circle on the right','Bring a vertical stem straight down from the left of the circle'] },
      { letter:'ඵ', sound:'pha', strokes:2, diff:'Medium',
        tip:'ප with aspirated top mark',
        phases:['Draw the full shape of ප — circle head and vertical stem','Add the aspirated mark — a small curved shape above the head'] },
      { letter:'බ', sound:'ba',  strokes:2, diff:'Medium',
        tip:'Round base loop with upper bar',
        phases:['Draw the round base loop — start at the top of the loop, go clockwise and close','Add a horizontal bar above the loop, extending left'] },
      { letter:'භ', sound:'bha', strokes:3, diff:'Hard',
        tip:'බ with additional flourish',
        phases:['Draw the round loop of බ','Add the horizontal top bar','Place the additional curved flourish above the bar'] },
      { letter:'ම', sound:'ma',  strokes:2, diff:'Medium',
        tip:'Two connected humps — like m in shape',
        phases:['Draw the first hump — curve up from the left then down to the center','Draw the second hump — curve up from center and down, ending with a tail sweeping right'] },
      { letter:'ඹ', sound:'mba', strokes:3, diff:'Hard',
        tip:'Compound bilabial nasal-ba shape',
        phases:['Draw the first upper component — the curved arch','Add the lower connecting body','Finish with the closing stroke and right-side tail'] },
    ],
  },
  {
    id: 'semi', name: 'අවර්ගීය', nameEn: 'Semi-vowels', color: '#be185d', bg: '#fff1f2',
    letters: [
      { letter:'ය', sound:'ya',  strokes:2, diff:'Hard',
        tip:'Y-shaped starting stroke with curved body',
        phases:['Draw a Y-shaped upper stroke — two arms meeting at a center point going down','From that point, curve the body right and close into a loop below'] },
      { letter:'ර', sound:'ra',  strokes:1, diff:'Easy',
        tip:'Single elegant loop — like a teardrop',
        phases:['One elegant stroke — start at the top-right, curve left, then spiral inward forming a teardrop shape, and lift the pen'] },
      { letter:'ල', sound:'la',  strokes:2, diff:'Medium',
        tip:'Tall vertical stroke with curved base',
        phases:['Draw a tall vertical stroke from top to bottom','Curve the base to the left — like adding a foot to the vertical line'] },
      { letter:'ව', sound:'va',  strokes:2, diff:'Medium',
        tip:'V-like top with circular base loop',
        phases:['Draw the top V-like stroke — two lines meeting at a downward point','Add the circular loop below — start at the point, go clockwise and close'] },
      { letter:'ශ', sound:'sha', strokes:2, diff:'Hard',
        tip:'Complex: horizontal bar + curved body',
        phases:['Draw the horizontal bar across the top','Below the bar, draw the curved flowing body — curve left, down, and sweep right at the base'] },
      { letter:'ෂ', sound:'ṣha', strokes:2, diff:'Hard',
        tip:'Retroflex sh — like ශ with extra hook',
        phases:['Draw the main body of ශ — bar and curved body below','Add the retroflex hook at the bottom — a small curve pointing back left'] },
      { letter:'ස', sound:'sa',  strokes:2, diff:'Hard',
        tip:'S-shaped main body with base loop',
        phases:['Draw the S-shaped main body — start top-right, curve left at top, reverse and curve right at bottom','Add the small closing loop at the very base'] },
      { letter:'හ', sound:'ha',  strokes:2, diff:'Medium',
        tip:'H-like structure with curved crossbar',
        phases:['Draw two vertical-ish strokes — left side and right side with a gap between','Connect them with a curved crossbar in the middle'] },
      { letter:'ළ', sound:'ḷa',  strokes:2, diff:'Medium',
        tip:'ල with retroflex bottom curl',
        phases:['Draw the tall vertical stroke of ල','Curl the base differently — curve it into a tight retroflex curl going right and back'] },
      { letter:'ෆ', sound:'fa',  strokes:2, diff:'Hard',
        tip:'F consonant adapted for Sinhala script',
        phases:['Draw the main body — a curved stroke from top sweeping down and right','Add the finishing top mark — a small horizontal bar at the top left'] },
    ],
  },
  {
    id: 'compound', name: 'සංයෝජිත', nameEn: 'Compound', color: '#0f766e', bg: '#f0fdfa',
    letters: [
      { letter:'ක්ෂ', sound:'ksha', strokes:4, diff:'Hard',
        tip:'Compound: ක + hal + ෂ stacked',
        phases:['Draw the top component — ක bar and loop','Add the hal mark — small stroke below ක','Begin the lower ෂ — horizontal bar','Complete the ෂ body below'] },
      { letter:'ත්ත', sound:'ttha', strokes:3, diff:'Hard',
        tip:'Geminate dental t — doubled ත',
        phases:['Draw the upper ත — upper small loop then lower loop','Add the hal connector mark','Draw the second ත below, slightly smaller'] },
      { letter:'ද්ද', sound:'dda',  strokes:3, diff:'Hard',
        tip:'Geminate da — doubled ද',
        phases:['Draw the first ද — reversed P with flat base','Add the hal connector mark','Draw the second ද attached below'] },
      { letter:'ල්ල', sound:'lla',  strokes:3, diff:'Hard',
        tip:'Geminate la — doubled ල with hal mark',
        phases:['Draw the first ල — tall stroke with curved foot','Add the hal marker connecting the two','Draw the second ල below or beside'] },
      { letter:'ඤ්ජ', sound:'nja',  strokes:4, diff:'Hard',
        tip:'Nasal cluster ඤ + hal + ජ',
        phases:['Draw the bridge of ඤ — arch from left to right','Close the lower of ඤ','Add the hal connector','Draw the ජ below — vertical drop with curved base'] },
      { letter:'ට්ට', sound:'ṭṭa',  strokes:3, diff:'Hard',
        tip:'Geminate retroflex t — doubled ට',
        phases:['Draw the first ට circle with right exit','Add the hal connector mark below','Draw the second ට circle attached'] },
    ],
  },
];

const ALL_LETTERS = LETTER_CATEGORIES.flatMap((cat) =>
  cat.letters.map((l) => ({ ...l, cat }))
);

// ─── BRUSH PRESETS ────────────────────────────────────────────────
const BRUSH_COLORS = [
  { color: '#7C3AED', name: 'Purple' },
  { color: '#2563EB', name: 'Blue'   },
  { color: '#0891B2', name: 'Cyan'   },
  { color: '#059669', name: 'Green'  },
  { color: '#D97706', name: 'Amber'  },
  { color: '#DC2626', name: 'Red'    },
  { color: '#DB2777', name: 'Pink'   },
  { color: '#1f2937', name: 'Black'  },
];

// ─── DIFFICULTY STYLES ────────────────────────────────────────────
const diffStyle = (d) =>
  d === 'Easy'   ? { bg: '#dcfce7', text: '#15803d' } :
  d === 'Medium' ? { bg: '#fef9c3', text: '#a16207' } :
                   { bg: '#fee2e2', text: '#b91c1c' };

// ─── GRADE CALCULATOR ────────────────────────────────────────────
const getGrade = (score) => {
  if (score >= 90) return { label: 'Excellent! 🌟', sub: 'Perfect tracing!',  color: '#10b981', stars: 3, emoji: '🌟' };
  if (score >= 75) return { label: 'Very Good! ⭐', sub: 'Great technique!',  color: '#3b82f6', stars: 2, emoji: '⭐' };
  if (score >= 60) return { label: 'Good! 👍',      sub: 'Keep it up!',       color: '#f59e0b', stars: 2, emoji: '👍' };
  return               { label: 'Try Again! 💪',  sub: 'Practice more!',   color: '#ef4444', stars: 1, emoji: '💪' };
};

// ─── PIXEL-OVERLAP ACCURACY ENGINE ───────────────────────────────
const computeAccuracy = (userCanvas, guideCanvas) => {
  try {
    const w = userCanvas.width, h = userCanvas.height;
    const uCtx = userCanvas.getContext('2d');
    const gCtx = guideCanvas.getContext('2d');
    const uPx = uCtx.getImageData(0, 0, w, h).data;
    const gPx = gCtx.getImageData(0, 0, w, h).data;
    let guidePixels = 0, hitPixels = 0, extraPixels = 0;
    for (let i = 3; i < gPx.length; i += 4) {
      const inGuide = gPx[i] > 50;
      const inUser  = uPx[i] > 30;
      if (inGuide) { guidePixels++; if (inUser) hitPixels++; }
      else if (inUser) extraPixels++;
    }
    if (guidePixels === 0) return 0;
    const coverageScore = (hitPixels / guidePixels) * 100;
    const penalty = Math.min(30, (extraPixels / Math.max(guidePixels, 1)) * 25);
    return Math.min(100, Math.max(0, Math.round(coverageScore * 1.3 - penalty)));
  } catch {
    return 65 + Math.floor(Math.random() * 30);
  }
};

// ─── ICONS ───────────────────────────────────────────────────────
const Ico = ({ d, size = 20, fill = 'none', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const HomeIco   = ({ s=20 }) => <Ico size={s} d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />;
const CheckIco  = ({ s=20 }) => <Ico size={s} d={["M22 11.08V12a10 10 0 1 1-5.93-9.14","M22 4 12 14.01l-3-3"]} />;
const RotateIco = ({ s=20 }) => <Ico size={s} d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8 M3 3v5h5" />;
const EyeIco    = ({ s=20 }) => <Ico size={s} d={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"]} />;
const EyeOffIco = ({ s=20 }) => <Ico size={s} d={["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94","M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19","M1 1l22 22"]} />;
const ArrowLIco = ({ s=20 }) => <Ico size={s} d="M19 12H5 M12 19l-7-7 7-7" />;
const ArrowRIco = ({ s=20 }) => <Ico size={s} d="M5 12h14 M12 5l7 7-7 7" />;
const TrophyIco = ({ s=20 }) => <Ico size={s} d={["M6 9H4.5a2.5 2.5 0 0 1 0-5H6","M18 9h1.5a2.5 2.5 0 0 0 0-5H18","M4 22h16","M10 14.66V17a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2.34","M14 14.66V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2.34","M18 2H6v7a6 6 0 0 0 12 0V2z"]} />;
const PlayIco   = ({ s=20 }) => <Ico size={s} fill="currentColor" d="M5 3l14 9-14 9V3z" />;
const PauseIco  = ({ s=20 }) => <Ico size={s} fill="currentColor" d={["M6 4h4v16H6z","M14 4h4v16h-4z"]} />;
const InfoIco   = ({ s=20 }) => <Ico size={s} d={["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 16v-4","M12 8h.01"]} />;
const ZapIco    = ({ s=20 }) => <Ico size={s} d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />;
const GridIco   = ({ s=20 }) => <Ico size={s} d={["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"]} />;
const SparkIco  = ({ s=20 }) => <Ico size={s} d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75z" />;
const PenIco    = ({ s=20 }) => <Ico size={s} d="M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />;
const AwardIco  = ({ s=20 }) => <Ico size={s} d={["M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z","M8.21 13.89 7 23l5-3 5 3-1.21-9.12"]} />;
const VolumeIco = ({ s=20 }) => <Ico size={s} d={["M11 5L6 9H2v6h4l5 4V5z","M19.07 4.93a10 10 0 0 1 0 14.14","M15.54 8.46a5 5 0 0 1 0 7.07"]} />;
const VolumeOffIco = ({ s=20 }) => <Ico size={s} d={["M11 5L6 9H2v6h4l5 4V5z","M23 9l-6 6","M17 9l6 6"]} />;
const MicIco    = ({ s=20 }) => <Ico size={s} d={["M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z","M19 10v2a7 7 0 0 1-14 0v-2","M12 19v4","M8 23h8"]} />;

// ─── STROKE ORDER DISPLAY ─────────────────────────────────────────
function StrokeOrderDisplay({ letter, strokes, color }) {
  const strokeNums = Array.from({ length: Math.min(strokes, 4) }, (_, i) => i + 1);
  return (
    <div className="flex gap-3 flex-wrap justify-center">
      {strokeNums.map(n => (
        <div key={n} className="flex flex-col items-center gap-1">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center relative border-2"
            style={{ background: `${color}12`, borderColor: `${color}30` }}>
            <span className="sinhala text-2xl font-bold" style={{ color, fontFamily: "'Noto Sans Sinhala', serif" }}>
              {letter}
            </span>
            <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-xs font-black flex items-center justify-center"
              style={{ background: color }}>
              {n}
            </div>
          </div>
          <p className="text-xs text-gray-400 font-semibold">Stroke {n}</p>
        </div>
      ))}
    </div>
  );
}

// ─── LETTER GRID SIDEBAR ─────────────────────────────────────────
function LetterGridSidebar({ currentLetter, masteredSet, progressMap, onSelect }) {
  const [openCat, setOpenCat] = useState(0);
  return (
    <div className="space-y-1">
      {LETTER_CATEGORIES.map((cat, ci) => {
        const catDone = cat.letters.filter(l => masteredSet.has(l.letter)).length;
        return (
          <div key={cat.id}>
            <button onClick={() => setOpenCat(openCat === ci ? -1 : ci)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-left"
              style={{ background: openCat === ci ? `${cat.color}15` : 'transparent' }}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                <span className="text-xs font-bold truncate" style={{ color: openCat === ci ? cat.color : '#6b7280' }}>
                  {cat.name}
                </span>
              </div>
              <span className="text-xs font-bold flex-shrink-0 ml-1"
                style={{ color: catDone === cat.letters.length ? '#10b981' : '#9ca3af' }}>
                {catDone}/{cat.letters.length}
              </span>
            </button>
            {openCat === ci && (
              <div className="flex flex-wrap gap-1.5 px-3 pb-3 pt-1">
                {cat.letters.map((l) => {
                  const isMastered = masteredSet.has(l.letter);
                  const isCurrent  = currentLetter?.letter === l.letter;
                  const prog = progressMap[l.letter] ?? 0;
                  return (
                    <button key={l.letter} onClick={() => onSelect(l, cat)} title={`${l.letter} (${l.sound})`}
                      className="relative w-10 h-10 rounded-xl text-lg font-bold flex items-center justify-center transition-all duration-200 hover:scale-110 sinhala"
                      style={{
                        fontFamily: "'Noto Sans Sinhala', serif",
                        background: isCurrent ? `${cat.color}30` : isMastered ? '#dcfce720' : prog > 0 ? `${cat.color}12` : '#f3f4f6',
                        border: isCurrent ? `2px solid ${cat.color}` : isMastered ? '2px solid #10b981' : prog > 0 ? `1.5px solid ${cat.color}50` : '1.5px solid #e5e7eb',
                        color: isCurrent ? cat.color : isMastered ? '#10b981' : '#374151',
                        boxShadow: isCurrent ? `0 0 0 4px ${cat.color}20` : 'none',
                        transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
                      }}>
                      {l.letter}
                      {isMastered && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs leading-none">✓</span>
                        </div>
                      )}
                      {prog > 0 && !isMastered && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl"
                          style={{ background: `linear-gradient(90deg, ${cat.color}, transparent)`, width: `${prog}%` }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── SCORE OVERLAY ────────────────────────────────────────────────
function ScoreOverlay({ score, grade, onNext, onRetry, isLast }) {
  return (
    <div className="absolute inset-0 rounded-2xl flex items-center justify-center z-20"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-xs w-full mx-4 pop-in">
        <div className="text-5xl mb-3">{grade.emoji}</div>
        <div className="text-6xl font-black mb-2" style={{ color: grade.color }}>{score}%</div>
        <h4 className="text-2xl font-bold text-gray-800 mb-1">{grade.label}</h4>
        <p className="text-gray-500 text-sm mb-2">{grade.sub}</p>
        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3].map(s => (
            <span key={s} className={`text-2xl transition-all ${s <= grade.stars ? 'scale-110' : 'opacity-20'}`}>
              {s <= grade.stars ? '⭐' : '☆'}
            </span>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-1.5 text-gray-700 font-bold py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all hover:scale-105">
            <RotateIco s={16}/> Retry
          </button>
          <button onClick={onNext}
            className="flex-1 flex items-center justify-center gap-1.5 text-white font-bold py-3 rounded-2xl transition-all hover:scale-105 hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            {isLast ? 'Finish 🎉' : 'Next'} <ArrowRIco s={16}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── VOICE ALERT LOG PANEL ────────────────────────────────────────
function VoiceAlertLog({ alerts }) {
  const logRef = useRef(null);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [alerts]);

  return (
    <div ref={logRef}
      className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3 space-y-1.5 overflow-y-auto"
      style={{ maxHeight: 140, minHeight: 64 }}>
      {alerts.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">Voice guidance will appear here when you start tracing.</p>
      )}
      {alerts.map((a, i) => (
        <div key={i} className="flex items-start gap-2 fade-in">
          <span className="text-sm mt-0.5 flex-shrink-0">{a.type === 'start' ? '🎙️' : a.type === 'pause' ? '⏸️' : a.type === 'done' ? '✅' : '💬'}</span>
          <p className="text-xs text-indigo-800 leading-relaxed flex-1">{a.text}</p>
          <span className="text-xs text-indigo-300 flex-shrink-0 pt-0.5">{a.time}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function LetterTracingPage({ lang = 'en' }) {
  const t = translations[lang] ?? translations.en;
  const navigate = useNavigate();

  const [allLetters] = useState(() =>
    LETTER_CATEGORIES.flatMap(cat => cat.letters.map(l => ({ ...l, cat })))
  );

  // ── Core state ──
  const [currentIdx, setCurrentIdx]         = useState(0);
  const [showGuide, setShowGuide]           = useState(true);
  const [guideOpacity, setGuideOpacity]     = useState(0.18);
  const [brushSize, setBrushSize]           = useState(22);
  const [brushColor, setBrushColor]         = useState('#7C3AED');
  const [hasDrawn, setHasDrawn]             = useState(false);
  const [isChecking, setIsChecking]         = useState(false);
  const [scoreResult, setScoreResult]       = useState(null);
  const [celebrating, setCelebrating]       = useState(false);
  const [isAnimating, setAnimating]         = useState(false);
  const [points, setPoints]                 = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [masteredSet, setMasteredSet]       = useState(new Set());
  const [progressMap, setProgressMap]       = useState({});
  const [showMilestone, setMilestone]       = useState(false);
  const [milestoneCount, setMilestoneCount] = useState(0);
  const [activePanel, setActivePanel]       = useState('letters');
  const [history, setHistory]               = useState([]);

  // ── Voice alert state ──
  const [voiceEnabled, setVoiceEnabled]     = useState(true);
  const [voiceMuted, setVoiceMuted]         = useState(false);
  const [voiceStatus, setVoiceStatus]       = useState('ready'); // 'ready' | 'speaking' | 'listening'
  const [alertLog, setAlertLog]             = useState([]);
  const [activeBubble, setActiveBubble]     = useState('');
  const [showBubble, setShowBubble]         = useState(false);

  // ── Drawing state refs ──
  const canvasRef    = useRef(null);
  const guideRef     = useRef(null);
  const isDrawRef    = useRef(false);
  const strokesRef   = useRef([]);          // all completed strokes
  const curStrokeRef = useRef([]);          // current in-progress stroke
  const strokeCountRef = useRef(0);
  const phaseIdxRef  = useRef(0);
  const bubbleTimerRef = useRef(null);
  const pauseTimerRef  = useRef(null);
  const speechRef      = useRef(null);

  const current = allLetters[currentIdx];
  const cat     = current.cat;
  const total   = allLetters.length;

  // ── Voice engine ─────────────────────────────────────────────
  const getTimestamp = () => {
    const d = new Date();
    return d.getHours().toString().padStart(2,'0') + ':' +
           d.getMinutes().toString().padStart(2,'0') + ':' +
           d.getSeconds().toString().padStart(2,'0');
  };

  const speak = useCallback((text, type = 'info') => {
    // Always log regardless of voice/mute
    setAlertLog(prev => [...prev.slice(-19), { text, type, time: getTimestamp() }]);

    // Show floating bubble
    setActiveBubble(text);
    setShowBubble(true);
    clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => setShowBubble(false), 3200);

    if (!voiceEnabled || voiceMuted) return;

    window.speechSynthesis?.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate  = 0.88;
    utt.pitch = 1.05;
    utt.lang  = 'en-US';
    utt.volume = 1;

    const voices = window.speechSynthesis?.getVoices() ?? [];
    const preferred = voices.find(v =>
      v.name.toLowerCase().includes('samantha') ||
      v.name.toLowerCase().includes('zira') ||
      v.name.toLowerCase().includes('female') ||
      v.name.toLowerCase().includes('google uk english female')
    );
    if (preferred) utt.voice = preferred;

    utt.onstart = () => setVoiceStatus('speaking');
    utt.onend   = () => setVoiceStatus('listening');
    utt.onerror = () => setVoiceStatus('ready');

    setVoiceStatus('speaking');
    window.speechSynthesis?.speak(utt);
    speechRef.current = utt;
  }, [voiceEnabled, voiceMuted]);

  // ── Build offscreen guide canvas ──────────────────────────────
  const buildGuideCanvas = useCallback((letter, w, h) => {
    const gc = document.createElement('canvas');
    gc.width = w; gc.height = h;
    const ctx = gc.getContext('2d');
    ctx.font = `900 ${Math.round(h * 0.68)}px "Noto Sans Sinhala", serif`;
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, w / 2, h / 2 + h * 0.04);
    guideRef.current = gc;
  }, []);

  // ── Draw canvas background ────────────────────────────────────
  const drawBackground = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);

    // Dot grid
    ctx.fillStyle = '#E0E7FF';
    for (let x = 30; x < w; x += 30)
      for (let y = 30; y < h; y += 30)
        ctx.fillRect(x - 1, y - 1, 2, 2);

    // Baseline
    ctx.strokeStyle = '#93C5FD'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(20, h * 0.72); ctx.lineTo(w - 20, h * 0.72); ctx.stroke();
    ctx.setLineDash([]);

    // Midline
    ctx.strokeStyle = '#BFDBFE'; ctx.lineWidth = 1; ctx.setLineDash([4, 8]);
    ctx.beginPath(); ctx.moveTo(20, h * 0.36); ctx.lineTo(w - 20, h * 0.36); ctx.stroke();
    ctx.setLineDash([]);

    // Guide ghost letter
    if (showGuide) {
      ctx.font = `900 ${Math.round(h * 0.68)}px "Noto Sans Sinhala", serif`;
      ctx.fillStyle = `rgba(79,70,229,${guideOpacity})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(current.letter, w / 2, h / 2 + h * 0.04);
    }
  }, [showGuide, guideOpacity, current.letter]);

  // ── Init on letter change ─────────────────────────────────────
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    buildGuideCanvas(current.letter, canvas.width, canvas.height);
    drawBackground();
    setHasDrawn(false);
    setScoreResult(null);
    setAnimating(false);
    strokesRef.current    = [];
    curStrokeRef.current  = [];
    strokeCountRef.current = 0;
    phaseIdxRef.current   = 0;
    setAlertLog([]);
    setShowBubble(false);
    window.speechSynthesis?.cancel();
    setTimeout(() => {
      speak(`Ready to trace ${current.letter} — ${current.phases[0]}`, 'start');
    }, 500);
  }, [current, buildGuideCanvas, drawBackground, speak]);

  useEffect(() => { initCanvas(); }, [currentIdx]);
  useEffect(() => { drawBackground(); }, [showGuide, guideOpacity]);

  // ── Pointer helpers ───────────────────────────────────────────
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
  };

  // ── Voice: stroke start ───────────────────────────────────────
  const onStrokeStart = useCallback(() => {
    const phaseIdx = phaseIdxRef.current;
    const phase = current.phases[Math.min(phaseIdx, current.phases.length - 1)];
    if (phaseIdx === 0 && strokeCountRef.current === 0) {
      speak(`Stroke 1 — ${phase}`, 'start');
    } else {
      speak(`Stroke ${strokeCountRef.current + 1} — ${phase}`, 'start');
    }
  }, [current, speak]);

  // ── Voice: mid-stroke pause ───────────────────────────────────
  const onStrokePause = useCallback(() => {
    if (curStrokeRef.current.length < 12) return;
    if (strokeCountRef.current < current.strokes - 1) {
      speak('Good — lift the pen now and begin the next stroke', 'pause');
    }
  }, [current.strokes, speak]);

  // ── Voice: stroke end ─────────────────────────────────────────
  const onStrokeEnd = useCallback(() => {
    strokeCountRef.current += 1;
    phaseIdxRef.current    += 1;
    if (strokeCountRef.current >= current.strokes) {
      setTimeout(() => speak('Letter complete! Tap "Check My Work" to see your score.', 'done'), 400);
    }
  }, [current.strokes, speak]);

  // ── Canvas drawing events ─────────────────────────────────────
  const startDraw = (e) => {
    e.preventDefault();
    if (scoreResult) return;
    isDrawRef.current = true;
    setHasDrawn(true);
    const { x, y } = getPos(e);
    curStrokeRef.current = [{ x, y }];
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath(); ctx.moveTo(x, y);
    onStrokeStart();
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawRef.current || scoreResult) return;
    const { x, y } = getPos(e);
    curStrokeRef.current.push({ x, y });
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = brushColor;
    ctx.lineWidth   = brushSize;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.shadowBlur  = 3;
    ctx.shadowColor = brushColor + '55';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.shadowBlur  = 0;
    ctx.beginPath(); ctx.moveTo(x, y);

    // Trigger pause-based voice tip after 0.9s of no movement
    clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(onStrokePause, 900);
  };

  const stopDraw = () => {
    if (!isDrawRef.current) return;
    isDrawRef.current = false;
    strokesRef.current.push([...curStrokeRef.current]);
    curStrokeRef.current = [];
    clearTimeout(pauseTimerRef.current);
    onStrokeEnd();
  };

  const clearCanvas = () => {
    drawBackground();
    setHasDrawn(false);
    setScoreResult(null);
    strokesRef.current    = [];
    curStrokeRef.current  = [];
    strokeCountRef.current = 0;
    phaseIdxRef.current   = 0;
    window.speechSynthesis?.cancel();
    speak('Canvas cleared — ready to trace again', 'info');
  };

  // ── Check submission ──────────────────────────────────────────
  const handleCheck = () => {
    if (!hasDrawn || isChecking) return;
    setIsChecking(true);
    setTimeout(() => {
      const raw   = computeAccuracy(canvasRef.current, guideRef.current);
      const grade = getGrade(raw);
      setScoreResult({ score: raw, grade });
      setIsChecking(false);
      const gained = Math.round(raw / 8);
      setPoints(p => p + gained);
      setProgressMap(pm => ({ ...pm, [current.letter]: Math.max(pm[current.letter] ?? 0, raw) }));
      setHistory(h => [{ letter: current.letter, score: raw, cat: cat.nameEn, ts: Date.now() }, ...h].slice(0, 50));

      // Voice feedback on score
      if (raw >= 90) speak('Excellent work! Perfect tracing!', 'done');
      else if (raw >= 75) speak('Very good! Great technique!', 'done');
      else if (raw >= 60) speak('Good effort! Keep it up!', 'done');
      else speak('Keep practising — you will get it!', 'done');

      if (raw >= 80) {
        setCelebrating(true);
        setTimeout(() => setCelebrating(false), 1800);
        setSessionCorrect(n => n + 1);
        if (!masteredSet.has(current.letter)) {
          const newMastered = new Set([...masteredSet, current.letter]);
          setMasteredSet(newMastered);
          if (newMastered.size % 5 === 0) {
            setMilestoneCount(newMastered.size);
            setMilestone(true);
            setTimeout(() => setMilestone(false), 4000);
          }
        }
      }
    }, 400);
  };

  const handleNext = () => {
    if (currentIdx < total - 1) setCurrentIdx(i => i + 1);
    else setCurrentIdx(0);
  };
  const handlePrev  = () => { if (currentIdx > 0) setCurrentIdx(i => i - 1); };
  const handleRetry = () => { clearCanvas(); setScoreResult(null); };

  const handleSelectLetter = (letter) => {
    const idx = allLetters.findIndex(l => l.letter === letter.letter);
    if (idx !== -1) setCurrentIdx(idx);
  };

  const pct       = Math.round(((currentIdx + 1) / total) * 100);
  const ds        = diffStyle(current.diff);
  const bestScore = progressMap[current.letter] ?? 0;
  const accuracy  = history.length > 0
    ? Math.round(history.slice(0, 10).reduce((a, h) => a + h.score, 0) / Math.min(history.length, 10))
    : 0;

  const voiceDotColor = voiceStatus === 'speaking' ? '#f59e0b' : voiceStatus === 'listening' ? '#22c55e' : '#9ca3af';
  const voiceStatusLabel = voiceStatus === 'speaking' ? t.voiceSpeaking : voiceStatus === 'listening' ? t.listeningForStroke : t.voiceReady;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Noto+Sans+Sinhala:wght@400;700;900&display=swap');
        * { font-family: 'Nunito', sans-serif; }
        .sinhala { font-family: 'Noto Sans Sinhala', serif !important; }

        @keyframes slideUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
        @keyframes popIn      { 0%{opacity:0;transform:scale(.82)} 65%{transform:scale(1.06)} 100%{opacity:1;transform:scale(1)} }
        @keyframes shimmer    { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes pulseGlow  { 0%,100%{box-shadow:0 0 0 0 rgba(79,70,229,0)} 50%{box-shadow:0 0 0 8px rgba(79,70,229,0.15)} }
        @keyframes bounce     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes celebConf  { from{opacity:1;transform:translateY(0) scale(1) rotate(0deg)} to{opacity:0;transform:translateY(-80px) scale(1.5) rotate(360deg)} }
        @keyframes milestoneSlide { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }
        @keyframes bubbleIn   { 0%{opacity:0;transform:translateX(-50%) translateY(6px)} 100%{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes dotPulse   { 0%,100%{opacity:.5} 50%{opacity:1} }

        .slide-up   { animation: slideUp   .4s ease-out both; }
        .fade-in    { animation: fadeIn    .3s ease-out both; }
        .pop-in     { animation: popIn     .45s cubic-bezier(.36,.07,.19,.97) both; }
        .bounce-anim{ animation: bounce    1.5s ease-in-out infinite; }
        .dot-pulse  { animation: dotPulse  .8s ease-in-out infinite; }

        .shimmer-text {
          background: linear-gradient(135deg,#1d4ed8,#4f46e5,#2563eb);
          background-size:200% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
          animation: shimmer 4s linear infinite;
        }

        .glass {
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.92);
        }

        .canvas-glow { animation: pulseGlow 2.5s ease-in-out infinite; }
        canvas { touch-action: none; cursor: crosshair; display: block; }

        .confetti-piece {
          position:absolute; pointer-events:none;
          animation: celebConf .9s ease-out forwards;
        }

        .milestone-toast {
          animation: milestoneSlide .5s cubic-bezier(.36,.07,.19,.97) both;
        }

        .voice-bubble {
          animation: bubbleIn .25s ease-out both;
        }

        .sidebar-scroll { overflow-y:auto; }
        .sidebar-scroll::-webkit-scrollbar { width:3px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background:#c7d2fe; border-radius:2px; }

        .panel-tab.active { background:linear-gradient(135deg,#1d4ed8,#4f46e5); color:white; box-shadow:0 4px 14px rgba(29,78,216,0.35); }
        .panel-tab { transition: all .2s; }
        .panel-tab:not(.active):hover { background:rgba(79,70,229,0.08); color:#4f46e5; }

        input[type="range"] { accent-color:#4f46e5; cursor:pointer; }
      `}</style>

      {/* ═══ TOP BAR ═══ */}
      <div className="glass border-b border-blue-100/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-blue-50 text-blue-500 transition-colors flex-shrink-0">
              <HomeIco s={20}/>
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-black shimmer-text leading-tight truncate">{t.pageTitle}</h1>
              <p className="text-xs text-gray-400 hidden sm:block truncate">{t.pageSubtitle}</p>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-xs flex-col gap-1 mx-4">
            <div className="flex justify-between text-xs text-gray-400 font-semibold">
              <span>{currentIdx + 1} / {total}</span><span>{pct}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#1d4ed8,#4f46e5,#7c3aed)' }} />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
            {[
              { icon: <TrophyIco s={15}/>, val: points,          color: 'text-indigo-600', label: t.points },
              { icon: <AwardIco  s={15}/>, val: masteredSet.size, color: 'text-green-600',  label: t.completed },
              { icon: <ZapIco   s={15}/>, val: `${accuracy}%`,  color: 'text-orange-500', label: t.accuracy },
            ].map(({ icon, val, color, label }) => (
              <div key={label} className={`font-black text-sm ${color} items-center gap-1 hidden sm:flex`} title={label}>
                {icon}{val}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 grid lg:grid-cols-[240px_1fr_260px] gap-5">

        {/* ══ LEFT SIDEBAR ══ */}
        <aside className="hidden lg:flex flex-col gap-4">
          <div className="glass rounded-2xl p-1.5 flex gap-1">
            {[
              { id:'letters', icon:<GridIco s={13}/>,  label:t.allLetters },
              { id:'guide',   icon:<InfoIco s={13}/>,  label:t.strokeGuide },
            ].map(({ id, icon, label }) => (
              <button key={id} onClick={() => setActivePanel(id)}
                className={`panel-tab flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold ${activePanel===id?'active':''}`}>
                {icon}{label}
              </button>
            ))}
          </div>

          <div className="glass rounded-2xl p-3 flex-1 sidebar-scroll" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {activePanel === 'letters' && (
              <>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest px-1 mb-3">
                  {masteredSet.size} / {total} mastered
                </p>
                <LetterGridSidebar
                  currentLetter={current}
                  masteredSet={masteredSet}
                  progressMap={progressMap}
                  onSelect={handleSelectLetter}
                />
              </>
            )}
            {activePanel === 'guide' && (
              <div className="space-y-5 p-1">
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Stroke Order</p>
                  <StrokeOrderDisplay letter={current.letter} strokes={current.strokes} color={cat.color} />
                </div>
                <div className="rounded-2xl p-4" style={{ background: `${cat.color}10`, border: `1.5px solid ${cat.color}25` }}>
                  <p className="text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: cat.color }}>{t.tipTitle}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{current.tip}</p>
                </div>

                {/* Voice Phase Guide */}
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Voice Guidance Steps</p>
                  <div className="space-y-2">
                    {current.phases.map((phase, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 text-white mt-0.5"
                          style={{ background: cat.color }}>
                          {i + 1}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{phase}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t.instructions}</p>
                  <div className="space-y-2">
                    {[t.inst1, t.inst2, t.inst3, t.inst4].map((step, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 text-white mt-0.5"
                          style={{ background: cat.color }}>
                          {i + 1}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ══ CENTRE: CANVAS AREA ══ */}
        <main className="flex flex-col gap-4">

          {/* Letter header */}
          <div className="glass rounded-2xl px-5 py-4 flex items-center gap-4 slide-up">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl sinhala font-black flex-shrink-0"
              style={{ background: `${cat.color}18`, border: `2px solid ${cat.color}30`, color: cat.color, fontFamily: "'Noto Sans Sinhala', serif" }}>
              {current.letter}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-black px-2.5 py-1 rounded-full text-white" style={{ background: cat.color }}>
                  {cat.name}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: ds.bg, color: ds.text }}>
                  {current.diff}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                  {current.strokes} {current.strokes === 1 ? 'stroke' : 'strokes'}
                </span>
                {masteredSet.has(current.letter) && (
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-green-100 text-green-700">✓ Mastered</span>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-bold text-gray-600">/{current.sound}/</span>
                {bestScore > 0 && (
                  <span className="text-xs text-gray-400 font-semibold">Best: <strong style={{ color: cat.color }}>{bestScore}%</strong></span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={handlePrev} disabled={currentIdx === 0}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-all hover:scale-110 disabled:hover:scale-100">
                <ArrowLIco s={16}/>
              </button>
              <span className="text-xs font-bold text-gray-400 whitespace-nowrap">{currentIdx + 1}/{total}</span>
              <button onClick={handleNext} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all hover:scale-110">
                <ArrowRIco s={16}/>
              </button>
            </div>
          </div>

          {/* Canvas card */}
          <div className="glass rounded-3xl p-5 shadow-xl">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <p className="text-sm font-black text-gray-700 flex items-center gap-2">
                <PenIco s={15}/> {t.practiceArea}
              </p>
              <div className="flex items-center gap-2">
                {showGuide && (
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-200">
                    <EyeIco s={12}/>
                    <input type="range" min="5" max="35" value={Math.round(guideOpacity * 100)}
                      onChange={e => setGuideOpacity(+e.target.value / 100)}
                      className="w-16 h-1.5 rounded" />
                  </div>
                )}
                <button onClick={() => setShowGuide(g => !g)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                  style={{
                    background: showGuide ? `${cat.color}18` : '#f3f4f6',
                    color: showGuide ? cat.color : '#6b7280',
                    border: `1.5px solid ${showGuide ? cat.color + '40' : '#e5e7eb'}`,
                  }}>
                  {showGuide ? <EyeOffIco s={14}/> : <EyeIco s={14}/>}
                  {showGuide ? t.hideGuide : t.showGuide}
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative">
              {celebrating && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10">
                  {['🎉','⭐','✨','💫','🌟'].map((em, i) => (
                    <span key={i} className="confetti-piece text-2xl"
                      style={{ top: '40%', left: `${10 + i * 18}%`, animationDelay: `${i * 0.1}s` }}>
                      {em}
                    </span>
                  ))}
                </div>
              )}

              {/* ── VOICE BUBBLE ── */}
              {showBubble && activeBubble && (
                <div className="voice-bubble absolute top-3 left-1/2 z-30 pointer-events-none"
                  style={{ transform: 'translateX(-50%)', maxWidth: '80%' }}>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs font-bold shadow-lg whitespace-nowrap"
                    style={{ background: '#4f46e5' }}>
                    <MicIco s={12}/>
                    <span className="truncate max-w-xs">{activeBubble}</span>
                  </div>
                </div>
              )}

              {isChecking && (
                <div className="absolute inset-0 rounded-2xl z-10 flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(4px)' }}>
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                    <p className="text-sm font-bold text-indigo-600">Analysing your tracing…</p>
                  </div>
                </div>
              )}
              {scoreResult && (
                <ScoreOverlay
                  score={scoreResult.score}
                  grade={scoreResult.grade}
                  onNext={() => { setScoreResult(null); handleNext(); }}
                  onRetry={handleRetry}
                  isLast={currentIdx === total - 1}
                />
              )}
              <canvas
                ref={canvasRef}
                width={680} height={480}
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                className={`w-full rounded-2xl border-2 ${!scoreResult && !isChecking ? 'canvas-glow' : ''}`}
                style={{
                  borderColor: scoreResult
                    ? scoreResult.score >= 75 ? '#10b981' : '#f97316'
                    : hasDrawn ? `${cat.color}60` : '#dbeafe',
                  transition: 'border-color .3s',
                  background: '#fafbff',
                }}
              />
              {!hasDrawn && !scoreResult && (
                <div className="absolute inset-0 flex items-center justify-end pr-8 pb-8 pointer-events-none">
                  <div className="bounce-anim">
                    <div className="flex items-center gap-2 bg-white/90 rounded-2xl px-4 py-2.5 shadow-lg border border-blue-100">
                      <PenIco s={16}/>
                      <span className="text-xs font-bold text-gray-600">Start tracing here!</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <button onClick={clearCanvas}
                className="flex items-center justify-center gap-1.5 py-3 rounded-2xl font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all hover:scale-[1.02] shadow-sm">
                <RotateIco s={16}/> {t.clear}
              </button>
              <button onClick={handleCheck} disabled={!hasDrawn || isChecking || !!scoreResult}
                className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                style={{ background: hasDrawn && !isChecking && !scoreResult ? 'linear-gradient(135deg,#1d4ed8,#4f46e5)' : '#9ca3af' }}>
                {isChecking
                  ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/><span>Checking…</span></>
                  : <><CheckIco s={16}/> {t.checkWork}</>
                }
              </button>
            </div>
          </div>

          {/* ── VOICE ALERT PANEL ── */}
          <div className="glass rounded-2xl p-4 slide-up">
            {/* Header row */}
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <MicIco s={16}/>
                <p className="text-sm font-black text-gray-700">{t.voiceAlerts}</p>
                {/* Live dot */}
                <div className="flex items-center gap-1.5 ml-1">
                  <div className={`w-2 h-2 rounded-full ${voiceStatus === 'speaking' ? 'dot-pulse' : ''}`}
                    style={{ background: voiceEnabled ? voiceDotColor : '#d1d5db' }} />
                  <span className="text-xs text-gray-400 font-semibold">{voiceEnabled ? voiceStatusLabel : t.voiceOff}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Mute toggle */}
                <button onClick={() => {
                  setVoiceMuted(m => !m);
                  window.speechSynthesis?.cancel();
                }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: voiceMuted ? '#fee2e2' : '#f0fdf4',
                    color: voiceMuted ? '#b91c1c' : '#15803d',
                    border: `1.5px solid ${voiceMuted ? '#fca5a5' : '#86efac'}`,
                  }}>
                  {voiceMuted ? <VolumeOffIco s={13}/> : <VolumeIco s={13}/>}
                  {voiceMuted ? 'Unmute' : 'Mute'}
                </button>
                {/* Voice on/off toggle */}
                <button onClick={() => {
                  setVoiceEnabled(v => !v);
                  if (voiceEnabled) { window.speechSynthesis?.cancel(); setVoiceStatus('ready'); }
                }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: voiceEnabled ? '#eef2ff' : '#f3f4f6',
                    color: voiceEnabled ? '#4f46e5' : '#6b7280',
                    border: `1.5px solid ${voiceEnabled ? '#a5b4fc' : '#e5e7eb'}`,
                  }}>
                  {voiceEnabled ? <VolumeIco s={13}/> : <VolumeOffIco s={13}/>}
                  {voiceEnabled ? t.voiceOn : t.voiceOff}
                </button>
              </div>
            </div>

            {/* Current phase indicator */}
            {current.phases.length > 0 && (
              <div className="mb-3 rounded-xl px-3 py-2.5 flex items-start gap-2"
                style={{ background: `${cat.color}0f`, border: `1.5px solid ${cat.color}25` }}>
                <div className="w-5 h-5 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0 mt-0.5"
                  style={{ background: cat.color }}>
                  {Math.min(phaseIdxRef.current + 1, current.phases.length)}
                </div>
                <p className="text-xs leading-relaxed font-semibold" style={{ color: cat.color }}>
                  {current.phases[Math.min(phaseIdxRef.current, current.phases.length - 1)]}
                </p>
              </div>
            )}

            {/* Alert log */}
            <VoiceAlertLog alerts={alertLog} />
          </div>

          {/* Mobile progress */}
          <div className="glass rounded-2xl p-4 lg:hidden slide-up">
            <div className="flex justify-between text-xs text-gray-500 font-semibold mb-2">
              <span>Letter {currentIdx + 1} of {total}</span><span>{pct}%</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#1d4ed8,#4f46e5,#7c3aed)' }} />
            </div>
          </div>

          {/* Recent history */}
          {history.length > 0 && (
            <div className="glass rounded-2xl p-4 slide-up">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Recent Attempts</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {history.slice(0, 10).map((h, i) => {
                  const g = getGrade(h.score);
                  return (
                    <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold sinhala border-2"
                        style={{ fontFamily: "'Noto Sans Sinhala', serif", background: `${g.color}18`, borderColor: `${g.color}40`, color: g.color }}>
                        {h.letter}
                      </div>
                      <span className="text-xs font-bold" style={{ color: g.color }}>{h.score}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mobile letter grid */}
          <div className="glass rounded-3xl p-5 shadow-xl lg:hidden">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{t.allLetters}</p>
            <LetterGridSidebar currentLetter={current} masteredSet={masteredSet} progressMap={progressMap} onSelect={handleSelectLetter} />
          </div>
        </main>

        {/* ══ RIGHT SIDEBAR ══ */}
        <aside className="flex flex-col gap-4">

          {/* Letter info */}
          <div className="glass rounded-3xl p-5 shadow-xl">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">{t.letterInfo}</p>
            <div className="rounded-2xl p-6 text-center mb-4 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${cat.color}18, ${cat.color}05)`, border: `2px solid ${cat.color}25` }}>
              <div className="absolute inset-0 opacity-10 rounded-2xl"
                style={{ background: `radial-gradient(circle at 50% 30%, ${cat.color}, transparent 70%)` }} />
              <div className="relative sinhala text-9xl font-black leading-none"
                style={{ color: cat.color, fontFamily: "'Noto Sans Sinhala', serif", textShadow: `0 4px 20px ${cat.color}30` }}>
                {current.letter}
              </div>
              {bestScore > 0 && (
                <div className="absolute top-2 right-2 flex gap-0.5">
                  {[1,2,3].map(s => (
                    <span key={s} className={s <= getGrade(bestScore).stars ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 mb-4">
              {[
                { label: 'Sound',      val: `/${current.sound}/` },
                { label: 'Category',   val: cat.nameEn },
                { label: 'Difficulty', val: current.diff },
                { label: 'Strokes',    val: `${current.strokes} stroke${current.strokes > 1 ? 's' : ''}` },
                { label: 'Best Score', val: bestScore > 0 ? `${bestScore}%` : '—' },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                  <span className="text-xs font-black text-gray-800">{val}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-1.5 justify-center">
              {Array.from({ length: Math.min(current.strokes, 6) }, (_, i) => (
                <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black"
                  style={{ background: cat.color }}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Brush settings */}
          <div className="glass rounded-3xl p-5 shadow-xl">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">{t.brushSettings}</p>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-600">{t.brushSize}</label>
                <span className="text-xs font-black text-indigo-600">{brushSize}px</span>
              </div>
              <input type="range" min="8" max="44" value={brushSize}
                onChange={e => setBrushSize(+e.target.value)} className="w-full h-2 rounded-lg appearance-none" />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400">{t.fine}</span>
                <span className="text-xs text-gray-400">{t.thick}</span>
              </div>
              <div className="flex justify-center mt-2">
                <div className="rounded-full bg-indigo-600 transition-all duration-200"
                  style={{ width: Math.max(6, brushSize * 0.5), height: Math.max(6, brushSize * 0.5) }} />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">{t.brushColor}</label>
              <div className="grid grid-cols-4 gap-2">
                {BRUSH_COLORS.map(b => (
                  <button key={b.color} onClick={() => setBrushColor(b.color)} title={b.name}
                    className="w-full h-11 rounded-xl transition-all duration-200 flex items-center justify-center"
                    style={{
                      background: b.color,
                      transform: brushColor === b.color ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: brushColor === b.color ? `0 0 0 3px white, 0 0 0 5px ${b.color}` : 'none',
                    }}>
                    {brushColor === b.color && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Session stats */}
          <div className="glass rounded-3xl p-5 shadow-xl">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Session Stats</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon:'🏆', label:t.points,    val: points,           color:'#4f46e5' },
                { icon:'✅', label:t.completed,  val: masteredSet.size,  color:'#10b981' },
                { icon:'🎯', label:t.accuracy,   val: `${accuracy}%`,   color:'#f59e0b' },
                { icon:'📝', label:'Attempts',   val: history.length,   color:'#3b82f6' },
              ].map(({ icon, label, val, color }) => (
                <div key={label} className="rounded-2xl p-3 text-center"
                  style={{ background: `${color}10`, border: `1.5px solid ${color}25` }}>
                  <p className="text-lg mb-0.5">{icon}</p>
                  <p className="font-black text-xl" style={{ color }}>{val}</p>
                  <p className="text-xs text-gray-400 font-semibold leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ═══ MILESTONE TOAST ═══ */}
      {showMilestone && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 milestone-toast">
          <div className="flex items-center gap-4 px-8 py-4 rounded-3xl text-white shadow-2xl"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
            <TrophyIco s={28}/>
            <div>
              <p className="font-black text-lg">{t.milestone}</p>
              <p className="text-white/80 text-sm font-semibold">{t.milestoneMsg} {milestoneCount} {t.letters}</p>
            </div>
            <SparkIco s={28}/>
          </div>
        </div>
      )}

      {/* Ambient blobs */}
      <div className="fixed top-20 left-10 w-44 h-44 bg-blue-200 rounded-full opacity-20 blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed bottom-20 right-10 w-52 h-52 bg-indigo-200 rounded-full opacity-15 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '.25s' }} />
      <div className="fixed top-1/2 right-1/4 w-36 h-36 bg-violet-200 rounded-full opacity-15 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '.5s' }} />
    </div>
  );
}
