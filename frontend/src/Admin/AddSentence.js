import { useState, useRef, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:8080/sentences";

export default function SinhalaAdmin() {
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create form
  const [newSentence, setNewSentence] = useState("");
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Audio upload
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const fileInputRefs = useRef({});

  // Edit
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [savingId, setSavingId] = useState(null);

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Search
  const [search, setSearch] = useState("");

  const fetchSentences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSentences(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSentences(); }, [fetchSentences]);

  const handleCreate = async () => {
    if (!newSentence.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: newSentence.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNewSentence("");
      setCreateSuccess(true);
      setTimeout(() => setCreateSuccess(false), 2000);
      fetchSentences();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async (id) => {
    if (!editValue.trim()) return;
    setSavingId(id);
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: editValue.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEditingId(null);
      fetchSentences();
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDeleteConfirmId(null);
      fetchSentences();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAudioUpload = async (id, file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".m4a") && file.type !== "audio/x-m4a" && file.type !== "audio/mp4") {
      setUploadError({ id, msg: "Please upload an M4A file only." });
      setTimeout(() => setUploadError(null), 3000);
      return;
    }
    setUploadingId(id);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/${id}/audio`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUploadSuccess(id);
      setTimeout(() => setUploadSuccess(null), 2500);
      fetchSentences();
    } catch (e) {
      setUploadError({ id, msg: e.message });
      setTimeout(() => setUploadError(null), 3000);
    } finally {
      setUploadingId(null);
    }
  };

  const filtered = sentences.filter(s =>
    s.sentence?.toLowerCase().includes(search.toLowerCase()) ||
    String(s.id).includes(search)
  );

  const stats = {
    total: sentences.length,
    withAudio: sentences.filter(s => s.hasAudio).length,
    withoutAudio: sentences.filter(s => !s.hasAudio).length,
  };

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&family=Noto+Sans+Sinhala:wght@300;400;500;600&display=swap');
        * { font-family: 'Nunito', sans-serif; box-sizing: border-box; }
        .sinhala { font-family: 'Noto Sans Sinhala', sans-serif; }
        .font-display { font-family: 'Nunito', sans-serif; font-weight: 800; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-border { 0%,100% { border-color: #d1d5db; } 50% { border-color: #111; } }
        .anim-fade-up { animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
        .spinner { width:16px; height:16px; border:2px solid #e5e7eb; border-top-color:#111; border-radius:50%; animation: spin 0.7s linear infinite; display:inline-block; vertical-align:middle; }
        .spinner-white { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation: spin 0.7s linear infinite; display:inline-block; vertical-align:middle; }
        .row-hover { transition: background 0.18s; }
        .row-hover:hover { background: #f9fafb; }
        .drop-zone-active { border-color: #111 !important; background: #f9fafb !important; animation: pulse-border 1s ease infinite; }
        input[type="text"], input[type="search"], textarea {
          outline: none;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          font-family: 'Nunito', sans-serif;
          transition: border-color 0.18s;
          width: 100%;
          background: white;
        }
        input[type="text"]:focus, input[type="search"]:focus, textarea:focus { border-color: #111; }
        .btn { cursor: pointer; border: none; border-radius: 10px; font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 13px; padding: 9px 18px; transition: all 0.18s; display:inline-flex; align-items:center; gap:6px; }
        .btn-black { background: #111; color: white; }
        .btn-black:hover { background: #333; }
        .btn-black:disabled { background: #9ca3af; cursor: not-allowed; }
        .btn-outline { background: white; color: #111; border: 1.5px solid #e5e7eb; }
        .btn-outline:hover { border-color: #111; }
        .btn-danger { background: white; color: #dc2626; border: 1.5px solid #fee2e2; }
        .btn-danger:hover { background: #fee2e2; }
        .btn-danger-solid { background: #dc2626; color: white; }
        .btn-danger-solid:hover { background: #b91c1c; }
        .btn-sm { padding: 6px 13px; font-size: 12px; border-radius: 8px; }
        .badge { display:inline-flex; align-items:center; gap:4px; padding: 3px 10px; border-radius: 999px; font-size:11px; font-weight:700; letter-spacing:0.03em; }
        .badge-green { background:#dcfce7; color:#166534; }
        .badge-gray { background:#f3f4f6; color:#6b7280; }
        .badge-red { background:#fee2e2; color:#dc2626; }
        .card { background: white; border: 1.5px solid #e5e7eb; border-radius: 20px; padding: 24px; }
        .stat-card { background: #f9fafb; border: 1.5px solid #f3f4f6; border-radius: 16px; padding: 20px 24px; }
        .drop-zone { border: 2px dashed #e5e7eb; border-radius: 12px; padding: 14px; text-align: center; cursor: pointer; transition: all 0.18s; background: #fafafa; }
        .drop-zone:hover { border-color: #9ca3af; background: white; }
        .toast { position:fixed; bottom:24px; right:24px; background:#111; color:white; padding:12px 20px; border-radius:14px; font-size:13px; font-weight:600; z-index:999; animation: fadeUp 0.3s ease; box-shadow: 0 8px 30px rgba(0,0,0,0.18); }
        .toast-error { background: #dc2626; }
        .divider { border: none; border-top: 1.5px solid #f3f4f6; margin: 0; }
        .confirm-box { background: #fff7ed; border: 1.5px solid #fed7aa; border-radius: 14px; padding: 14px 18px; margin-top: 10px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
      `}</style>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 40px" }}>


        {/* ─── ERROR BANNER ─── */}
        {error && (
          <div style={{ background: "#fee2e2", border: "1.5px solid #fca5a5", borderRadius: 14, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <span style={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>{error}</span>
            </div>
            <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
        )}

        {/* ─── STATS ─── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 10 }}>
          <button onClick={fetchSentences} className="btn btn-outline btn-sm" disabled={loading}>
            {loading ? <span className="spinner" /> : (
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            )}
            Refresh
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }} className="anim-fade-up">
          {[
            { label: "Total sentences", value: stats.total, icon: "📝" },
            { label: "With audio", value: stats.withAudio, icon: "🔊" },
            { label: "Missing audio", value: stats.withoutAudio, icon: "⚠️" },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div className="font-display" style={{ fontSize: 28 }}>{loading ? "—" : s.value}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ─── ADD SENTENCE ─── */}
        <div className="card anim-fade-up" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 30, height: 30, background: "#111", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            </div>
            <div className="font-display" style={{ fontSize: 16 }}>Add New Sentence</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              className="sinhala"
              placeholder="සිංහල වාක්‍යයක් ඇතුළු කරන්න..."
              value={newSentence}
              onChange={e => setNewSentence(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleCreate(); }}
              style={{ fontSize: 16 }}
            />
            <button
              className="btn btn-black"
              onClick={handleCreate}
              disabled={creating || !newSentence.trim()}
              style={{ whiteSpace: "nowrap", minWidth: 110 }}
            >
              {creating ? <span className="spinner-white" /> : (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              )}
              {creating ? "Adding…" : "Add"}
            </button>
          </div>
          {createSuccess && (
            <div style={{ marginTop: 10, fontSize: 13, color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              Sentence added successfully!
            </div>
          )}
        </div>

        {/* ─── SEARCH ─── */}
        <div style={{ marginBottom: 16, position: "relative" }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="search"
            placeholder="Search sentences or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>

        {/* ─── SENTENCES TABLE ─── */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 130px 200px 120px", gap: 12, padding: "14px 20px", background: "#f9fafb", borderBottom: "1.5px solid #f3f4f6" }}>
            {["ID", "Sentence", "Status", "Audio Upload", "Actions"].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#9ca3af" }}>
              <div className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }} />
              <div style={{ marginTop: 12, fontSize: 13 }}>Loading sentences…</div>
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#9ca3af" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 14 }}>{search ? "No sentences match your search." : "No sentences yet. Add one above."}</div>
            </div>
          )}

          {/* Rows */}
          {!loading && filtered.map((s, idx) => (
            <div key={s.id}>
              {idx > 0 && <hr className="divider" />}
              <div
                className="row-hover"
                style={{ display: "grid", gridTemplateColumns: "60px 1fr 130px 200px 120px", gap: 12, padding: "16px 20px", alignItems: "start" }}
              >
                {/* ID */}
                <div style={{ paddingTop: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", background: "#f3f4f6", padding: "3px 8px", borderRadius: 8 }}>#{s.id}</span>
                </div>

                {/* Sentence */}
                <div>
                  {editingId === s.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <input
                        type="text"
                        className="sinhala"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleEdit(s.id); if (e.key === "Escape") setEditingId(null); }}
                        autoFocus
                        style={{ fontSize: 15 }}
                      />
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-black btn-sm" onClick={() => handleEdit(s.id)} disabled={savingId === s.id}>
                          {savingId === s.id ? <span className="spinner-white" /> : "Save"}
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <span className="sinhala" style={{ fontSize: 17, lineHeight: 1.6 }}>{s.sentence}</span>
                  )}
                </div>

                {/* Status */}
                <div style={{ paddingTop: 4 }}>
                  {s.hasAudio ? (
                    <span className="badge badge-green">
                      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      Has audio
                    </span>
                  ) : (
                    <span className="badge badge-gray">No audio</span>
                  )}
                </div>

                {/* Audio Upload */}
                <div>
                  <input
                    type="file"
                    accept=".m4a,audio/x-m4a,audio/mp4"
                    style={{ display: "none" }}
                    ref={el => fileInputRefs.current[s.id] = el}
                    onChange={e => handleAudioUpload(s.id, e.target.files[0])}
                  />
                  <div
                    className={`drop-zone${dragOverId === s.id ? " drop-zone-active" : ""}`}
                    onClick={() => fileInputRefs.current[s.id]?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOverId(s.id); }}
                    onDragLeave={() => setDragOverId(null)}
                    onDrop={e => {
                      e.preventDefault();
                      setDragOverId(null);
                      const file = e.dataTransfer.files[0];
                      handleAudioUpload(s.id, file);
                    }}
                  >
                    {uploadingId === s.id ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <span className="spinner" />
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>Uploading…</span>
                      </div>
                    ) : uploadSuccess === s.id ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>Uploaded!</span>
                      </div>
                    ) : uploadError?.id === s.id ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        <span style={{ fontSize: 10, color: "#dc2626", fontWeight: 700 }}>{uploadError.msg}</span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>{s.hasAudio ? "Replace .m4a" : "Drop .m4a here"}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 2 }}>
                  {editingId !== s.id && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => { setEditingId(s.id); setEditValue(s.sentence); setDeleteConfirmId(null); }}
                    >
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      Edit
                    </button>
                  )}
                  {deleteConfirmId !== s.id && editingId !== s.id && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => { setDeleteConfirmId(s.id); setEditingId(null); }}
                    >
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Delete confirm */}
              {deleteConfirmId === s.id && (
                <div style={{ padding: "0 20px 16px" }}>
                  <div className="confirm-box">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#ea580c" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                    <span style={{ flex: 1, fontSize: 13, color: "#92400e", fontWeight: 600 }}>
                      Delete sentence #{s.id}? This cannot be undone.
                    </span>
                    <button
                      className="btn btn-danger-solid btn-sm"
                      onClick={() => handleDelete(s.id)}
                      disabled={deletingId === s.id}
                    >
                      {deletingId === s.id ? <span className="spinner-white" /> : "Yes, delete"}
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Footer count */}
          {!loading && filtered.length > 0 && (
            <div style={{ padding: "12px 20px", background: "#f9fafb", borderTop: "1.5px solid #f3f4f6", fontSize: 12, color: "#9ca3af", display: "flex", justifyContent: "space-between" }}>
              <span>{filtered.length} sentence{filtered.length !== 1 ? "s" : ""} {search ? "found" : "total"}</span>
              <span>{stats.withAudio} / {stats.total} have audio</span>
            </div>
          )}
        </div>


      </main>
    </div>
  );
}