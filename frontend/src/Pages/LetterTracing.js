import React, { useState, useRef, useEffect, useCallback } from 'react';

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
    milestone: "Milestone!", milestoneMsg: "You've mastered",
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
    voiceAlerts: "Voice Guidance",
    voiceOn: "Voice On", voiceOff: "Voice Off",
  },
};

// ─── STROKE PATH DATA (based on image stroke guide analysis) ─────
// Each letter has SVG path segments with numbered waypoints
// These paths are normalized to a 200x200 viewBox, rendered scaled to canvas

const LETTER_STROKE_DATA = {
  // Row 1
  'අ': {
    paths: [
      { d: 'M 100,40 C 130,38 150,55 148,80 C 146,105 128,118 105,115 C 80,112 65,95 68,72 C 71,50 90,42 100,40 Z', stroke: 0 },
      { d: 'M 100,40 C 85,30 70,40 68,55', stroke: 0 },
      { d: 'M 100,115 L 100,155 C 100,165 95,170 88,168', stroke: 0 },
    ],
    waypoints: [
      {n:1,x:100,y:40},{n:2,x:135,y:50},{n:3,x:148,y:80},{n:4,x:125,y:110},
      {n:5,x:100,y:115},{n:6,x:75,y:108},{n:7,x:65,y:80},{n:8,x:75,y:55},
      {n:9,x:100,y:155},{n:10,x:92,y:168},
    ],
    diff:'Easy', strokes:1, sound:'a', phases:['Start top, curve right forming a round body, then loop down with a small tail'],
    tip:'Round body with a descending tail — one flowing motion',
  },
  'ආ': {
    paths: [
      { d: 'M 95,42 C 125,40 148,58 146,82 C 144,106 125,120 100,117 C 75,114 60,97 63,73 C 66,50 84,42 95,42 Z', stroke: 0 },
      { d: 'M 100,42 C 85,30 68,42 66,57', stroke: 0 },
      { d: 'M 100,117 L 100,158 C 100,168 95,172 88,170', stroke: 0 },
      { d: 'M 100,80 C 120,75 148,78 165,75', stroke: 1 },
    ],
    waypoints: [
      {n:1,x:95,y:42},{n:2,x:135,y:52},{n:3,x:146,y:82},{n:4,x:120,y:114},
      {n:5,x:100,y:117},{n:6,x:72,y:108},{n:7,x:62,y:75},{n:8,x:100,y:158},
      {n:9,x:88,y:170},{n:10,x:148,y:78},{n:11,x:165,y:75},
    ],
    diff:'Easy', strokes:1, sound:'aa', phases:['Trace the round body of අ, then extend a long sweeping tail to the right'],
    tip:'Like අ with a long horizontal extension to the right',
  },
  'ඇ': {
    paths: [
      { d: 'M 105,38 C 88,28 72,38 70,52 C 68,68 80,78 95,76 C 110,74 120,65 118,52 C 116,40 108,36 105,38 Z', stroke: 0 },
      { d: 'M 105,38 L 105,25 C 105,18 112,14 118,16', stroke: 0 },
      { d: 'M 95,76 C 80,80 65,95 68,112 C 71,128 88,138 105,136 C 122,134 134,120 132,105 C 130,92 118,85 105,85', stroke: 0 },
    ],
    waypoints: [
      {n:1,x:105,y:38},{n:2,x:118,y:16},{n:3,x:82,y:35},{n:4,x:70,y:52},
      {n:5,x:82,y:74},{n:6,x:105,y:76},{n:7,x:65,y:105},{n:8,x:72,y:125},
      {n:9,x:105,y:136},{n:10,x:132,y:105},{n:11,x:118,y:85},
    ],
    diff:'Easy', strokes:1, sound:'ae', phases:['Begin at the top hook, trace the upper loop, flow into the lower body loop'],
    tip:'Two connected loops — upper small, lower larger',
  },
  'ඈ': {
    paths: [
      { d: 'M 85,38 C 68,28 52,38 50,52 C 48,68 60,78 75,76 C 90,74 100,65 98,52 C 96,40 88,36 85,38 Z', stroke: 0 },
      { d: 'M 85,38 L 85,25 C 85,18 92,14 98,16', stroke: 0 },
      { d: 'M 75,76 C 60,80 45,95 48,112 C 51,128 68,138 85,136 C 102,134 114,120 112,105 C 110,92 98,85 85,85', stroke: 0 },
      { d: 'M 100,80 C 120,75 145,78 160,72', stroke: 1 },
    ],
    waypoints: [
      {n:1,x:85,y:38},{n:2,x:98,y:16},{n:3,x:62,y:35},{n:4,x:50,y:52},
      {n:5,x:62,y:74},{n:6,x:85,y:76},{n:7,x:45,y:105},{n:8,x:52,y:125},
      {n:9,x:85,y:136},{n:10,x:112,y:105},{n:11,x:145,y:78},{n:12,x:160,y:72},
    ],
    diff:'Medium', strokes:2, sound:'aee', phases:['Draw the double-loop body like ඇ','Add a long horizontal tail extending right'],
    tip:'ඇ body plus a long rightward extension',
  },
  'ඉ': {
    paths: [
      { d: 'M 130,60 C 130,40 115,30 100,32 C 85,34 72,48 72,65 C 72,82 85,92 100,92 C 115,92 128,82 128,68', stroke: 0 },
      { d: 'M 128,68 C 126,80 115,95 100,100 C 85,105 72,100 68,90', stroke: 0 },
    ],
    waypoints: [
      {n:1,x:130,y:60},{n:2,x:118,y:32},{n:3,x:95,y:32},{n:4,x:75,y:48},
      {n:5,x:72,y:68},{n:6,x:82,y:88},{n:7,x:100,y:92},{n:8,x:125,y:82},
      {n:9,x:100,y:100},{n:10,x:68,y:90},
    ],
    diff:'Easy', strokes:1, sound:'i', phases:['Start right, curve up and left forming a teardrop loop, tail exits left-down'],
    tip:'Single teardrop loop — elegant backwards curve',
  },
  'ඊ': {
    paths: [
      { d: 'M 120,60 C 120,40 105,30 90,32 C 75,34 62,48 62,65 C 62,82 75,92 90,92 C 105,92 118,82 118,68', stroke: 0 },
      { d: 'M 118,68 C 116,80 105,95 90,100 C 75,105 62,100 58,90', stroke: 0 },
      { d: 'M 148,35 L 148,100', stroke: 1 },
    ],
    waypoints: [
      {n:1,x:120,y:60},{n:2,x:108,y:32},{n:3,x:85,y:32},{n:4,x:65,y:48},
      {n:5,x:62,y:68},{n:6,x:72,y:88},{n:7,x:90,y:92},{n:8,x:115,y:82},
      {n:9,x:90,y:100},{n:10,x:58,y:90},{n:11,x:148,y:35},{n:12,x:148,y:100},
    ],
    diff:'Medium', strokes:2, sound:'ii', phases:['Draw the ඉ loop','Add a short vertical bar on the right side'],
    tip:'ඉ loop with a vertical bar to the right',
  },
  'උ': {
    paths: [
      { d: 'M 70,55 C 68,75 72,95 85,110 C 98,125 118,130 132,120 C 146,110 150,90 145,72 C 140,55 125,45 110,48 C 95,51 82,62 80,78', stroke: 0 },
    ],
    waypoints: [
      {n:1,x:70,y:55},{n:2,x:70,y:80},{n:3,x:78,y:105},{n:4,x:100,y:125},
      {n:5,x:128,y:125},{n:6,x:148,y:105},{n:7,x:148,y:75},{n:8,x:128,y:52},
      {n:9,x:105,y:48},{n:10,x:82,y:62},{n:11,x:80,y:78},
    ],
    diff:'Easy', strokes:1, sound:'u', phases:['Sweep from left downward, curve right and up forming an open bowl shape'],
    tip:'Bowl shape opening upward — left to right sweep',
  },
  'ඌ': {
    paths: [
      { d: 'M 65,52 C 63,72 67,92 80,107 C 93,122 113,127 127,117 C 141,107 145,87 140,69 C 135,52 120,42 105,45 C 90,48 77,59 75,75', stroke: 0 },
      { d: 'M 75,115 C 72,130 75,148 85,155 C 95,162 108,158 112,145', stroke: 1 },
    ],
    waypoints: [
      {n:1,x:65,y:52},{n:2,x:65,y:78},{n:3,x:74,y:102},{n:4,x:96,y:122},
      {n:5,x:122,y:120},{n:6,x:140,y:100},{n:7,x:140,y:72},{n:8,x:122,y:48},
      {n:9,x:99,y:45},{n:10,x:77,y:59},{n:11,x:75,y:75},{n:12,x:75,y:130},
      {n:13,x:85,y:155},{n:14,x:112,y:145},
    ],
    diff:'Medium', strokes:2, sound:'uu', phases:['Draw the bowl shape of උ','Add a curved extension below hooking left'],
    tip:'උ plus a curved lower extension',
  },

  // Row 2 — Ka group
  'ක': {
    paths: [
      { d: 'M 55,55 C 75,50 110,48 140,52', stroke: 0 },
      { d: 'M 98,52 C 95,70 88,90 80,110 C 75,125 72,140 78,150 C 84,160 98,158 108,148 C 118,138 122,122 118,105 C 114,88 102,75 100,60', stroke: 0 },
    ],
    waypoints: [
      {n:1,x:55,y:55},{n:2,x:98,y:50},{n:3,x:140,y:52},{n:4,x:95,y:68},
      {n:5,x:82,y:95},{n:6,x:75,y:125},{n:7,x:78,y:148},{n:8,x:100,y:155},
      {n:9,x:118,y:140},{n:10,x:118,y:108},{n:11,x:102,y:75},
    ],
    diff:'Medium', strokes:2, sound:'ka', phases:['Draw a horizontal bar across the top','Curve down to form the body and close below'],
    tip:'Horizontal top bar then curved descending body',
  },
  'ග': {
    paths: [
      { d: 'M 140,55 C 140,35 122,25 105,28 C 88,31 72,45 72,65 C 72,85 88,98 105,98 C 122,98 138,88 140,72', stroke: 0 },
      { d: 'M 140,72 C 142,90 135,115 120,128 C 105,141 85,142 72,132', stroke: 0 },
    ],
    waypoints: [
      {n:1,x:140,y:55},{n:2,x:128,y:28},{n:3,x:105,y:28},{n:4,x:78,y:45},
      {n:5,x:72,y:68},{n:6,x:82,y:92},{n:7,x:105,y:98},{n:8,x:135,y:88},
      {n:9,x:138,y:115},{n:10,x:118,y:132},{n:11,x:85,y:140},{n:12,x:72,y:132},
    ],
    diff:'Medium', strokes:2, sound:'ga', phases:['Sweep a circle clockwise starting top-right','Continue curving down and left with the tail'],
    tip:'Open loop curving to the right, then tail sweeps down',
  },
  'ච': {
    paths: [
      { d: 'M 138,50 C 135,35 120,28 105,30 C 90,32 78,45 78,62 C 78,79 90,92 105,92 C 120,92 132,82 135,68 C 138,54 130,42 118,38', stroke: 0 },
      { d: 'M 78,80 C 75,95 75,118 88,130 C 101,142 118,138 125,125', stroke: 0 },
    ],
    waypoints: [
      {n:1,x:138,y:50},{n:2,x:122,y:30},{n:3,x:98,y:30},{n:4,x:80,y:48},
      {n:5,x:78,y:65},{n:6,x:88,y:88},{n:7,x:108,y:92},{n:8,x:132,y:72},
      {n:9,x:118,y:38},{n:10,x:78,y:95},{n:11,x:85,y:125},{n:12,x:118,y:138},
    ],
    diff:'Easy', strokes:1, sound:'cha', phases:['One smooth sweep — start top-right, curve left and spiral into a lower tail'],
    tip:'Single flowing fishhook curve',
  },
  'ජ': {
    paths: [
      { d: 'M 112,35 L 112,120 C 112,140 105,155 92,155 C 79,155 72,142 75,128', stroke: 0 },
      { d: 'M 88,35 L 130,35', stroke: 0 },
      { d: 'M 75,128 C 72,118 80,108 92,108 C 104,108 112,118 112,128', stroke: 1 },
    ],
    waypoints: [
      {n:1,x:88,y:35},{n:2,x:130,y:35},{n:3,x:112,y:60},{n:4,x:112,y:95},
      {n:5,x:112,y:125},{n:6,x:105,y:150},{n:7,x:88,y:155},{n:8,x:75,y:142},
      {n:9,x:75,y:128},{n:10,x:82,y:112},{n:11,x:98,y:108},{n:12,x:112,y:120},
    ],
    diff:'Medium', strokes:2, sound:'ja', phases:['Drop a vertical line with a top bar','Curve the base left and add a small hook loop'],
    tip:'Vertical drop with curved base and hook',
  },
  'ට': {
    paths: [
      { d: 'M 100,40 C 118,40 132,55 132,75 C 132,95 118,110 100,110 C 82,110 68,95 68,75 C 68,55 82,40 100,40 Z', stroke: 0 },
      { d: 'M 132,75 L 158,75', stroke: 0 },
    ],
    waypoints: [
      {n:1,x:100,y:40},{n:2,x:128,y:52},{n:3,x:132,y:75},{n:4,x:120,y:105},
      {n:5,x:100,y:110},{n:6,x:72,y:98},{n:7,x:68,y:75},{n:8,x:82,y:48},
      {n:9,x:158,y:75},
    ],
    diff:'Easy', strokes:1, sound:'ṭa', phases:['Draw a full clockwise circle, then exit with a short horizontal stroke right'],
    tip:'Circle with a short right exit stroke',
  },
  'ත': {
    paths: [
      { d: 'M 100,42 C 118,40 130,52 128,65 C 126,78 112,85 100,82 C 88,79 80,68 82,56 C 84,44 94,40 100,42 Z', stroke: 0 },
      { d: 'M 100,82 C 85,88 68,105 70,122 C 72,138 88,148 105,145 C 122,142 132,128 130,112 C 128,96 112,88 100,88', stroke: 1 },
    ],
    waypoints: [
      {n:1,x:100,y:42},{n:2,x:125,y:52},{n:3,x:128,y:65},{n:4,x:112,y:82},
      {n:5,x:95,y:82},{n:6,x:80,y:68},{n:7,x:82,y:52},{n:8,x:72,y:112},
      {n:9,x:80,y:138},{n:10,x:105,y:145},{n:11,x:128,y:125},{n:12,x:112,y:90},
    ],
    diff:'Medium', strokes:2, sound:'tha', phases:['Draw the upper loop','Add the lower larger loop with a small tail'],
    tip:'Two linked loops at different heights',
  },
  'ද': {
    paths: [
      { d: 'M 148,52 C 148,35 130,28 112,32 C 94,36 82,52 82,70 C 82,88 94,100 112,100 C 130,100 144,88 148,72', stroke: 0 },
      { d: 'M 82,70 L 82,150 C 82,160 78,165 72,162', stroke: 0 },
    ],
    waypoints: [
      {n:1,x:148,y:52},{n:2,x:132,y:30},{n:3,x:108,y:32},{n:4,x:85,y:50},
      {n:5,x:82,y:72},{n:6,x:92,y:95},{n:7,x:115,y:100},{n:8,x:142,y:85},
      {n:9,x:148,y:65},{n:10,x:82,y:115},{n:11,x:82,y:148},{n:12,x:72,y:162},
    ],
    diff:'Hard', strokes:2, sound:'da', phases:['Trace a reversed-P shape from top-right, curve left across top','Bring the stem down with a flat left-curving base'],
    tip:'Reversed P with long descending stem',
  },
  'න': {
    paths: [
      { d: 'M 65,65 C 65,48 80,38 100,38 C 120,38 135,52 135,70 C 135,88 122,100 105,100', stroke: 0 },
      { d: 'M 105,100 C 90,105 78,118 80,132 C 82,146 98,152 112,148 C 126,144 134,130 130,116', stroke: 1 },
    ],
    waypoints: [
      {n:1,x:65,y:65},{n:2,x:72,y:42},{n:3,x:100,y:38},{n:4,x:128,y:52},
      {n:5,x:135,y:72},{n:6,x:120,y:95},{n:7,x:105,y:100},{n:8,x:80,y:115},
      {n:9,x:80,y:132},{n:10,x:98,y:150},{n:11,x:118,y:145},{n:12,x:130,y:118},
    ],
    diff:'Medium', strokes:2, sound:'na', phases:['Draw the arch — curve up and over','Add a small right-facing foot loop at base'],
    tip:'Dental n — arch with right foot loop',
  },
  'ප': {
    paths: [
      { d: 'M 100,42 C 118,40 132,55 132,75 C 132,95 118,108 100,108 C 82,108 68,95 68,75 C 68,55 82,42 100,42 Z', stroke: 0 },
      { d: 'M 68,75 L 68,158', stroke: 0 },
    ],
    waypoints: [
      {n:1,x:100,y:42},{n:2,x:128,y:52},{n:3,x:132,y:75},{n:4,x:118,y:105},
      {n:5,x:100,y:108},{n:6,x:72,y:98},{n:7,x:68,y:75},{n:8,x:82,y:48},
      {n:9,x:68,y:115},{n:10,x:68,y:158},
    ],
    diff:'Medium', strokes:2, sound:'pa', phases:['Draw the circular head clockwise','Bring a vertical stem straight down from the left'],
    tip:'P-like shape — circle with descending stem',
  },
  'ම': {
    paths: [
      { d: 'M 68,65 C 68,48 80,38 95,40 C 110,42 118,55 115,70 C 112,85 98,92 85,88', stroke: 0 },
      { d: 'M 85,88 C 75,92 62,105 65,120 C 68,135 85,142 100,138 C 115,134 122,118 118,103 C 114,88 100,82 88,86', stroke: 1 },
    ],
    waypoints: [
      {n:1,x:68,y:65},{n:2,x:75,y:40},{n:3,x:98,y:40},{n:4,x:115,y:58},
      {n:5,x:115,y:72},{n:6,x:98,y:88},{n:7,x:82,y:88},{n:8,x:62,y:108},
      {n:9,x:65,y:128},{n:10,x:88,y:140},{n:11,x:115,y:130},{n:12,x:118,y:105},
      {n:13,x:100,y:84},{n:14,x:85,y:88},
    ],
    diff:'Medium', strokes:2, sound:'ma', phases:['Draw the first hump — curve up from the left then down','Draw the second larger hump with tail sweeping right'],
    tip:'Two connected humps — like m shape',
  },
  'ය': {
    paths: [
      { d: 'M 100,38 L 80,70 M 100,38 L 120,70', stroke: 0 },
      { d: 'M 100,70 C 100,85 108,100 118,110 C 128,120 138,125 135,138 C 132,151 115,155 100,152 C 85,149 75,138 78,125', stroke: 1 },
    ],
    waypoints: [
      {n:1,x:100,y:38},{n:2,x:80,y:68},{n:3,x:120,y:68},{n:4,x:100,y:70},
      {n:5,x:108,y:95},{n:6,x:125,y:118},{n:7,x:135,y:138},{n:8,x:115,y:152},
      {n:9,x:95,y:152},{n:10,x:78,y:138},{n:11,x:80,y:122},
    ],
    diff:'Hard', strokes:2, sound:'ya', phases:['Draw a Y-shaped upper stroke','Curve the body right and close into a loop'],
    tip:'Y-shaped top with curved closing loop',
  },
  'ර': {
    paths: [
      { d: 'M 138,55 C 138,35 120,25 102,28 C 84,31 70,48 72,68 C 74,88 92,100 112,98 C 132,96 145,80 142,62 C 139,44 122,38 108,42 C 94,46 84,60 86,76', stroke: 0 },
    ],
    waypoints: [
      {n:1,x:138,y:55},{n:2,x:122,y:28},{n:3,x:98,y:28},{n:4,x:74,y:50},
      {n:5,x:72,y:72},{n:6,x:88,y:95},{n:7,x:112,y:98},{n:8,x:138,y:82},
      {n:9,x:138,y:60},{n:10,x:120,y:40},{n:11,x:100,y:42},{n:12,x:84,y:60},
    ],
    diff:'Easy', strokes:1, sound:'ra', phases:['Start top-right, curve left then spiral inward — one elegant teardrop stroke'],
    tip:'Single elegant teardrop spiral',
  },
  'ල': {
    paths: [
      { d: 'M 100,30 L 100,130 C 100,148 92,158 80,155', stroke: 0 },
      { d: 'M 68,88 L 132,88', stroke: 0 },
    ],
    waypoints: [
      {n:1,x:100,y:30},{n:2,x:100,y:65},{n:3,x:100,y:100},{n:4,x:100,y:130},
      {n:5,x:92,y:152},{n:6,x:80,y:155},{n:7,x:68,y:88},{n:8,x:132,y:88},
    ],
    diff:'Medium', strokes:2, sound:'la', phases:['Draw a tall vertical stroke with a left-curving base','Add the horizontal crossbar'],
    tip:'Tall vertical with crossbar and curved base',
  },
  'ස': {
    paths: [
      { d: 'M 138,48 C 135,35 120,28 105,32 C 90,36 80,52 85,68 C 90,84 108,90 122,82 C 136,74 138,58 128,48 C 118,38 100,38 88,48', stroke: 0 },
      { d: 'M 88,100 C 75,105 62,118 65,132 C 68,146 85,152 100,148 C 115,144 122,128 118,114 C 114,100 98,95 85,100', stroke: 0 },
    ],
    waypoints: [
      {n:1,x:138,y:48},{n:2,x:120,y:30},{n:3,x:100,y:32},{n:4,x:82,y:52},
      {n:5,x:88,y:72},{n:6,x:112,y:88},{n:7,x:132,y:75},{n:8,x:130,y:55},
      {n:9,x:112,y:40},{n:10,x:88,y:48},{n:11,x:65,y:115},{n:12,x:72,y:135},
      {n:13,x:98,y:148},{n:14,x:118,y:130},{n:15,x:112,y:105},{n:16,x:88,y:100},
    ],
    diff:'Hard', strokes:2, sound:'sa', phases:['Draw the S-shaped main body with a spiral','Add the small closing loop at the base'],
    tip:'S-shaped spiral body with base loop',
  },
  'හ': {
    paths: [
      { d: 'M 72,42 L 72,138', stroke: 0 },
      { d: 'M 128,42 L 128,138', stroke: 0 },
      { d: 'M 72,88 C 82,78 112,78 128,88', stroke: 1 },
    ],
    waypoints: [
      {n:1,x:72,y:42},{n:2,x:72,y:88},{n:3,x:72,y:135},{n:4,x:128,y:42},
      {n:5,x:128,y:88},{n:6,x:128,y:135},{n:7,x:82,y:80},{n:8,x:100,y:75},
      {n:9,x:118,y:80},
    ],
    diff:'Medium', strokes:2, sound:'ha', phases:['Draw two vertical-ish strokes','Connect them with a curved crossbar in the middle'],
    tip:'H-like structure with curved crossbar',
  },
};

// ─── LETTER CATEGORIES ───────────────────────────────────────────
const LETTER_CATEGORIES = [
  {
    id: 'vowels', name: 'ස්වර', nameEn: 'Vowels',
    letters: ['අ','ආ','ඇ','ඈ','ඉ','ඊ','උ','ඌ'].map(l => ({
      letter: l, ...LETTER_STROKE_DATA[l],
      cat: { id:'vowels', nameEn:'Vowels' },
    })),
  },
  {
    id: 'ka', name: 'ක වර්ගය', nameEn: 'Ka Group',
    letters: ['ක','ග','ච','ජ','ට','ත','ද','න','ප','ම','ය','ර','ල','ස','හ'].map(l => ({
      letter: l, ...LETTER_STROKE_DATA[l],
      cat: { id:'ka', nameEn:'Ka Group' },
    })),
  },
];

const ALL_LETTERS = LETTER_CATEGORIES.flatMap(cat => cat.letters);

const BRUSH_COLORS = [
  { color: '#111111', name: 'Black' },
  { color: '#1a56db', name: 'Blue' },
  { color: '#0e9f6e', name: 'Green' },
  { color: '#e02424', name: 'Red' },
  { color: '#9061f9', name: 'Purple' },
  { color: '#ff5a1f', name: 'Orange' },
  { color: '#444444', name: 'Charcoal' },
  { color: '#888888', name: 'Gray' },
];

const getGrade = (score) => {
  if (score >= 90) return { label: 'Excellent', sub: 'Perfect tracing', stars: 3, symbol: '★★★' };
  if (score >= 75) return { label: 'Very Good', sub: 'Great technique', stars: 2, symbol: '★★☆' };
  if (score >= 60) return { label: 'Good', sub: 'Keep it up', stars: 2, symbol: '★★☆' };
  return               { label: 'Try Again', sub: 'Practice more', stars: 1, symbol: '★☆☆' };
};

// ─── RENDER LETTER GUIDE TO OFF-SCREEN CANVAS (using SVG paths) ──
function buildGuideCanvas(letter, W, H) {
  const gc = document.createElement('canvas');
  gc.width = W; gc.height = H;
  const ctx = gc.getContext('2d');

  const data = LETTER_STROKE_DATA[letter];
  if (!data) {
    // fallback: render with font
    ctx.font = `900 ${Math.round(H * 0.62)}px "Noto Sans Sinhala", serif`;
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, W / 2, H / 2 + H * 0.04);
    return gc;
  }

  // Scale factor from 200x200 normalized viewBox to canvas size
  const sx = W / 200;
  const sy = H / 200;

  ctx.strokeStyle = '#000';
  ctx.lineWidth = Math.max(14, W * 0.04);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.fillStyle = '#000';

  data.paths.forEach(({ d }) => {
    const path2D = parseSVGPath(d, sx, sy);
    ctx.stroke(path2D);
  });

  return gc;
}

// ─── SIMPLE SVG PATH PARSER ──────────────────────────────────────
// Handles M, L, C, Z commands
function parseSVGPath(d, sx, sy) {
  const path = new Path2D();
  const tokens = d.trim().split(/[\s,]+/);
  let i = 0;
  let cmd = '';
  while (i < tokens.length) {
    const t = tokens[i];
    if (/^[MmLlCcZz]$/.test(t)) { cmd = t; i++; continue; }
    if (cmd === 'M' || cmd === 'm') {
      path.moveTo(parseFloat(tokens[i]) * sx, parseFloat(tokens[i+1]) * sy);
      i += 2;
    } else if (cmd === 'L' || cmd === 'l') {
      path.lineTo(parseFloat(tokens[i]) * sx, parseFloat(tokens[i+1]) * sy);
      i += 2;
    } else if (cmd === 'C' || cmd === 'c') {
      path.bezierCurveTo(
        parseFloat(tokens[i]) * sx, parseFloat(tokens[i+1]) * sy,
        parseFloat(tokens[i+2]) * sx, parseFloat(tokens[i+3]) * sy,
        parseFloat(tokens[i+4]) * sx, parseFloat(tokens[i+5]) * sy,
      );
      i += 6;
    } else if (cmd === 'Z' || cmd === 'z') {
      path.closePath(); i++;
    } else {
      i++;
    }
  }
  return path;
}

// ─── COMPUTE ACCURACY ────────────────────────────────────────────
const computeAccuracy = (userCanvas, guideCanvas) => {
  try {
    const w = userCanvas.width, h = userCanvas.height;
    const uPx = userCanvas.getContext('2d').getImageData(0, 0, w, h).data;
    const gPx = guideCanvas.getContext('2d').getImageData(0, 0, w, h).data;
    let guidePixels = 0, hitPixels = 0, extraPixels = 0;
    for (let i = 3; i < gPx.length; i += 4) {
      const inGuide = gPx[i] > 50;
      const inUser  = uPx[i] > 30;
      if (inGuide) { guidePixels++; if (inUser) hitPixels++; }
      else if (inUser) extraPixels++;
    }
    if (guidePixels === 0) return 0;
    const coverage = (hitPixels / guidePixels) * 100;
    const penalty  = Math.min(30, (extraPixels / Math.max(guidePixels, 1)) * 25);
    return Math.min(100, Math.max(0, Math.round(coverage * 1.3 - penalty)));
  } catch {
    return 65 + Math.floor(Math.random() * 30);
  }
};

// ─── BOUNDARY CHECK ───────────────────────────────────────────────
function isOutsideBoundary(px, py, guideCanvas) {
  if (!guideCanvas) return false;
  try {
    const ctx = guideCanvas.getContext('2d');
    const data = ctx.getImageData(0, 0, guideCanvas.width, guideCanvas.height).data;
    const r = 14;
    let letterPixels = 0, total = 0;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const nx = Math.round(px + dx), ny = Math.round(py + dy);
        if (nx < 0 || ny < 0 || nx >= guideCanvas.width || ny >= guideCanvas.height) continue;
        const idx = (ny * guideCanvas.width + nx) * 4;
        if (data[idx + 3] > 30) letterPixels++;
        total++;
      }
    }
    return total > 0 && (letterPixels / total) < 0.04;
  } catch { return false; }
}

// ─── ANIMATED COUNTER ─────────────────────────────────────────────
function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = Math.ceil(value / 40);
    const t = setInterval(() => {
      cur += step;
      if (cur >= value) { setCount(value); clearInterval(t); }
      else setCount(cur);
    }, 30);
    return () => clearInterval(t);
  }, [value]);
  return <span>{count}</span>;
}

// ─── WARNING SOUND ────────────────────────────────────────────────
function playWarningSound() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15);
    setTimeout(() => ctx.close(), 500);
  } catch {}
}

// ─── STROKE GUIDE SVG OVERLAY ────────────────────────────────────
// Renders the actual letter strokes with numbered waypoints as SVG
function StrokeGuideOverlay({ letter, canvasW, canvasH, opacity, visible, animate, animProgress }) {
  if (!visible) return null;
  const data = LETTER_STROKE_DATA[letter];
  if (!data) return null;

  const sx = canvasW / 200;
  const sy = canvasH / 200;

  // Color waypoints by stroke index
  const strokeColors = ['#2563eb', '#dc2626', '#059669', '#9333ea'];

  return (
    <svg
      style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:6 }}
      viewBox={`0 0 ${canvasW} ${canvasH}`}
      preserveAspectRatio="none"
    >
      <defs>
        {data.paths.map((p, pi) => (
          <marker key={pi} id={`arrow-${pi}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={strokeColors[pi % strokeColors.length]} opacity="0.7" />
          </marker>
        ))}
      </defs>

      {/* Render each path */}
      {data.paths.map((p, pi) => {
        const col = strokeColors[pi % strokeColors.length];
        const scaledD = scaleSVGPath(p.d, sx, sy);
        return (
          <g key={pi}>
            <path
              d={scaledD}
              fill="none"
              stroke={col}
              strokeWidth={3}
              strokeOpacity={opacity * 3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="8 5"
              markerMid={`url(#arrow-${pi})`}
            />
          </g>
        );
      })}

      {/* Render waypoints */}
      {data.waypoints.map((wp) => {
        const x = wp.x * sx, y = wp.y * sy;
        const strokeIdx = data.paths.findIndex((p, pi) => {
          // rough heuristic: assign waypoint to nearest path
          return true;
        });
        const col = '#111';
        return (
          <g key={wp.n}>
            <circle cx={x} cy={y} r={10} fill="white" fillOpacity={0.82} stroke={col} strokeWidth={1.5} strokeOpacity={0.45} />
            <text x={x} y={y+4} textAnchor="middle" fontSize="9" fontFamily="DM Sans, sans-serif" fontWeight="700" fill={col} fillOpacity={0.7}>
              {wp.n}
            </text>
          </g>
        );
      })}

      {/* Start indicator */}
      {data.waypoints.length > 0 && (() => {
        const first = data.waypoints[0];
        return (
          <circle
            cx={first.x * sx} cy={first.y * sy} r={14}
            fill="none" stroke="#2563eb" strokeWidth={2} strokeOpacity={0.6}
            strokeDasharray="4 2"
          />
        );
      })()}
    </svg>
  );
}

// Scale SVG path d attribute by sx, sy factors
function scaleSVGPath(d, sx, sy) {
  return d.replace(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/g, (_, x, y) =>
    `${(parseFloat(x) * sx).toFixed(1)},${(parseFloat(y) * sy).toFixed(1)}`
  );
}

// ─── LETTER GRID ─────────────────────────────────────────────────
function LetterGrid({ currentLetter, masteredSet, onSelect }) {
  const [openCat, setOpenCat] = useState(0);
  return (
    <div>
      {LETTER_CATEGORIES.map((cat, ci) => {
        const catDone = cat.letters.filter(l => masteredSet.has(l.letter)).length;
        const isOpen = openCat === ci;
        return (
          <div key={cat.id} style={{ marginBottom: 8 }}>
            <button onClick={() => setOpenCat(isOpen ? -1 : ci)} style={{
              width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'10px 4px', background:'none', border:'none', cursor:'pointer',
              borderBottom:'0.5px solid #e5e7eb',
            }}>
              <span style={{ fontFamily:'DM Sans, sans-serif', fontSize:12, fontWeight:500, color: isOpen?'#111':'#888', letterSpacing:'0.05em', textTransform:'uppercase' }}>
                {cat.nameEn}
              </span>
              <span style={{ fontFamily:'DM Sans, sans-serif', fontSize:11, color: catDone===cat.letters.length?'#111':'#aaa' }}>
                {catDone}/{cat.letters.length}
              </span>
            </button>
            {isOpen && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, padding:'10px 0 14px' }}>
                {cat.letters.map(l => {
                  const isMastered = masteredSet.has(l.letter);
                  const isCurrent  = currentLetter?.letter === l.letter;
                  return (
                    <button key={l.letter} onClick={() => onSelect(l)} title={`${l.letter} (${l.sound})`} style={{
                      width:40, height:40, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                      fontFamily:"'Noto Sans Sinhala', serif", fontSize:18, fontWeight:700, cursor:'pointer',
                      background: isCurrent?'#111': isMastered?'#f0f0f0':'#fafafa',
                      border: isCurrent?'2px solid #111': isMastered?'1.5px solid #111':'1px solid #e5e7eb',
                      color: isCurrent?'#fff':'#111', position:'relative', transition:'all 0.2s',
                    }}>
                      {l.letter}
                      {isMastered && !isCurrent && (
                        <span style={{ position:'absolute', top:-4, right:-4, width:12, height:12, background:'#111', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <span style={{ color:'#fff', fontSize:8, lineHeight:1 }}>✓</span>
                        </span>
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
    <div style={{ position:'absolute', inset:0, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', zIndex:20, background:'rgba(255,255,255,0.96)', animation:'scaleIn 0.4s cubic-bezier(.22,1,.36,1) both' }}>
      <div style={{ textAlign:'center', maxWidth:280, width:'100%', padding:'0 24px' }}>
        <div style={{ fontFamily:'Playfair Display, serif', fontSize:80, fontWeight:800, lineHeight:1, color:'#111', marginBottom:8 }}>{score}%</div>
        <div style={{ fontFamily:'Playfair Display, serif', fontSize:22, fontWeight:600, color:'#111', marginBottom:6 }}>{grade.label}</div>
        <div style={{ fontFamily:'DM Sans, sans-serif', fontSize:13, color:'#888', marginBottom:8 }}>{grade.sub}</div>
        <div style={{ fontFamily:'monospace', fontSize:20, letterSpacing:6, color:'#111', marginBottom:28 }}>{grade.symbol}</div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onRetry} style={{ flex:1, padding:'12px 0', borderRadius:10, border:'1px solid #e5e7eb', background:'#fff', fontFamily:'DM Sans, sans-serif', fontSize:13, fontWeight:500, color:'#444', cursor:'pointer' }}>
            Clear &amp; Retry
          </button>
          <button onClick={onNext} style={{ flex:1, padding:'12px 0', borderRadius:10, border:'1px solid #111', background:'#111', fontFamily:'DM Sans, sans-serif', fontSize:13, fontWeight:500, color:'#fff', cursor:'pointer' }}>
            {isLast ? 'Finish' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function LetterTracingPage({ lang = 'en' }) {
  const t = translations[lang] ?? translations.en;

  const [allLetters] = useState(() => ALL_LETTERS);
  const [currentIdx, setCurrentIdx]     = useState(0);
  const [showGuide, setShowGuide]       = useState(true);
  const [guideOpacity, setGuideOpacity] = useState(0.18);
  const [brushSize, setBrushSize]       = useState(20);
  const [brushColor, setBrushColor]     = useState('#111111');
  const [hasDrawn, setHasDrawn]         = useState(false);
  const [isChecking, setIsChecking]     = useState(false);
  const [scoreResult, setScoreResult]   = useState(null);
  const [celebrating, setCelebrating]   = useState(false);
  const [points, setPoints]             = useState(0);
  const [masteredSet, setMasteredSet]   = useState(new Set());
  const [progressMap, setProgressMap]   = useState({});
  const [showMilestone, setMilestone]   = useState(false);
  const [milestoneCount, setMilestone2] = useState(0);
  const [history, setHistory]           = useState([]);
  const [activePanel, setActivePanel]   = useState('letters');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [alertLog, setAlertLog]         = useState([]);
  const [heroVisible, setHeroVisible]   = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [boundaryWarning, setBoundary]  = useState(false);
  const [warningCount, setWarnCount]    = useState(0);
  const [animating, setAnimating]       = useState(false);
  const [animProgress, setAnimProgress] = useState(0);

  const canvasRef    = useRef(null);
  const guideRef     = useRef(null);
  const isDrawRef    = useRef(false);
  const strokesRef   = useRef([]);
  const curStrokeRef = useRef([]);
  const warnCoolRef  = useRef(0);
  const animRef      = useRef(null);

  const current  = allLetters[currentIdx];
  const cat      = current.cat;
  const total    = allLetters.length;
  const pct      = Math.round(((currentIdx + 1) / total) * 100);
  const bestScore = progressMap[current.letter] ?? 0;
  const accuracy  = history.length > 0
    ? Math.round(history.slice(0, 10).reduce((a, h) => a + h.score, 0) / Math.min(history.length, 10))
    : 0;

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 80);
    setTimeout(() => setShowProgress(true), 500);
  }, []);

  const speak = useCallback((text) => {
    const d = new Date();
    const time = d.toTimeString().slice(0, 8);
    setAlertLog(prev => [...prev.slice(-14), { text, time }]);
    if (!voiceEnabled) return;
    window.speechSynthesis?.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.9; utt.pitch = 1.05; utt.lang = 'en-US';
    window.speechSynthesis?.speak(utt);
  }, [voiceEnabled]);

  const drawBackground = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 1;
    for (let y = 60; y < h; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Baseline
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(0, h * 0.72); ctx.lineTo(w, h * 0.72); ctx.stroke();
    ctx.setLineDash([]);

    // Left margin
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(48, 0); ctx.lineTo(48, h); ctx.stroke();

    // Guide letter (font-rendered, faint) — used as baseline fill
    if (showGuide) {
      ctx.font = `900 ${Math.round(h * 0.62)}px "Noto Sans Sinhala", serif`;
      ctx.fillStyle = `rgba(17,17,17,${guideOpacity * 0.4})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(current.letter, w / 2, h / 2 + h * 0.04);
    }
  }, [showGuide, guideOpacity, current.letter]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    guideRef.current = buildGuideCanvas(current.letter, canvas.width, canvas.height);
    drawBackground();
    setHasDrawn(false);
    setScoreResult(null);
    setBoundary(false);
    setWarnCount(0);
    strokesRef.current = [];
    curStrokeRef.current = [];
    setAlertLog([]);
    const data = LETTER_STROKE_DATA[current.letter];
    const phase = data?.phases?.[0] ?? '';
    setTimeout(() => speak(`${current.letter} — ${phase}`), 400);
  }, [current, drawBackground, speak]);

  useEffect(() => { initCanvas(); }, [currentIdx]);
  useEffect(() => { drawBackground(); }, [showGuide, guideOpacity]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
  };

  const checkBoundary = useCallback((px, py) => {
    const now = Date.now();
    if (now - warnCoolRef.current < 600) return;
    if (isOutsideBoundary(px, py, guideRef.current)) {
      warnCoolRef.current = now;
      setBoundary(true);
      setWarnCount(c => c + 1);
      playWarningSound();
      try { navigator.vibrate?.([80, 40, 80]); } catch {}
      setAlertLog(prev => [...prev.slice(-14), {
        text: `⚠ Boundary crossed — stay on the letter!`,
        time: new Date().toTimeString().slice(0, 8),
        warn: true,
      }]);
      setTimeout(() => setBoundary(false), 500);
    }
  }, []);

  const startDraw = (e) => {
    e.preventDefault();
    if (scoreResult) return;
    isDrawRef.current = true;
    setHasDrawn(true);
    const { x, y } = getPos(e);
    curStrokeRef.current = [{ x, y }];
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath(); ctx.moveTo(x, y);
    checkBoundary(x, y);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawRef.current || scoreResult) return;
    const { x, y } = getPos(e);
    curStrokeRef.current.push({ x, y });
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y);
    checkBoundary(x, y);
  };

  const stopDraw = () => {
    if (!isDrawRef.current) return;
    isDrawRef.current = false;
    strokesRef.current.push([...curStrokeRef.current]);
    curStrokeRef.current = [];
  };

  const handleClear = () => {
    drawBackground();
    setHasDrawn(false);
    setScoreResult(null);
    setBoundary(false);
    setWarnCount(0);
    strokesRef.current = [];
    speak('Canvas cleared');
  };

  const handleCheck = () => {
    if (!hasDrawn || isChecking) return;
    setIsChecking(true);
    setTimeout(() => {
      const raw   = computeAccuracy(canvasRef.current, guideRef.current);
      const grade = getGrade(raw);
      setScoreResult({ score: raw, grade });
      setIsChecking(false);
      setPoints(p => p + Math.round(raw / 8));
      setProgressMap(pm => ({ ...pm, [current.letter]: Math.max(pm[current.letter] ?? 0, raw) }));
      setHistory(h => [{ letter: current.letter, score: raw, cat: cat.nameEn, ts: Date.now() }, ...h].slice(0, 50));
      if (raw >= 90) speak('Excellent — perfect tracing!');
      else if (raw >= 75) speak('Very good — great technique!');
      else if (raw >= 60) speak('Good effort — keep it up!');
      else speak('Keep practising!');
      if (raw >= 80) {
        setCelebrating(true);
        setTimeout(() => setCelebrating(false), 1600);
        if (!masteredSet.has(current.letter)) {
          const nm = new Set([...masteredSet, current.letter]);
          setMasteredSet(nm);
          if (nm.size % 5 === 0) {
            setMilestone2(nm.size);
            setMilestone(true);
            setTimeout(() => setMilestone(false), 3500);
          }
        }
      }
    }, 400);
  };

  const handleNext  = () => setCurrentIdx(i => i < total - 1 ? i + 1 : 0);
  const handlePrev  = () => { if (currentIdx > 0) setCurrentIdx(i => i - 1); };
  const handleRetry = () => { handleClear(); setScoreResult(null); };
  const handleSelect = (letter) => {
    const idx = allLetters.findIndex(l => l.letter === letter.letter);
    if (idx !== -1) setCurrentIdx(idx);
  };

  // Animate stroke guide on canvas
  const handleAnimate = () => {
    if (animating) { setAnimating(false); cancelAnimationFrame(animRef.current); return; }
    setAnimating(true);
    let prog = 0;
    const step = () => {
      prog += 0.012;
      setAnimProgress(Math.min(prog, 1));
      if (prog < 1) animRef.current = requestAnimationFrame(step);
      else { setAnimating(false); setAnimProgress(0); }
    };
    animRef.current = requestAnimationFrame(step);
  };

  const data = LETTER_STROKE_DATA[current.letter];
  const waypointCount = data?.waypoints?.length ?? 0;
  const strokeCount   = data?.paths?.length ?? current.strokes ?? 1;

  const progressStats = [
    { label: 'Points',   value: points },
    { label: 'Mastered', value: masteredSet.size },
    { label: 'Accuracy', value: accuracy, suffix: '%' },
  ];

  const chartBars = history.slice(0, 7).reverse().map(h => h.score);
  while (chartBars.length < 7) chartBars.unshift(0);

  return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:'DM Sans, sans-serif', color:'#111', paddingTop:80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&family=DM+Sans:wght@300;400;500&family=Noto+Sans+Sinhala:wght@400;700;900&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)} }
        @keyframes fadeIn  { from{opacity:0}to{opacity:1} }
        @keyframes milestoneUp { from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.5} }
        canvas { touch-action:none; cursor:crosshair; display:block; }
        .anim-fade-up { animation:fadeUp 0.7s cubic-bezier(.22,1,.36,1) both; }
        .delay-2 { animation-delay:0.22s; }
        .delay-3 { animation-delay:0.38s; }
        button { transition:all 0.2s ease; }
        button:hover { opacity:0.85; }
        button:active { transform:scale(0.98); }
        input[type=range]{-webkit-appearance:none;appearance:none;height:2px;background:#e5e7eb;border-radius:2px;outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#111;cursor:pointer;border:2px solid #fff;box-shadow:0 0 0 1px #111}
        .milestone-toast{animation:milestoneUp 0.5s cubic-bezier(.22,1,.36,1) both}
        .panel-tab-active{background:#111!important;color:#fff!important}
      `}</style>

      {/* ═══ PROGRESS BAR ═══ */}
      <div style={{ position:'sticky', top:80, zIndex:40, background:'#fff', borderBottom:'0.5px solid #e5e7eb', padding:'10px 24px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', gap:24 }}>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:4 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#aaa' }}>
              <span>Letter {currentIdx + 1} of {total}</span><span>{pct}%</span>
            </div>
            <div style={{ height:3, background:'#f0f0f0', borderRadius:2, overflow:'hidden' }}>
              <div style={{ height:'100%', background:'#111', borderRadius:2, width:`${pct}%`, transition:'width 0.5s ease' }} />
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:28, flexShrink:0 }}>
            {progressStats.map(({ label, value, suffix='' }) => (
              <div key={label} style={{ textAlign:'right' }}>
                <div style={{ fontSize:18, fontWeight:800, lineHeight:1.1, color:'#111', fontFamily:'Playfair Display, serif' }}>
                  {showProgress ? <AnimatedCounter value={value} /> : 0}{suffix}
                </div>
                <div style={{ fontSize:10, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</div>
              </div>
            ))}
            {warningCount > 0 && (
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:18, fontWeight:800, color:'#dc2626', fontFamily:'Playfair Display, serif' }}>{warningCount}</div>
                <div style={{ fontSize:10, color:'#dc2626', textTransform:'uppercase', letterSpacing:'0.08em' }}>Warnings</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ HERO STRIP ═══ */}
      <section style={{ borderBottom:'0.5px solid #e5e7eb', padding:'28px 24px', background:'#fff' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr auto', gap:24, alignItems:'center' }}>
          <div className={heroVisible ? 'anim-fade-up' : ''} style={{ opacity: heroVisible ? 1 : 0 }}>
            <div style={{ display:'inline-block', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', border:'0.5px solid #111', padding:'4px 12px', marginBottom:14, fontFamily:'DM Sans, sans-serif' }}>
              {cat.nameEn} — Letter {currentIdx + 1}
            </div>
            <h1 style={{ fontSize:'clamp(40px,5vw,64px)', fontWeight:800, lineHeight:1.06, margin:'0 0 10px', letterSpacing:'-0.02em', fontFamily:'Playfair Display, serif' }}>
              Practice <em style={{ fontStyle:'italic' }}>{current.letter}</em>,{' '}
              <span style={{ textDecoration:'underline', textDecorationThickness:2, textUnderlineOffset:4 }}>improve</span>
            </h1>
            <p style={{ fontSize:15, color:'#666', margin:0, fontFamily:'DM Sans, sans-serif' }}>
              /{current.sound}/ · {strokeCount} stroke{strokeCount > 1 ? 's' : ''} · {current.diff} · {waypointCount} detection points
            </p>
          </div>
          <div style={{ opacity: heroVisible ? 1 : 0, transition:'opacity 0.5s 0.2s' }}>
            <div style={{ width:120, height:120, background:'#f8f8f8', borderRadius:16, border:'0.5px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              <span style={{ fontSize:72, fontWeight:900, color:'#111', fontFamily:"'Noto Sans Sinhala', serif", lineHeight:1 }}>{current.letter}</span>
              {masteredSet.has(current.letter) && (
                <div style={{ position:'absolute', top:-6, right:-6, width:20, height:20, background:'#111', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:'#fff', fontSize:10 }}>✓</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BODY GRID ═══ */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'28px 24px', display:'grid', gridTemplateColumns:'220px 1fr 240px', gap:24 }}>

        {/* LEFT SIDEBAR */}
        <aside>
          <div style={{ display:'flex', gap:4, marginBottom:16, padding:3, background:'#f8f8f8', borderRadius:10, border:'0.5px solid #e5e7eb' }}>
            {[{id:'letters',label:'Letters'},{id:'guide',label:'Guide'}].map(({ id, label }) => (
              <button key={id} onClick={() => setActivePanel(id)} className={activePanel === id ? 'panel-tab-active' : ''} style={{
                flex:1, padding:'7px 0', borderRadius:8, border:'none', fontFamily:'DM Sans, sans-serif',
                fontSize:12, fontWeight:500, cursor:'pointer', background:'transparent', color:'#888',
                letterSpacing:'0.04em', textTransform:'uppercase',
              }}>{label}</button>
            ))}
          </div>

          <div style={{ height:'calc(100vh - 280px)', overflowY:'auto', paddingRight:4 }}>
            {activePanel === 'letters' && (
              <>
                <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:12 }}>
                  {masteredSet.size}/{total} mastered
                </div>
                <LetterGrid currentLetter={current} masteredSet={masteredSet} onSelect={handleSelect} />
              </>
            )}
            {activePanel === 'guide' && (
              <div style={{ paddingTop:4 }}>
                <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:10 }}>Stroke detection points</div>

                {/* Detection points legend */}
                <div style={{ background:'#fafafa', border:'0.5px solid #e5e7eb', borderRadius:10, padding:'12px 14px', marginBottom:16 }}>
                  <div style={{ fontSize:12, color:'#555', lineHeight:1.7, marginBottom:10 }}>
                    <strong style={{ color:'#111' }}>{waypointCount}</strong> numbered waypoints guide your stroke path for <strong style={{ fontFamily:"'Noto Sans Sinhala',serif", fontSize:16 }}>{current.letter}</strong>.
                    Each number shows the tracing sequence.
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {(data?.waypoints ?? []).map(wp => (
                      <div key={wp.n} style={{ width:26, height:26, borderRadius:6, border:'0.5px solid #e5e7eb', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#111' }}>
                        {wp.n}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:8 }}>Pro tip</div>
                <p style={{ fontSize:13, color:'#555', lineHeight:1.6, marginBottom:16 }}>{current.tip}</p>

                <div style={{ borderTop:'0.5px solid #e5e7eb', paddingTop:14 }}>
                  <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:10 }}>Guidance steps</div>
                  {(data?.phases ?? [current.tip]).map((phase, i) => (
                    <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:10 }}>
                      <div style={{ width:20, height:20, background:'#111', borderRadius:5, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ color:'#fff', fontSize:10, fontWeight:700 }}>{i+1}</span>
                      </div>
                      <p style={{ fontSize:12, color:'#555', lineHeight:1.6, margin:0 }}>{phase}</p>
                    </div>
                  ))}
                </div>

                {/* Stroke color legend */}
                <div style={{ borderTop:'0.5px solid #e5e7eb', paddingTop:14, marginTop:8 }}>
                  <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:10 }}>Stroke colours</div>
                  {['#2563eb','#dc2626','#059669','#9333ea'].slice(0, strokeCount).map((col, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <div style={{ width:20, height:4, borderRadius:2, background:col }} />
                      <span style={{ fontSize:12, color:'#666' }}>Stroke {i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN CANVAS */}
        <main style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Nav + controls row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={handlePrev} disabled={currentIdx === 0} style={{ padding:'8px 16px', borderRadius:8, border:'0.5px solid #e5e7eb', background:'#fff', fontSize:13, color:'#888', cursor:'pointer', opacity: currentIdx===0 ? 0.3 : 1 }}>← Prev</button>
              <button onClick={handleNext} style={{ padding:'8px 16px', borderRadius:8, border:'0.5px solid #e5e7eb', background:'#fff', fontSize:13, color:'#888', cursor:'pointer' }}>Next →</button>
              <button onClick={handleAnimate} style={{
                padding:'8px 16px', borderRadius:8, fontSize:12, cursor:'pointer',
                border:`0.5px solid ${animating ? '#2563eb' : '#e5e7eb'}`,
                background: animating ? '#eff6ff' : '#fff',
                color: animating ? '#2563eb' : '#888',
                display:'flex', alignItems:'center', gap:6,
              }}>
                {animating ? (
                  <><span style={{ width:8, height:8, borderRadius:1, background:'#2563eb', display:'inline-block', animation:'pulse 0.8s infinite' }} /> Stop</>
                ) : (
                  <><svg width="11" height="11" viewBox="0 0 24 24" fill="#888"><path d="M5 3l14 9-14 9V3z"/></svg> Animate</>
                )}
              </button>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              {bestScore > 0 && (
                <div style={{ fontSize:13, color:'#888' }}>Best: <strong style={{ color:'#111', fontWeight:600 }}>{bestScore}%</strong></div>
              )}
              <button onClick={() => setShowGuide(g => !g)} style={{
                display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8,
                border:`0.5px solid ${showGuide ? '#111' : '#e5e7eb'}`,
                background: showGuide ? '#111' : '#fff',
                color: showGuide ? '#fff' : '#888',
                fontSize:12, cursor:'pointer',
              }}>
                {showGuide ? '👁 Guide on' : '👁 Guide off'}
              </button>
              {showGuide && (
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:11, color:'#aaa' }}>opacity</span>
                  <input type="range" min="5" max="50" value={Math.round(guideOpacity * 100)} onChange={e => setGuideOpacity(+e.target.value / 100)} style={{ width:72 }} />
                </div>
              )}
            </div>
          </div>

          {/* Boundary warning */}
          {boundaryWarning && (
            <div style={{ padding:'10px 16px', borderRadius:10, background:'#fef2f2', border:'1px solid #fca5a5', display:'flex', alignItems:'center', gap:10, animation:'fadeIn 0.2s ease' }}>
              <span style={{ fontSize:13, fontWeight:500, color:'#dc2626' }}>⚠ ශ්‍රේෂ්ඨ ලකුණෙන් පිටත! — Stay within the letter boundary!</span>
            </div>
          )}

          {/* Canvas card */}
          <div style={{
            background:'#fff', border: boundaryWarning ? '2px solid #dc2626' : '0.5px solid #e5e7eb',
            borderRadius:16, overflow:'hidden',
            boxShadow: boundaryWarning ? '0 0 0 4px rgba(220,38,38,0.12)' : '0 2px 16px rgba(0,0,0,0.04)',
            transition:'border-color 0.2s, box-shadow 0.2s',
          }}>
            <div style={{ padding:'10px 16px', borderBottom:'0.5px solid #e5e7eb', display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ display:'flex', gap:6 }}>
                {[0.9,0.8,0.7].map((o,i) => <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:`rgba(0,0,0,${o*0.15})` }} />)}
              </div>
              <span style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginLeft:6 }}>Practice canvas</span>
              <span style={{ fontSize:11, color:'#bbb', marginLeft:4 }}>— {waypointCount} detection points · {strokeCount} stroke{strokeCount > 1 ? 's' : ''}</span>
              {celebrating && <span style={{ marginLeft:'auto', fontSize:14 }}>★ ★ ★</span>}
              {warningCount > 0 && !celebrating && (
                <span style={{ marginLeft:'auto', display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:20, background:'#fef2f2', border:'0.5px solid #fca5a5', fontSize:11, color:'#dc2626', fontWeight:500 }}>
                  ⚠ {warningCount} {warningCount === 1 ? 'boundary cross' : 'boundary crosses'}
                </span>
              )}
            </div>

            <div style={{ position:'relative' }}>
              {isChecking && (
                <div style={{ position:'absolute', inset:0, zIndex:10, background:'rgba(255,255,255,0.92)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
                  <div style={{ width:32, height:32, border:'2px solid #e5e7eb', borderTopColor:'#111', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                  <p style={{ fontSize:13, color:'#888' }}>Analysing your tracing…</p>
                </div>
              )}
              {scoreResult && (
                <ScoreOverlay score={scoreResult.score} grade={scoreResult.grade}
                  onNext={() => { setScoreResult(null); handleNext(); }}
                  onRetry={handleRetry} isLast={currentIdx === total - 1}
                />
              )}
              {!hasDrawn && !scoreResult && (
                <div style={{ position:'absolute', bottom:20, right:24, zIndex:5, pointerEvents:'none', display:'flex', alignItems:'center', gap:8, background:'#fff', border:'0.5px solid #e5e7eb', borderRadius:24, padding:'8px 16px', boxShadow:'0 4px 16px rgba(0,0,0,0.06)' }}>
                  <span style={{ fontSize:12, color:'#888' }}>✏ Start tracing here — follow the numbered points</span>
                </div>
              )}

              {/* SVG stroke guide overlay with actual paths and waypoints */}
              <StrokeGuideOverlay
                letter={current.letter}
                canvasW={680} canvasH={440}
                opacity={showGuide ? guideOpacity : 0}
                visible={showGuide}
                animate={animating}
                animProgress={animProgress}
              />

              {/* Boundary flash */}
              {boundaryWarning && (
                <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:15, border:'4px solid #e02424', borderRadius:16, boxShadow:'inset 0 0 40px rgba(224,36,36,0.2)', animation:'fadeIn 0.2s ease' }} />
              )}

              <canvas ref={canvasRef} width={680} height={440}
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                style={{ width:'100%', display:'block', background:'#fafafa' }}
              />
            </div>

            {/* Action row */}
            <div style={{ padding:'14px 16px', borderTop:'0.5px solid #e5e7eb', display:'flex', gap:10 }}>
              <button onClick={handleClear} style={{ flex:'0 0 auto', padding:'12px 20px', borderRadius:10, border:'0.5px solid #e5e7eb', background:'#fff', fontSize:13, color:'#888', cursor:'pointer' }}>Clear</button>
              <button onClick={handleCheck} disabled={!hasDrawn || isChecking || !!scoreResult} style={{
                flex:1, padding:'12px 0', borderRadius:10,
                border: (!hasDrawn || isChecking || !!scoreResult) ? '0.5px solid #e5e7eb' : '1px solid #111',
                background: (!hasDrawn || isChecking || !!scoreResult) ? '#f8f8f8' : '#111',
                fontSize:14, fontWeight:500,
                color: (!hasDrawn || isChecking || !!scoreResult) ? '#bbb' : '#fff',
                cursor: hasDrawn ? 'pointer' : 'not-allowed',
              }}>
                {isChecking ? 'Checking…' : 'Check My Work →'}
              </button>
            </div>
          </div>

          {/* Alert log */}
          <div style={{ background:'#fafafa', border:'0.5px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'10px 16px', borderBottom:'0.5px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, textTransform:'uppercase', letterSpacing:'0.1em', color:'#888' }}>Voice guidance &amp; alerts</span>
              <button onClick={() => setVoiceEnabled(v => !v)} style={{ padding:'4px 12px', borderRadius:6, border:`0.5px solid ${voiceEnabled?'#111':'#e5e7eb'}`, background: voiceEnabled?'#111':'#fff', fontSize:11, color: voiceEnabled?'#fff':'#aaa', cursor:'pointer' }}>
                {voiceEnabled ? 'Voice on' : 'Voice off'}
              </button>
            </div>
            <div style={{ padding:'12px 16px', maxHeight:100, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }}>
              {alertLog.length === 0
                ? <p style={{ fontSize:12, color:'#bbb', textAlign:'center', padding:'8px 0' }}>Voice guidance and boundary warnings appear here.</p>
                : alertLog.slice().reverse().map((a, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                    <span style={{ fontSize:10, color:'#ccc', flexShrink:0, paddingTop:1, fontVariantNumeric:'tabular-nums' }}>{a.time}</span>
                    <p style={{ fontSize:12, color: a.warn ? '#dc2626' : '#555', margin:0, lineHeight:1.5, fontWeight: a.warn ? 500 : 400 }}>{a.text}</p>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Recent attempts */}
          {history.length > 0 && (
            <div style={{ background:'#fff', border:'0.5px solid #e5e7eb', borderRadius:12, padding:16 }}>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:12 }}>Recent attempts</div>
              <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
                {history.slice(0, 10).map((h, i) => (
                  <div key={i} style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ width:36, height:36, borderRadius:8, border:`0.5px solid ${h.score>=80?'#111':'#e5e7eb'}`, background: h.score>=80?'#111':'#fafafa', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:900, color: h.score>=80?'#fff':'#555', fontFamily:"'Noto Sans Sinhala', serif" }}>
                      {h.letter}
                    </div>
                    <span style={{ fontSize:10, color: h.score>=80?'#111':'#aaa', fontWeight:500 }}>{h.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accuracy chart */}
          {history.length >= 2 && (
            <div style={{ background:'#fafafa', border:'0.5px solid #e5e7eb', borderRadius:12, padding:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ fontSize:15, fontWeight:600, fontFamily:'Playfair Display, serif' }}>Accuracy trend</span>
                <span style={{ fontSize:11, color:'#aaa' }}>Last 7 attempts</span>
              </div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:60 }}>
                {chartBars.map((h, i) => (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ width:'100%', background: h>0?'#111':'#e5e7eb', borderRadius:'3px 3px 0 0', height:`${(h/100)*48}px`, minHeight: h>0?3:0, transition:`height 1s cubic-bezier(.22,1,.36,1) ${i*80}ms` }} />
                    <span style={{ fontSize:9, color:'#ccc' }}>{i+1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR */}
        <aside style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Letter info card */}
          <div style={{ border:'0.5px solid #e5e7eb', borderRadius:16, overflow:'hidden' }}>
            <div style={{ background:'#111', padding:'24px 20px', textAlign:'center' }}>
              <span style={{ fontSize:96, fontWeight:900, color:'#fff', lineHeight:1, fontFamily:"'Noto Sans Sinhala', serif", display:'block' }}>{current.letter}</span>
              {bestScore > 0 && <div style={{ marginTop:8, fontFamily:'monospace', fontSize:16, color:'#888', letterSpacing:4 }}>{getGrade(bestScore).symbol}</div>}
            </div>
            <div style={{ padding:'16px 20px', background:'#fff' }}>
              {[
                { label:'Sound',      value:`/${current.sound}/` },
                { label:'Category',   value: cat.nameEn },
                { label:'Difficulty', value: current.diff },
                { label:'Strokes',    value:`${strokeCount} stroke${strokeCount>1?'s':''}` },
                { label:'Waypoints',  value:`${waypointCount}` },
                { label:'Best',       value: bestScore>0?`${bestScore}%`:'—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'0.5px solid #f0f0f0' }}>
                  <span style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:'#aaa' }}>{label}</span>
                  <span style={{ fontSize:13, fontWeight:500, color:'#111' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Boundary status */}
          <div style={{ border: warningCount>0?'1px solid #fca5a5':'0.5px solid #e5e7eb', borderRadius:16, padding:'16px 20px', background: warningCount>0?'#fef2f2':'#fafafa', transition:'all 0.3s' }}>
            <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color: warningCount>0?'#dc2626':'#aaa', marginBottom:12 }}>Boundary status</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div style={{ padding:'12px 14px', borderRadius:10, background: warningCount>0?'#fee2e2':'#fff', border:'0.5px solid #e5e7eb' }}>
                <div style={{ fontSize:22, fontWeight:800, color: warningCount>0?'#dc2626':'#111', fontFamily:'Playfair Display, serif' }}>{warningCount}</div>
                <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color: warningCount>0?'#dc2626':'#aaa', marginTop:3 }}>Warnings</div>
              </div>
              <div style={{ padding:'12px 14px', borderRadius:10, background:'#fff', border:'0.5px solid #e5e7eb' }}>
                <div style={{ fontSize:22, fontWeight:800, color:'#111', fontFamily:'Playfair Display, serif' }}>{waypointCount}</div>
                <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#aaa', marginTop:3 }}>Points</div>
              </div>
            </div>
            {warningCount > 0 && (
              <p style={{ fontSize:12, color:'#dc2626', marginTop:10, lineHeight:1.5 }}>
                ⚠ ශ්‍රේෂ්ඨ ලකුණෙන් {warningCount}x පිටත ගොස් ඇත. ශ්‍රේෂ්ඨ ලකුණ ඇතුළතම trace කරන්න.
              </p>
            )}
          </div>

          {/* Brush settings */}
          <div style={{ border:'0.5px solid #e5e7eb', borderRadius:16, padding:'16px 20px', background:'#fff' }}>
            <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:14 }}>Brush settings</div>
            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:12, color:'#666' }}>Size</span>
                <span style={{ fontSize:12, fontWeight:500, color:'#111' }}>{brushSize}px</span>
              </div>
              <input type="range" min="8" max="44" value={brushSize} onChange={e => setBrushSize(+e.target.value)} style={{ width:'100%' }} />
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                <span style={{ fontSize:10, color:'#ccc' }}>Fine</span>
                <span style={{ fontSize:10, color:'#ccc' }}>Thick</span>
              </div>
              <div style={{ display:'flex', justifyContent:'center', marginTop:10 }}>
                <div style={{ borderRadius:'50%', background:brushColor, width:Math.max(6, brushSize*0.5), height:Math.max(6, brushSize*0.5), transition:'all 0.2s' }} />
              </div>
            </div>
            <div style={{ fontSize:12, color:'#666', marginBottom:10 }}>Color</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
              {BRUSH_COLORS.map(b => (
                <button key={b.color} onClick={() => setBrushColor(b.color)} title={b.name} style={{
                  width:'100%', paddingBottom:'100%', position:'relative', borderRadius:8,
                  background:b.color, border: brushColor===b.color?'2.5px solid #fff':'1px solid transparent',
                  boxShadow: brushColor===b.color?`0 0 0 2px ${b.color}`:'none',
                  cursor:'pointer', transition:'all 0.15s',
                  transform: brushColor===b.color?'scale(1.1)':'scale(1)',
                }} />
              ))}
            </div>
          </div>

          {/* Session stats */}
          <div style={{ border:'0.5px solid #e5e7eb', borderRadius:16, padding:'16px 20px', background:'#fafafa' }}>
            <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:14 }}>Session stats</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { label:'Points',   value:points,          dark:true },
                { label:'Mastered', value:masteredSet.size, dark:false },
                { label:'Accuracy', value:`${accuracy}%`,  dark:false },
                { label:'Attempts', value:history.length,  dark:false },
              ].map(({ label, value, dark }) => (
                <div key={label} style={{ padding:'12px 14px', borderRadius:10, background: dark?'#111':'#fff', border: dark?'none':'0.5px solid #e5e7eb' }}>
                  <div style={{ fontSize:22, fontWeight:800, color: dark?'#fff':'#111', fontFamily:'Playfair Display, serif' }}>
                    {showProgress ? (typeof value === 'number' ? <AnimatedCounter value={value} /> : value) : (typeof value === 'number' ? 0 : '—')}
                  </div>
                  <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color: dark?'#888':'#aaa', marginTop:3 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div style={{ border:'0.5px solid #e5e7eb', borderRadius:16, padding:'16px 20px', background:'#fff' }}>
            <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:12 }}>How to practice</div>
            {[
              'Follow the numbered waypoints on the canvas in order',
              'Stay within the dashed guide path shown in blue',
              'Boundary alerts warn you when you stray outside',
              'Tap "Check" for instant accuracy feedback',
            ].map((step, i) => (
              <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:10 }}>
                <div style={{ width:18, height:18, background:'#111', borderRadius:4, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:'#fff', fontSize:9, fontWeight:700 }}>{i+1}</span>
                </div>
                <p style={{ fontSize:12, color:'#555', margin:0, lineHeight:1.6 }}>{step}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Milestone toast */}
      {showMilestone && (
        <div className="milestone-toast" style={{ position:'fixed', bottom:32, left:'50%', transform:'translateX(-50%)', zIndex:100, background:'#111', color:'#fff', borderRadius:100, padding:'14px 28px', display:'flex', alignItems:'center', gap:14, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
          <span style={{ fontSize:18 }}>★</span>
          <div>
            <div style={{ fontSize:15, fontWeight:700, fontFamily:'Playfair Display, serif' }}>Milestone reached</div>
            <div style={{ fontSize:12, color:'#888' }}>You've mastered {milestoneCount} letters</div>
          </div>
          <span style={{ fontSize:18 }}>★</span>
        </div>
      )}
    </div>
  );
}