// ===== PASTE LINK GOOGLE APPS SCRIPT KAMU DI DALAM TANDA KUTIP DI BAWAH INI =====
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx.../exec"; 

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
    setupTouchButtons();
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
    
    player.x = touchX - player.width / 2;

    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
}

canvas.addEventListener("touchstart", handleTouch, { passive: false });
canvas.addEventListener("touchmove", handleTouch, { passive: false });

function setupTouchButtons() {
    const btnLeft = document.getElementById("btn-left");
    const btnRight = document.getElementById("btn-right");

    if (btnLeft && btnRight) {
        btnLeft.addEventListener("touchstart", (e) => { e.preventDefault(); leftPressed = true; });
        btnLeft.addEventListener("touchend", (e) => { e.preventDefault(); leftPressed = false; });
        btnLeft.addEventListener("mousedown", () => { leftPressed = true; });
        btnLeft.addEventListener("mouseup", () => { leftPressed = false; });

        btnRight.addEventListener("touchstart", (e) => { e.preventDefault(); rightPressed = true; });
        btnRight.addEventListener("touchend", (e) => { e.preventDefault(); rightPressed = false; });
        btnRight.addEventListener("mousedown", () => { rightPressed = true; });
        btnRight.addEventListener("mouseup", () => { rightPressed = false; });
    }
}

// --- FUNGSI UTAMA GAME ---
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

    if (rightPressed && player.x < canvas.width - player.width) player.x += player.speed;
    if (leftPressed && player.x > 0) player.x -= player.speed;

    // Gambar Papan
    ctx.fillStyle = "#ff4757";
    ctx.beginPath();
    ctx.roundRect(player.x, player.y, player.width, player.height, 6);
    ctx.fill();

    // Gerak & Gambar Koin
    coin.y += coin.speed;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.size, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd32a";
    ctx.fill();
    ctx.closePath();

    // Deteksi Benturan
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

    if (coin.y > canvas.height) {
        endGame();
        return;
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Poppins, Arial";
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
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
            username: username,
            wa: wa,
            score: score
        })
    })
    .then(() => {
        document.getElementById("status-msg").innerText = "Skor berhasil disimpan!";
        setTimeout(fetchLeaderboard, 1000);
    })
    .catch(error => {
        document.getElementById("status-msg").innerText = "Gagal menyimpan skor.";
        console.error("Error:", error);
    });
}

function fetchLeaderboard() {
    if (!SCRIPT_URL || SCRIPT_URL.includes("AKfycbx...")) return;

    fetch(SCRIPT_URL + "?t=" + new Date().getTime())
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
    fetchLeaderboard();
}

function escapeHtml(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
