// DETERMINISTIC AUTH — password = "CARE" + hospital_id + "2026"
// Example: H001 → CAREH0012026
export const derivePassword = (id) => `CARE${String(id).trim().toUpperCase()}2026`;
export const authenticate   = (id, pw) => !!id && !!pw && pw === derivePassword(id);
