/* ===== 페이지 이동 ===== */
const HOME_PAGE = 'home.html';
const COMMUNITY_PAGE = 'community.html';

/* ===== 화면 상태 =====
   작품 정보(WORKS) / 장르 목록(GENRES) / 내 게시판(loadMyBoards)은 js/data.js에 있다. */
let keyword = '';          // 검색 바에서 찾은 말 (작품명 또는 작가명)
let selectedGenre = null;  // null이면 장르를 고르지 않은 상태
let addTarget = null;      // 추가 카드를 띄운 작품의 key

const searchInput = document.getElementById('searchInput');
const genreList = document.getElementById('genreList');
const genreStrip = document.getElementById('genreStrip');
const workGrid = document.getElementById('workGrid');

const dim = document.getElementById('dim');
const addCard = document.getElementById('addCard');
const addTitle = document.getElementById('addTitle');

/* 띄어쓰기와 대소문자를 무시하고 견주기 위해 양쪽을 같은 모양으로 만든다 */
function normalize(text) {
  return String(text).replace(/\s+/g, '').toLowerCase();
}

/* 지금 조건(찾은 말 + 고른 장르)에 맞는 작품만 고른다 */
function visibleWorks() {
  const word = normalize(keyword);

  return Object.keys(WORKS).filter((key) => {
    const work = WORKS[key];

    // 작품명과 작가명 둘 중 하나만 맞아도 된다
    if (word && normalize(work.title).indexOf(word) === -1
             && normalize(work.author).indexOf(word) === -1) return false;

    if (selectedGenre && (work.tag || []).indexOf(selectedGenre) === -1) return false;

    return true;
  });
}

/* ===== 장르 해시태그 ===== */
function renderGenres() {
  genreList.innerHTML = GENRES
    .map((genre) => `<button class="genre-chip${genre === selectedGenre ? ' is-selected' : ''}"
              type="button" data-genre="${genre}">#${genre}</button>`)
    .join('');
}

/* ===== 표지 배너 ===== */
function workMarkup(key) {
  const work = WORKS[key];

  return `<article class="work-card" data-work="${key}" role="button" tabindex="0">
      <div class="work-cover">
        <img src="${work.cover}" alt="${work.title}">
      </div>
      <div class="work-detail">
        <p class="work-name">${work.title}</p>
        <div class="work-meta">
          <span class="meta-group">
            <img class="icon-star" src="assets/icon-star.svg" alt="별점">
            <span class="score cap-trim">${work.score}</span>
          </span>
          <span class="meta-group">
            <img class="icon-heart" src="assets/icon-heart.svg" alt="좋아요">
            <span class="likes cap-trim">${work.like}</span>
          </span>
        </div>
      </div>
    </article>`;
}

function render() {
  const keys = visibleWorks();

  workGrid.innerHTML = keys.length
    ? keys.map(workMarkup).join('')
    : '<p class="empty cap-trim">찾는 작품이 없습니다.</p>';
}

renderGenres();
render();

/* ===== 검색 바 =====
   돋보기를 누르거나 엔터를 치면 찾는다. 칸을 비우고 다시 찾으면 전체로 돌아온다. */
function runSearch() {
  keyword = searchInput.value.trim();
  render();
}

document.getElementById('searchBtn').addEventListener('click', runSearch);

searchInput.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  runSearch();
});

/* ===== 해시태그 누르기 (이미 고른 해시태그를 다시 누르면 전체로 돌아온다) ===== */
genreList.addEventListener('click', (e) => {
  const chip = e.target.closest('.genre-chip');
  if (!chip) return;

  const genre = chip.dataset.genre;
  selectedGenre = selectedGenre === genre ? null : genre;

  renderGenres();
  render();
});

/* ===== 해시태그 줄을 마우스로 끌어서 넘기기 =====
   마우스일 때만 직접 처리하고, 터치/펜은 브라우저 기본 스크롤에 맡긴다.
   (home의 게시판 실린더와 같은 방식이다) */
function enableDragScroll(el) {
  let dragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let moved = false;

  function onPointerMove(e) {
    if (!dragging) return;
    const distance = e.clientX - startX;
    if (Math.abs(distance) > 3) moved = true;
    el.scrollLeft = startScrollLeft - distance;
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('dragging');
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
  }

  el.addEventListener('pointerdown', (e) => {
    // 터치로 눌렀을 때도 초기화해야 이전 드래그 때문에 탭이 막히지 않는다
    moved = false;
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    dragging = true;
    startX = e.clientX;
    startScrollLeft = el.scrollLeft;
    el.classList.add('dragging');

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  });

  // 끌어서 넘긴 동작이 해시태그 클릭으로 이어지지 않게 막는다
  el.addEventListener('click', (e) => {
    if (!moved) return;
    moved = false;
    e.preventDefault();
    e.stopPropagation();
  }, true);

  el.addEventListener('dragstart', (e) => e.preventDefault());
}

enableDragScroll(genreStrip);

/* ===== 표지 배너 누르기 =====
   이미 내 게시판에 있는 작품이면 바로 그 게시판으로 가고,
   없는 작품이면 추가할지 묻는 카드를 띄운다.
   community에는 from=search를 같이 넘겨서 뒤로 가기가 이 화면으로 돌아오게 한다. */
function openWork(key) {
  if (hasMyBoard(key)) {
    window.location.href = `${COMMUNITY_PAGE}?board=${key}&from=search`;
    return;
  }

  addTarget = key;
  addTitle.textContent = `‘${WORKS[key].title}’`;
  dim.hidden = false;
  addCard.hidden = false;
}

function closeCard() {
  addTarget = null;
  dim.hidden = true;
  addCard.hidden = true;
}

workGrid.addEventListener('click', (e) => {
  const card = e.target.closest('.work-card');
  if (!card) return;
  openWork(card.dataset.work);
});

// Enter / Space로도 눌릴 수 있게 같은 동작을 키보드에도 붙인다
workGrid.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const card = e.target.closest('.work-card');
  if (!card) return;
  e.preventDefault();
  openWork(card.dataset.work);
});

/* '예'를 누르면 home의 내 게시판에 그 작품이 추가된다.
   추가한 뒤에 같은 표지를 다시 누르면 그 작품의 community로 넘어간다. */
document.getElementById('addConfirm').addEventListener('click', () => {
  if (addTarget) addMyBoard(addTarget);
  closeCard();
});

document.getElementById('addCancel').addEventListener('click', closeCard);
dim.addEventListener('click', closeCard);

/* ===== 헤더 ===== */
document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = HOME_PAGE;
});
