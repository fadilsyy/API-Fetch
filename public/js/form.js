// public/js/form.js

const API_URL = 'https://genshin.jmp.blue/characters/all';

// Referensi Elemen DOM
const formFavorit = document.getElementById('form-favorit');
const domNama = document.getElementById('nama');
const domKarakter = document.getElementById('karakter');
const domAlasan = document.getElementById('alasan');

const errNama = document.getElementById('error-nama');
const errKarakter = document.getElementById('error-karakter');
const errAlasan = document.getElementById('error-alasan');
const domHitungAlasan = document.getElementById('hitung-alasan');

const domStatusKarakter = document.getElementById('status-karakter');
const btnCobaLagi = document.getElementById('btn-coba-lagi-form');
const domHasil = document.getElementById('hasil');

// Menghubungkan input dengan pesan error untuk aksesibilitas (Screen Reader)
domNama.setAttribute('aria-describedby', 'error-nama');
domKarakter.setAttribute('aria-describedby', 'error-karakter');
domAlasan.setAttribute('aria-describedby', 'error-alasan');

// Fungsi Mengambil Data Karakter untuk Dropdown
async function ambilDataDropdown() {
    // Kondisi memuat
    domKarakter.disabled = true;
    domKarakter.innerHTML = '<option value="">Memuat karakter...</option>';
    domStatusKarakter.textContent = '';
    btnCobaLagi.classList.add('tersembunyi');

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const data = await response.json();
        const daftarKarakter = Array.isArray(data) ? data : Object.values(data);
        
        const karakterFontaine = daftarKarakter
            .filter(char => char.nation && char.nation.toLowerCase() === 'fontaine')
            .sort((a, b) => a.name.localeCompare(b.name));
        
        // Bersihkan dan isi ulang dropdown
        domKarakter.innerHTML = '<option value="">Pilih karakter...</option>';
        
        karakterFontaine.forEach(char => {
            const opsi = document.createElement('option');
            // Menyimpan string JSON ke dalam value agar data bisa dipakai utuh di tahap selanjutnya
            opsi.value = JSON.stringify(char);
            opsi.textContent = char.name;
            domKarakter.appendChild(opsi);
        });

        domKarakter.disabled = false;

    } catch (error) {
        console.error('Fetch error:', error);
        domKarakter.innerHTML = '<option value="">Gagal memuat data</option>';
        domStatusKarakter.textContent = 'Gagal memuat karakter. Periksa koneksi lalu coba lagi.';
        btnCobaLagi.classList.remove('tersembunyi');
    }
}

// Fungsi Utilitas: Set Status Error pada Input
function setStatusError(inputElemen, errorElemen, pesan) {
    if (pesan) {
        errorElemen.textContent = pesan;
        inputElemen.setAttribute('aria-invalid', 'true');
        inputElemen.classList.add('input-error');
        return false;
    } else {
        errorElemen.textContent = '';
        inputElemen.setAttribute('aria-invalid', 'false');
        inputElemen.classList.remove('input-error');
        return true;
    }
}

// Validasi Field Nama
function validasiNama() {
    const nilai = domNama.value.trim();
    if (!nilai) return setStatusError(domNama, errNama, 'Nama wajib diisi.');
    if (nilai.length < 3) return setStatusError(domNama, errNama, 'Nama minimal 3 karakter.');
    if (nilai.length > 30) return setStatusError(domNama, errNama, 'Nama maksimal 30 karakter.');
    if (!/[a-zA-Z]/.test(nilai)) return setStatusError(domNama, errNama, 'Nama harus mengandung huruf.');
    return setStatusError(domNama, errNama, '');
}

// Validasi Field Karakter (Dropdown)
function validasiKarakter() {
    const nilai = domKarakter.value;
    if (!nilai) return setStatusError(domKarakter, errKarakter, 'Pilih salah satu karakter.');
    return setStatusError(domKarakter, errKarakter, '');
}

// Validasi Field Alasan
function validasiAlasan() {
    const nilai = domAlasan.value.trim();
    
    // Perbarui Tampilan Penghitung
    domHitungAlasan.textContent = `${nilai.length}/120`;
    if (nilai.length > 120) {
        domHitungAlasan.classList.add('penghitung-error');
    } else {
        domHitungAlasan.classList.remove('penghitung-error');
    }

    if (!nilai) return setStatusError(domAlasan, errAlasan, 'Alasan wajib diisi.');
    if (nilai.length < 10) return setStatusError(domAlasan, errAlasan, 'Alasan minimal 10 karakter.');
    if (nilai.length > 120) return setStatusError(domAlasan, errAlasan, 'Alasan maksimal 120 karakter.');
    return setStatusError(domAlasan, errAlasan, '');
}

// Event Listeners: Interaksi dan Validasi Real-time
domNama.addEventListener('input', validasiNama);
domKarakter.addEventListener('change', validasiKarakter);
domAlasan.addEventListener('input', validasiAlasan);
btnCobaLagi.addEventListener('click', ambilDataDropdown);

// Event Listener: Submit Form
formFavorit.addEventListener('submit', (e) => {
    e.preventDefault(); // Cegah kirim bawaan
    
    // Lakukan validasi pada semua field
    const isNamaValid = validasiNama();
    const isKarakterValid = validasiKarakter();
    const isAlasanValid = validasiAlasan();

    // Jika ada yang tidak valid, pindahkan fokus ke field bermasalah pertama
    if (!isNamaValid) {
        domNama.focus();
    } else if (!isKarakterValid) {
        domKarakter.focus();
    } else if (!isAlasanValid) {
        domAlasan.focus();
    } else {
        // Jika semuanya valid
        domHasil.innerHTML = '<!-- TODO: Kartu favorit akan dirender di sini pada tahap selanjutnya -->';
    }
});

// Inisialisasi awal saat script dimuat
ambilDataDropdown();