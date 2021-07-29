const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const displayMode = document.querySelector('.display-mode')

const card = document.querySelector('.fa-th')
const list = document.querySelector('.fa-bars')
const leave = document.querySelector('.leave')

const MOVIES_PER_PAGE = 12

// 初始化API接收陣列、搜尋結果
const movies = []
let filteredMovies = []

//初始化設定值
const config = {
  display: 'card', //card, list
  data: 'movies', //movies, search, favorite
  page: { //main, favorite
    main: 1, search: 1
  }
}

//從電影清單API，push到陣列裡
axios
  .get('https://movie-list.alphacamp.io/api/v1/movies/')
  .then((response) => {
    //回傳的格式是 Array(80)
    movies.push(...response.data.results)
    //預設載入第一頁
    renderMovieList(getMoviesByPage(config.page.main, configData()))
    //渲染分頁器
    renderPaginator(configData())
  })
  .catch((error) => console.log(error))

//監聽搜尋按鈕
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // form 提交後，預設會重新整理網頁
  event.preventDefault()
  // 處理關鍵字空白
  const keyword = searchInput.value.trim().toLowerCase()

  switch (!keyword.length) {
    case true:
      searchInput.classList.add('is-invalid')
      break
    default:
      searchInput.classList.remove('is-invalid')
      config.data = 'search'
      //用filter比對movies陣列中各元素的title
      filteredMovies = filterTitle(keyword)
      renderSearch(filteredMovies)
      break
  }
})

//監聽結束搜尋
leave.addEventListener('click', () => {
  config.data = 'movies'
  searchInput.value = ''
  renderMovieList(getMoviesByPage(configPage(), configData()))
  renderPaginator(configData())
  leave.classList.remove('visible')
  setTimeout(() => {
    leave.style.visibility = 'hidden'
  }, 700)
})

//監聽切換模式按鈕
displayMode.addEventListener('click', (event) => {
  //切換模式跟畫面
  switch (event.target) {
    case card:
      config.display = 'card'
      switchColor(card, list)
      break

    case list:
      config.display = 'list'
      switchColor(list, card)
      break
  }

  //處理無搜尋結果
  const data = configData()
  switch (!data.length) {
    case true:
      paginator.style.visibility = 'hidden'
      dataPanel.innerHTML = `<div class='col-12 text-center my-5'><h2 class='text-secondary'>沒有符合條件的電影</h2></div>`
      break

    default:
      renderMovieList(getMoviesByPage(configPage(), configData()))
      renderPaginator(configData())
      break
  }
})


//預先渲染Modal
dataPanel.addEventListener('mouseover', function onPanelClick(event) {
  if (event.target.matches('.btn-show-movie')) {
    renderMovieModal(Number(event.target.dataset.id))
  }
})

//監聽點擊加號
dataPanel.addEventListener('click', function onPanelClick(event) {
  if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})


//監聽分頁器
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  //從dataset取得點擊頁數，賦值到全域物件config
  const currentPage = event.target.dataset.page
  let pageNumber = configPage()
  switch (currentPage) {
    case 'previous':
      pageNumber--
      break
    case 'next':
      pageNumber++
      break
    default:
      pageNumber = Number(currentPage)
      break
  }
  updatePage(pageNumber)
  //渲染點擊主頁面跟分頁器
  renderMovieList(getMoviesByPage(configPage(), configData()))
  renderPaginator(configData())
})


//函式

//for搜尋
//判斷搜尋結果，呼叫渲染電影及分頁器
function renderSearch(result) {
  switch (!result.length) {
    case true:
      paginator.style.visibility = 'hidden'
      dataPanel.innerHTML = `<div class='col-12 text-center my-5'><h2 class='text-secondary'>沒有符合條件的電影</h2></div>`
      break
    default:
      //預設在載入第一頁
      config.page.search
      //重新渲染
      renderMovieList(getMoviesByPage(configPage(), configData()))
      renderPaginator(configData())
      leave.style.visibility = 'visible'
      leave.classList.add('visible')
      break
  }
}

//轉成小寫比較title
function filterTitle(keyword) {
  return movies.filter((item) => item.title.toLowerCase().includes(keyword))
}


//for電影物件渲染
//渲染卡片及清單電影資料
function renderMovieList(data) {
  let rawHTML = ''
  switch (config.display) {
    case 'card':
      data.forEach((item) => {
        // 需要title、image
        rawHTML += `
      <div class='col-sm-3'>
      <div class='mb-2'>
        <div class='card'>
          <img src='${POSTER_URL + item.image
          }' class='card-img-top' alt='電影海報' loading='lazy'>
          <div class='card-body'>
            <h5 class='card-title'>${item.title}</h5>
          </div>
          <div class='card-footer'>
            <button class='btn btn-primary btn-show-movie' data-toggle='modal'
              data-target='#movie-modal' data-id='${item.id}'>More</button>
            <button class='btn btn-info btn-add-favorite' data-id='${item.id
          }'>+</button>
          </div>
        </div>
      </div>
    </div>
      `
      })
      break

    case 'list':
      rawHTML = `<ul class='list-group list-group-flush col-11'>`
      data.forEach((item) => {
        //只需要title
        rawHTML += `
        <li class='list-group-item'>
          <h5>${item.title}</h5>
          <div>
          <button class='btn btn-primary btn-show-movie' data-toggle='modal' data-target='#movie-modal' data-id='${item.id}'>More</button>
            <button class='btn btn-info btn-add-favorite' data-id='${item.id}'>+</button>
          </div>
        </li>
        `
      })
      rawHTML += `</ul>`
      break
  }
  dataPanel.innerHTML = rawHTML
}

//切割對應頁數的電影資料
function getMoviesByPage(pageNumber, data = configData()) {
  //計算指定頁數第一個電影物件，在整個movies陣列中的index
  const startIndex = (pageNumber - 1) * MOVIES_PER_PAGE
  //回傳切割的指定頁數裡的電影資料
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

//toggle icon color(bootstrap helper class)
function switchColor(able, disable) {
  able.classList.add('text-primary')
  able.classList.remove('text-muted')
  disable.classList.remove('text-primary')
  disable.classList.add('text-muted')
}


//for『dataPanel』按鈕
//渲染modal資料
function renderMovieModal(movieId) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  //向個別電影API get資料
  axios.get(INDEX_URL + movieId).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src='${POSTER_URL + data.image
      }' alt='movie-poster' class='img-fluid'>`
    console.log(`完成渲染 ${data.title} 的 Model` )
  })
}

function addToFavorite(movieId) {
  //兩者皆為true則以左邊優先。
  //意即若找不到local storage裡favoriteMovies的資料就回傳空陣列
  //local storage裡的值是JSON字串，要轉換回JS的資料格式
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  //find()只有回傳第一個符合條件的元素
  const movie = movies.find((item) => item.id === movieId)
  if (list.some((item) => item.id === movieId)) {
    return alert('你已經收藏這部電影了喔！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//for分頁器
//渲染分頁器
function renderPaginator(data) {
  paginator.style.visibility = 'visible'
  // 用電影總物件數計算總頁數
  const amount = data.length
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = `<ul class='pagination justify-content-center' id='paginator'>`
  currentPage = configPage()
  //上一頁
  rawHTML += `<li class='page-item ${currentPage === 1 ? 'disabled' : ''
    }'><a class='page-link' href='#' data-page='previous'>上一頁 </a></li>`

  //數字頁
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class='page-item ${page === currentPage ? 'active' : ''
      }'><a class='page-link' href='#' data-page='${page}'>${page}</a></li>
    `
  }

  //下一頁
  rawHTML += `<li class='page-item ${currentPage === numberOfPages ? 'disabled' : ''
    }'><a class='page-link' href='#' data-page='next'>下一頁</a></li>`

  paginator.innerHTML = rawHTML
}

//切換資料來源
function configData() {
  return config.data === 'search' ? filteredMovies : movies
}

//切換頁數資料
//讀取對應頁數
function configPage() {
  return config.data === 'search' ? config.page.search : config.page.main
}
//寫回對應頁數
function updatePage(newPage) {
  config.data === 'search' ? config.page.search = newPage : config.page.main = newPage
}