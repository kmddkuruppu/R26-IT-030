const API_BASE = "http://localhost:8080/api/auth";

/* ═══════════════════════════════════════════════════
   REGISTER
═══════════════════════════════════════════════════ */
export async function registerStudent(formData) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
      email: formData.email,
      age: Number(formData.age),
      grade: formData.grade,
      school: formData.school,
      password: formData.password,
    }),
  });

  if (!res.ok) {
    const errBody = await safeJson(res);
    throw new Error(errBody?.message || "Registration failed. Try a different username.");
  }

  return res.json(); // AuthResponse { token, id, firstName, lastName, username, age, grade, school }
}

/* ═══════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════ */
export async function loginStudent(formData) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: formData.username,
      password: formData.password,
    }),
  });

  if (!res.ok) {
    const errBody = await safeJson(res);
    throw new Error(errBody?.message || "Invalid username or password.");
  }

  return res.json();
}

/* ═══════════════════════════════════════════════════
   FORGOT PASSWORD — Step 1: send OTP to email
═══════════════════════════════════════════════════ */
export async function forgotPassword(email) {
  const res = await fetch(`${API_BASE}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const errBody = await safeJson(res);
    throw new Error(errBody?.message || "Failed to send OTP. Check the email and try again.");
  }

  return res.text();
}

/* ═══════════════════════════════════════════════════
   FORGOT PASSWORD — Step 2: verify the OTP code
═══════════════════════════════════════════════════ */
export async function verifyOtp(email, otpCode) {
  const res = await fetch(`${API_BASE}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otpCode }),
  });

  if (!res.ok) {
    const errBody = await safeJson(res);
    throw new Error(errBody?.message || "Invalid OTP.");
  }

  return res.text();
}

/* ═══════════════════════════════════════════════════
   FORGOT PASSWORD — Step 3: set the new password
═══════════════════════════════════════════════════ */
export async function resetPassword(email, otpCode, newPassword) {
  const res = await fetch(`${API_BASE}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otpCode, newPassword }),
  });

  if (!res.ok) {
    const errBody = await safeJson(res);
    throw new Error(errBody?.message || "Password reset failed.");
  }

  return res.text();
}

/* ═══════════════════════════════════════════════════
   LOCAL STORAGE HELPERS
═══════════════════════════════════════════════════ */
export function saveAuth(authResponse) {
  localStorage.setItem("token", authResponse.token);
  localStorage.setItem("student", JSON.stringify({
    id: authResponse.id,
    firstName: authResponse.firstName,
    lastName: authResponse.lastName,
    username: authResponse.username,
    age: authResponse.age,
    grade: authResponse.grade,
    school: authResponse.school,
  }));
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getStudent() {
  const s = localStorage.getItem("student");
  return s ? JSON.parse(s) : null;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("student");
}

/* ═══════════════════════════════════════════════════
   INTERNAL HELPER
═══════════════════════════════════════════════════ */
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}