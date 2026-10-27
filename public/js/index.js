// public/js/index.js

const API_URL = 'https://genshin.jmp.blue/characters/all';
const IMAGE_BASE_URL = 'https://genshin.jmp.blue/characters/';
// Placeholder berupa SVG data URL dengan warna emas
const PLACEHOLDER_IMG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23B8923A"><path d="M12 21.5c-3.5 0-6.5-3-6.5-6.5 0-3.5 4-9.5 6.5-12.5 2.5 3 6.5 9 6.5 12.5 0 3.5-3 6.5-6.5 6.5z"/></svg>';
// SVG inline sederhana untuk ikon pada badge elemen
const SVG_IKON_ELEMEN = `<svg class="badge-ikon-svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.5c-3.5 0-6.5-3-6.5-6.5 0-3.5 4-9.5 6.5-12.5 2.5 3 6.5 9 6.5 12.5 0 3.5-3 6.5-6.5 6.5z"/></svg>`;

// Elemen DOM
const domGrid = document.getElementById('grid');
const domStatus = document.getElementById('status');
const domPesanStatus = domStatus.querySelector('p');
const btnCobaLagi = document.getElementById('btn-coba-lagi');
const domJumlahHasil = document.getElementById('jumlah-hasil');
const domCari = document.getElementById('cari');
const domFilterElemen = document.getElementById('filter-elemen');

// Variabel Global
let semuaKarakterFontaine = [];

async function ambilData() {
    tampilkanStatus('Memuat data...', false);

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const data = await response.json();
        const daftarKarakter = Array.isArray(data) ? data : Object.values(data);
        
        semuaKarakterFontaine = saringDanUrutkan(daftarKarakter);
        
        isiOpsiFilter(semuaKarakterFontaine);
        terapkanFilter();

    } catch (error) {
        console.error('Fetch error:', error);
        tampilkanStatus('Gagal memuat data. Periksa koneksi lalu coba lagi.', true);
        domGrid.innerHTML = '';
        domJumlahHasil.textContent = 'Menyiapkan data...';
    }
}

function saringDanUrutkan(semuaKarakter) {
    return semuaKarakter
        .filter(char => char.nation && char.nation.toLowerCase() === 'fontaine')
        .sort((a, b) => a.name.localeCompare(b.name));
}

function isiOpsiFilter(dataKarakter) {
    const elemenUnik = [...new Set(dataKarakter.map(char => char.vision).filter(v => v))].sort();
    domFilterElemen.innerHTML = '<option value="Semua elemen">Semua elemen</option>';
    
    elemenUnik.forEach(elemen => {
        const opsi = document.createElement('option');
        opsi.value = elemen;
        opsi.textContent = elemen;
        domFilterElemen.appendChild(opsi);
    });
}

function terapkanFilter() {
    const kataKunci = domCari.value.trim().toLowerCase();
    const elemenPilihan = domFilterElemen.value;

    const hasilFilter = semuaKarakterFontaine.filter(char => {
        const namaCocok = char.name.toLowerCase().includes(kataKunci);
        const elemenCocok = elemenPilihan === 'Semua elemen' || char.vision === elemenPilihan;
        
        return namaCocok && elemenCocok;
    });

    tampilkanKumpulanKartu(hasilFilter, semuaKarakterFontaine.length);
}

function buatElemenKartu(char) {
    const artikel = document.createElement('article');
    artikel.className = 'kartu';

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

    // Badge Elemen
    const wadahElemen = document.createElement('div');
    wadahElemen.className = 'kartu-info-baris';
    
    const badgeElemen = document.createElement('span');
    const namaVision = char.vision || 'Unknown';
    const visionClass = char.vision ? char.vision.toLowerCase() : 'unknown';
    
    badgeElemen.className = `badge-elemen badge-${visionClass}`;
    badgeElemen.innerHTML = `${SVG_IKON_ELEMEN} ${namaVision}`;
    wadahElemen.appendChild(badgeElemen);

    // Teks Senjata
    const wadahSenjata = document.createElement('div');
    wadahSenjata.className = 'kartu-info-baris';
    wadahSenjata.textContent = `Senjata: ${char.weapon || 'Tidak diketahui'}`;

    // Rarity (Bintang Emas)
    const rarity = document.createElement('div');
    rarity.className = 'kartu-rarity';
    const jumlahBintang = parseInt(char.rarity) || 0;
    rarity.textContent = '★'.repeat(jumlahBintang);

    info.appendChild(wadahElemen);
    info.appendChild(wadahSenjata);
    info.appendChild(rarity);

    konten.appendChild(nama);
    konten.appendChild(julukan);
    konten.appendChild(info);

    artikel.appendChild(wadahGambar);
    artikel.appendChild(konten);

    return artikel;
}

function tampilkanKumpulanKartu(karakterArray, totalKarakter) {
    domGrid.innerHTML = '';
    domJumlahHasil.textContent = `Menampilkan ${karakterArray.length} dari ${totalKarakter} karakter`;
    
    if (karakterArray.length === 0) {
        tampilkanStatus('Karakter tidak ditemukan.', false);
        return;
    }

    sembunyikanStatus();

    karakterArray.forEach(char => {
        const kartu = buatElemenKartu(char);
        domGrid.appendChild(kartu);
    });
}

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
domCari.addEventListener('input', terapkanFilter);
domFilterElemen.addEventListener('change', terapkanFilter);

ambilData();    