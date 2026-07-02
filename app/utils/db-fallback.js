const fallbackStores = new Map();

function getStore(tableName) {
  if (!fallbackStores.has(tableName)) {
    fallbackStores.set(tableName, new Map());
  }
  return fallbackStores.get(tableName);
}

function makeId(tableName) {
  return `${tableName}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function normalizeUserId(userId) {
  if (userId === undefined || userId === null || userId === '') return null;
  return userId;
}

function cloneRecord(record) {
  return JSON.parse(JSON.stringify(record));
}

export function isSchemaFallbackError(error) {
  const message = String(error?.message || error || '');
  const code = String(error?.code || '');
  return code === '42P01' || message.includes('Could not find the table') || message.includes('does not exist') || message.includes('relation') || message.includes('column') || message.includes('schema cache');
}

export function createFallbackRecord(tableName, userId, payload = {}) {
  const store = getStore(tableName);
  const recordId = payload.id || makeId(tableName);
  const record = {
    id: recordId,
    created_at: new Date().toISOString(),
    ...payload,
    user_id: normalizeUserId(payload.user_id ?? userId)
  };
  store.set(recordId, record);
  return cloneRecord(record);
}

export function listFallbackRecords(tableName, predicate = () => true) {
  const store = getStore(tableName);
  return Array.from(store.values())
    .filter(predicate)
    .map(cloneRecord)
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

export function getFallbackRecord(tableName, predicate = () => true) {
  const store = getStore(tableName);
  const entry = Array.from(store.values()).find(predicate);
  return entry ? cloneRecord(entry) : null;
}

export function updateFallbackRecord(tableName, recordId, updates = {}) {
  const store = getStore(tableName);
  const existing = store.get(recordId);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...updates,
    id: recordId,
    updated_at: new Date().toISOString()
  };
  store.set(recordId, updated);
  return cloneRecord(updated);
}

export function deleteFallbackRecord(tableName, recordId) {
  const store = getStore(tableName);
  const existing = store.get(recordId);
  if (!existing) return false;
  store.delete(recordId);
  return true;
}

export function clearFallbackStore(tableName) {
  fallbackStores.delete(tableName);
}
