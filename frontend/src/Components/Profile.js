import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Check, Camera, Pencil, LogOut,
  Trash2, Bell, Lock, User, GraduationCap,
  Calendar, School, X, BookOpen
} from "lucide-react";
import { getToken, getStudent, saveAuth, logout } from "../services/authService";
import { getCameraConsent, setCameraConsent } from "../utils/cameraConsent";

const API = "http://localhost:8080/api/student";

function Avatar({ src, initials, size = 100, onClick }) {
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      {src ? (
        <img
          src={src} alt="Profile"
          className="rounded-full object-cover ring-4 ring-white shadow-xl"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="rounded-full bg-black flex items-center justify-center ring-4 ring-white shadow-xl"
          style={{ width: size, height: size, fontSize: size * 0.33, fontWeight: 700, color: "white" }}
        >
          {initials}
        </div>
      )}
      {onClick && (
        <button
          onClick={onClick}
          className="absolute bottom-0.5 right-0.5 w-8 h-8 rounded-full bg-black flex items-center justify-center ring-2 ring-white shadow-md hover:bg-gray-800 active:scale-95 transition-all"
          aria-label="Change profile photo"
        >
          <Camera size={14} color="white" />
        </button>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, onEdit, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.28 }}
      className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors group"
    >
      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0">
        <Icon size={17} className="text-black" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`text-[14px] font-medium truncate ${value ? "text-black" : "text-gray-300 italic font-normal"}`}>
          {value || "Not provided"}
        </p>
      </div>
      {onEdit && (
        <button
          onClick={onEdit}
          className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:text-white hover:border-black text-gray-400"
          aria-label={`Edit ${label}`}
        >
          <Pencil size={13} />
        </button>
      )}
    </motion.div>
  );
}

// ── Camera Engagement Tracking toggle ─────────────────────────────
// Global, parent-controlled setting (see mage recommendation): one switch
// here applies to every game in GamifiedLearningPage — no per-game camera
// prompts. Default is OFF (opt-in only). Reads/writes via cameraConsent.js
// (localStorage), so GameWithAutoCamera picks up the current value the
// next time any game is opened.
function CameraConsentToggle({ enabled, onToggle, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.28 }}
      className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100"
    >
      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0">
        <Camera size={17} className="text-black" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
          Camera Engagement Tracking
        </p>
        <p className="text-[12.5px] text-gray-500 leading-relaxed">
          Uses the camera to understand how engaged your child feels while
          playing. The camera view is never shown or recorded — only a live
          engagement score is saved. Turn this on only with a parent's
          permission.
        </p>
      </div>
      <button
        onClick={onToggle}
        aria-pressed={enabled}
        aria-label="Toggle camera engagement tracking"
        className={`relative shrink-0 w-12 h-7 rounded-full transition-colors ${enabled ? "bg-black" : "bg-gray-300"}`}
      >
        <span
          className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all"
          style={{ left: enabled ? 22 : 2 }}
        />
      </button>
    </motion.div>
  );
}

function EditField({ label, value, onChange, type = "text", isSelect = false, options = [] }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${focused ? "text-black" : "text-gray-400"}`}>
        {label}
      </label>
      {isSelect ? (
        <div className="relative">
          <select
            value={value ?? ""}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`w-full bg-white rounded-xl px-4 py-3 text-[14px] text-black outline-none appearance-none cursor-pointer border-2 transition-colors ${focused ? "border-black" : "border-gray-200"}`}
          >
            <option value="">Select grade…</option>
            {options.map(o => <option key={o} value={o}>{`Grade ${o}`}</option>)}
          </select>
        </div>
      ) : (
        <input
          type={type} value={value ?? ""}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`bg-white rounded-xl px-4 py-3 text-[14px] text-black outline-none border-2 transition-colors ${focused ? "border-black" : "border-gray-200"}`}
        />
      )}
    </div>
  );
}

function DeleteModal({ onConfirm, onCancel, loading, error }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-gray-100"
      >
        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={22} className="text-black" />
        </div>
        <h3 className="text-[17px] font-bold text-black text-center mb-2">Delete account?</h3>
        <p className="text-[13.5px] text-gray-500 text-center leading-relaxed mb-4">
          This will permanently delete your account and all data. This action cannot be undone.
        </p>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 flex items-start gap-3 overflow-hidden"
            >
              <X size={15} className="text-black shrink-0 mt-0.5" />
              <p className="text-[12.5px] text-black leading-relaxed">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-2xl bg-gray-100 text-black text-[14px] font-semibold hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-black text-white text-[14px] font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60">
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ── Local auth state (sourced from localStorage via authService) ──
  const [student, setStudent] = useState(() => getStudent());
  const token = getToken();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token || !student) {
      navigate("/register");
    }
  }, [token, student, navigate]);

  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [form, setForm] = useState({
    firstName: student?.firstName || "",
    lastName: student?.lastName || "",
    age: student?.age || "",
    grade: student?.grade || "",
    school: student?.school || "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ── Camera engagement tracking consent (global toggle) ─────────────
  const [cameraTrackingEnabled, setCameraTrackingEnabled] = useState(() => getCameraConsent());
  const handleToggleCameraTracking = () => {
    const next = !cameraTrackingEnabled;
    setCameraTrackingEnabled(next);
    setCameraConsent(next);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fullName = `${student?.firstName || ""} ${student?.lastName || ""}`.trim();
  const initials = fullName
    ? fullName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const openEdit = () => {
    setForm({
      firstName: student?.firstName || "",
      lastName: student?.lastName || "",
      age: student?.age || "",
      grade: student?.grade || "",
      school: student?.school || "",
    });
    setSaveError("");
    setEditMode(true);
  };

  // Photo is preview-only — no backend persistence yet.
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfileImage(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`${API}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          age: form.age ? Number(form.age) : null,
          grade: form.grade ? Number(form.grade) : null,
          school: form.school,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      // Keep localStorage (and therefore Navbar) in sync with the new details.
      const updatedStudent = {
        ...student,
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        grade: data.grade,
        school: data.school,
      };
      saveAuth({ token, ...updatedStudent });
      setStudent(updatedStudent);
      setEditMode(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete account ──────────────────────────────────────────────
  // Previously this swallowed all failures (network error, 403, 404, 500,
  // FK constraint violation on the backend, etc.) into a silent modal
  // close — so a failed delete looked identical to nothing happening.
  // Now: on failure we surface the real status/message inside the modal
  // and keep it open so the user (and you, debugging) can actually see
  // what went wrong instead of guessing.
  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`${API}/profile`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        let message = `Delete failed (status ${res.status})`;
        try {
          const text = await res.text();
          if (text) {
            try {
              const parsed = JSON.parse(text);
              message = parsed.message || parsed.error || message;
            } catch {
              message = text;
            }
          }
        } catch {
          // ignore body-read errors, fall back to status message
        }
        throw new Error(message);
      }

      logout();
      navigate("/");
    } catch (err) {
      setDeleteError(
        err instanceof TypeError
          ? "Couldn't reach the server. Check your connection and try again."
          : err.message
      );
    } finally {
      setDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDelete(false);
    setDeleteError("");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Avoid flashing the page before the redirect-check above kicks in.
  if (!token || !student) return null;

  return (
    <div className="min-h-screen bg-white">
      <input
        ref={fileInputRef} type="file" accept="image/*"
        className="hidden" onChange={handleImageChange}
      />

      <AnimatePresence>
        {showDelete && (
          <DeleteModal
            onConfirm={handleDelete}
            onCancel={closeDeleteModal}
            loading={deleting}
            error={deleteError}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!editMode ? (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="max-w-md mx-auto px-5 pb-14"
          >
            <div className="relative pt-14 pb-7 text-center">
              <div className="absolute top-10 right-2 opacity-[0.04] pointer-events-none select-none">
                <GraduationCap size={72} />
              </div>

              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 220, delay: 0.06 }}
                className="flex justify-center mb-4 relative z-10"
              >
                <Avatar
                  src={profileImage} initials={initials} size={108}
                  onClick={() => fileInputRef.current?.click()}
                />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.13 }}
                className="text-[22px] font-bold text-black tracking-tight"
              >
                {fullName || "Your Name"}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.19 }}
                className="flex items-center justify-center gap-2 mt-2 flex-wrap"
              >
                <span className="inline-flex items-center gap-1.5 bg-black text-white text-[11px] font-bold px-3 py-1 rounded-full">
                  <GraduationCap size={10} />
                  {student?.grade ? `Grade ${student.grade}` : "Grade not set"}
                </span>
                <span className="inline-flex items-center bg-gray-100 text-gray-600 text-[11px] font-semibold px-3 py-1 rounded-full border border-gray-200">
                  Student
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.23 }}
                className="text-[13px] text-gray-400 mt-2"
              >
                @{student?.username}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="grid grid-cols-3 gap-3 mb-8"
            >
              {[
                { icon: Pencil, label: "Edit profile",  action: openEdit    },
                { icon: Bell,   label: "Notifications", action: () => {}    },
                { icon: Lock,   label: "Privacy",       action: () => {}    },
              ].map(({ icon: Icon, label, action }) => (
                <button key={label} onClick={action}
                  className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-black active:scale-95 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:border-black transition-colors">
                    <Icon size={17} className="text-black group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500 group-hover:text-white transition-colors leading-tight text-center">{label}</span>
                </button>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
              className="mb-5">
              <p className="text-[11px] font-bold text-black uppercase tracking-widest mb-3 px-1">Account</p>
              <div className="flex flex-col gap-2">
                <InfoCard icon={User}     label="First Name" value={student?.firstName} onEdit={openEdit} delay={0.29} />
                <InfoCard icon={User}     label="Last Name"  value={student?.lastName}  onEdit={openEdit} delay={0.32} />
                <InfoCard icon={BookOpen} label="Username"   value={student?.username}                     delay={0.35} />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.31 }}
              className="mb-8">
              <p className="text-[11px] font-bold text-black uppercase tracking-widest mb-3 px-1">School Details</p>
              <div className="flex flex-col gap-2">
                <InfoCard icon={Calendar}      label="Age"   value={student?.age}                       onEdit={openEdit} delay={0.34} />
                <InfoCard icon={GraduationCap} label="Grade" value={student?.grade ? `Grade ${student.grade}` : ""} onEdit={openEdit} delay={0.37} />
                <InfoCard icon={School}        label="School" value={student?.school}                    onEdit={openEdit} delay={0.40} />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
              className="mb-8">
              <p className="text-[11px] font-bold text-black uppercase tracking-widest mb-3 px-1">Privacy</p>
              <div className="flex flex-col gap-2">
                <CameraConsentToggle
                  enabled={cameraTrackingEnabled}
                  onToggle={handleToggleCameraTracking}
                  delay={0.39}
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.43 }}
              className="flex flex-col gap-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 text-[14px] font-semibold hover:border-black hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                <LogOut size={16} /> Log out
              </button>
              <button
                onClick={() => setShowDelete(true)}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 text-[14px] font-semibold hover:border-black hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                <Trash2 size={16} /> Delete account
              </button>
            </motion.div>
          </motion.div>

        ) : (

          <motion.div
            key="edit"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.22 }}
            className="max-w-md mx-auto px-5 pb-14"
          >
            <div className="flex items-center gap-3 pt-5 pb-7">
              <button
                onClick={() => { setEditMode(false); setSaveError(""); }}
                className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all"
                aria-label="Back"
              >
                <ArrowLeft size={18} className="text-black" />
              </button>
              <h1 className="flex-1 text-[20px] font-bold text-black">Edit Profile</h1>
              <button
                onClick={handleSave} disabled={saving}
                className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-60"
                aria-label="Save"
              >
                <Check size={18} color="white" />
              </button>
            </div>

            <div className="flex flex-col items-center pb-8">
              <div className="relative">
                <Avatar
                  src={profileImage} initials={initials} size={96}
                  onClick={() => fileInputRef.current?.click()}
                />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white rounded-full px-2.5 py-0.5 shadow-sm border border-gray-200 whitespace-nowrap">
                  <span className="text-[10px] font-semibold text-black">Change photo</span>
                </div>
              </div>
              <p className="text-[12px] text-gray-400 mt-5">JPG, PNG or WebP · Preview only, not saved yet</p>
            </div>

            <AnimatePresence>
              {saveError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 flex items-center gap-3 overflow-hidden"
                >
                  <X size={15} className="text-black shrink-0" />
                  <p className="text-[13px] text-black">{saveError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-6">
              <p className="text-[11px] font-bold text-black uppercase tracking-widest mb-3 px-1">Personal Info</p>
              <div className="bg-gray-50 rounded-3xl p-5 flex flex-col gap-5 border border-gray-100">
                <EditField label="First name" value={form.firstName} onChange={v => set("firstName", v)} />
                <EditField label="Last name"  value={form.lastName}  onChange={v => set("lastName", v)} />
                <EditField label="Age"        value={form.age}       onChange={v => set("age", v)} type="number" />
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[11px] font-bold text-black uppercase tracking-widest mb-3 px-1">School Details</p>
              <div className="bg-gray-50 rounded-3xl p-5 flex flex-col gap-5 border border-gray-100">
                <EditField label="School" value={form.school} onChange={v => set("school", v)} />
                <EditField label="Grade"  value={form.grade}  onChange={v => set("grade", v)} isSelect options={[1,2,3,4,5]} />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={handleSave} disabled={saving}
              className="w-full bg-black text-white py-4 rounded-2xl text-[15px] font-bold tracking-wide disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Check size={17} />
              {saving ? "Saving…" : "Save Changes"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}