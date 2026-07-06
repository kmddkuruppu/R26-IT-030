import { useState, useEffect, useCallback, useRef } from "react";
import {
  getGameLetters, createGameLetter, updateGameLetter, deleteGameLetter,
  getGameWords,   createGameWord,   updateGameWord,   deleteGameWord,
  getConnectSets, createConnectSet, updateConnectSet, deleteConnectSet,
} from "../services/apiService";

const TABS = ["Letters", "Words", "Line Connect"];

const CATEGORY_COLORS = [
  { name: "ස්වර (Vowels)",  color: "#e11d48" },
  { name: "ක වර්ගය",        color: "#7c3aed" },
  { name: "ච වර්ගය",        color: "#0891b2" },
  { name: "ට වර්ගය",        color: "#08b24c" },
  { name: "ත වර්ගය",        color: "#110688" },
  { name: "ප වර්ගය",        color: "#b45309" },
  { name: "අවර්ගීය",        color: "#be185d" },
];

const EMOJI_OPTIONS = [
  "👩","👨","🏠","🏫","🌸","🪨","⏰","🕳️","🪈","👁️",
  "👂","💧","🌳","⚡","🗺️","🥛","🐟","🐰","🍚","🌙",
  "🐘","🦁","🐦","🐓","🐇","🐬","🌺","🍎","📚","🎵",
];

// ═══════════════════════════════════════════════════════════════════
// FORM FIELD COMPONENTS — defined at module level (outside their tabs)
// so React doesn't recreate them on every keystroke/re-render, which
// was causing input fields to lose focus after every character typed.
// ═══════════════════════════════════════════════════════════════════
const LetterFormFields = ({ f, setF }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Letter *</div>
      <input className="sinhala" value={f.letter} onChange={e => setF(p => ({ ...p, letter: e.target.value }))} placeholder="අ" style={{ fontSize: 20 }} />
    </div>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Name *</div>
      <input className="sinhala" value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} placeholder="අ" style={{ fontSize: 18 }} />
    </div>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Sound *</div>
      <input value={f.sound} onChange={e => setF(p => ({ ...p, sound: e.target.value }))} placeholder="a" />
    </div>
    <div style={{ gridColumn: "span 2" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Category</div>
      <select value={f.categoryName} onChange={e => {
        const cat = CATEGORY_COLORS.find(c => c.name === e.target.value);
        setF(p => ({ ...p, categoryName: e.target.value, categoryColor: cat?.color ?? p.categoryColor }));
      }}>
        {CATEGORY_COLORS.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
      </select>
    </div>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Sort Order</div>
      <input type="number" value={f.sortOrder} onChange={e => setF(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} />
    </div>
  </div>
);

const WordFormFields = ({ f, setF, isEdit }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Word (Sinhala) *</div>
      <input className="sinhala" value={f.word} onChange={e => setF(p => ({ ...p, word: e.target.value }))} placeholder="අම්මා" style={{ fontSize: 18 }} />
    </div>
    {/* <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Meaning (English) *</div>
      <input value={f.meaning} onChange={e => setF(p => ({ ...p, meaning: e.target.value }))} placeholder="Mother" />
    </div> */}
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Syllables (comma-separated) *</div>
      <input className="sinhala" value={isEdit ? (f.syllablesStr ?? f.syllables?.join(",") ?? "") : f.syllablesStr}
        onChange={e => setF(p => ({ ...p, syllablesStr: e.target.value }))} placeholder="අ,ම්,මා" />
      <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>Separate each syllable with a comma</div>
    </div>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Emoji</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 0" }}>
        {EMOJI_OPTIONS.map(e => (
          <button key={e} onClick={() => setF(p => ({ ...p, emoji: e }))}
            style={{ fontSize: 20, background: f.emoji === e ? "#111" : "#f3f4f6", border: "none", borderRadius: 8, padding: "4px 6px", cursor: "pointer", lineHeight: 1 }}>
            {e}
          </button>
        ))}
      </div>
    </div>
  </div>
);

const blankPair = { leftText: "", rightText: "", leftMeaning: "", rightMeaning: "", sortOrder: 0 };

const addPair = (f, setF) => setF(p => ({ ...p, pairs: [...p.pairs, { ...blankPair, sortOrder: p.pairs.length }] }));
const removePair = (f, setF, idx) => setF(p => ({ ...p, pairs: p.pairs.filter((_, i) => i !== idx) }));
const updatePair = (f, setF, idx, field, val) => setF(p => ({ ...p, pairs: p.pairs.map((pair, i) => i === idx ? { ...pair, [field]: val } : pair) }));

const ConnectSetForm = ({ f, setF }) => (
  <div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 10, marginBottom: 14 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Title (Sinhala) *</div>
        <input className="sinhala" value={f.title} onChange={e => setF(p => ({ ...p, title: e.target.value }))} placeholder="සතා යා කරන්න" style={{ fontSize: 16 }} />
      </div>
      {/* <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Hint (English) *</div>
        <input value={f.hint} onChange={e => setF(p => ({ ...p, hint: e.target.value }))} placeholder="Match each animal to what it does" />
      </div> */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Order</div>
        <input type="number" value={f.sortOrder} onChange={e => setF(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} />
      </div>
    </div>

    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 8 }}>PAIRS</div>
    {f.pairs.map((pair, idx) => (
      <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 32px", gap: 8, marginBottom: 8, alignItems: "end" }}>
        <div>
          {idx === 0 && <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", marginBottom: 3 }}>LEFT (Sinhala)</div>}
          <input className="sinhala" value={pair.leftText} onChange={e => updatePair(f, setF, idx, "leftText", e.target.value)} placeholder="හාවා" style={{ fontSize: 16 }} />
        </div>
        <div>
          {idx === 0 && <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", marginBottom: 3 }}>RIGHT (Sinhala)</div>}
          <input className="sinhala" value={pair.rightText} onChange={e => updatePair(f, setF, idx, "rightText", e.target.value)} placeholder="පැන පැන යයි" style={{ fontSize: 16 }} />
        </div>
        <div>
          {idx === 0 && <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", marginBottom: 3 }}>LEFT MEANING</div>}
          <input value={pair.leftMeaning} onChange={e => updatePair(f, setF, idx, "leftMeaning", e.target.value)} placeholder="Rabbit" />
        </div>
        <div>
          {idx === 0 && <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", marginBottom: 3 }}>RIGHT MEANING</div>}
          <input value={pair.rightMeaning} onChange={e => updatePair(f, setF, idx, "rightMeaning", e.target.value)} placeholder="Run away" />
        </div>
        <button onClick={() => removePair(f, setF, idx)} style={{ background: "#fee2e2", border: "none", borderRadius: 8, cursor: "pointer", color: "#dc2626", fontSize: 16, padding: "8px", marginTop: idx === 0 ? 17 : 0 }}>×</button>
      </div>
    ))}
    <button className="btn btn-outline btn-sm" onClick={() => addPair(f, setF)} style={{ marginTop: 6 }}>+ Add Pair</button>
  </div>
);

export default function GameDataAdmin() {
  const [activeTab, setActiveTab] = useState("Letters");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&family=Noto+Sans+Sinhala:wght@400;600&display=swap');
        *{font-family:'Nunito',sans-serif;box-sizing:border-box;}
        .sinhala{font-family:'Noto Sans Sinhala',sans-serif;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        .anim{animation:fadeUp 0.4s cubic-bezier(.22,1,.36,1) both;}
        .spin{width:15px;height:15px;border:2px solid #e5e7eb;border-top-color:#111;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;}
        .spin-w{width:15px;height:15px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;}
        input,textarea,select{outline:none;border:1.5px solid #e5e7eb;border-radius:10px;padding:9px 13px;font-size:14px;width:100%;background:white;font-family:inherit;transition:border 0.15s;}
        input:focus,textarea:focus,select:focus{border-color:#111;}
        .btn{cursor:pointer;border:none;border-radius:9px;font-weight:700;font-size:13px;padding:8px 16px;display:inline-flex;align-items:center;gap:6px;transition:all 0.15s;}
        .btn-black{background:#111;color:#fff;}.btn-black:hover{background:#333;}
        .btn-black:disabled{background:#9ca3af;cursor:not-allowed;}
        .btn-outline{background:#fff;color:#111;border:1.5px solid #e5e7eb;}.btn-outline:hover{border-color:#111;}
        .btn-red{background:#fff;color:#dc2626;border:1.5px solid #fee2e2;}.btn-red:hover{background:#fee2e2;}
        .btn-red-solid{background:#dc2626;color:#fff;}.btn-red-solid:hover{background:#b91c1c;}
        .btn-sm{padding:6px 12px;font-size:12px;border-radius:8px;}
        .btn-xs{padding:4px 9px;font-size:11px;border-radius:7px;}
        .card{background:#fff;border:1.5px solid #e5e7eb;border-radius:18px;overflow:hidden;}
        .row:hover{background:#f9fafb;}
        .badge{display:inline-flex;align-items:center;gap:3px;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:700;}
        .badge-g{background:#dcfce7;color:#166534;}
        .badge-gray{background:#f3f4f6;color:#6b7280;}
        .divider{border:none;border-top:1.5px solid #f3f4f6;margin:0;}
        .tab{padding:8px 18px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;border:none;background:transparent;transition:all 0.15s;}
        .tab-active{background:#111;color:#fff;}
        .tab-inactive{color:#6b7280;}.tab-inactive:hover{background:#f3f4f6;color:#111;}
        .color-dot{width:12px;height:12px;border-radius:50%;display:inline-block;flex-shrink:0;}
        .section-title{font-size:11px;font-weight:800;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;}
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1.5px solid #f3f4f6", background: "#fff", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 16, height: 60 }}>
          <div style={{ width: 32, height: 32, background: "#111", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 16 }}>🎮</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Game Data Admin</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>Manage letters, words & connect sets</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1.5px solid #f3f4f6", background: "#fff", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 4, paddingTop: 10, paddingBottom: 10 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`tab ${activeTab === tab ? "tab-active" : "tab-inactive"}`}>
              {tab === "Letters" ? "🔤 " : tab === "Words" ? "📝 " : "🔗 "}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 48px" }}>
        {activeTab === "Letters"      && <LettersTab      showToast={showToast} />}
        {activeTab === "Words"        && <WordsTab        showToast={showToast} />}
        {activeTab === "Line Connect" && <ConnectSetsTab  showToast={showToast} />}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: toast.type === "error" ? "#dc2626" : "#111", color: "#fff", padding: "12px 20px", borderRadius: 13, fontSize: 13, fontWeight: 700, zIndex: 999, animation: "fadeUp 0.3s ease", boxShadow: "0 8px 30px rgba(0,0,0,0.18)" }}>
          {toast.type === "error" ? "❌ " : "✅ "}{toast.msg}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1 — LETTERS
// ═══════════════════════════════════════════════════════════════════
function LettersTab({ showToast }) {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  const blank = { letter: "", name: "", sound: "", categoryName: "ස්වර (Vowels)", categoryColor: "#e11d48", sortOrder: 0 };
  const [form, setForm] = useState(blank);
  const [editForm, setEditForm] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try { setLetters(await getGameLetters()); } catch { showToast("Failed to load letters", "error"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const grouped = letters.reduce((acc, l) => {
    if (!acc[l.categoryName]) acc[l.categoryName] = [];
    acc[l.categoryName].push(l);
    return acc;
  }, {});

  const filtered = search
    ? letters.filter(l => l.letter.includes(search) || l.name.includes(search) || l.sound.includes(search) || l.categoryName.includes(search))
    : null;

  const handleAdd = async () => {
    if (!form.letter || !form.name || !form.sound) return showToast("Letter, Name, Sound required", "error");
    setSaving(true);
    try {
      await createGameLetter(form);
      showToast("Letter added!");
      setShowAdd(false); setForm(blank); load();
    } catch { showToast("Failed to add letter", "error"); }
    setSaving(false);
  };

  const handleUpdate = async (id) => {
    setSaving(true);
    try {
      await updateGameLetter(id, editForm);
      showToast("Letter updated!"); setEditId(null); load();
    } catch { showToast("Failed to update", "error"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteGameLetter(id);
      showToast("Letter deleted!"); setDeleteId(null); load();
    } catch { showToast("Failed to delete", "error"); }
    setDeleting(false);
  };

  const displayLetters = filtered ?? letters;
  const displayGrouped = filtered
    ? filtered.reduce((acc, l) => { if (!acc[l.categoryName]) acc[l.categoryName] = []; acc[l.categoryName].push(l); return acc; }, {})
    : grouped;

  return (
    <div className="anim">
      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>Sinhala Letters</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>{letters.length} letters across {Object.keys(grouped).length} categories</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ width: 180 }} />
          <button className="btn btn-outline btn-sm" onClick={load}>{loading ? <span className="spin" /> : "↻"} Refresh</button>
          <button className="btn btn-black btn-sm" onClick={() => setShowAdd(s => !s)}>+ Add Letter</button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card anim" style={{ padding: 20, marginBottom: 20, background: "#f9fafb" }}>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>Add New Letter</div>
          <LetterFormFields f={form} setF={setForm} />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-black btn-sm" onClick={handleAdd} disabled={saving}>
              {saving ? <span className="spin-w" /> : null} Add Letter
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => { setShowAdd(false); setForm(blank); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Letter groups */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
          <span className="spin" style={{ width: 24, height: 24 }} /><br />Loading letters…
        </div>
      ) : Object.keys(displayGrouped).length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
          {search ? "No letters match search." : "No letters yet."}
        </div>
      ) : Object.entries(displayGrouped).map(([catName, catLetters]) => {
        const catColor = CATEGORY_COLORS.find(c => c.name === catName)?.color ?? "#111";
        return (
          <div key={catName} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span className="color-dot" style={{ background: catColor }} />
              <span style={{ fontWeight: 800, fontSize: 13 }}>{catName}</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>({catLetters.length})</span>
            </div>
            <div className="card">
              {catLetters.map((l, i) => (
                <div key={l.id}>
                  {i > 0 && <hr className="divider" />}
                  {editId === l.id ? (
                    <div style={{ padding: "14px 18px", background: "#f9fafb" }}>
                      <LetterFormFields f={editForm} setF={setEditForm} />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-black btn-sm" onClick={() => handleUpdate(l.id)} disabled={saving}>
                          {saving ? <span className="spin-w" /> : null} Save
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px" }}>
                      <div className="sinhala" style={{ fontSize: 28, fontWeight: 700, color: catColor, minWidth: 40 }}>{l.letter}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }} className="sinhala">{l.name}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>/{l.sound}/ · order: {l.sortOrder}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-outline btn-xs" onClick={() => { setEditId(l.id); setEditForm({ ...l }); setDeleteId(null); }}>Edit</button>
                        <button className="btn btn-red btn-xs" onClick={() => { setDeleteId(l.id); setEditId(null); }}>Delete</button>
                      </div>
                    </div>
                  )}
                  {deleteId === l.id && (
                    <div style={{ padding: "10px 18px", background: "#fff7ed", borderTop: "1.5px solid #fed7aa" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, color: "#92400e", fontWeight: 600 }}>Delete "{l.letter}"? Cannot undo.</span>
                        <button className="btn btn-red-solid btn-xs" onClick={() => handleDelete(l.id)} disabled={deleting}>{deleting ? <span className="spin-w" /> : null} Delete</button>
                        <button className="btn btn-outline btn-xs" onClick={() => setDeleteId(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2 — WORDS
// ═══════════════════════════════════════════════════════════════════
function WordsTab({ showToast }) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  const blank = { word: "", syllables: [], emoji: "🌸" };
  const [form, setForm] = useState({ ...blank, syllablesStr: "" });
  const [editForm, setEditForm] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try { setWords(await getGameWords()); } catch { showToast("Failed to load words", "error"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const parseSyllables = (str) => str.split(",").map(s => s.trim()).filter(Boolean);

  const handleAdd = async () => {
    const syllables = parseSyllables(form.syllablesStr);
    if (!form.word || syllables.length === 0) return showToast("All fields required", "error");
    setSaving(true);
    try {
      await createGameWord({ word: form.word, syllables, emoji: form.emoji });
      showToast("Word added!"); setShowAdd(false); setForm({ ...blank, syllablesStr: "" }); load();
    } catch { showToast("Failed to add word", "error"); }
    setSaving(false);
  };

  const handleUpdate = async (id) => {
    const syllables = parseSyllables(editForm.syllablesStr || editForm.syllables?.join(",") || "");
    setSaving(true);
    try {
      await updateGameWord(id, { word: editForm.word, syllables, emoji: editForm.emoji });
      showToast("Word updated!"); setEditId(null); load();
    } catch { showToast("Failed to update", "error"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteGameWord(id); showToast("Word deleted!"); setDeleteId(null); load();
    } catch { showToast("Failed to delete", "error"); }
    setDeleting(false);
  };

  const displayed = search
    ? words.filter(w => w.word.includes(search) || w.meaning.toLowerCase().includes(search.toLowerCase()))
    : words;

  return (
    <div className="anim">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>Sinhala Words</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>{words.length} words for Word Builder, Unscramble & Missing Letter games</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ width: 180 }} />
          <button className="btn btn-outline btn-sm" onClick={load}>{loading ? <span className="spin" /> : "↻"} Refresh</button>
          <button className="btn btn-black btn-sm" onClick={() => setShowAdd(s => !s)}>+ Add Word</button>
        </div>
      </div>

      {showAdd && (
        <div className="card anim" style={{ padding: 20, marginBottom: 20, background: "#f9fafb" }}>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>Add New Word</div>
          <WordFormFields f={form} setF={setForm} isEdit={false} />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-black btn-sm" onClick={handleAdd} disabled={saving}>
              {saving ? <span className="spin-w" /> : null} Add Word
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => { setShowAdd(false); setForm({ ...blank, syllablesStr: "" }); }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
          <span className="spin" style={{ width: 24, height: 24 }} /><br />Loading words…
        </div>
      ) : (
        <div className="card">
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "50px 1fr 120px 1fr 90px", gap: 12, padding: "12px 18px", background: "#f9fafb", borderBottom: "1.5px solid #f3f4f6" }}>
            {["#", "Word", "Syllables", "Actions"].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>
          {displayed.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>No words yet.</div>
          )}
          {displayed.map((w, i) => (
            <div key={w.id}>
              {i > 0 && <hr className="divider" />}
              {editId === w.id ? (
                <div style={{ padding: "14px 18px", background: "#f9fafb" }}>
                  <WordFormFields f={editForm} setF={setEditForm} isEdit={true} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-black btn-sm" onClick={() => handleUpdate(w.id)} disabled={saving}>
                      {saving ? <span className="spin-w" /> : null} Save
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="row" style={{ display: "grid", gridTemplateColumns: "50px 1fr 120px 1fr 90px", gap: 12, padding: "12px 18px", alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 700 }}>#{w.id}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 22 }}>{w.emoji}</span>
                    <span className="sinhala" style={{ fontSize: 18, fontWeight: 700 }}>{w.word}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#374151" }}>{w.meaning}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {w.syllables.map((s, si) => (
                      <span key={si} className="sinhala" style={{ background: "#f3f4f6", borderRadius: 6, padding: "2px 8px", fontSize: 14, fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-outline btn-xs" onClick={() => { setEditId(w.id); setEditForm({ ...w, syllablesStr: w.syllables.join(",") }); setDeleteId(null); }}>Edit</button>
                    <button className="btn btn-red btn-xs" onClick={() => { setDeleteId(w.id); setEditId(null); }}>Delete</button>
                  </div>
                </div>
              )}
              {deleteId === w.id && (
                <div style={{ padding: "10px 18px", background: "#fff7ed", borderTop: "1.5px solid #fed7aa" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, color: "#92400e", fontWeight: 600 }}>Delete "{w.word}" ({w.meaning})?</span>
                    <button className="btn btn-red-solid btn-xs" onClick={() => handleDelete(w.id)} disabled={deleting}>{deleting ? <span className="spin-w" /> : null} Delete</button>
                    <button className="btn btn-outline btn-xs" onClick={() => setDeleteId(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3 — LINE CONNECT SETS
// ═══════════════════════════════════════════════════════════════════
function ConnectSetsTab({ showToast }) {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const blankSet  = { title: "", sortOrder: 0, pairs: [{ ...blankPair }] };
  const [form, setForm] = useState({ ...blankSet });
  const [editForm, setEditForm] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try { setSets(await getConnectSets()); } catch { showToast("Failed to load sets", "error"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.title || form.pairs.length === 0) return showToast("Title, & pairs required", "error");
    setSaving(true);
    try {
      await createConnectSet(form); showToast("Connect set added!"); setShowAdd(false); setForm({ ...blankSet, pairs: [{ ...blankPair }] }); load();
    } catch { showToast("Failed to add", "error"); }
    setSaving(false);
  };

  const handleUpdate = async (id) => {
    setSaving(true);
    try {
      await updateConnectSet(id, editForm); showToast("Updated!"); setEditId(null); load();
    } catch { showToast("Failed to update", "error"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteConnectSet(id); showToast("Deleted!"); setDeleteId(null); load();
    } catch { showToast("Failed to delete", "error"); }
    setDeleting(false);
  };

  return (
    <div className="anim">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>Line Connect Sets</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>{sets.length} sets · used in Line Connect game</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={load}>{loading ? <span className="spin" /> : "↻"} Refresh</button>
          <button className="btn btn-black btn-sm" onClick={() => setShowAdd(s => !s)}>+ Add Set</button>
        </div>
      </div>

      {showAdd && (
        <div className="card anim" style={{ padding: 20, marginBottom: 20, background: "#f9fafb" }}>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>Add New Connect Set</div>
          <ConnectSetForm f={form} setF={setForm} />
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button className="btn btn-black btn-sm" onClick={handleAdd} disabled={saving}>{saving ? <span className="spin-w" /> : null} Add Set</button>
            <button className="btn btn-outline btn-sm" onClick={() => { setShowAdd(false); setForm({ ...blankSet, pairs: [{ ...blankPair }] }); }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
          <span className="spin" style={{ width: 24, height: 24 }} /><br />Loading…
        </div>
      ) : sets.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>No connect sets yet.</div>
      ) : sets.map((set, si) => (
        <div key={set.id} className="card anim" style={{ marginBottom: 16 }}>
          {editId === set.id ? (
            <div style={{ padding: 20, background: "#f9fafb" }}>
              <div style={{ fontWeight: 700, marginBottom: 14 }}>Editing Set #{set.id}</div>
              <ConnectSetForm f={editForm} setF={setEditForm} />
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button className="btn btn-black btn-sm" onClick={() => handleUpdate(set.id)} disabled={saving}>{saving ? <span className="spin-w" /> : null} Save</button>
                <button className="btn btn-outline btn-sm" onClick={() => setEditId(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="sinhala" style={{ fontWeight: 700, fontSize: 17 }}>{set.title}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{set.hint} · {set.pairs?.length ?? 0} pairs · order: {set.sortOrder}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => {
                    setEditId(set.id);
                    setEditForm({ ...set, pairs: (set.pairs ?? []).map(p => ({ ...p })) });
                    setDeleteId(null);
                  }}>Edit</button>
                  <button className="btn btn-red btn-sm" onClick={() => { setDeleteId(set.id); setEditId(null); }}>Delete</button>
                </div>
              </div>
              {/* Pairs preview */}
              <div style={{ padding: "0 20px 16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {(set.pairs ?? []).map((pair, pi) => (
                    <div key={pi} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f9fafb", borderRadius: 10, padding: "8px 12px" }}>
                      <span className="sinhala" style={{ fontWeight: 700, fontSize: 15 }}>{pair.leftText}</span>
                      <span style={{ color: "#9ca3af", fontSize: 12 }}>({pair.leftMeaning})</span>
                      <span style={{ color: "#d1d5db", margin: "0 4px" }}>→</span>
                      <span className="sinhala" style={{ fontWeight: 700, fontSize: 15 }}>{pair.rightText}</span>
                      <span style={{ color: "#9ca3af", fontSize: 12 }}>({pair.rightMeaning})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {deleteId === set.id && (
            <div style={{ padding: "12px 20px", background: "#fff7ed", borderTop: "1.5px solid #fed7aa" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "#92400e", fontWeight: 600 }}>Delete "{set.title}" and all {set.pairs?.length} pairs?</span>
                <button className="btn btn-red-solid btn-xs" onClick={() => handleDelete(set.id)} disabled={deleting}>{deleting ? <span className="spin-w" /> : null} Delete</button>
                <button className="btn btn-outline btn-xs" onClick={() => setDeleteId(null)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}