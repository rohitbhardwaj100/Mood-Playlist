// New Enhanced Music Player JS
console.log('🎧 Music Player Enhanced Version');
let currentSong = new Audio();
let songs = [];
let currFolder = "";
let isShuffle = false;
let isRepeat = false;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    const a = await fetch(`${folder}/`);
    const response = await a.text();
    const div = document.createElement("div");
    div.innerHTML = response;
    const as = div.getElementsByTagName("a");
    const tempSongs = [];
    for (let i = 0; i < as.length; i++) {
        const href = as[i].href;
        if (href.endsWith(".mp3")) {
            const track = decodeURIComponent(href.split(`${folder}/`)[1]);
            tempSongs.push({ track, folder });
        }
    }
    return tempSongs;
}

function renderSongs(songsToRender) {
    songs = songsToRender;
    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const songObj of songs) {
        songUL.innerHTML += `<li><img class="invert" width="34" src="img/music.svg" alt="">
            <div class="info"><div>${songObj.track}</div><div>ROHIT BHARDWAJ</div></div>
            <div class="playnow"><span>Play Now</span><img class="invert" src="img/play.svg" alt=""></div></li>`;
    }

    Array.from(songUL.getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            const song = songs[index];
            playMusic(song.track, song.folder);
        });
    });

}

function playMusic(track, folder, pause = false) {
    if (!track || !folder) return;
    currFolder = folder;
    const encoded = encodeURIComponent(track);
    currentSong.src = `${currFolder}/${encoded}`;
    if (!pause) {
        currentSong.play().catch(err => console.warn("Playback error:", err));
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerText = decodeURIComponent(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}

async function displayAlbums() {
    const res = await fetch("songs/");
    const html = await res.text();
    const div = document.createElement("div");
    div.innerHTML = html;
    const anchors = div.getElementsByTagName("a");
    const cardContainer = document.querySelector(".cardContainer");
    const filterContainer = document.querySelector(".filters");
    filterContainer.innerHTML = `<button data-folder="all">All</button>`;

    for (let anchor of anchors) {
        if (anchor.href.includes("/songs/") && !anchor.href.endsWith(".mp3")) {
            const folder = decodeURIComponent(anchor.href.split("/songs/")[1].replace("/", ""));
            try {
                const metadata = await fetch(`songs/${folder}/info.json`).then(r => r.json());
                cardContainer.innerHTML += `<div class="card" data-folder="${folder}">
                    <div class="play">▶️</div>
                    <img src="songs/${folder}/cover.jpg" alt="">
                    <h2>${metadata.title}</h2>
                    <p>${metadata.description}</p>
                </div>`;
                filterContainer.innerHTML += `<button data-folder="${folder}">${metadata.title}</button>`;
            } catch (err) {
                console.warn(`No info.json in ${folder}`);
            }
        }
    }

    document.querySelectorAll(".filters button").forEach(btn => {
        btn.addEventListener("click", async () => {
            document.querySelectorAll(".filters button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
           

main();
            const folder = btn.dataset.folder;
            const folderSongs = await getSongs(`songs/${folder}`);
            renderSongs(folderSongs);
        });
    });

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            const folder = card.dataset.folder;
            const folderSongs = await getSongs(`songs/${folder}`);
            renderSongs(folderSongs);
        });
    });
}

async function main() {
    const res = await fetch("songs/");
    const html = await res.text();
    const div = document.createElement("div");
    div.innerHTML = html;

    const folders = Array.from(div.getElementsByTagName("a"))
        .map(a => {
            const parts = a.href.split("/songs/");
            return parts[1] ? decodeURIComponent(parts[1].replace("/", "")) : null;
        })
        .filter(name => name && !name.includes("."));

    let allSongs = [];
    for (const folder of folders) {
        const folderSongs = await getSongs(`songs/${folder}`);
        allSongs.push(...folderSongs);
    }
    if (allSongs.length > 0) {
        renderSongs(allSongs);
        playMusic(allSongs[0].track, allSongs[0].folder, true);
    }
    await displayAlbums();
}

play.addEventListener("click", () => {
    if (currentSong.paused) {
        currentSong.play();
        play.src = "img/pause.svg";
    } else {
        currentSong.pause();
        play.src = "img/play.svg";
    }
});

currentSong.addEventListener("timeupdate", () => {
    const current = secondsToMinutesSeconds(currentSong.currentTime);
    const total = secondsToMinutesSeconds(currentSong.duration);
    document.querySelector(".songtime").innerText = `${current} / ${total}`;
    document.querySelector(".circle").style.left =
        (currentSong.currentTime / currentSong.duration) * 100 + "%";
});

currentSong.addEventListener("ended", () => {
    const currentTrackName = decodeURIComponent(currentSong.src.split("/").pop().split("?")[0]);
    const index = songs.findIndex(s => s.track === currentTrackName);
    if (isRepeat) {
        playMusic(songs[index].track, songs[index].folder);
    } else if (isShuffle) {
        const rand = Math.floor(Math.random() * songs.length);
        playMusic(songs[rand].track, songs[rand].folder);
    } else {
        const nextIndex = (index + 1) % songs.length;
        playMusic(songs[nextIndex].track, songs[nextIndex].folder);
    }
});

next.addEventListener("click", () => {
    currentSong.pause();
    const currentTrackName = decodeURIComponent(currentSong.src.split("/").pop().split("?")[0]);
    const index = songs.findIndex(s => s.track === currentTrackName);
    const nextIndex = (index + 1) % songs.length;
    playMusic(songs[nextIndex].track, songs[nextIndex].folder);
});

previous.addEventListener("click", () => {
    currentSong.pause();
    const currentTrackName = decodeURIComponent(currentSong.src.split("/").pop().split("?")[0]);
    const index = songs.findIndex(s => s.track === currentTrackName);
    const prevIndex = (index - 1 + songs.length) % songs.length;
    playMusic(songs[prevIndex].track, songs[prevIndex].folder);
});

document.querySelector(".seekbar").addEventListener("click", e => {
    const percent = (e.offsetX / e.target.clientWidth);
    currentSong.currentTime = percent * currentSong.duration;
});

document.querySelector(".range input").addEventListener("input", e => {
    currentSong.volume = parseInt(e.target.value) / 100;
});

document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
        currentSong.volume = 0;
        e.target.src = e.target.src.replace("volume.svg", "mute.svg");
        document.querySelector(".range input").value = 0;
    } else {
        currentSong.volume = 0.1;
        e.target.src = e.target.src.replace("mute.svg", "volume.svg");
        document.querySelector(".range input").value = 10;
    }
});

document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
});

document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
});

document.querySelector("#shuffle").addEventListener("click", () => {
    isShuffle = !isShuffle;
    alert(`Shuffle: ${isShuffle ? "ON" : "OFF"}`);
});

document.querySelector("#repeat").addEventListener("click", () => {
    isRepeat = !isRepeat;
    alert(`Repeat: ${isRepeat ? "ON" : "OFF"}`);
});

document.querySelector('.search-bar')?.remove();



main();
