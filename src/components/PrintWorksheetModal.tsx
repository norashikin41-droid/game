import React from 'react';
import { StationQuestion, CipherEntry } from '../types/game';
import { Printer, Download, ArrowLeft, KeyRound, CheckSquare } from 'lucide-react';

interface PrintWorksheetModalProps {
  questions: StationQuestion[];
  cipherTable: CipherEntry[];
  passcode: string;
}

export const PrintWorksheetModal: React.FC<PrintWorksheetModalProps> = ({
  questions,
  cipherTable,
  passcode,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control Banner (hidden on print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-amber-400" />
              <span>Helaian Kerja Cetak & Jadual Kod Rahsia (Worksheet)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Sedia untuk dicetak (A4) bagi kegunaan fizikal di bilik darjah. Lengkap dengan 8 soalan, ruang langkah kerja, jadual kod, dan jalur kata laluan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan Sebagai PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* The Printable Page Area */}
      <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-3xl shadow-2xl max-w-5xl mx-auto border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                Aktiviti Pembelajaran Abad Ke-21 (PAK-21) • Matematik Tingkatan 1 - 3
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight font-display">
                PEMECAH KOD RAHSIA: BILIK LEPAS DIRI ALGEBRA
              </h1>
              <p className="text-xs font-medium text-slate-600 mt-0.5">
                Kembangkan & Faktorkan Ungkapan Algebra untuk Menembusi Kod Rahsia
              </p>
            </div>
            <div className="text-right border-2 border-slate-900 px-3 py-1.5 rounded-lg bg-amber-50 font-mono text-xs">
              <div className="font-bold">MASA: 25 MINIT</div>
              <div className="text-[10px] text-slate-600">8 STESEN KOD</div>
            </div>
          </div>

          {/* Student Info Fields */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-3 border-t border-slate-300 text-xs font-semibold">
            <div>
              <span className="text-slate-500">Nama Kumpulan:</span>
              <div className="border-b border-slate-400 mt-1 h-5" />
            </div>
            <div>
              <span className="text-slate-500">Ketua / Ahli:</span>
              <div className="border-b border-slate-400 mt-1 h-5" />
            </div>
            <div>
              <span className="text-slate-500">Masa Mula / Tamat:</span>
              <div className="border-b border-slate-400 mt-1 h-5" />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl mb-6 text-xs text-slate-700">
          <strong className="text-slate-900">Arahan Permainan:</strong>
          <ol className="list-decimal list-inside space-y-1 mt-1 text-[11px] leading-relaxed">
            <li>Selesaikan setiap soalan algebra di Stesen 1 hingga Stesen 8. Tulis jalan kerja ringkas di ruang yang disediakan.</li>
            <li>Padankan jawapan akhir anda dengan <strong>Jadual Kod Rahsia</strong> di bawah untuk mendapatkan huruf/nombor kod.</li>
            <li>Susun huruf kod dari Stesen 1 hingga 8 di dalam <strong>Jalur Kata Laluan</strong> untuk membentuk kata laluan rahsia.</li>
            <li>Wakil kumpulan yang pertama membisikkan kata laluan yang betul kepada pengadil akan dinobatkan sebagai <strong>Pemenang Misi</strong>!</li>
          </ol>
        </div>

        {/* 8 Questions Grid (4 Kembangan & 4 Pemfaktoran) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {questions.map((q) => (
            <div
              key={q.id}
              className="border-2 border-slate-800 rounded-xl p-3.5 flex flex-col justify-between bg-white break-inside-avoid"
            >
              <div>
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 mb-2">
                  <span className="font-black text-xs uppercase tracking-wide text-slate-900">
                    STESEN {q.stationNumber} ({q.type === 'kembangan' ? 'Kembangan' : 'Pemfaktoran'})
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{q.points} Mata</span>
                </div>

                <div className="bg-slate-100 rounded-lg py-2.5 px-3 text-center mb-2">
                  <span className="text-xs text-slate-500 block mb-0.5">
                    {q.type === 'kembangan' ? 'Kembangkan:' : 'Faktorkan selengkapnya:'}
                  </span>
                  <span className="text-lg font-bold font-mono text-slate-950 tracking-wide">
                    {q.problem}
                  </span>
                </div>

                {/* Working Area */}
                <div className="h-20 border border-dashed border-slate-300 rounded-lg p-2 text-[10px] text-slate-400 relative">
                  <span>Ruang Langkah Kerja:</span>
                </div>
              </div>

              {/* Bottom Answer & Decoded Box */}
              <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-200 text-xs">
                <div className="flex-1">
                  <span className="text-[10px] text-slate-500 block">Jawapan Akhir:</span>
                  <div className="border-b border-slate-400 h-5" />
                </div>
                <div className="w-16 text-center border-2 border-slate-900 bg-amber-50 rounded-lg p-1">
                  <span className="text-[9px] font-bold block text-slate-600">HURUF KOD</span>
                  <div className="h-5 font-mono font-bold text-sm text-slate-900" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section 2: Jadual Kod Rahsia (Cipher Key Table) */}
        <div className="border-2 border-slate-900 rounded-2xl p-4 mb-6 bg-slate-50 break-inside-avoid">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
              <span>🔑</span>
              <span>Jadual Kod Rahsia (Decipher Key Matrix)</span>
            </h3>
            <span className="text-[10px] text-slate-500 italic">
              Padankan jawapan anda untuk mencari huruf/angka
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 text-xs">
            {cipherTable.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-300 rounded-lg p-2 flex items-center justify-between"
              >
                <span className="font-mono text-[11px] font-semibold text-slate-800 truncate pr-1">
                  {item.answer}
                </span>
                <span className="w-6 h-6 rounded bg-slate-900 text-amber-400 font-mono font-black text-xs flex items-center justify-center shrink-0">
                  {item.code}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Final Decoded Passcode Strip */}
        <div className="border-2 border-slate-900 rounded-2xl p-4 bg-amber-100/70 break-inside-avoid">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-900">
                Jalur Kata Laluan Rahsia Kumpulan (Susun dari Stesen 1 - 8):
              </div>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <div
                    key={s}
                    className="w-10 h-12 bg-white border-2 border-slate-900 rounded-lg flex flex-col items-center justify-center font-mono"
                  >
                    <span className="text-[9px] text-slate-500 font-bold">S{s}</span>
                    <div className="h-5" />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-600 bg-white/80 rounded-xl p-3 min-w-[200px] text-center text-xs">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">
                Pengesahan Pengadil:
              </span>
              <div className="flex items-center justify-center gap-2 mt-2 text-[11px]">
                <span className="flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5" /> Sahih
                </span>
                <span className="text-slate-400">|</span>
                <span>Tandatangan: ____________</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer print note */}
        <div className="mt-4 pt-3 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
          <span>Aplikasi Pemecah Kod Rahsia Matematik • Escape Room Suite</span>
          <span>Helaian Pelajar / Pengadil</span>
        </div>
      </div>
    </div>
  );
};
