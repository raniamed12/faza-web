// Client HTTP minimal pour l’API FAZA. Le jeton de connexion est gardé dans le navigateur.
const KEY = "faza.token";
export const getToken = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
export const setToken = (t) => { try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch { /* navigation privée */ } };

async function request(method, path, body) {
  const token = getToken();
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw Object.assign(new Error("Le serveur ne répond pas. Vérifie qu’il est lancé (npm run dev)."), { status: 0 });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Une erreur est survenue."), { status: res.status, fields: data.fields || {} });
  return data;
}

export const api = {
  get: (p) => request("GET", p),
  post: (p, b) => request("POST", p, b || {}),
  put: (p, b) => request("PUT", p, b || {}),
  patch: (p, b) => request("PATCH", p, b || {}),
  del: (p) => request("DELETE", p),
};

// Réduit une image dans le navigateur avant l’envoi (1200 px max, JPEG), puis la téléverse.
export function resizeImage(file, max = 1200) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) return reject(new Error("Ce fichier n’est pas une image."));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("Impossible de lire cette image."));
    img.src = url;
  });
}
export async function uploadImage(file) {
  const dataUrl = await resizeImage(file);
  const { url } = await api.post("/uploads", { dataUrl });
  return url;
}
