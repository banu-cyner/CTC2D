// Ganti dengan URL Google Apps Script kamu
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxsmnj2czsiFkscjbrlZYPCVddaGA2xWBuO-TLagk7GhKO4fi_hrEN9qpbc_mU5D9WjfA/exec";

let username = "";
let wa = "";
let score = 0;
let gameOver = false;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = { x: 135, y: 340, width: 80, height: 16, speed: 7 };
let coin = { x: Math.random() * 320 + 15, y: 0, size: 12, speed: 3.5 };
let rightPressed = false;
let leftPressed = false;

window.onload = () => {
    fetchLeaderboard();
};

// --- KONTROL KEYBOARD (PC) ---
document.addEventListener("keydown", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});

// --- KONTROL SENTUH / TOUCHSCREEN (HP) ---
function handleTouch(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    const touchX = touch.clientX - rect.left;
    
    // Papan bergerak mengikuti posisi jari secara presisi
    player.x = touchX - player.width / 2;

    // Batasi pergerakan agar tidak melenceng keluar area
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
}

canvas.addEventListener("touchstart", handleTouch, { passive: false });
canvas.addEventListener("touchmove", handleTouch, { passive: false });

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
    player.x = (canvas.width - player.width) / 2;
    coin.y = 0;
    coin.speed = 3.5;
    
    requestAnimationFrame(updateGame);
}

function updateGame() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gerak Keyboard
    if (rightPressed && player.x < canvas.width - player.width) player.x += player.speed;
    if (leftPressed && player.x > 0) player.x -= player.speed;

    // Gambar Papan Pemain
    ctx.fillStyle = "#ff4757";
    ctx.beginPath();
    ctx.roundRect(player.x, player.y, player.width, player.height, 6);
    ctx.fill();

    // Gerak Koin
    coin.y += coin.speed;

    // Gambar Koin
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.size, 0, Math.PI * 2);
    ctx.fillStyle = "#eccc68";
    ctx.fill();
    ctx.closePath();

    // Deteksi Kena Koin
    if (
        coin.y + coin.size >= player.y &&
        coin.x >= player.x &&
        coin.x <= player.x + player.width
    ) {
        score += 10;
        coin.y = 0;
        coin.x = Math.random() * (canvas.width - 30) + 15;
        coin.speed += 0.2;
    }

    // Game Over jika Koin Jatuh
    if (coin.y > canvas.height) {
        endGame();
        return;
    }

    // Tampilkan Skor
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Arial";
    ctx.fillText("Skor: " + score, 15, 30);

    requestAnimationFrame(updateGame);
}

function endGame() {
    gameOver = true;
    document.getElementById("game-section").classList.add("hidden");
    document.getElementById("over-section").classList.remove("hidden");
    document.getElementById("final-score").innerText = score;

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
        document.getElementById("status-msg").innerText = "Skor berhasil disimpan!";
        fetchLeaderboard();
    })
    .catch(error => {
        document.getElementById("status-msg").innerText = "Gagal menyimpan skor.";
        console.error("Error:", error);
    });
}

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

function escapeHtml(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
