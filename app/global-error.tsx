'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="bg-black text-white p-8 font-sans">
        <h2 className="text-xl font-bold mb-4">Terjadi kesalahan sistem</h2>
        <button 
          onClick={() => reset()}
          className="px-4 py-2 bg-[#d4af37] text-black font-bold rounded-lg"
        >
          Coba Lagi
        </button>
      </body>
    </html>
  );
}
