import React, { useState, useEffect, useCallback } from 'react';
import { getServerExperimentSummary, getAllExperimentEntries, getExperimentExportUrl } from '../services/experimentLogService';

// NOTE ON ACCESS: this page is intentionally not linked from anywhere in
// the student-facing UI — students should never see or choose their
// Adaptive/Static group (see assignExperimentGroup() in LetterTracing.js
// for why). It's reachable only by URL (see the route in App.js).
// If this project has a login/ProtectedRoute set up, wrap this route with
// it so only teachers/researchers can open it — right now it's open the
// same way /add-sentence and /add-tracing-data already are.

const cardStyle = {
  padding: '16px 18px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff',
};
const labelStyle = {
  fontFamily: 'DM Sans,sans-serif', fontSize: 11, textTransform: 'uppercase',
  letterSpacing: '0.08em', color: '#888', marginBottom: 6,
};
const bigNumberStyle = { fontFamily: 'Playfair Display,serif', fontSize: 28, fontWeight: 800, color: '#111' };

function StatCard({ label, value, suffix = '' }) {
  return (
    <div style={cardStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={bigNumberStyle}>{value ?? '—'}{value != null ? suffix : ''}</div>
    </div>
  );
}

function ModeComparisonRow({ label, adaptiveValue, staticValue, suffix = '' }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
      <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: '#888' }}>{label}</span>
      <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 15, fontWeight: 600, color: '#111' }}>
        {adaptiveValue ?? '—'}{adaptiveValue != null ? suffix : ''}
      </span>
      <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 15, fontWeight: 600, color: '#111' }}>
        {staticValue ?? '—'}{staticValue != null ? suffix : ''}
      </span>
    </div>
  );
}

export default function ResearchDashboard() {
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [entriesError, setEntriesError] = useState(null);

  const loadSummary = useCallback(() => {
    setSummaryLoading(true);
    setSummaryError(null);
    getServerExperimentSummary()
      .then(setSummary)
      .catch(err => setSummaryError(err.message || 'Could not load summary'))
      .finally(() => setSummaryLoading(false));
  }, []);

  const loadEntries = useCallback(() => {
    setEntriesLoading(true);
    setEntriesError(null);
    getAllExperimentEntries()
      .then(data => setEntries(data || []))
      .catch(err => setEntriesError(err.message || 'Could not load entries'))
      .finally(() => setEntriesLoading(false));
  }, []);

  const refreshAll = useCallback(() => { loadSummary(); loadEntries(); }, [loadSummary, loadEntries]);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: 'DM Sans,sans-serif', color: '#111', paddingTop: 40 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800&family=DM+Sans:wght@300;400;500&display=swap');
      `}</style>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 32, fontWeight: 800, margin: 0 }}>
              Research Dashboard
            </h1>
            <p style={{ fontSize: 13, color: '#888', marginTop: 6, maxWidth: 560 }}>
              Adaptive vs Static scaffolding — pooled across every device that has practiced Letter Tracing.
              Not linked anywhere in the student app; researcher/teacher use only.
            </p>
          </div>
          <button onClick={refreshAll}
            style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid #111', background: '#111',
              color: '#fff', fontFamily: 'DM Sans,sans-serif', fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
            Refresh
          </button>
        </div>

        {/* ═══ TOP-LINE STATS ═══ */}
        {summaryLoading && <p style={{ fontSize: 13, color: '#888', marginTop: 20 }}>Loading summary…</p>}
        {summaryError && (
          <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 10, background: '#fef2f2',
            border: '1px solid #fca5a5', color: '#dc2626', fontSize: 13 }}>
            Couldn't load summary: {summaryError}
          </div>
        )}

        {summary && !summaryError && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 24, marginBottom: 28 }}>
              <StatCard label="Total attempts" value={summary.totalEntries} />
              <StatCard label="Devices" value={summary.distinctDevices} />
              <StatCard label="Adaptive attempts" value={summary.adaptiveCount} />
              <StatCard label="Static attempts" value={summary.staticCount} />
            </div>

            <div style={{ ...cardStyle, marginBottom: 28 }}>
              <div style={labelStyle}>Adaptive vs Static comparison</div>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr', gap: 12, padding: '10px 0', borderBottom: '2px solid #111' }}>
                <span/>
                <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1a56db', fontWeight: 700 }}>Adaptive</span>
                <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', fontWeight: 700 }}>Static (control)</span>
              </div>
              <ModeComparisonRow label="Avg score" adaptiveValue={summary.adaptiveAvgScore} staticValue={summary.staticAvgScore} suffix="%" />
              <ModeComparisonRow label="Avg duration" adaptiveValue={summary.adaptiveAvgDurationMs != null ? Math.round(summary.adaptiveAvgDurationMs / 1000) : null}
                staticValue={summary.staticAvgDurationMs != null ? Math.round(summary.staticAvgDurationMs / 1000) : null} suffix="s" />
              <ModeComparisonRow label="Avg warnings" adaptiveValue={summary.adaptiveAvgWarnings} staticValue={summary.staticAvgWarnings} />
            </div>
          </>
        )}

        <a href={getExperimentExportUrl()} target="_blank" rel="noreferrer"
          style={{ display: 'inline-block', padding: '11px 22px', borderRadius: 8, border: '1px solid #111',
            background: '#111', color: '#fff', textDecoration: 'none', fontFamily: 'DM Sans,sans-serif',
            fontSize: 13, fontWeight: 500, marginBottom: 32 }}>
          Download full CSV (every device, every attempt)
        </a>

        {/* ═══ RAW ENTRIES TABLE ═══ */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 20, fontWeight: 700, margin: 0 }}>
            Recent attempts
          </h2>
          <span style={{ fontSize: 12, color: '#aaa' }}>{entries.length} loaded</span>
        </div>

        {entriesLoading && <p style={{ fontSize: 13, color: '#888' }}>Loading entries…</p>}
        {entriesError && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: '#fef2f2',
            border: '1px solid #fca5a5', color: '#dc2626', fontSize: 13 }}>
            Couldn't load entries: {entriesError}
          </div>
        )}

        {!entriesLoading && !entriesError && (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
            {entries.length === 0 ? (
              <p style={{ padding: 20, fontSize: 13, color: '#888' }}>No attempts logged yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'DM Sans,sans-serif' }}>
                  <thead>
                    <tr style={{ background: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
                      {['Mode', 'Letter', 'Category', 'Score', 'Difficulty', 'Warnings', 'Duration (s)', 'Device'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#888', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.slice(0, 100).map(e => (
                      <tr key={e.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '8px 12px', color: e.mode === 'adaptive' ? '#1a56db' : '#888', fontWeight: 600, textTransform: 'capitalize' }}>{e.mode}</td>
                        <td style={{ padding: '8px 12px', fontFamily: '"Noto Sans Sinhala",serif', fontSize: 14 }}>{e.letter}</td>
                        <td style={{ padding: '8px 12px' }}>{e.category}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{e.score}%</td>
                        <td style={{ padding: '8px 12px' }}>{e.difficulty != null ? e.difficulty.toFixed(2) : '—'}</td>
                        <td style={{ padding: '8px 12px' }}>{e.warningCount}</td>
                        <td style={{ padding: '8px 12px' }}>{(e.durationMs / 1000).toFixed(1)}</td>
                        <td style={{ padding: '8px 12px', color: '#aaa', fontSize: 11 }}>{e.deviceId?.slice(0, 8)}…</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {entries.length > 100 && (
                  <p style={{ padding: '10px 16px', fontSize: 11, color: '#aaa' }}>
                    Showing the first 100 of {entries.length} — use the CSV export above for the full set.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}