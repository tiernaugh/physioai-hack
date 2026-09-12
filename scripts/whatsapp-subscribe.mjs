// Run yourself after entering your Meta values in .env. Never prints tokens.
const env = process.env;
for (const key of ['WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_API_VERSION', 'WHATSAPP_BUSINESS_ACCOUNT_ID']) {
  if (!env[key] || env[key].startsWith('PASTE_')) {
    console.error(`Fill ${key} in .env first.`);
    process.exit(1);
  }
}
if (!/^v\d+\.\d+$/.test(env.WHATSAPP_API_VERSION) || !/^\d+$/.test(env.WHATSAPP_BUSINESS_ACCOUNT_ID)) {
  console.error('Use a Graph API version such as v23.0 and a numeric WhatsApp Business Account ID.');
  process.exit(1);
}
try {
  const response = await fetch(`https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_BUSINESS_ACCOUNT_ID}/subscribed_apps`, {
    method: 'POST', headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}` },
    redirect: 'error', signal: AbortSignal.timeout(30000),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    console.error(`Subscription failed (HTTP ${response.status}, Meta error ${result.error?.code ?? 'unknown'}). Check the token, its permissions and the Business Account ID.`);
    process.exitCode = 1;
  } else console.log('Success: your Meta app is subscribed to this WhatsApp Business Account.');
} catch {
  console.error('Could not reach Meta. Check your Internet connection and retry.');
  process.exitCode = 1;
}
