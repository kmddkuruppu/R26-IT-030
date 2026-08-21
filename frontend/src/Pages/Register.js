import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoSrc from "../Logo01.png";
import {
  registerStudent,
  loginStudent,
  saveAuth,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../services/authService";

/* ═══════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@300;400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  * { font-family: 'Nunito', sans-serif; }
  body { background: #f8f8f8; overflow: hidden; }

  @keyframes heroSlideIn {
    from { transform: translateY(-100%); opacity: 0; }
    to   { transform: translateY(0);     opacity: 1; }
  }

  @keyframes formRise {
    from { transform: translateY(40px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  @keyframes logoBounce {
    0%   { opacity: 0; transform: scale(0.4) translateY(-20px); }
    55%  { transform: scale(1.12) translateY(4px); }
    75%  { transform: scale(0.96) translateY(-2px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }

  @keyframes sinFloat {
    0%   { transform: translateY(-10px) translateX(0) rotate(var(--rot)); opacity: 0; }
    15%  { opacity: var(--op); }
    85%  { opacity: var(--op); }
    100% { transform: translateY(110px) translateX(var(--drift)) rotate(calc(var(--rot) + 20deg)); opacity: 0; }
  }

  @keyframes shimmer {
    0%   { transform: translateX(-150%) skewX(-20deg); }
    100% { transform: translateX(250%) skewX(-20deg); }
  }

  @keyframes glowRing {
    0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
    50%     { box-shadow: 0 0 0 18px rgba(255,255,255,0.07); }
  }

  @keyframes lineGrow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  @keyframes fieldIn {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  @keyframes successScale {
    0%   { opacity: 0; transform: scale(0.85); }
    60%  { transform: scale(1.03); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes checkDraw    { from { stroke-dashoffset: 188; } to { stroke-dashoffset: 0; } }
  @keyframes checkStroke  { from { stroke-dashoffset: 60;  } to { stroke-dashoffset: 0; } }
  @keyframes countDown {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: 157; }
  }
  @keyframes textPop {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes grain {
    0%,100% { transform: translate(0,0); }
    25% { transform: translate(-1%,-2%); }
    50% { transform: translate(1%,1%); }
    75% { transform: translate(-1%,1%); }
  }

  @keyframes wipeIn {
    from { clip-path: inset(0 100% 0 0); }
    to   { clip-path: inset(0 0% 0 0); }
  }
  @keyframes wipeOut {
    from { clip-path: inset(0 0% 0 0); opacity: 1; }
    to   { clip-path: inset(0 0% 0 100%); opacity: 0; }
  }

  .f-wrap { position: relative; padding-bottom: 2px; border-bottom: 1.5px solid #e0e0e0; }
  .f-bar {
    position: absolute; bottom: -1px; left: 0;
    width: 100%; height: 2px;
    background: #0a0a0a;
    transform: scaleX(0); transform-origin: left;
    transition: transform .3s cubic-bezier(.4,0,.2,1);
  }
  .f-wrap:focus-within .f-bar { transform: scaleX(1); }
  .f-wrap:focus-within label { color: #0a0a0a !important; }

  .g-btn {
    flex: 1; position: relative; overflow: hidden;
    border: 1.5px solid #e0e0e0;
    background: #fff; color: #0a0a0a;
    font-family: 'Nunito', sans-serif;
    font-size: .9rem; font-weight: 700;
    padding: .6rem 0; cursor: pointer;
    transition: border-color .2s, transform .15s;
    border-radius: 4px;
  }
  .g-btn::before {
    content: ''; position: absolute; inset: 0;
    background: #0a0a0a;
    transform: scaleY(0); transform-origin: bottom;
    transition: transform .26s cubic-bezier(.4,0,.2,1);
    border-radius: inherit;
  }
  .g-btn span { position: relative; z-index: 1; display: block; transition: color .2s; }
  .g-btn:hover::before, .g-btn.active::before { transform: scaleY(1); }
  .g-btn:hover span, .g-btn.active span { color: #fff; }
  .g-btn.active { border-color: #0a0a0a; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.15); }

  .sub-btn {
    position: relative; overflow: hidden; cursor: pointer;
    width: 100%; background: #0a0a0a; color: #fff;
    border: none; padding: 1rem;
    font-family: 'Nunito', sans-serif;
    font-size: .95rem; font-weight: 800;
    letter-spacing: .08em; border-radius: 6px;
    transition: background .2s, transform .15s, box-shadow .2s;
  }
  .sub-btn:hover { background: #1c1c1c; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.2); }
  .sub-btn:active { transform: translateY(0); }
  .sub-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; box-shadow: none; }

  .signin-link {
    background: transparent;
    border: 1.5px solid #0a0a0a;
    color: #0a0a0a;
    cursor: pointer;
    font-family: 'Nunito', sans-serif;
    font-size: .82rem; font-weight: 700;
    letter-spacing: .06em;
    padding: .35rem .9rem; border-radius: 20px;
    transition: background .2s, color .2s, transform .15s;
    display: inline-block;
  }
  .signin-link:hover { background: #0a0a0a; color: #fff; transform: translateY(-1px); }

  .text-link {
    background: none; border: none; cursor: pointer;
    color: #0a0a0a; font-weight: 800;
    font-family: 'Nunito',sans-serif; font-size: .78rem;
    text-decoration: underline; text-underline-offset: 3px;
    padding: 0;
  }

  input:-webkit-autofill, input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 100px #fff inset !important;
    -webkit-text-fill-color: #0a0a0a !important;
  }

  .err-msg {
    color: #d33;
    font-size: .82rem;
    font-weight: 600;
    text-align: center;
    background: rgba(211,51,51,.08);
    border: 1px solid rgba(211,51,51,.25);
    border-radius: 6px;
    padding: .55rem .8rem;
    animation: fieldIn .3s ease both;
  }
  .info-msg {
    color: #0a0a0a;
    font-size: .8rem;
    font-weight: 600;
    text-align: center;
    background: rgba(10,10,10,.05);
    border: 1px solid rgba(10,10,10,.12);
    border-radius: 6px;
    padding: .55rem .8rem;
    animation: fieldIn .3s ease both;
  }

  .scroll-panel::-webkit-scrollbar { width: 3px; }
  .scroll-panel::-webkit-scrollbar-track { background: transparent; }
  .scroll-panel::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
`;

/* ═══════════════════════════════════════════════════
   SINHALA LETTERS POOL
═══════════════════════════════════════════════════ */
const SINHALA_CHARS = [
  "අ","ආ","ඇ","ඈ","ඉ","ඊ","උ","ඌ","ක","ඛ","ග","ඝ","ච","ජ","ට","ඩ",
  "ත","ද","ධ","න","ප","බ","භ","ම","ය","ර","ල","ව","ශ","ස","හ","ළ",
  "ිකා","ිදා","ිත","ිල","ිය","ොල","ිස","ිව","ිශ","ිහ"
];

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  char: SINHALA_CHARS[i % SINHALA_CHARS.length],
  left: `${3 + (i * 3.4) % 94}%`,
  top: `${5 + (i * 7.3) % 80}%`,
  size: 11 + (i % 5) * 4,
  delay: (i * 0.38) % 6,
  duration: 5 + (i % 4) * 1.5,
  rot: `${-15 + (i % 7) * 5}deg`,
  drift: `${-20 + (i % 5) * 10}px`,
  op: 0.12 + (i % 4) * 0.04,
}));

/* ═══════════════════════════════════════════════════
   FIELD COMPONENT
═══════════════════════════════════════════════════ */
function Field({ label, name, type = "text", value, onChange, placeholder, delay = 0, maxLength }) {
  const [show, setShow] = useState(false);
  const [pwShow, setPwShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);
  const isPass = type === "password";

  return (
    <div style={{
      opacity:   show ? 1 : 0,
      transform: show ? "none" : "translateY(18px)",
      transition: "opacity .45s ease, transform .45s ease",
    }}>
      <div className="f-wrap">
        <label style={{
          display: "block",
          fontFamily: "'Nunito',sans-serif",
          fontSize: ".63rem", fontWeight: 700,
          letterSpacing: ".14em", textTransform: "uppercase",
          color: "#bbb", marginBottom: ".2rem",
          transition: "color .2s",
        }}>{label}</label>
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type={isPass ? (pwShow ? "text" : "password") : type}
            name={name} value={value} onChange={onChange}
            placeholder={placeholder} autoComplete="off"
            maxLength={maxLength}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              fontFamily: "'Nunito',sans-serif",
              fontSize: ".88rem", fontWeight: 500,
              color: "#0a0a0a", padding: ".42rem 0 .45rem",
            }}
          />
          {isPass && (
            <button type="button" onClick={() => setPwShow(v => !v)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", padding: "0 0 0 6px", transition: "color .2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#0a0a0a"}
              onMouseLeave={e => e.currentTarget.style.color = "#ccc"}>
              {pwShow
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          )}
        </div>
        <div className="f-bar" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   HERO PANEL  — taller (320px) + bigger logo (130px)
═══════════════════════════════════════════════════ */
function HeroPanel({ logoReady, subtitle }) {
  return (
    <div style={{
      height: 320,
      background: "#0a0a0a",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 4rem",
      animation: "heroSlideIn .8s cubic-bezier(.4,0,.2,1) forwards",
      flexShrink: 0,
    }}>

      <div style={{
        position: "absolute", inset: "-50%",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
        backgroundSize: "256px 256px",
        animation: "grain 8s steps(1) infinite",
        pointerEvents: "none", zIndex: 0,
      }}/>

      <div style={{
        position: "absolute", top: 0, left: 0,
        width: "40%", height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,.04), transparent)",
        animation: "shimmer 4s 1s ease-in-out infinite",
        pointerEvents: "none", zIndex: 1,
      }}/>

      {PARTICLES.map(p => (
        <div key={p.id} style={{
          position: "absolute",
          left: p.left, top: p.top,
          fontFamily: "'Noto Sans Sinhala', sans-serif",
          fontSize: p.size,
          color: "rgba(255,255,255,1)",
          "--rot": p.rot,
          "--drift": p.drift,
          "--op": p.op,
          animation: `sinFloat ${p.duration}s ${p.delay}s ease-in-out infinite`,
          pointerEvents: "none",
          zIndex: 1,
          userSelect: "none",
          opacity: 0,
        }}>
          {p.char}
        </div>
      ))}

      {[0,1,2,3,4].map(i => (
        <div key={i} style={{
          position: "absolute",
          width: "1px", height: "300%",
          background: `rgba(255,255,255,${.018 - i * .003})`,
          transform: `rotate(20deg) translateX(${-200 + i * 120}px)`,
          top: "-100%", left: "50%",
          pointerEvents: "none", zIndex: 1,
        }}/>
      ))}

      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: "2.4rem" }}>
        <div style={{
          animation: logoReady ? "logoBounce .9s .4s cubic-bezier(.34,1.3,.64,1) both" : "none",
          borderRadius: "50%",
        }}>
          <img
            src={logoSrc}
            alt="Logo"
            style={{
              height: 130,
              width: "auto", objectFit: "contain",
              filter: "drop-shadow(0 6px 32px rgba(0,0,0,.55))",
            }}
          />
        </div>

        <div style={{
          width: 1, height: 80,
          background: "rgba(255,255,255,.15)",
          animation: "fieldIn .5s .9s ease both",
        }}/>

        <div style={{ animation: "fieldIn .55s .9s ease both" }}>
          <p style={{
            fontFamily: "'Nunito',sans-serif",
            fontSize: ".65rem", fontWeight: 700,
            letterSpacing: ".22em", textTransform: "uppercase",
            color: "rgba(255,255,255,.4)", marginBottom: ".35rem",
          }}>Student Portal</p>
          <h2 style={{
            fontFamily: "'Nunito',sans-serif",
            fontSize: "2.3rem", fontWeight: 900,
            color: "#fff", letterSpacing: "-.01em",
            lineHeight: 1.1,
          }}>{subtitle}</h2>
          <p style={{
            fontFamily: "'Noto Sans Sinhala',sans-serif",
            fontSize: ".85rem", fontWeight: 400,
            color: "rgba(255,255,255,.35)", marginTop: ".45rem",
            letterSpacing: ".04em",
          }}>ශිෂ්‍ය ලියාපදිංචි පෝරමය</p>
        </div>
      </div>

      <div style={{
        position: "relative", zIndex: 2, textAlign: "right",
        animation: "fieldIn .6s 1.1s ease both",
      }}>
        <p style={{
          fontFamily: "'Noto Sans Sinhala',sans-serif",
          fontSize: "4rem", fontWeight: 800,
          color: "rgba(255,255,255,.06)",
          lineHeight: 1, userSelect: "none",
          letterSpacing: "-.02em",
        }}>ඉගෙනීම</p>
        <p style={{
          fontFamily: "'Nunito',sans-serif",
          fontSize: ".65rem", fontWeight: 600,
          letterSpacing: ".2em", textTransform: "uppercase",
          color: "rgba(255,255,255,.2)", marginTop: ".35rem",
        }}>Education · දැනුම</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   LOGIN PAGE
═══════════════════════════════════════════════════ */
function LoginPage({ onBack, onForgotPassword }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [logoReady, setLogoReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
    const t = setTimeout(() => setLogoReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  const change = e => {
    if (error) setError("");
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username.trim() || !form.password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const authResponse = await loginStudent(form);
      saveAuth(authResponse);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      opacity: show ? 1 : 0,
      animation: show ? "wipeIn .55s cubic-bezier(.4,0,.2,1) forwards" : "none",
    }}>
      <HeroPanel logoReady={logoReady} subtitle="Welcome Back" />

      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        background: "#f8f8f8", padding: "2.5rem",
        animation: "formRise .6s .35s ease both",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ marginBottom: "2rem", animation: "fieldIn .5s .4s ease both" }}>
            <p style={{
              fontFamily: "'Nunito',sans-serif", fontSize: ".65rem",
              fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase",
              color: "#bbb", marginBottom: ".4rem",
            }}>Welcome back</p>
            <h1 style={{
              fontFamily: "'Nunito',sans-serif", fontSize: "2rem", fontWeight: 900,
              color: "#0a0a0a", letterSpacing: "-.02em",
            }}>Sign In</h1>
            <div style={{
              height: 3, width: 36, background: "#0a0a0a", marginTop: ".6rem",
              transformOrigin: "left", animation: "lineGrow .5s .65s ease both",
            }}/>
          </div>

          <form onSubmit={submit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
              <Field label="Username" name="username" value={form.username} onChange={change} placeholder="kamal_p123" delay={500}/>
              <Field label="Password" name="password" type="password" value={form.password} onChange={change} placeholder="••••••••" delay={580}/>

              <div style={{ display: "flex", justifyContent: "flex-end", animation: "fieldIn .5s .62s ease both" }}>
                <button type="button" onClick={onForgotPassword}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontFamily: "'Nunito',sans-serif", fontSize: ".75rem", fontWeight: 600, padding: 0 }}>
                  Forgot password?
                </button>
              </div>

              {error && <p className="err-msg">{error}</p>}

              <div style={{ animation: "fieldIn .5s .7s ease both" }}>
                <button type="submit" className="sub-btn" disabled={loading}>
                  {loading
                    ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                        <span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }}/>
                        Signing in…
                      </span>
                    : "Sign In →"
                  }
                </button>
              </div>

              <p style={{
                fontFamily: "'Nunito',sans-serif", fontSize: ".78rem",
                color: "#bbb", textAlign: "center",
                animation: "fieldIn .5s .8s ease both",
              }}>
                Don't have an account?{" "}
                <button type="button" onClick={onBack} className="text-link">
                  Register
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   FORGOT PASSWORD PAGE (email → OTP → new password)
═══════════════════════════════════════════════════ */
function ForgotPasswordPage({ onBack, onDone }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [show, setShow] = useState(false);
  const [logoReady, setLogoReady] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
    const t = setTimeout(() => setLogoReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setInfo("OTP sent. Please check your email.");
      setStep("otp");
    } catch (err) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");

    if (otpCode.trim().length !== 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(email, otpCode.trim());
      setStep("newPassword");
    } catch (err) {
      setError(err.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");

    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, otpCode.trim(), newPassword);
      onDone();
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(""); setInfo("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setInfo("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    email: { heading: "Reset Password", sub: "Forgot your password" },
    otp: { heading: "Verify Code", sub: "Check your inbox" },
    newPassword: { heading: "New Password", sub: "Almost done" },
  };

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      opacity: show ? 1 : 0,
      animation: show ? "wipeIn .55s cubic-bezier(.4,0,.2,1) forwards" : "none",
    }}>
      <HeroPanel logoReady={logoReady} subtitle="Reset Password" />

      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        background: "#f8f8f8", padding: "2.5rem",
        animation: "formRise .6s .35s ease both",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ marginBottom: "2rem", animation: "fieldIn .5s .4s ease both" }}>
            <p style={{
              fontFamily: "'Nunito',sans-serif", fontSize: ".65rem",
              fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase",
              color: "#bbb", marginBottom: ".4rem",
            }}>{titles[step].sub}</p>
            <h1 style={{
              fontFamily: "'Nunito',sans-serif", fontSize: "2rem", fontWeight: 900,
              color: "#0a0a0a", letterSpacing: "-.02em",
            }}>{titles[step].heading}</h1>
            <div style={{
              height: 3, width: 36, background: "#0a0a0a", marginTop: ".6rem",
              transformOrigin: "left", animation: "lineGrow .5s .65s ease both",
            }}/>
          </div>

          {step === "email" && (
            <form onSubmit={handleSendOtp}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
                <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: ".82rem", color: "#999", lineHeight: 1.5, animation: "fieldIn .5s .45s ease both" }}>
                  Enter the email address linked to your account. We'll send you a 6-digit code to reset your password.
                </p>

                <Field label="Email" name="email" type="email" value={email}
                  onChange={e => { if (error) setError(""); setEmail(e.target.value); }}
                  placeholder="you@example.com" delay={500}/>

                {error && <p className="err-msg">{error}</p>}

                <div style={{ animation: "fieldIn .5s .7s ease both" }}>
                  <button type="submit" className="sub-btn" disabled={loading}>
                    {loading
                      ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                          <span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }}/>
                          Sending OTP…
                        </span>
                      : "Send OTP →"
                    }
                  </button>
                </div>

                <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: ".78rem", color: "#bbb", textAlign: "center", animation: "fieldIn .5s .8s ease both" }}>
                  Remembered your password?{" "}
                  <button type="button" onClick={onBack} className="text-link">Sign In</button>
                </p>
              </div>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
                <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: ".82rem", color: "#999", lineHeight: 1.5, animation: "fieldIn .5s .45s ease both" }}>
                  We've sent a 6-digit code to <strong style={{ color: "#0a0a0a" }}>{email}</strong>. Enter it below — it expires in 10 minutes.
                </p>

                <Field label="OTP Code" name="otpCode" type="text" value={otpCode}
                  onChange={e => { if (error) setError(""); setOtpCode(e.target.value.replace(/\D/g, "")); }}
                  placeholder="000000" delay={500} maxLength={6}/>

                {info && <p className="info-msg">{info}</p>}
                {error && <p className="err-msg">{error}</p>}

                <div style={{ animation: "fieldIn .5s .7s ease both" }}>
                  <button type="submit" className="sub-btn" disabled={loading}>
                    {loading
                      ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                          <span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }}/>
                          Verifying…
                        </span>
                      : "Verify Code →"
                    }
                  </button>
                </div>

                <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: ".78rem", color: "#bbb", textAlign: "center", animation: "fieldIn .5s .8s ease both" }}>
                  Didn't get the code?{" "}
                  <button type="button" onClick={handleResendOtp} className="text-link" disabled={loading}>Resend</button>
                </p>
              </div>
            </form>
          )}

          {step === "newPassword" && (
            <form onSubmit={handleResetPassword}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
                <Field label="New Password" name="newPassword" type="password" value={newPassword}
                  onChange={e => { if (error) setError(""); setNewPassword(e.target.value); }}
                  placeholder="••••••••" delay={400}/>

                <Field label="Confirm Password" name="confirmPassword" type="password" value={confirmPassword}
                  onChange={e => { if (error) setError(""); setConfirmPassword(e.target.value); }}
                  placeholder="••••••••" delay={460}/>

                {error && <p className="err-msg">{error}</p>}

                <div style={{ animation: "fieldIn .5s .6s ease both" }}>
                  <button type="submit" className="sub-btn" disabled={loading}>
                    {loading
                      ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                          <span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }}/>
                          Resetting…
                        </span>
                      : "Reset Password →"
                    }
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SUCCESS SCREEN  (redirect on a short delay)
═══════════════════════════════════════════════════ */
function SuccessScreen({ name, grade, school, message, redirectTo, onRedirect }) {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => {
        if (onRedirect) onRedirect();
        else navigate(redirectTo || "/home");
      }, 500);
    }, 2800);
    return () => clearTimeout(t);
  }, [navigate, redirectTo, onRedirect]);

  return (
    <div style={{
      height: "100vh", background: "#0a0a0a",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: "1.8rem", position: "relative", overflow: "hidden",
      animation: leaving ? "wipeOut .5s ease forwards" : "successScale .7s cubic-bezier(.34,1.2,.64,1) forwards",
    }}>
      <div style={{
        position: "absolute", inset: "-50%",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
        backgroundSize: "256px 256px", animation: "grain 8s steps(1) infinite", pointerEvents: "none",
      }}/>

      {PARTICLES.slice(0, 16).map(p => (
        <div key={p.id} style={{
          position: "absolute", left: p.left, top: p.top,
          fontFamily: "'Noto Sans Sinhala',sans-serif", fontSize: p.size,
          color: "rgba(255,255,255,1)",
          "--rot": p.rot, "--drift": p.drift, "--op": p.op,
          animation: `sinFloat ${p.duration}s ${p.delay}s ease-in-out infinite`,
          pointerEvents: "none", zIndex: 1, userSelect: "none", opacity: 0,
        }}>{p.char}</div>
      ))}

      <img src={logoSrc} alt="" style={{
        height: 85, objectFit: "contain", position: "relative", zIndex: 2,
        filter: "drop-shadow(0 4px 20px rgba(0,0,0,.6))",
        animation: "logoBounce .9s ease both",
      }}/>

      <div style={{ position: "relative", zIndex: 2 }}>
        <svg width="90" height="90" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="28" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2"/>
          <circle cx="30" cy="30" r="28" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="2"
            strokeDasharray="188"
            style={{ animation: "checkDraw .9s cubic-bezier(.4,0,.2,1) forwards" }}/>
          <polyline points="17,31 26,40 43,22" fill="none"
            stroke="rgba(255,255,255,.9)" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="60"
            style={{ animation: "checkStroke .5s .7s ease forwards", strokeDashoffset: 60 }}/>
        </svg>
      </div>

      <div style={{ textAlign: "center", position: "relative", zIndex: 2, animation: "textPop .6s .4s ease both", opacity: 0 }}>
        {message ? (
          <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: "1.8rem", fontWeight: 900, color: "#fff", letterSpacing: "-.01em" }}>
            {message}
          </p>
        ) : (
          <>
            <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: "2.1rem", fontWeight: 900, color: "#fff", letterSpacing: "-.01em" }}>
              Welcome to නැණ තක්සලාව
            </p>
            <p style={{ fontFamily: "'Noto Sans Sinhala',sans-serif", fontSize: ".9rem", color: "rgba(255,255,255,.45)", marginTop: ".3rem" }}>
              ඔබට සාදරයෙන් පිළිගනිමු
            </p>
            <p style={{ fontFamily: "'Nunito',sans-serif", color: "rgba(255,255,255,.5)", fontSize: ".82rem", marginTop: ".6rem", fontWeight: 500 }}>
              {name} · Grade {grade} · {school}
            </p>
          </>
        )}
      </div>

    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN REGISTRATION PAGE
═══════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage]       = useState("register");
  const [form, setForm]       = useState({ firstName:"", lastName:"", username:"", email:"", age:"", grade:null, school:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [ready, setReady]     = useState(false);
  const [logoReady, setLogoReady] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setReady(true));
    const t = setTimeout(() => setLogoReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  const change = e => {
    if (error) setError("");
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.firstName.trim()) return "Please enter your first name.";
    if (!form.lastName.trim())  return "Please enter your last name.";
    if (!form.username.trim()) return "Please choose a username.";
    if (!form.email.trim())    return "Please enter your email address.";
    if (!form.age || Number(form.age) <= 0) return "Please enter a valid age.";
    if (!form.grade) return "Please select a grade.";
    if (!form.school.trim()) return "Please enter your school.";
    if (!form.password || form.password.length < 4) return "Password must be at least 4 characters.";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const authResponse = await registerStudent(form);
      saveAuth(authResponse);
      setLoading(false);
      setPage("success");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  if (page === "login")
    return <><style>{STYLES}</style>
      <LoginPage onBack={() => setPage("register")} onForgotPassword={() => setPage("forgotPassword")}/>
    </>;

  if (page === "forgotPassword")
    return <><style>{STYLES}</style>
      <ForgotPasswordPage onBack={() => setPage("login")} onDone={() => setPage("passwordResetDone")}/>
    </>;

  if (page === "passwordResetDone")
    return <><style>{STYLES}</style>
      <SuccessScreen message="Password Reset!" onRedirect={() => setPage("login")}/>
    </>;

  if (page === "success") return (
    <>
      <style>{STYLES}</style>
      <SuccessScreen
        name={`${form.firstName} ${form.lastName}`}
        grade={form.grade}
        school={form.school}
      />
    </>
  );

  return (
    <>
      <style>{STYLES}</style>
      <div style={{
        height: "100vh", display: "flex", flexDirection: "column",
        background: "#f8f8f8",
        opacity: ready ? 1 : 0,
        transition: "opacity .3s ease",
      }}>

        <HeroPanel logoReady={logoReady} subtitle="Create Account" />

        <div style={{
          flex: 1, overflow: "hidden",
          display: "flex", alignItems: "stretch",
          animation: "formRise .65s .3s ease both",
        }}>
          <div className="scroll-panel" style={{
            flex: 1, overflowY: "auto",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "2rem 5rem",
          }}>
            <div style={{ width: "100%", maxWidth: 760 }}>
              <form onSubmit={submit}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.35rem" }}>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem" }}>
                    <Field label="First Name" name="firstName" value={form.firstName} onChange={change} placeholder="Kamal"  delay={400}/>
                    <Field label="Last Name"  name="lastName"  value={form.lastName}  onChange={change} placeholder="Perera" delay={460}/>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "2.5rem" }}>
                    <Field label="Username" name="username" value={form.username} onChange={change} placeholder="kamal_p123" delay={500}/>
                    <Field label="Age"      name="age"      type="number" value={form.age} onChange={change} placeholder="12" delay={520}/>
                  </div>

                  <Field label="Email" name="email" type="email" value={form.email} onChange={change} placeholder="kamal@example.com" delay={560}/>

                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr", gap: "2.5rem", alignItems: "end" }}>
                    <Field label="School" name="school" value={form.school} onChange={change} placeholder="Royal College, Colombo" delay={620}/>
                    <div style={{ animation: "fieldIn .5s 680ms ease both" }}>
                      <label style={{
                        display: "block", fontFamily: "'Nunito',sans-serif",
                        fontSize: ".63rem", fontWeight: 700,
                        letterSpacing: ".14em", textTransform: "uppercase",
                        color: "#bbb", marginBottom: ".5rem",
                      }}>Grade</label>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[1,2,3,4,5].map(g => (
                          <button key={g} type="button"
                            className={`g-btn${form.grade === g ? " active" : ""}`}
                            onClick={() => setForm(p => ({ ...p, grade: g }))}>
                            <span>{g}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Field label="Password" name="password" type="password" value={form.password} onChange={change} placeholder="••••••••" delay={740}/>

                  {error && <p className="err-msg">{error}</p>}

                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr auto",
                    gap: "1.2rem", alignItems: "center",
                    marginTop: ".3rem",
                    animation: "fieldIn .5s 820ms ease both",
                  }}>
                    <button type="submit" className="sub-btn" disabled={loading}>
                      {loading
                        ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                            <span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }}/>
                            Creating Account…
                          </span>
                        : "Create Account →"
                      }
                    </button>

                    <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                      <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: ".72rem", color: "#bbb", marginBottom: ".35rem" }}>
                        Already registered?
                      </p>
                      <button type="button" className="signin-link" onClick={() => setPage("login")}>
                        Sign In
                      </button>
                    </div>
                  </div>

                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}