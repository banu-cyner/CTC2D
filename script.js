// Ganti nilai ini dengan URL Google Apps Script Anda
const SCRIPT_URL = "MASUKKAN_URL_WEB_APP_GOOGLE_SCRIPT_ANDA_DI_SINI";

let username = "";
let wa = "";
let score = 0;
let gameOver = false;

// Element Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = { x: 160, y: 360, width: 80, height: 15, speed: 7 };
let coin = { x: Math.random() * 370, y: 0, size: 15, speed: 4 };
let rightPressed = false;
let leftPressed = false;

// Ambil Leaderboard saat halaman selesai dimuat
window.onload = () => {
    fetchLeaderboard();
};

// Event Kontrol Keyboard
document.addEventListener("keydown", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});

// Mulai Game
function startGame() {
    username = document.getElementById("username").value.trim();
    wa = document.getElementById("wa").value.trim();

    if (!username || !wa) {
        alert("Harap isi Username dan Nomor WA terlebih dahulu!");
        return;
    }

    document.getElementById("menu-section").classList.add("hidden");
    document.getElementById("game-section").classList.remove("hidden");

    score = 0;
    gameOver = false;
    coin.y = 0;
    coin.speed = 4;
    
    requestAnimationFrame(updateGame);
}

// Loop Utama Game
function updateGame() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gerak Pemain
    if (rightPressed && player.x < canvas.width - player.width) player.x += player.speed;
    if (leftPressed && player.x > 0) player.x -= player.speed;

    // Gambar Papan Pemain
    ctx.fillStyle = "#ff4757";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Gerak Koin
    coin.y += coin.speed;

    // Gambar Koin
    ctx.beginPath();
    ctx.arc(coin.x + 7, coin.y, coin.size, 0, Math.PI * 2);
    ctx.fillStyle = "#eccc68";
    ctx.fill();
    ctx.closePath();

    // Deteksi Benturan Koin & Pemain
    if (
        coin.y + coin.size >= player.y &&
        coin.x >= player.x &&
        coin.x <= player.x + player.width
    ) {
        score += 10;
        coin.y = 0;
        coin.x = Math.random() * (canvas.width - 20);
        coin.speed += 0.3; // Koin bertambah cepat
    }

    // Cek Game Over (Koin Jatuh)
    if (coin.y > canvas.height) {
        endGame();
        return;
    }

    // Tampilkan Skor Real-time
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px Arial";
    ctx.fillText("Skor: " + score, 10, 25);

    requestAnimationFrame(updateGame);
}

// Game Selesai & Kirim Skor
function endGame() {
    gameOver = true;
    document.getElementById("game-section").classList.add("hidden");
    document.getElementById("over-section").classList.remove("hidden");
    document.getElementById("final-score").innerText = score;

    // Kirim Data Skor ke Google Sheets via API
    fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: username,
            wa: wa,
            score: score
        })
    })
    .then(() => {
        document.getElementById("status-msg").innerText = "Skor berhasil disimpan ke Leaderboard!";
        fetchLeaderboard();
    })
    .catch(error => {
        document.getElementById("status-msg").innerText = "Gagal menyimpan skor.";
        console.error("Error:", error);
    });
}

// Mengambil Data Leaderboard dari Google Sheets
function fetchLeaderboard() {
    fetch(SCRIPT_URL)
    .then(response => response.json())
    .then(data => {
        let tbody = document.getElementById("leaderboard-body");
        tbody.innerHTML = "";
        
        if (!data || data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='3'>Belum ada data</td></tr>";
            return;
        }

        data.forEach((item, index) => {
            let row = `<tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(item.username)}</td>
                <td>${item.score}</td>
            </tr>`;
            tbody.innerHTML += row;
        });
    })
    .catch(err => console.error("Gagal memuat leaderboard:", err));
}

function restartGame() {
    document.getElementById("over-section").classList.add("hidden");
    document.getElementById("menu-section").classList.remove("hidden");
    document.getElementById("status-msg").innerText = "Mengirim data ke Google Sheets...";
}

// Sanitasi Input untuk Mencegah XSS
function escapeHtml(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
