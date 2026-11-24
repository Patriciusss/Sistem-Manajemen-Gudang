export const pick = (value) => (Array.isArray(value) ? value[0] : value);

export const withParams = (params) => `?${new URLSearchParams(Object.entries(params).filter(([, value]) => value))}`;
