console.log("Let's write JavaScript");
let currentSong = new Audio();
let songs = [];
let currFolder = "";
const moods = ["Chill_(mood)", "Romantic_(mood)", "Sad_(mood)"];


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    console.log("📁 Loading folder:", folder);

    try {
        const res = await fetch(`songs/${folder}/info.json`);
        const info = await res.json();
        if (!info.songs || !Array.isArray(info.songs)) throw "No song list";

        songs = info.songs;

        const songUL = document.querySelector(".songList ul");
        songUL.innerHTML = "";
        for (const song of songs) {
            songUL.innerHTML += `<li><img class="invert" width="34"src="img/music.svg" alt="">
                <div class="info"><div>${song}</div><div>ROHIT BHARDWAJ</div></div>
                <div class="playnow"><span>Play Now</span><img class="invert" src="img/play.svg" alt=""></div>
            </li>`;
        }

        Array.from(songUL.getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", () => {
                const track = e.querySelector(".info div").innerText.trim();
                playMusic(track);
            });
        });

        return songs;
    } catch (e) {
        console.warn("⚠ Unable to load songs for:", folder);
        return [];
    }
}

function playMusic(track, pause = false) {
    if (!track) {
        console.warn("⚠ No track specified.");
        return;
    }

    const encoded = encodeURIComponent(track);
    currentSong.src = `${currFolder}/${encodeURIComponent(track)}`;

    if (!pause) {
        currentSong.play().catch(err => {
            console.warn("Playback error:", err);
        });
        play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerText = decodeURIComponent(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}

async function displayAlbums() {
    console.log("🎨 Displaying albums.");
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    for (const folder of moods) {
        try {
            let metadata = await fetch(`songs/${folder}/info.json`).then(r => r.json());
            cardContainer.innerHTML += `<div class="card" data-folder="${folder}">
                <div class="play"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M5 20V4L19 12L5 20Z" fill="#000" stroke="#141B34" stroke-width="1.5"/></svg></div>
                <img src="songs/${folder}/cover.jpg" alt="">
                <h2>${metadata.title}</h2>
                <p>${metadata.description}</p>
            </div>`;
        } catch (err) {
            console.warn(`⚠ No info.json in ${folder}`);
        }
    }

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            const folder = card.dataset.folder;
            await getSongs(folder);
            if (songs.length > 0) playMusic(songs[0]);
        });
    });
}

async function main() {
    console.log("🚀 Starting player.");
    console.log("Moods list:", moods);


    if (moods.length > 0) {
        const defaultFolder = moods[0];
        await getSongs(defaultFolder);
        if (songs.length > 0) playMusic(songs[0], true);
    }

    await displayAlbums();

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

    document.querySelector(".seekbar").addEventListener("click", e => {
        const percent = (e.offsetX / e.target.clientWidth);
        currentSong.currentTime = percent * currentSong.duration;
    });

    previous.addEventListener("click", () => {
        currentSong.pause();
        const index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (index > 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        currentSong.pause();
        const index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (index + 1 < songs.length) playMusic(songs[index + 1]);
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
}

main();
