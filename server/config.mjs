export const requiredLive = ['WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_APP_SECRET',
  'WHATSAPP_VERIFY_TOKEN', 'WHATSAPP_API_VERSION', 'WHATSAPP_PATIENT_MAP', 'ADMIN_TOKEN'];
export function patientMap(raw) {
  const map = JSON.parse(raw || '{}');
  if (!map || Array.isArray(map) || typeof map !== 'object' || !Object.keys(map).length) throw new Error('Configure at least one WhatsApp sender');
  for (const [sender, patient] of Object.entries(map)) {
    if (!/^\d{7,15}$/.test(sender) || typeof patient !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(patient)) throw new Error('Invalid WhatsApp patient mapping');
  }
  return map;
}
