import { useState, useEffect, useCallback } from "react";
import {
  getAchievementDefinitions, createAchievementDefinition,
  updateAchievementDefinition, deleteAchievementDefinition,
} from "../services/apiService";

// ═══════════════════════════════════════════════════════════════════
// AchievementsAdminTab — 4th tab for GameDataAdmin.js
// Field names match backend model/AchievementDefinition.java EXACTLY:
// code, titleEn, titleSi, descriptionEn, descriptionSi, icon, tier,
// criteriaType, criteriaValue, criteriaGameId, sortOrder, active
//
// INTEGRATION (in GameDataAdmin.js):
//   1. import AchievementsAdminTab from "./AchievementsAdminTab";
//   2. const TABS = ["Letters", "Words", "Line Connect", "Achievements"];
//   3. tab icon line:  tab === "Achievements" ? "🏆 " : ...
//   4. {activeTab === "Achievements" && <AchievementsAdminTab showToast={showToast} />}
// ═══════════════════════════════════════════════════════════════════

const CRITERIA_TYPES = [
  { value: "TOTAL_SCORE",        label: "Total Score reaches X" },
  { value: "GAME_MASTERY",       label: "Best stars in a specific game >= X" },
  { value: "GAMES_EXPLORED",     label: "Played X different games" },
  { value: "ALL_GAMES_MASTERED", label: "3 stars in every game" },
  { value: "STREAK_DAYS",        label: "Played X days in a row" },
  { value: "PERFECT_SESSION",    label: "100% score in one session" },
  { value: "LOW_MOVES",          label: "Finished a game in <= X moves" },
  { value: "POSITIVE_MOOD",      label: "X happy reactions recorded" },
];

const TIERS = ["BRONZE", "SILVER", "GOLD"];
const TIER_COLOR = { BRONZE: "#c98b3a", SILVER: "#9aa5b1", GOLD: "#eab308" };

const GAME_IDS = [
  "memory-match", "speed-quiz", "letter-hunt", "letter-puzzle",
  "word-builder", "word-unscramble", "missing-letter", "line-connect",
];

const NEEDS_GAME_ID = ["GAME_MASTERY", "LOW_MOVES"];

const blank = {
  code: "", titleEn: "", titleSi: "", descriptionEn: "", descriptionSi: "",
  icon: "🏆", tier: "BRONZE", criteriaType: "TOTAL_SCORE", criteriaValue: 100,
  criteriaGameId: "", sortOrder: 0, active: true,
};

const AchievementFormFields = ({ f, setF }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 10, marginBottom: 10 }}>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Code * (unique, no spaces)</div>
      <input value={f.code} onChange={e => setF(p => ({ ...p, code: e.target.value.toLowerCase().replace(/\s+/g, "_") }))} placeholder="master" />
    </div>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Icon (emoji)</div>
      <input value={f.icon} onChange={e => setF(p => ({ ...p, icon: e.target.value }))} placeholder="🏆" style={{ fontSize: 18 }} />
    </div>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Tier</div>
      <select value={f.tier} onChange={e => setF(p => ({ ...p, tier: e.target.value }))}>
        {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
    </div>

    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Title (English) *</div>
      <input value={f.titleEn} onChange={e => setF(p => ({ ...p, titleEn: e.target.value }))} placeholder="Master Learner" />
    </div>
    <div style={{ gridColumn: "span 2" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>නම (සිංහල) *</div>
      <input className="sinhala" value={f.titleSi} onChange={e => setF(p => ({ ...p, titleSi: e.target.value }))} placeholder="ප්‍රධාන ඉගෙන්නා" style={{ fontSize: 16 }} />
    </div>

    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Description (English)</div>
      <input value={f.descriptionEn} onChange={e => setF(p => ({ ...p, descriptionEn: e.target.value }))} placeholder="Earned 500+ total points" />
    </div>
    <div style={{ gridColumn: "span 2" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>විස්තරය (සිංහල)</div>
      <input className="sinhala" value={f.descriptionSi} onChange={e => setF(p => ({ ...p, descriptionSi: e.target.value }))} placeholder="මුළු ලකුණු 500ක් ලබා ගත්තා" style={{ fontSize: 14 }} />
    </div>

    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Criteria Type</div>
      <select value={f.criteriaType} onChange={e => setF(p => ({ ...p, criteriaType: e.target.value }))}>
        {CRITERIA_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
    </div>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Threshold value (X)</div>
      <input type="number" value={f.criteriaValue} onChange={e => setF(p => ({ ...p, criteriaValue: parseInt(e.target.value) || 0 }))} />
    </div>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Order</div>
      <input type="number" value={f.sortOrder} onChange={e => setF(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} />
    </div>

    {NEEDS_GAME_ID.includes(f.criteriaType) && (
      <div style={{ gridColumn: "span 3" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>Which game? (required)</div>
        <select value={f.criteriaGameId} onChange={e => setF(p => ({ ...p, criteriaGameId: e.target.value }))}>
          <option value="">— select game —</option>
          {GAME_IDS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
    )}

    <div style={{ gridColumn: "span 3", display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
      <input type="checkbox" checked={f.active} onChange={e => setF(p => ({ ...p, active: e.target.checked }))} style={{ width: "auto" }} />
      <span style={{ fontSize: 12, color: "#6b7280" }}>Active (checked automatically after every game session)</span>
    </div>
  </div>
);

export default function AchievementsAdminTab({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [form, setForm] = useState(blank);
  const [editForm, setEditForm] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await getAchievementDefinitions()); } catch { showToast("Failed to load achievements", "error"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.code || !form.titleEn || !form.titleSi) return showToast("Code, Title (EN/SI) required", "error");
    if (NEEDS_GAME_ID.includes(form.criteriaType) && !form.criteriaGameId) return showToast("Select a game for this criteria type", "error");
    setSaving(true);
    try {
      await createAchievementDefinition(form);
      showToast("Achievement added!"); setShowAdd(false); setForm(blank); load();
    } catch { showToast("Failed to add achievement", "error"); }
    setSaving(false);
  };

  const handleUpdate = async (id) => {
    setSaving(true);
    try {
      await updateAchievementDefinition(id, editForm);
      showToast("Achievement updated!"); setEditId(null); load();
    } catch { showToast("Failed to update", "error"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteAchievementDefinition(id);
      showToast("Achievement deleted!"); setDeleteId(null); load();
    } catch { showToast("Failed to delete", "error"); }
    setDeleting(false);
  };

  return (
    <div className="anim">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>Achievements</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>{items.length} achievements · auto-checked after every game session</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={load}>{loading ? <span className="spin" /> : "↻"} Refresh</button>
          <button className="btn btn-black btn-sm" onClick={() => setShowAdd(s => !s)}>+ Add Achievement</button>
        </div>
      </div>

      {showAdd && (
        <div className="card anim" style={{ padding: 20, marginBottom: 20, background: "#f9fafb" }}>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>Add New Achievement</div>
          <AchievementFormFields f={form} setF={setForm} />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-black btn-sm" onClick={handleAdd} disabled={saving}>
              {saving ? <span className="spin-w" /> : null} Add Achievement
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => { setShowAdd(false); setForm(blank); }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
          <span className="spin" style={{ width: 24, height: 24 }} /><br />Loading achievements…
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>No achievements yet.</div>
      ) : (
        <div className="card">
          {items.map((a, i) => (
            <div key={a.id}>
              {i > 0 && <hr className="divider" />}
              {editId === a.id ? (
                <div style={{ padding: "14px 18px", background: "#f9fafb" }}>
                  <AchievementFormFields f={editForm} setF={setEditForm} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-black btn-sm" onClick={() => handleUpdate(a.id)} disabled={saving}>
                      {saving ? <span className="spin-w" /> : null} Save
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {a.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{a.titleEn}</span>
                      <span className="sinhala" style={{ fontSize: 13, color: "#6b7280" }}>· {a.titleSi}</span>
                      <span className="badge" style={{ background: `${TIER_COLOR[a.tier]}22`, color: TIER_COLOR[a.tier] }}>{a.tier}</span>
                      {!a.active && <span className="badge badge-gray">inactive</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                      {CRITERIA_TYPES.find(c => c.value === a.criteriaType)?.label ?? a.criteriaType} — target: {a.criteriaValue}
                      {a.criteriaGameId ? ` (${a.criteriaGameId})` : ""} · code: {a.code}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-outline btn-xs" onClick={() => { setEditId(a.id); setEditForm({ ...a }); setDeleteId(null); }}>Edit</button>
                    <button className="btn btn-red btn-xs" onClick={() => { setDeleteId(a.id); setEditId(null); }}>Delete</button>
                  </div>
                </div>
              )}
              {deleteId === a.id && (
                <div style={{ padding: "10px 18px", background: "#fff7ed", borderTop: "1.5px solid #fed7aa" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, color: "#92400e", fontWeight: 600 }}>Delete "{a.titleEn}"? Students who earned it will lose it from the badge list.</span>
                    <button className="btn btn-red-solid btn-xs" onClick={() => handleDelete(a.id)} disabled={deleting}>{deleting ? <span className="spin-w" /> : null} Delete</button>
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
