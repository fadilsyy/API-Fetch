// public/js/form.js

const API_URL = 'https://genshin.jmp.blue/characters/all';
const IMAGE_BASE_URL = 'https://genshin.jmp.blue/characters/';
const PLACEHOLDER_IMG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23B8923A"><path d="M12 21.5c-3.5 0-6.5-3-6.5-6.5 0-3.5 4-9.5 6.5-12.5 2.5 3 6.5 9 6.5 12.5 0 3.5-3 6.5-6.5 6.5z"/></svg>';
const SVG_IKON_ELEMEN = `<svg class="badge-ikon-svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.5c-3.5 0-6.5-3-6.5-6.5 0-3.5 4-9.5 6.5-12.5 2.5 3 6.5 9 6.5 12.5 0 3.5-3 6.5-6.5 6.5z"/></svg>`;

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
const btnReset = document.getElementById('btn-reset');
const domHasil = document.getElementById('hasil');

domNama.setAttribute('aria-describedby', 'error-nama');
domKarakter.setAttribute('aria-describedby', 'error-karakter');
domAlasan.setAttribute('aria-describedby', 'error-alasan');

async function ambilDataDropdown() {
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
        
        domKarakter.innerHTML = '<option value="">Pilih karakter...</option>';
        
        karakterFontaine.forEach(char => {
            const opsi = document.createElement('option');
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

function validasiNama() {
    const nilai = domNama.value.trim();
    if (!nilai) return setStatusError(domNama, errNama, 'Nama wajib diisi.');
    if (nilai.length < 3) return setStatusError(domNama, errNama, 'Nama minimal 3 karakter.');
    if (nilai.length > 30) return setStatusError(domNama, errNama, 'Nama maksimal 30 karakter.');
    if (!/[a-zA-Z]/.test(nilai)) return setStatusError(domNama, errNama, 'Nama harus mengandung huruf.');
    return setStatusError(domNama, errNama, '');
}

function validasiKarakter() {
    const nilai = domKarakter.value;
    if (!nilai) return setStatusError(domKarakter, errKarakter, 'Pilih salah satu karakter.');
    return setStatusError(domKarakter, errKarakter, '');
}

function validasiAlasan() {
    const nilai = domAlasan.value.trim();
    
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

function buatKartuHasil() {
    const namaUser = domNama.value.trim();
    const alasanUser = domAlasan.value.trim();
    const charData = JSON.parse(domKarakter.value);

    // Bersihkan hasil sebelumnya
    domHasil.innerHTML = '';

    // Membangun elemen kartu (Menggunakan kelas dari index.css)
    const artikel = document.createElement('article');
    artikel.className = 'kartu';

    const wadahGambar = document.createElement('div');
    wadahGambar.className = 'kartu-gambar-wadah';
    
    const gambar = document.createElement('img');
    gambar.src = `${IMAGE_BASE_URL}${charData.id}/card`;
    gambar.alt = `Gambar ${charData.name}`;
    gambar.onerror = function() {
        this.src = PLACEHOLDER_IMG;
        this.classList.add('gambar-error');
    };
    wadahGambar.appendChild(gambar);

    const konten = document.createElement('div');
    konten.className = 'kartu-konten';

    const pemilik = document.createElement('p');
    pemilik.className = 'kartu-pemilik';
    pemilik.textContent = `Kartu favorit milik ${namaUser}`;

    const namaKarakter = document.createElement('h2');
    namaKarakter.className = 'kartu-nama';
    namaKarakter.textContent = charData.name;

    const wadahElemen = document.createElement('div');
    wadahElemen.className = 'kartu-info-baris';
    const badgeElemen = document.createElement('span');
    const namaVision = charData.vision || 'Unknown';
    const visionClass = charData.vision ? charData.vision.toLowerCase() : 'unknown';
    badgeElemen.className = `badge-elemen badge-${visionClass}`;
    
    // Inject ikon SVG dengan aman, lalu tambahkan teks elemen sebagai node terpisah (TextNode)
    badgeElemen.innerHTML = SVG_IKON_ELEMEN;
    badgeElemen.appendChild(document.createTextNode(` ${namaVision}`));
    wadahElemen.appendChild(badgeElemen);

    const rarity = document.createElement('div');
    rarity.className = 'kartu-rarity';
    const jumlahBintang = parseInt(charData.rarity) || 0;
    rarity.textContent = '★'.repeat(jumlahBintang);

    const wadahAlasan = document.createElement('div');
    wadahAlasan.className = 'kartu-alasan';
    const teksAlasan = document.createElement('p');
    // Memasukkan alasan pengguna sebagai textContent agar tag HTML tidak dieksekusi (aman dari XSS)
    teksAlasan.textContent = `"${alasanUser}"`;
    wadahAlasan.appendChild(teksAlasan);

    // Menyusun hierarki
    konten.appendChild(pemilik);
    konten.appendChild(namaKarakter);
    konten.appendChild(wadahElemen);
    konten.appendChild(rarity);
    konten.appendChild(wadahAlasan);

    artikel.appendChild(wadahGambar);
    artikel.appendChild(konten);

    domHasil.appendChild(artikel);
}

// Event Listeners: Validasi
domNama.addEventListener('input', validasiNama);
domKarakter.addEventListener('change', validasiKarakter);
domAlasan.addEventListener('input', validasiAlasan);
btnCobaLagi.addEventListener('click', ambilDataDropdown);

// Event Listener: Submit Form
formFavorit.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const isNamaValid = validasiNama();
    const isKarakterValid = validasiKarakter();
    const isAlasanValid = validasiAlasan();

    if (!isNamaValid) {
        domNama.focus();
    } else if (!isKarakterValid) {
        domKarakter.focus();
    } else if (!isAlasanValid) {
        domAlasan.focus();
    } else {
        buatKartuHasil();
    }
});

// Event Listener: Reset Form
btnReset.addEventListener('click', () => {
    // Kembalikan form ke nilai awal
    formFavorit.reset();

    // Hilangkan semua state error dan visual invalid
    setStatusError(domNama, errNama, '');
    setStatusError(domKarakter, errKarakter, '');
    setStatusError(domAlasan, errAlasan, '');
    
    // Reset penghitung
    domHitungAlasan.textContent = '0/120';
    domHitungAlasan.classList.remove('penghitung-error');

    // Hapus kartu hasil
    domHasil.innerHTML = '';
});

// Inisialisasi
ambilDataDropdown();