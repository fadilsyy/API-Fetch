// public/js/index.js

const API_URL = 'https://genshin.jmp.blue/characters/all';
const IMAGE_BASE_URL = 'https://genshin.jmp.blue/characters/';
// Placeholder berupa SVG data URL jika gambar gagal dimuat
const PLACEHOLDER_IMG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231E5F99"><path d="M12 21.5c-3.5 0-6.5-3-6.5-6.5 0-3.5 4-9.5 6.5-12.5 2.5 3 6.5 9 6.5 12.5 0 3.5-3 6.5-6.5 6.5z"/></svg>';

// Elemen DOM
const domGrid = document.getElementById('grid');
const domStatus = document.getElementById('status');
const domPesanStatus = domStatus.querySelector('p');
const btnCobaLagi = document.getElementById('btn-coba-lagi');
const domJumlahHasil = document.getElementById('jumlah-hasil');

// Fungsi Utama: Mengambil Data
async function ambilData() {
    tampilkanStatus('Memuat data...', false);

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Memastikan format data yang dikembalikan API (bisa berupa object atau array)
        const daftarKarakter = Array.isArray(data) ? data : Object.values(data);
        
        const karakterFontaine = saringDanUrutkan(daftarKarakter);
        tampilkanKumpulanKartu(karakterFontaine);
        sembunyikanStatus();

    } catch (error) {
        console.error('Fetch error:', error);
        tampilkanStatus('Gagal memuat data. Periksa koneksi lalu coba lagi.', true);
        domGrid.innerHTML = '';
        domJumlahHasil.textContent = 'Menyiapkan data...';
    }
}

// Fungsi: Menyaring dan Mengurutkan Data
function saringDanUrutkan(semuaKarakter) {
    return semuaKarakter
        .filter(char => char.nation && char.nation.toLowerCase() === 'fontaine')
        .sort((a, b) => a.name.localeCompare(b.name));
}

// Fungsi: Membuat Satu Elemen Kartu lewat DOM
function buatElemenKartu(char) {
    const artikel = document.createElement('article');
    artikel.className = 'kartu';

    // Wadah Gambar
    const wadahGambar = document.createElement('div');
    wadahGambar.className = 'kartu-gambar-wadah';
    
    const gambar = document.createElement('img');
    gambar.src = `${IMAGE_BASE_URL}${char.id}/card`;
    gambar.alt = `Gambar ${char.name}`;
    gambar.onerror = function() {
        this.src = PLACEHOLDER_IMG;
        this.classList.add('gambar-error');
    };
    
    wadahGambar.appendChild(gambar);

    // Wadah Konten
    const konten = document.createElement('div');
    konten.className = 'kartu-konten';

    const nama = document.createElement('h2');
    nama.className = 'kartu-nama';
    nama.textContent = char.name;

    const julukan = document.createElement('p');
    julukan.className = 'kartu-title';
    julukan.textContent = char.title || '-';

    const info = document.createElement('div');
    info.className = 'kartu-info';

    const elemen = document.createElement('p');
    elemen.textContent = `Elemen: ${char.vision || 'Tidak diketahui'}`;

    const senjata = document.createElement('p');
    senjata.textContent = `Senjata: ${char.weapon || 'Tidak diketahui'}`;

    const rarity = document.createElement('div');
    rarity.className = 'kartu-rarity';
    const jumlahBintang = parseInt(char.rarity) || 0;
    rarity.textContent = '★'.repeat(jumlahBintang);

    // Menyusun elemen
    info.appendChild(elemen);
    info.appendChild(senjata);
    info.appendChild(rarity);

    konten.appendChild(nama);
    konten.appendChild(julukan);
    konten.appendChild(info);

    artikel.appendChild(wadahGambar);
    artikel.appendChild(konten);

    return artikel;
}

// Fungsi: Menampilkan Daftar Kartu ke Grid
function tampilkanKumpulanKartu(karakterArray) {
    domGrid.innerHTML = '';
    
    karakterArray.forEach(char => {
        const kartu = buatElemenKartu(char);
        domGrid.appendChild(kartu);
    });

    domJumlahHasil.textContent = `Menampilkan ${karakterArray.length} dari ${karakterArray.length} karakter`;
}

// Fungsi Utilitas: Mengatur Tampilan Status
function tampilkanStatus(pesan, tampilkanTombol) {
    domStatus.classList.remove('tersembunyi');
    domPesanStatus.textContent = pesan;
    
    if (tampilkanTombol) {
        btnCobaLagi.classList.remove('tersembunyi');
    } else {
        btnCobaLagi.classList.add('tersembunyi');
    }
}

function sembunyikanStatus() {
    domStatus.classList.add('tersembunyi');
}

// Event Listeners
btnCobaLagi.addEventListener('click', ambilData);

// Inisialisasi halaman
ambilData();