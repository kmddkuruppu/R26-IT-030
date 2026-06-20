const API_BASE = "http://localhost:8080/api/auth";

export async function registerStudent(formData) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
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

  return res.json(); // AuthResponse { token, id, firstName, lastName, username, grade, school }
}

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

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}