export function cleanUrlParam(value) {
  if (!value) return value;
  return String(value).replace(/^["']|["']$/g, "");
}

export function updateSearchParam(searchParams, key, value) {
  const newParams = new URLSearchParams(searchParams);

  if (value === null || value === undefined || value === "") {
    newParams.delete(key);
  } else {
    newParams.set(key, value);
  }

  return newParams;
}
