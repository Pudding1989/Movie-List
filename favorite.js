const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

// 從Local Storage讀取JSON字串，解析成JavaScript資料格式
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

switch (!movies.length) {
  case true:
    dataPanel.innerHTML = `<div class="col-12 text-center my-5"><h2 class="text-secondary">你還沒有收藏任何電影喔</h2></div>`
    break
  default: renderMovieList(movies)
    break
}


//預先渲染Modal
dataPanel.addEventListener('mouseover', function onPanelClick(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  }
})

//監聽點擊刪除按鈕
dataPanel.addEventListener('click', function onPanelClick(event) {
  if (event.target.matches('.btn-remove-favorite')) {
    event.target.parentElement.parentElement.classList.add('delete')
    setTimeout(() => {
      removeFromFavorite(Number(event.target.dataset.id))
      renderMovieList(movies)
    }, 575);
  }
})



//只有card模式
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // 需要title、image
    rawHTML += `
      <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img
            src="${POSTER_URL + item.image}"
            class="card-img-top" alt="電影海報" loading="lazy">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-toggle="modal"
              data-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
          </div>
        </div>
      </div>
    </div>
      `
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(movieId) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  //向個別電影API get資料
  axios.get(INDEX_URL + movieId)
    .then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image
        }" alt="movie-poster" class="img-fluid">`
      console.log(`完成渲染 ${data.title} 的 Model`)
    })
}

function removeFromFavorite(movieId) {
  //findIndex()只有回傳第一個符合條件的元素
  const movieIndex = movies.findIndex((item) => item.id === movieId)
  //稱為early return，用break會顯示語法錯誤
  if (!movies) return
  if (movieIndex === -1) return
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
}