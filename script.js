function endGame() {
    gameOver = true;
    document.getElementById("game-section").classList.add("hidden");
    document.getElementById("over-section").classList.remove("hidden");
    document.getElementById("final-score").innerText = score;

    // Mengirim data menggunakan URLSearchParams agar tidak terhalang CORS
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
        setTimeout(fetchLeaderboard, 1000); // Beri jeda 1 detik agar Google Sheets sempat menyimpan
    })
    .catch(error => {
        document.getElementById("status-msg").innerText = "Gagal menyimpan skor.";
        console.error("Error:", error);
    });
}

function fetchLeaderboard() {
    // Menambahkan timestamp agar browser tidak me-load data cache lama
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
