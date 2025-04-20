let songs = [
  { Number: "1", title: 'One Last Time', artist: 'Ariana Grande', src: 'songs/1.mp3' },
  { Number: "2", title: 'Problem', artist: 'Ariana Grande', src: 'songs/2.mp3' },
  { Number: "3", title: 'My Everything', artist: 'Ariana Grande', src: 'songs/3.mp3' },
  { Number: "4", title: 'Pushpa', artist: 'Pushpa', src: 'songs/4.mp3' },
  { Number: "5", title: 'Humdum', artist: 'Arjit', src: 'songs/5.mp3' },
  { Number: "6", title: 'Dekhta tenu', artist: 'Arjit', src: 'songs/6.mp3' },
  { Number: "7", title: 'Me & You', artist: 'Talha Anjum', src: 'songs/7.mp3' },
  { Number: "8", title: 'Khana Badosh', artist: 'JJ47', src: 'songs/8.mp3' },
  { Number: "9", title: 'Jazbaat', artist: 'AMC', src: 'songs/9.mp3' },
  { Number: "10", title: 'Happy Hour', artist: 'Talha Younas', src: 'songs/10.mp3' },
];


let currentSongIndex = 0;
let isPlaying = false;
let audio;
let ws;

document.addEventListener('DOMContentLoaded', () => {
  audio = new Audio(songs[currentSongIndex].src);

  const storedIndex = localStorage.getItem('currentSongIndex');
  if (storedIndex !== null) {
    currentSongIndex = parseInt(storedIndex, 10);
  }
  loadSong(currentSongIndex);

  // WebSocket connection initialization
  ws = new WebSocket('ws://localhost:8888');

  ws.onopen = function (event) {
    console.log('WebSocket connection established.');
  };

  let lock = false;

  ws.onmessage = function (event) {
    
    if (lock) {
      return;
    }
    console.log('Received gesture:', event.data);
  
    switch (event.data) {
      case 'thumbs_up':
        prevSong();
        break;
      case 'thumbs_down':
        nextSong();
        break;
      case 'open_palm':
        playPause();
        break;
      case 'peace_sign':
        showPlaylist();
        break;
        case 'finger_gun':
          document.getElementById("song-title").innerText = 'App is closing.....'
          // Show confirmation dialog
         setTimeout(()=>{
            window.close();
         }, 3000)
          break;   
      default:
        console.log('Unknown gesture:', event.data);
    }
  
    lock = true;
    setTimeout(() => {
      lock = false;
    }, 1000);
  };
  
  

  ws.onclose = function (event) {
    console.log('WebSocket connection closed.');
  };

  ws.onerror = function (event) {
    console.error('WebSocket error:', event);
  };

  // Sync progress bar with the song
  audio.addEventListener('timeupdate', updateProgress);
  document.getElementById('progress').addEventListener('input', seekSong);
});

function loadSong(index) {
  const song = songs[index];
  document.getElementById('song-title').innerText = song.title;
  document.getElementById('artist-name').innerText = song.artist;
  audio.src = song.src;
  audio.onloadedmetadata = () => {
    document.getElementById('duration').innerText = formatTime(audio.duration);
    document.getElementById('progress').max = Math.floor(audio.duration);
  };
  playPause();
}

function playPause() {
  if (isPlaying) {
    audio.pause();
    document.querySelector('.play-pause').innerHTML = '&#9654;'; // Play icon
  } else {
    audio.play();
    document.querySelector('.play-pause').innerHTML = '&#10074;&#10074;'; // Pause icon
  }
  isPlaying = !isPlaying;
}

function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong(currentSongIndex);
  audio.play();
  document.querySelector('.play-pause').innerHTML = '&#10074;&#10074;'; // Update the icon to pause
  isPlaying = true; // Set the isPlaying flag to true
  localStorage.setItem('currentSongIndex', currentSongIndex);
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(currentSongIndex);
  audio.play();
  document.querySelector('.play-pause').innerHTML = '&#10074;&#10074;'; // Update the icon to pause
  isPlaying = true; // Set the isPlaying flag to true
  localStorage.setItem('currentSongIndex', currentSongIndex);
}

function repeatSong() {
  audio.currentTime = 0;
  if (!isPlaying) {
    audio.play();
    isPlaying = true;
    document.querySelector('.play-pause').innerHTML = '&#10074;&#10074;'; // Pause icon
  }
}

function showPlaylist() {
  navigateTo('songs');
}

function navigateTo(page) {
  window.location.href = `${page}.html`;
}

function updateProgress() {
  const currentTime = Math.floor(audio.currentTime);
  document.getElementById('current-time').innerText = formatTime(currentTime);
  document.getElementById('progress').value = currentTime;
}

function seekSong(event) {
  const seekTime = event.target.value;
  audio.currentTime = seekTime;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Load the initial song
loadSong(currentSongIndex);

// Event listeners for control buttons
document.querySelector('.play-pause').addEventListener('click', playPause);
document.querySelector('.next').addEventListener('click', nextSong);
document.querySelector('.prev').addEventListener('click', prevSong);
document.querySelector('.repeat').addEventListener('click', repeatSong);
document.querySelector('.playlist').addEventListener('click', showPlaylist);
