module.exports = async (host = '', log_entry = 'undefined', errors) => {
  const sourceKey = '69b04f3f-2f6c-47d5-95e5-13822d5dafaf' // TODO: RICO: use env variables
  const apiKey = 'JKwPv5oP8YBY' // TODO: RICO: use env variables
  const metadata = Array.isArray(errors)
    ? { errors: { ...errors.reduce((obj, error, idx) => ({ ...obj, [idx]: error }), {}) } }
    : { errors }
  // TODO: RICO: this are test logs. Edit it with actual credentials
  return fetch("https://api.logflare.app/logs", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
      "User-Agent": `Cloudflare Worker via ${host}`,
    },
    body: JSON.stringify({
      source: sourceKey, // TODO: RICO: handle both staging and production
      log_entry,
      metadata,
    })
  })
  .then(async r => {
    console.log('[LOGFLARE] | Attempt to send a new log. Status:', r.status);
  })
  .catch(err => {
    console.error('[LOGFLARE] | Error:', err);
  });
}