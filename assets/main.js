const $ = document.querySelector.bind(document)
// const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER'

const player = $('.player')
const cd = $('.cd');
const heading = $('header h2')
const headerSinger = $('header p')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const prevBtn = $('.btn-prev i')
const nextBtn = $('.btn-next i')
const randomBtn = $('.btn-random i')
const repeatBtn = $('.btn-repeat i')
const progressBar = $('.progress-bar')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Anh Là Ngoại Lệ Của Em',
            singer: 'Phương Ly',
            path: './assets/music/song1.mp3',
            image: './assets/img/img1.jpg'
        },
        {
            name: 'Đã Không Yêu Thì Thôi',
            singer: 'Minh Tuyết',
            path: './assets/music/song2.mp3',
            image: './assets/img/img2.jpg'
        },
        {
            name: 'Nước Mắt Em Lau Bằng Tình Yêu Mới',
            singer: 'Da LAB, Tóc Tiên',
            path: './assets/music/song3.mp3',
            image: './assets/img/img3.jpg'
        },
        {
            name: 'Từng Quen',
            singer: 'Wren Evans',
            path: './assets/music/song4.mp3',
            image: './assets/img/img4.jpg'
        },
        {
            name: 'Vùng Ký Ức',
            singer: 'Chillies',
            path: './assets/music/song5.mp3',
            image: './assets/img/img5.jpg'
        },
        {
            name: 'Em Xinh',
            singer: 'MONO, Onion',
            path: './assets/music/song6.mp3',
            image: './assets/img/img6.jpg'
        },
        {
            name: 'Phố Đã Lên Đèn',
            singer: 'Huyền Tâm Môn',
            path: './assets/music/song7.mp3',
            image: './assets/img/img7.jpg'
        },
        {
            name: 'Mười Năm',
            singer: 'Đen Vâu, Ngọc Linh',
            path: './assets/music/song8.mp3',
            image: './assets/img/img8.jpg'
        },
        {
            name: 'Để Mị Nói Cho Mà Nghe',
            singer: 'Hoàng Thùy Linh',
            path: './assets/music/song9.mp3',
            image: './assets/img/img9.jpg'
        },
        {
            name: 'Lần Cuối',
            singer: 'Ngọt',
            path: './assets/music/song10.mp3',
            image: './assets/img/img10.jpg'
        },
    ],

    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function () {
        const _this = this
        const cdWidth = cd.offsetWidth;

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([{ transform: 'rotate(360deg)' }], {
            duration: 15000,
            iterations: Infinity
        });
        cdThumbAnimate.pause();

        // Xử lý phóng to thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // Xử lý khi click play btn
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // Khi bài hát được play
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi bài hát bị pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
                progressBar.style.width = `${progressPercent}%`;
            }
            
        }

        // Xử lý khi tua bài hát
        progress.onchange = function (e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        // Khi next bài hát
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi prev bài hát
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Xử lý bật / tắt random bài hát
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Lặp lại bài hát
        repeatBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xử lý bài hát tiếp theo khi audio kết thúc
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')

            if (songNode || e.target.closest('.option')) {
                // Xử lý khi click vào bài hát
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                // Xử lý khi click vào option
                if (e.target.closest('.option')) {
                    // code
                }
            }
        }
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            })
        }, 300)
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        headerSinger.textContent = this.currentSong.singer
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    start: function () {
        // Gán cấu hình từ config vào app
        this.loadConfig()

        // Định nghĩa các thuộc tính cho object
        this.defineProperties()

        // Lắng nghe xử lý các sự kiện DOM Events
        this.handleEvents()

        // Tải thông tin bài hát đầu tiên UI khi chạy app
        this.loadCurrentSong()

        // Render playlist
        this.render()

        // Hiển thị trạng thái ban đầu của btn random & repeat
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start()