/**
 * Utility keamanan kriptografi untuk hashing PIN/Password di sisi aplikasi
 * Menggunakan Web Crypto API bawaan browser (SHA-256)
 */
export async function hashPassword(plainText: string): Promise<string> {
  if (!plainText || !plainText.trim()) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText.trim() + "_FUTSAR_SALT_2026_V1");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error("Crypto hash error, fallback:", err);
    // Fallback simple deterministic hash jika subtle crypto tidak tersedia
    let hash = 0;
    const str = plainText.trim() + "_FUTSAR_SALT_2026";
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(16);
  }
}

/**
 * Validasi kecocokan input password dengan hash tersimpan
 * Mendukung migrasi mundur (backward compatibility) jika akun lama masih plain-text
 */
export async function verifyPassword(inputPassword: string, storedHashOrPassword?: string, storedHash?: string): Promise<boolean> {
  if (!inputPassword || !inputPassword.trim()) return false;
  if (!storedHashOrPassword && !storedHash) return false;

  const inputHash = await hashPassword(inputPassword);
  
  // Cek hash baru
  if (storedHash && storedHash === inputHash) return true;
  if (storedHashOrPassword && storedHashOrPassword === inputHash) return true;
  
  // Backward compatibility untuk akun yang belum ter-hash (teks biasa)
  if (storedHashOrPassword && storedHashOrPassword.trim() === inputPassword.trim()) {
    return true;
  }
  
  return false;
}
