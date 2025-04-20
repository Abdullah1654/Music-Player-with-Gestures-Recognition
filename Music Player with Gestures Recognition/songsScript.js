document.addEventListener('DOMContentLoaded', () => {
  const songListElement = document.querySelector('.song-list');
  const searchInput = document.querySelector('.search-bar');
  let filteredSongs = songs;

  // Populate the song list with all songs initially
  populateSongList(filteredSongs);

  // Add event listener to the search input
  searchInput.addEventListener('input', () => {
    const searchQuery = searchInput.value.toLowerCase();
    filteredSongs = songs.filter((song) =>
      song.title.toLowerCase().includes(searchQuery) ||
      song.artist.toLowerCase().includes(searchQuery)
    );
    populateSongList(filteredSongs);
  });
});

function populateSongList(songs) {
  const songListElement = document.querySelector('.song-list');
  songListElement.innerHTML = ''; // Clear the song list

  songs.forEach((song) => {
    const li = document.createElement('li');
    li.classList.add('song-item');
    li.innerHTML = `
      <div class="song-info">
        <span class="song-title">${song.Number}. ${song.title}</span>
        <span class="song-artist">${song.artist}</span>
      </div>
    `;
    li.dataset.songTitle = song.title; // Store the song title in a data attribute
    li.addEventListener('click', () => playSelectedSong(song.title));
    li.addEventListener('mouseover', () => {
      li.style.backgroundColor = '#f0f0f0';
      li.style.cursor = 'pointer';
    });
    li.addEventListener('mouseout', () => {
      li.style.backgroundColor = '';
      li.style.cursor = '';
    });
    songListElement.appendChild(li);
  });
}

function playSelectedSong(title) {
  const songIndex = songs.findIndex(song => song.title === title);
  if (songIndex !== -1) {
    localStorage.setItem('currentSongIndex', songIndex);
    navigateTo('player');
  } else {
    console.error('Song not found');
  }
}

function navigateTo(page) {
  window.location.href = `${page}.html`;
}

const songs = [
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
