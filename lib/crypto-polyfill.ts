/**
 * Polyfill for crypto.randomUUID in non-secure contexts.
 *
 * Capacitor loads the Next.js app over cleartext HTTP on local networks,
 * which is not a secure context. In non-secure contexts, `crypto.randomUUID`
 * is unavailable (throws "crypto.randomUUID is not a function").
 *
 * This polyfill uses crypto.getRandomValues() when available (works in most
 * non-secure contexts), falling back to Math.random() for legacy environments.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
 */

/**
 * Generate a UUID v4 using crypto.getRandomValues if available,
 * otherwise fall back to Math.random.
 */
function generateUUID(): `${string}-${string}-${string}-${string}-${string}` {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}` as `${string}-${string}-${string}-${string}-${string}`;
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  }) as `${string}-${string}-${string}-${string}-${string}`;
}

/**
 * Install the crypto.randomUUID polyfill if needed.
 * Safe to call multiple times; only installs once.
 */
export function installCryptoPolyfill(): void {
  if (typeof globalThis === 'undefined') return;
  if (typeof globalThis.crypto === 'undefined') {
    (globalThis as Record<string, unknown>).crypto = {};
  }
  if (typeof globalThis.crypto.randomUUID !== 'function') {
    globalThis.crypto.randomUUID = generateUUID;
  }
}

/**
 * Inline script source for embedding in HTML <head>.
 * This runs before any bundled JavaScript and ensures crypto.randomUUID
 * is available immediately.
 */
export const cryptoPolyfillScript = `(function(){if(typeof crypto==='undefined')crypto={};if(typeof crypto.randomUUID!=='function'){crypto.randomUUID=function(){if(typeof crypto.getRandomValues==='function'){var b=new Uint8Array(16);crypto.getRandomValues(b);b[6]=(b[6]&0x0f)|0x40;b[8]=(b[8]&0x3f)|0x80;var h='';for(var i=0;i<16;i++)h+=b[i].toString(16).padStart(2,'0');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20)}return'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0;return(c==='x'?r:(r&0x3)|0x8).toString(16)})}}})();`;
