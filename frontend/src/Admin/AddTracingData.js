import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  getLetters, createLetter, updateLetter, deleteLetter,
} from '../services/tracingDataService';

// LetterTracing.js draws its practice canvas at 680x440 (CANVAS_W x CANVAS_H)
// but keypoints are STORED in a 400x400 source space (KP_SRC) and scaled up
// via getScaledKP() there. To make this editor look exactly like the student
// page (not stretched/squashed differently), it renders at the SAME 680x440
// size and does the identical 400 -> 680x440 scaling for preview — while
// still storing/importing/pasting coordinates in the original 400x400 space,
// so old KEYPOINTS_SRC values paste in unchanged.
const CANVAS_W = 680;
const CANVAS_H = 440;
const KP_SRC = 400;
const POINT_HIT_RADIUS = 14;

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const emptyLetterForm = {
  categoryId: '',
  letter: '',
  sound: '',
  strokes: 1,
  difficulty: 'Easy',
  tip: '',
  phases: [''],
  keypoints: [],
  orderIndex: 0,
};

const emptyCategoryForm = { code: '', name: '', nameEn: '', orderIndex: 0 };

// Parses coordinate text copied straight out of the OLD hard-coded
// KEYPOINTS_SRC map in LetterTracing.js, e.g.:
//   {x:185,y:150},{x:223,y:185},{x:180,y:190},
//   {x:150,y:230},{x:200,y:270},
// Also accepts quoted JSON-style keys ({"x":185,"y":150}). Order in the
// output always matches the order the pairs appear in the pasted text,
// so pasting a whole entry preserves the original stroke order exactly.
function parseCoordinateText(text) {
  const regex = /"?x"?\s*:\s*(-?\d+(?:\.\d+)?)\s*,\s*"?y"?\s*:\s*(-?\d+(?:\.\d+)?)/g;
  const points = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    points.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
  }
  return points;
}

// ─── KEYPOINT EDITOR ────────────────────────────────────────────
function KeypointEditor({ letterChar, keypoints, onChange }) {
  const canvasRef = useRef(null);
  const [pasteText, setPasteText] = useState('');
  const [manualX, setManualX] = useState('');
  const [manualY, setManualY] = useState('');
  const [pasteMsg, setPasteMsg] = useState(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = CANVAS_W, h = CANVAS_H;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, w, h);

    // same background treatment LetterTracing.js's drawBackground() uses
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1; ctx.setLineDash([]);
    for (let g = 60; g < h; g += 60) {
      ctx.beginPath(); ctx.moveTo(0, g); ctx.lineTo(w, g); ctx.stroke();
    }
    ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(0, h * 0.72); ctx.lineTo(w, h * 0.72); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(48, 0); ctx.lineTo(48, h); ctx.stroke();

    // guide letter — identical font sizing/position to LetterTracing.js
    if (letterChar) {
      ctx.font = `900 ${Math.round(h * 0.65)}px "Noto Sans Sinhala",serif`;
      ctx.fillStyle = 'rgba(17,17,17,0.14)';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(letterChar, w / 2, h / 2 + h * 0.04);
    }

    // keypoints are stored in the 400x400 source space — scale up to the
    // 680x440 display canvas exactly like getScaledKP() does in
    // LetterTracing.js, so what's shown here matches the student page 1:1
    const scaled = keypoints.map(p => ({ x: (p.x / KP_SRC) * w, y: (p.y / KP_SRC) * h }));

    if (scaled.length > 1) {
      ctx.strokeStyle = '#1a56db'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
      ctx.beginPath();
      scaled.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke(); ctx.setLineDash([]);
    }

    scaled.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
      ctx.fillStyle = i === scaled.length - 1 ? '#1a56db' : '#111';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '700 11px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), p.x, p.y);
    });
  }, [letterChar, keypoints]);

  useEffect(() => { draw(); }, [draw]);

  // display-space (680x440) position of the click, for hit-testing against
  // the already-scaled points drawn on screen
  const getDisplayPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = CANVAS_W / rect.width, sy = CANVAS_H / rect.height;
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  };

  const handleClick = (e) => {
    const disp = getDisplayPos(e);
    const scaled = keypoints.map(p => ({ x: (p.x / KP_SRC) * CANVAS_W, y: (p.y / KP_SRC) * CANVAS_H }));
    const hitIdx = scaled.findIndex(p => Math.hypot(p.x - disp.x, p.y - disp.y) <= POINT_HIT_RADIUS);
    if (hitIdx !== -1) {
      // clicking an existing point removes it (and re-numbers the rest)
      onChange(keypoints.filter((_, i) => i !== hitIdx));
    } else {
      // convert the click back from display space (680x440) into the
      // 400x400 source space the data is actually stored/pasted in
      const srcX = Math.round((disp.x / CANVAS_W) * KP_SRC);
      const srcY = Math.round((disp.y / CANVAS_H) * KP_SRC);
      onChange([...keypoints, { x: srcX, y: srcY }]);
    }
  };

  // ── manual numeric add ──
  const addManualPoint = () => {
    const x = parseFloat(manualX), y = parseFloat(manualY);
    if (Number.isNaN(x) || Number.isNaN(y)) return;
    onChange([...keypoints, { x, y }]);
    setManualX(''); setManualY('');
  };

  // ── editable list row helpers ──
  const updatePointField = (idx, field, value) => {
    const num = parseFloat(value);
    onChange(keypoints.map((p, i) => (i === idx ? { ...p, [field]: Number.isNaN(num) ? p[field] : num } : p)));
  };
  const removePoint = (idx) => onChange(keypoints.filter((_, i) => i !== idx));
  const movePoint = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= keypoints.length) return;
    const next = [...keypoints];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  // ── paste-import from the original hard-coded LetterTracing.js code ──
  const importPasted = (mode) => {
    const parsed = parseCoordinateText(pasteText);
    if (parsed.length === 0) {
      setPasteMsg({ type: 'error', text: 'No {x:..,y:..} pairs found in that text.' });
      return;
    }
    onChange(mode === 'replace' ? parsed : [...keypoints, ...parsed]);
    setPasteMsg({ type: 'success', text: `Imported ${parsed.length} point${parsed.length === 1 ? '' : 's'}.` });
    setPasteText('');
    setTimeout(() => setPasteMsg(null), 3000);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        onClick={handleClick}
        style={{
          width: '100%', maxWidth: 480, aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
          border: '1px solid #e5e7eb', borderRadius: 12, background: '#fafafa',
          cursor: 'crosshair', display: 'block',
        }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button type="button"
          onClick={() => onChange(keypoints.slice(0, -1))}
          disabled={keypoints.length === 0}
          style={btnStyle(false, keypoints.length === 0)}>
          Undo last
        </button>
        <button type="button"
          onClick={() => onChange([])}
          disabled={keypoints.length === 0}
          style={btnStyle(false, keypoints.length === 0)}>
          Clear all
        </button>
      </div>
      <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: '#888', marginTop: 8, lineHeight: 1.5 }}>
        Click on the letter to add keypoints in stroke order (1, 2, 3…). Click an existing
        numbered point to remove it. Currently{' '}
        <strong style={{ color: '#111' }}>{keypoints.length}</strong> keypoint{keypoints.length === 1 ? '' : 's'}.
      </p>

      {/* ── paste coordinates straight from the old LetterTracing.js file ── */}
      <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 14 }}>
        <label style={labelStyle}>Paste coordinates from the old LetterTracing.js code</label>
        <textarea
          value={pasteText}
          onChange={e => setPasteText(e.target.value)}
          placeholder={'e.g. {x:185,y:150},{x:223,y:185},{x:180,y:190},\n{x:150,y:230},{x:200,y:270},'}
          style={{ ...inputStyle, minHeight: 70, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button type="button" onClick={() => importPasted('replace')} style={btnStyle(true, !pasteText.trim())} disabled={!pasteText.trim()}>
            Import (replace all)
          </button>
          <button type="button" onClick={() => importPasted('append')} style={btnStyle(false, !pasteText.trim())} disabled={!pasteText.trim()}>
            Import (append)
          </button>
        </div>
        {pasteMsg && (
          <p style={{ fontSize: 12, marginTop: 6, color: pasteMsg.type === 'success' ? '#15803d' : '#dc2626' }}>
            {pasteMsg.text}
          </p>
        )}
        <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: '#aaa', marginTop: 6, lineHeight: 1.5 }}>
          Paste a whole letter's entry from the old KEYPOINTS_SRC map (or any {'{x:.., y:..}'} list) —
          the pairs are read left to right, so stroke order is preserved exactly as it was hard-coded.
        </p>
      </div>

      {/* ── manual numeric add ── */}
      <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 14 }}>
        <label style={labelStyle}>Add one point by exact coordinates</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="number" placeholder="x" value={manualX} onChange={e => setManualX(e.target.value)}
            style={{ ...inputStyle, width: 90 }} />
          <input type="number" placeholder="y" value={manualY} onChange={e => setManualY(e.target.value)}
            style={{ ...inputStyle, width: 90 }} />
          <button type="button" onClick={addManualPoint}
            disabled={manualX === '' || manualY === ''}
            style={btnStyle(false, manualX === '' || manualY === '')}>
            + Add point
          </button>
        </div>
        <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: '#aaa', marginTop: 6 }}>
          Coordinates are in the same 400 × 400 space the old KEYPOINTS_SRC values used (KP_SRC = 400) —
          numbers copied straight from the old file line up exactly.
        </p>
      </div>

      {/* ── editable list of current points ── */}
      {keypoints.length > 0 && (
        <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 14 }}>
          <label style={labelStyle}>Points (editable — order = stroke order)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
            {keypoints.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 22, textAlign: 'center', fontSize: 11, color: '#888', fontWeight: 600 }}>
                  {idx + 1}
                </span>
                <input type="number" value={p.x}
                  onChange={e => updatePointField(idx, 'x', e.target.value)}
                  style={{ ...inputStyle, width: 72, padding: '6px 8px' }} />
                <input type="number" value={p.y}
                  onChange={e => updatePointField(idx, 'y', e.target.value)}
                  style={{ ...inputStyle, width: 72, padding: '6px 8px' }} />
                <button type="button" onClick={() => movePoint(idx, -1)} disabled={idx === 0}
                  style={btnStyle(false, idx === 0)} title="Move earlier">↑</button>
                <button type="button" onClick={() => movePoint(idx, 1)} disabled={idx === keypoints.length - 1}
                  style={btnStyle(false, idx === keypoints.length - 1)} title="Move later">↓</button>
                <button type="button" onClick={() => removePoint(idx)}
                  style={{ ...btnStyle(false, false), color: '#dc2626', borderColor: '#fca5a5' }} title="Delete">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SHARED STYLES ──────────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb',
  fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: '#111', outline: 'none', boxSizing: 'border-box',
};
const labelStyle = {
  fontFamily: 'DM Sans,sans-serif', fontSize: 11, textTransform: 'uppercase',
  letterSpacing: '0.08em', color: '#888', display: 'block', marginBottom: 6,
};
function btnStyle(primary, disabled) {
  return {
    padding: '10px 18px', borderRadius: 8,
    border: primary ? '1px solid #111' : '1px solid #e5e7eb',
    background: disabled ? '#f5f5f5' : primary ? '#111' : '#fff',
    color: disabled ? '#bbb' : primary ? '#fff' : '#444',
    fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function AddTracingData() {
  const [categories, setCategories] = useState([]);
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);

  const [letterForm, setLetterForm] = useState(emptyLetterForm);
  const [editingLetterId, setEditingLetterId] = useState(null);
  const [letterSaving, setLetterSaving] = useState(false);
  const [letterFormOpen, setLetterFormOpen] = useState(false);

  const [statusMsg, setStatusMsg] = useState(null); // { type: 'success'|'error', text }
  const [filterCategory, setFilterCategory] = useState('all');

  const loadAll = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    Promise.all([getCategories(), getLetters()])
      .then(([cats, ltrs]) => { setCategories(cats || []); setLetters(ltrs || []); })
      .catch(err => setLoadError(err.message || 'Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const flash = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // ── category handlers ──
  const openNewCategoryForm = () => {
    setCategoryForm(emptyCategoryForm);
    setEditingCategoryId(null);
    setCategoryFormOpen(true);
  };
  const openEditCategoryForm = (cat) => {
    setCategoryForm({ code: cat.code, name: cat.name, nameEn: cat.nameEn, orderIndex: cat.orderIndex ?? 0 });
    setEditingCategoryId(cat.id);
    setCategoryFormOpen(true);
  };
  const submitCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.code.trim() || !categoryForm.name.trim() || !categoryForm.nameEn.trim()) {
      flash('error', 'Category code, Sinhala name and English name are all required.');
      return;
    }
    setCategorySaving(true);
    try {
      const payload = {
        code: categoryForm.code.trim(),
        name: categoryForm.name.trim(),
        nameEn: categoryForm.nameEn.trim(),
        orderIndex: Number(categoryForm.orderIndex) || 0,
      };
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, payload);
        flash('success', 'Category updated.');
      } else {
        await createCategory(payload);
        flash('success', 'Category created.');
      }
      setCategoryFormOpen(false);
      loadAll();
    } catch (err) {
      flash('error', err.message || 'Could not save category.');
    } finally {
      setCategorySaving(false);
    }
  };
  const removeCategory = async (cat) => {
    if (!window.confirm(`Delete category "${cat.nameEn}"? This will also remove its letters.`)) return;
    try {
      await deleteCategory(cat.id);
      flash('success', 'Category deleted.');
      loadAll();
    } catch (err) {
      flash('error', err.message || 'Could not delete category.');
    }
  };

  // ── letter handlers ──
  const openNewLetterForm = () => {
    setLetterForm({ ...emptyLetterForm, categoryId: categories[0]?.id ?? '' });
    setEditingLetterId(null);
    setLetterFormOpen(true);
  };
  const openEditLetterForm = (letter) => {
    setLetterForm({
      categoryId: letter.categoryId,
      letter: letter.letter,
      sound: letter.sound,
      strokes: letter.strokes,
      difficulty: letter.difficulty,
      tip: letter.tip,
      phases: letter.phases?.length ? letter.phases : [''],
      keypoints: letter.keypoints || [],
      orderIndex: letter.orderIndex ?? 0,
    });
    setEditingLetterId(letter.id);
    setLetterFormOpen(true);
  };

  const updatePhase = (idx, value) => {
    setLetterForm(f => {
      const phases = [...f.phases];
      phases[idx] = value;
      return { ...f, phases };
    });
  };
  const addPhase = () => setLetterForm(f => ({ ...f, phases: [...f.phases, ''] }));
  const removePhase = (idx) => setLetterForm(f => ({ ...f, phases: f.phases.filter((_, i) => i !== idx) }));

  const submitLetter = async (e) => {
    e.preventDefault();
    if (!letterForm.categoryId) { flash('error', 'Pick a category first.'); return; }
    if (!letterForm.letter.trim()) { flash('error', 'The Sinhala letter character is required.'); return; }
    if (!letterForm.sound.trim()) { flash('error', 'A romanized sound (e.g. "ka") is required.'); return; }
    if (letterForm.keypoints.length < 2) {
      flash('error', 'Place at least 2 keypoints on the letter before saving.');
      return;
    }

    setLetterSaving(true);
    try {
      const payload = {
        categoryId: Number(letterForm.categoryId),
        letter: letterForm.letter.trim(),
        sound: letterForm.sound.trim(),
        strokes: Number(letterForm.strokes) || 1,
        difficulty: letterForm.difficulty,
        tip: letterForm.tip.trim(),
        phases: letterForm.phases.map(p => p.trim()).filter(Boolean),
        keypoints: letterForm.keypoints,
        orderIndex: Number(letterForm.orderIndex) || 0,
      };
      if (editingLetterId) {
        await updateLetter(editingLetterId, payload);
        flash('success', `"${payload.letter}" updated.`);
      } else {
        await createLetter(payload);
        flash('success', `"${payload.letter}" created.`);
      }
      setLetterFormOpen(false);
      loadAll();
    } catch (err) {
      flash('error', err.message || 'Could not save letter.');
    } finally {
      setLetterSaving(false);
    }
  };

  const removeLetter = async (letter) => {
    if (!window.confirm(`Delete letter "${letter.letter}"?`)) return;
    try {
      await deleteLetter(letter.id);
      flash('success', 'Letter deleted.');
      loadAll();
    } catch (err) {
      flash('error', err.message || 'Could not delete letter.');
    }
  };

  const categoryName = (id) => categories.find(c => c.id === id)?.nameEn || '—';
  const visibleLetters = filterCategory === 'all'
    ? letters
    : letters.filter(l => String(l.categoryId) === String(filterCategory));

  if (loading) {
    return <div style={{ padding: 40, fontFamily: 'DM Sans,sans-serif', color: '#888' }}>Loading admin data…</div>;
  }
  if (loadError) {
    return (
      <div style={{ padding: 40, fontFamily: 'DM Sans,sans-serif' }}>
        <p style={{ color: '#dc2626', marginBottom: 12 }}>Couldn't load data: {loadError}</p>
        <button onClick={loadAll} style={btnStyle(true, false)}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'DM Sans,sans-serif', color: '#111', paddingTop: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800&family=DM+Sans:wght@300;400;500&family=Noto+Sans+Sinhala:wght@400;700;900&display=swap');
        .fd{font-family:'Playfair Display',serif}
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 80px' }}>
        <h1 className="fd" style={{ fontSize: 32, fontWeight: 800, marginBottom: 6 }}>Add Tracing Data</h1>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 28 }}>
          Manage letter categories, letters, guidance phases and stroke-order keypoints
          used by the Letter Tracing page — no more hard-coded data.
        </p>

        {statusMsg && (
          <div style={{
            padding: '10px 16px', borderRadius: 10, marginBottom: 20,
            background: statusMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${statusMsg.type === 'success' ? '#bbf7d0' : '#fca5a5'}`,
            color: statusMsg.type === 'success' ? '#15803d' : '#dc2626',
            fontSize: 13,
          }}>
            {statusMsg.text}
          </div>
        )}

        {/* ═══ CATEGORIES ═══ */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 className="fd" style={{ fontSize: 20, fontWeight: 700 }}>Categories</h2>
            <button onClick={openNewCategoryForm} style={btnStyle(true, false)}>+ New category</button>
          </div>

          {categoryFormOpen && (
            <form onSubmit={submitCategory} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Code</label>
                  <input style={inputStyle} placeholder="e.g. vowels" value={categoryForm.code}
                    onChange={e => setCategoryForm(f => ({ ...f, code: e.target.value }))}/>
                </div>
                <div>
                  <label style={labelStyle}>Sinhala name</label>
                  <input style={{ ...inputStyle, fontFamily: '"Noto Sans Sinhala",serif' }} placeholder="ස්වර"
                    value={categoryForm.name} onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))}/>
                </div>
                <div>
                  <label style={labelStyle}>English name</label>
                  <input style={inputStyle} placeholder="Vowels" value={categoryForm.nameEn}
                    onChange={e => setCategoryForm(f => ({ ...f, nameEn: e.target.value }))}/>
                </div>
                <div>
                  <label style={labelStyle}>Order</label>
                  <input type="number" style={inputStyle} value={categoryForm.orderIndex}
                    onChange={e => setCategoryForm(f => ({ ...f, orderIndex: e.target.value }))}/>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="submit" disabled={categorySaving} style={btnStyle(true, categorySaving)}>
                  {categorySaving ? 'Saving…' : editingCategoryId ? 'Update category' : 'Create category'}
                </button>
                <button type="button" onClick={() => setCategoryFormOpen(false)} style={btnStyle(false, false)}>Cancel</button>
              </div>
            </form>
          )}

          <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            {categories.length === 0 && (
              <p style={{ padding: 20, fontSize: 13, color: '#888' }}>No categories yet — add one above.</p>
            )}
            {categories.map(cat => (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: '"Noto Sans Sinhala",serif', fontSize: 16, fontWeight: 700 }}>{cat.name}</span>
                  <span style={{ fontSize: 13, color: '#666' }}>{cat.nameEn}</span>
                  <span style={{ fontSize: 11, color: '#bbb' }}>({cat.code}) · order {cat.orderIndex}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEditCategoryForm(cat)} style={btnStyle(false, false)}>Edit</button>
                  <button onClick={() => removeCategory(cat)} style={{ ...btnStyle(false, false), color: '#dc2626', borderColor: '#fca5a5' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ LETTERS ═══ */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 className="fd" style={{ fontSize: 20, fontWeight: 700 }}>Letters</h2>
            <button onClick={openNewLetterForm} disabled={categories.length === 0} style={btnStyle(true, categories.length === 0)}>
              + New letter
            </button>
          </div>
          {categories.length === 0 && (
            <p style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>Create a category first before adding letters.</p>
          )}

          {letterFormOpen && (
            <form onSubmit={submitLetter} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* left: fields */}
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Category</label>
                      <select style={inputStyle} value={letterForm.categoryId}
                        onChange={e => setLetterForm(f => ({ ...f, categoryId: e.target.value }))}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Letter</label>
                      <input style={{ ...inputStyle, fontFamily: '"Noto Sans Sinhala",serif', fontSize: 18 }}
                        placeholder="අ" value={letterForm.letter}
                        onChange={e => setLetterForm(f => ({ ...f, letter: e.target.value }))}/>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Sound</label>
                      <input style={inputStyle} placeholder="a" value={letterForm.sound}
                        onChange={e => setLetterForm(f => ({ ...f, sound: e.target.value }))}/>
                    </div>
                    <div>
                      <label style={labelStyle}>Strokes</label>
                      <input type="number" min="1" style={inputStyle} value={letterForm.strokes}
                        onChange={e => setLetterForm(f => ({ ...f, strokes: e.target.value }))}/>
                    </div>
                    <div>
<div>
  <label style={labelStyle}>
    Initial difficulty
  </label>

  <select
    style={inputStyle}
    value={letterForm.difficulty}
    onChange={e =>
      setLetterForm(f => ({
        ...f,
        difficulty: e.target.value,
      }))
    }
  >
    {DIFFICULTIES.map(d => (
      <option key={d} value={d}>
        {d}
      </option>
    ))}
  </select>

  <p
    style={{
      fontFamily: 'DM Sans,sans-serif',
      fontSize: 11,
      color: '#aaa',
      marginTop: 5,
      marginBottom: 0,
      lineHeight: 1.4,
    }}
  >
    Sets the starting support level for both
    Adaptive and Static tracing conditions.
  </p>
</div>                      <select style={inputStyle} value={letterForm.difficulty}
                        onChange={e => setLetterForm(f => ({ ...f, difficulty: e.target.value }))}>
                        {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Tip</label>
                    <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                      placeholder="Start top-left, curve right and loop down"
                      value={letterForm.tip} onChange={e => setLetterForm(f => ({ ...f, tip: e.target.value }))}/>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Order index</label>
                    <input type="number" style={{ ...inputStyle, maxWidth: 120 }} value={letterForm.orderIndex}
                      onChange={e => setLetterForm(f => ({ ...f, orderIndex: e.target.value }))}/>
                  </div>

                  <div>
                    <label style={labelStyle}>Guidance phases (shown as numbered steps)</label>
                    {letterForm.phases.map((phase, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <input style={inputStyle} placeholder={`Step ${idx + 1}`} value={phase}
                          onChange={e => updatePhase(idx, e.target.value)}/>
                        <button type="button" onClick={() => removePhase(idx)}
                          disabled={letterForm.phases.length === 1}
                          style={btnStyle(false, letterForm.phases.length === 1)}>✕</button>
                      </div>
                    ))}
                    <button type="button" onClick={addPhase} style={btnStyle(false, false)}>+ Add step</button>
                  </div>
                </div>

                {/* right: keypoint editor */}
                <div>
                  <label style={labelStyle}>Stroke-order keypoints</label>
                  <KeypointEditor
                    letterChar={letterForm.letter}
                    keypoints={letterForm.keypoints}
                    onChange={(kps) => setLetterForm(f => ({ ...f, keypoints: kps }))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                <button type="submit" disabled={letterSaving} style={btnStyle(true, letterSaving)}>
                  {letterSaving ? 'Saving…' : editingLetterId ? 'Update letter' : 'Create letter'}
                </button>
                <button type="button" onClick={() => setLetterFormOpen(false)} style={btnStyle(false, false)}>Cancel</button>
              </div>
            </form>
          )}

          {letters.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Filter by category</label>
              <select style={{ ...inputStyle, maxWidth: 240 }} value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}>
                <option value="all">All categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
              </select>
            </div>
          )}

          <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            {visibleLetters.length === 0 && (
              <p style={{ padding: 20, fontSize: 13, color: '#888' }}>No letters yet — add one above.</p>
            )}
            {visibleLetters.map(letter => (
              <div key={letter.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontFamily: '"Noto Sans Sinhala",serif', fontSize: 22, fontWeight: 900,
                    width: 32, textAlign: 'center' }}>{letter.letter}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      /{letter.sound}/ · {letter.strokes} stroke{letter.strokes > 1 ? 's' : ''} · {letter.difficulty}
                    </div>
                    <div style={{ fontSize: 11, color: '#888' }}>
                      {categoryName(letter.categoryId)} · {letter.keypoints?.length ?? 0} keypoints · {letter.phases?.length ?? 0} phases
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEditLetterForm(letter)} style={btnStyle(false, false)}>Edit</button>
                  <button onClick={() => removeLetter(letter)} style={{ ...btnStyle(false, false), color: '#dc2626', borderColor: '#fca5a5' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}