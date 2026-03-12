import { createContext, useContext, useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';

const NoteContext = createContext();

export const NoteProvider = ({ children }) => {
    const [notes, setNotes] = useState(() => {
        const stored = getStorage('scholarflow_notes', null);
        if (stored && stored.length > 6) return stored;

        return [
            {
                id: 'n1',
                title: '💡 Ide Skripsi: AI & Produktivitas',
                content: '# Konsep Utama\nMembuat aplikasi yang tidak sekadar "To-Do List" biasa.\n\n## Poin-poin Riset:\n- [x] Evaluasi masalah mahasiswa terkait manajemen waktu\n- [x] Studi literatur tentang teknik Pomodoro\n- [ ] Bangun prototipe awal berbasis React\n- [ ] Validasi prototipe dengan 10 mahasiswa\n\n## Gap yang Ditemukan\nBanyak aplikasi produktivitas bersifat generik, tidak dirancang untuk konteks **mahasiswa** yang memiliki jadwal kuliah, deadline tugas, dan kebutuhan mencatat materi secara bersamaan.\n\n> "Waktu tidak bisa diubah, tapi produktivitas bisa ditingkatkan dengan sistem yang tepat."\n\n## Next Step\nBuat proposal BAB 1 sebelum akhir bulan ini.',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'n2',
                title: '📌 Materi Kalkulus Lanjut',
                content: '# Integral Lipat Ganda\n\n## Aturan Dasar\n- Pastikan mengubah batas integral jika menukar urutan integrasi `dx dy` ke `dy dx`.\n- Gunakan koordinat polar apabila bidang lingkar/silinder diputar.\n\n## Rumus Penting\n```\n∫∫ f(x,y) dA = ∫[a,b] ∫[g1(x), g2(x)] f(x,y) dy dx\n```\n\n## Tips Ujian\n- Gambar selalu daerah integrasi sebelum mulai hitung\n- Periksa simetri fungsi — bisa memotong setengah pekerjaan\n- Koordinat polar efektif untuk `x² + y² = r²`',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 'n3',
                title: '🧠 Rangkuman Struktur Data',
                content: '# Struktur Data — Ringkasan UAS\n\n## Stack (Tumpukan)\nLIFO — Last In, First Out\n- `push()` → masukan elemen\n- `pop()` → keluarkan elemen teratas\n- Contoh: undo/redo, call stack\n\n## Queue (Antrian)\nFIFO — First In, First Out\n- `enqueue()` → tambah ke belakang\n- `dequeue()` → hapus dari depan\n- Contoh: antrian printer, BFS\n\n## Binary Search Tree\n- Kiri < Root < Kanan\n- Traversal: **In-order** (ascending), **Pre-order**, **Post-order**\n\n## Big O Cheatsheet\n| Struktur | Search | Insert | Delete |\n|---------|--------|--------|--------|\n| Array   | O(n)   | O(n)   | O(n)   |\n| BST     | O(log n) | O(log n) | O(log n) |\n| Hash Map | O(1) | O(1) | O(1) |',
                createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
            },
            {
                id: 'n4',
                title: '📝 Outline BAB 2 Skripsi',
                content: '# BAB 2 — Tinjauan Pustaka\n\n## 2.1 Manajemen Waktu Mahasiswa\nSumber utama: Covey (1989) — *7 Habits of Highly Effective People*\n\nMacliks Eisenhower Matrix sebagai dasar kategorisasi tugas berdasarkan urgensi dan kepentingan.\n\n## 2.2 Teknik Pomodoro\nDikembangkan oleh Francesco Cirillo (1980-an). Bekerja selama **25 menit** lalu istirahat **5 menit**.\n\n**Efektivitas:** Riset Cirillo menunjukkan peningkatan fokus hingga 40% pada pekerjaan kognitif.\n\n## 2.3 Progressive Web App (PWA)\n- Dapat digunakan offline\n- Responsif di semua perangkat\n- Tidak memerlukan instalasi\n\n## 2.4 React.js sebagai Framework\n> React memungkinkan pembuatan UI yang reaktif dan efisien melalui Virtual DOM.\n\n## Referensi yang Harus Dikutip\n- [ ] Covey, S.R. (1989)\n- [ ] Cirillo, F. (2006)\n- [ ] Nielsen Norman Group UX Research\n- [ ] React official documentation',
                createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
            },
            {
                id: 'n5',
                title: '☕ Tips Belajar Efektif',
                content: '# Tips Belajar yang Sudah Terbukti\n\n## 1. Spaced Repetition\nUlangi materi pada interval tertentu:\n- Hari ke-1 setelah belajar\n- Hari ke-3\n- Hari ke-7\n- Hari ke-21\n\n## 2. Active Recall\nJangan hanya membaca ulang — **tutup buku dan coba ingat!**\n\n## 3. Pomodoro\n- 25 menit fokus\n- 5 menit istirahat\n- Setiap 4 sesi → istirahat panjang 15-30 menit\n\n## 4. Feynman Technique\n1. Pilih konsep\n2. Jelaskan seolah mengajar anak SD\n3. Identifikasi gap pengetahuanmu\n4. Kembali ke sumber & sederhanakan\n\n## Tools Favorit\n- **ScholarFlow** 🎓 — all-in-one produktivitas mahasiswa\n- Anki — flashcard dengan spaced repetition\n- Notion — notetaking lanjutan',
                createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 4 * 86400000).toISOString()
            },
            {
                id: 'n6',
                title: '🔧 Catatan Algoritma Sorting',
                content: '# Algoritma Sorting\n\n## Bubble Sort\n```js\nfor (let i = 0; i < n-1; i++) {\n  for (let j = 0; j < n-i-1; j++) {\n    if (arr[j] > arr[j+1]) swap(arr, j, j+1);\n  }\n}\n```\n**Kompleksitas:** O(n²) — tidak efisien untuk data besar\n\n## Quick Sort\n- Pilih pivot\n- Partisi array: kiri < pivot, kanan > pivot\n- Rekursi kiri dan kanan\n\n**Kompleksitas:** O(n log n) rata-rata, O(n²) worst case\n\n## Merge Sort\n- Divide & Conquer\n- Selalu O(n log n)\n- Stabil (urutan elemen sama terjaga)\n\n## Mana yang Dipakai?\n| Kasus | Pilihan |\n|-------|--------|\n| Data kecil | Insertion Sort |\n| Data besar, random | Quick Sort |\n| Butuh stabilitas | Merge Sort |\n| Data hampir terurut | Insertion Sort |',
                createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 5 * 86400000).toISOString()
            },
            {
                id: 'n7',
                title: '🎯 Target Semester Ini',
                content: '# Target Semester Genap 2025/2026\n\n## Akademik\n- [ ] IPK semester ini ≥ 3.7\n- [ ] Selesaikan BAB 1-3 skripsi\n- [ ] Nilai Kalkulus minimal B+\n- [ ] Lolos seleksi asisten laboratorium\n\n## Non-Akademik\n- [ ] Ikut kompetisi hackathon minimal 1x\n- [ ] Selesaikan kursus React di Udemy\n- [ ] Contribusi ke 1 open-source project\n- [ ] Bangun portofolio website pribadi\n\n## Kesehatan\n- [ ] Olahraga minimal 3x seminggu\n- [ ] Tidur cukup 7-8 jam per malam\n- [ ] Kurangi konsumsi kafein > 2 gelas/hari\n\n## Keuangan\n- [ ] Hemat ≥ 20% dari uang bulanan\n- [ ] Riset beasiswa S2 luar negeri\n\n> *"Tujuan tanpa rencana hanyalah harapan."* — Antoine de Saint-Exupéry',
                createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 6 * 86400000).toISOString()
            }
        ];

    });

    useEffect(() => {
        setStorage('scholarflow_notes', notes);
    }, [notes]);

    const addNote = (note) => setNotes([...notes, note]);
    const updateNote = (id, updates) => setNotes(notes.map((n) => (n.id === id ? { ...n, ...updates } : n)));
    const deleteNote = (id) => setNotes(notes.filter((n) => n.id !== id));

    return (
        <NoteContext.Provider value={{ notes, addNote, updateNote, deleteNote }}>
            {children}
        </NoteContext.Provider>
    );
};

export const useNotes = () => useContext(NoteContext);
