export const derivePassword = (id: string) => `CARE${String(id).trim().toUpperCase()}2026`;
export const authenticate = (id: string, pw: string) => !!id && !!pw && pw === derivePassword(id);
