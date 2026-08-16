/* ===== 페이지 이동 ===== */
const COMMUNITY_PAGE = 'community.html';

/* ===== 어떤 게시판에 쓰는 글인지 =====
   community에서 write.html?board=게시판키 형태로 넘어온다.
   뒤로 가기 / 등록 둘 다 이 게시판의 community로 돌아간다.

   BOARDS / WORKS / USER_NICKNAME / resolveBoardKey / addNewPost는 js/data.js에 있다. */
const boardKey = resolveBoardKey(new URLSearchParams(window.location.search).get('board'));
const board = BOARDS[boardKey];

/* 작품 게시판(WORKS에 있는 게시판)에 쓰는 글이면 글에 붙는 작품이 이미 정해져 있다.
   테마 게시판은 정해진 작품이 없어서 관련 작품을 직접 골라야 한다. */
const isThemeBoard = !WORKS[boardKey];

/* ===== 화면 상태 ===== */
let category = '일반';
let rating = 0;         // 별점 작성바에 보이는, 완료를 눌러 확정한 별점
let cardRating = 0;     // 별점 작성 카드에서 고르는 중인 별점
let spoiler = false;
let selectedWork = null; // 테마 게시판에서 고른 관련 작품의 key
let workBarMode = 'rating'; // 작품 바에 무엇이 붙어 있는지 (rating / search / link)

const content = document.getElementById('content');
const boardName = document.getElementById('boardName');

const categoryBtn = document.getElementById('categoryBtn');
const categoryLabel = document.getElementById('categoryLabel');
const categoryMenu = document.getElementById('categoryMenu');
const categoryOptions = document.querySelectorAll('.category-option');

const anonCheck = document.getElementById('anonCheck');
const titleInput = document.getElementById('titleInput');
const textInput = document.getElementById('textInput');

const ratingBar = document.getElementById('ratingBar');
const ratingBarLabel = document.getElementById('ratingBarLabel');
const ratingBarScore = document.getElementById('ratingBarScore');
const ratingBarScoreBox = document.getElementById('ratingBarScoreBox');
const workSearchIcon = document.getElementById('workSearchIcon');
const workLinkIcon = document.getElementById('workLinkIcon');

const workSheet = document.getElementById('workSheet');
const workInput = document.getElementById('workInput');
const workList = document.getElementById('workList');
const ratingCard = document.getElementById('ratingCard');
const ratingCardScore = document.getElementById('ratingCardScore');
const ratingDone = document.getElementById('ratingDone');
const starButtons = Array.from(document.querySelectorAll('.star'));

const spoilerToggle = document.getElementById('spoilerToggle');
const dim = document.getElementById('dim');

boardName.textContent = `${board.title} 게시판`;

/* ===== 내용 입력칸 =====
   적은 만큼 늘어나야 해서 높이를 다시 재서 넣어준다.
   (scrollHeight는 테두리를 뺀 높이라 위아래 1px씩 더한다) */
function growText() {
  textInput.style.height = 'auto';
  textInput.style.height = `${textInput.scrollHeight + 2}px`;
}

textInput.addEventListener('input', () => {
  textInput.classList.remove('is-error');
  growText();
});

titleInput.addEventListener('input', () => {
  titleInput.classList.remove('is-error');
});

growText();

/* ===== 카테고리 dropdown =====
   별점 카드와 달리 뒤를 흐리지 않아서 다른 곳을 누르면 닫히도록 따로 봐준다. */
function openMenu() {
  /* 버튼 바로 아래에 열리도록 위치를 맞춘다.
     (내용이 길어져 화면이 스크롤됐을 수도 있어서 열 때마다 다시 잰다) */
  const button = categoryBtn.getBoundingClientRect();
  const phone = categoryBtn.closest('.phone').getBoundingClientRect();
  categoryMenu.style.top = `${button.bottom - phone.top + 15}px`;

  categoryMenu.hidden = false;
  categoryBtn.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  categoryMenu.hidden = true;
  categoryBtn.setAttribute('aria-expanded', 'false');
}

categoryBtn.addEventListener('click', () => {
  if (categoryMenu.hidden) openMenu();
  else closeMenu();
});

/* 열려 있을 때 메뉴 바깥을 누르면 닫는다.
   (카테고리 버튼은 바로 위에서 이미 여닫으니 여기서는 건드리지 않는다) */
document.addEventListener('click', (e) => {
  if (categoryMenu.hidden) return;
  if (categoryBtn.contains(e.target) || categoryMenu.contains(e.target)) return;
  closeMenu();
});

categoryOptions.forEach((option) => {
  option.addEventListener('click', () => {
    category = option.dataset.category;
    categoryLabel.textContent = category;

    categoryOptions.forEach((other) => {
      other.classList.toggle('is-selected', other === option);
    });

    updateWorkBar();
    closeMenu();

    /* 테마 게시판의 후기는 반드시 관련 작품을 골라야 해서
       카테고리를 고르자마자 검색창을 올려준다 */
    if (isThemeBoard && category === '후기' && !selectedWork) openSheet();
  });
});

// 처음 고른 상태(일반)를 메뉴에도 표시해 둔다
categoryOptions.forEach((option) => {
  option.classList.toggle('is-selected', option.dataset.category === category);
});

/* ===== 작품 바 =====
   게시판과 카테고리, 작품을 골랐는지에 따라 붙는 것이 달라진다.
     rating : 후기 - 오른쪽에 매긴 별점이 붙는다 (누르면 별점 작성 카드가 열린다)
     search : 테마 게시판인데 아직 작품을 고르지 않았을 때 (누르면 검색창이 올라온다)
     link   : 테마 게시판의 일반 / 토론 글에 작품을 골랐을 때 (누르면 다시 고를 수 있다) */
function setWorkBar(mode, label) {
  workBarMode = mode;

  ratingBarLabel.textContent = label;
  ratingBarScoreBox.hidden = mode !== 'rating';
  workSearchIcon.hidden = mode !== 'search';
  workLinkIcon.hidden = mode !== 'link';
}

function updateWorkBar() {
  /* 작품 게시판에 쓰는 글은 게시판의 작품이 곧 그 글의 작품이라
     후기일 때 별점만 매기면 되고, 일반 / 토론에는 작품 바가 붙지 않는다 */
  if (!isThemeBoard) {
    ratingBar.hidden = category !== '후기';
    setWorkBar('rating', '별점');
    return;
  }

  ratingBar.hidden = false;

  if (!selectedWork) {
    setWorkBar('search', '관련 작품 검색');
    return;
  }

  // 후기는 고른 작품에 별점까지 매긴다 (별점바의 '별점' 자리에 작품 제목이 들어간다)
  setWorkBar(category === '후기' ? 'rating' : 'link', WORKS[selectedWork].title);
}

updateWorkBar();

/* ===== 관련 작품 검색창 (테마 게시판) ===== */

/* 띄어쓰기와 대소문자를 무시하고 견주기 위해 양쪽을 같은 모양으로 만든다 */
function normalize(text) {
  return String(text).replace(/\s+/g, '').toLowerCase();
}

/* 작품명 또는 작가명으로 찾는다 (search 화면과 같은 방식이다) */
function renderWorkList() {
  const word = normalize(workInput.value.trim());

  const keys = Object.keys(WORKS).filter((key) => {
    if (!word) return true;
    return normalize(WORKS[key].title).indexOf(word) !== -1
        || normalize(WORKS[key].author).indexOf(word) !== -1;
  });

  workList.innerHTML = keys.length
    ? keys.map((key) => {
        const work = WORKS[key];
        return `<button class="work-row${key === selectedWork ? ' is-selected' : ''}"
                  type="button" data-work="${key}">
            <span class="row-cover"><img src="${work.cover}" alt=""></span>
            <span class="row-text">
              <span class="row-title">${workTitleLines(key)}</span>
              <span class="row-author">${work.author}</span>
            </span>
            <span class="row-check"></span>
          </button>`;
      }).join('')
    : '<p class="sheet-empty cap-trim">찾는 작품이 없습니다.</p>';
}

function openSheet() {
  renderWorkList();

  dim.hidden = false;
  workSheet.classList.add('is-open');
  workSheet.setAttribute('aria-hidden', 'false');
}

function closeSheet() {
  workSheet.classList.remove('is-open');
  workSheet.setAttribute('aria-hidden', 'true');
  dim.hidden = true;
}

workInput.addEventListener('input', renderWorkList);

workInput.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  renderWorkList();
});

document.getElementById('workSearchBtn').addEventListener('click', renderWorkList);
document.getElementById('sheetClose').addEventListener('click', closeSheet);

/* 작품을 고르면 체크가 찬 것을 잠깐 보여준 뒤 검색창이 내려가고,
   작품 바에 고른 작품의 제목이 들어간다 */
workList.addEventListener('click', (e) => {
  const row = e.target.closest('.work-row');
  if (!row) return;

  selectedWork = row.dataset.work;
  renderWorkList();
  updateWorkBar();

  setTimeout(closeSheet, 180);
});

/* ===== 별점 작성 카드 =====
   별 하나는 0점(빈 별) / 0.5점(반만 채운 별) / 1점(다 채운 별) 중 하나다.
   왼쪽부터 채워지니까 별점에서 그 별 앞까지의 점수를 빼면 이 별의 모양이 나온다. */
const STAR_SRC = {
  0: 'assets/icon-star-empty.svg',
  0.5: 'assets/icon-star-half.svg',
  1: 'assets/icon-star-full.svg'
};

function renderStars() {
  starButtons.forEach((button, i) => {
    const fill = Math.min(Math.max(cardRating - i, 0), 1);
    button.querySelector('img').src = STAR_SRC[fill];
  });

  ratingCardScore.textContent = cardRating.toFixed(1);
}

function openCard() {
  cardRating = rating; // 이미 매긴 별점이 있으면 그 상태에서 다시 고른다
  renderStars();

  dim.hidden = false;
  ratingCard.hidden = false;
}

function closeCard() {
  dim.hidden = true;
  ratingCard.hidden = true;
}

/* 별점을 매기는 바면 별점 카드를, 작품을 고르는 바면 검색창을 연다 */
ratingBar.addEventListener('click', () => {
  if (workBarMode === 'rating') openCard();
  else openSheet();
});

/* 별을 누르면 그 별까지 채워지고, 채워진 별을 한 번 더 누르면 반만 채워진다 */
starButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const value = Number(button.dataset.value);
    cardRating = cardRating === value ? value - 0.5 : value;
    renderStars();
  });
});

/* 완료를 누르면 방금 매긴 별점이 별점 작성바에 반영된다 */
ratingDone.addEventListener('click', () => {
  rating = cardRating;
  ratingBarScore.textContent = rating.toFixed(1);
  closeCard();
});

/* 막을 누르면 열려 있는 것을 닫는다 (별점은 완료를 눌러야 반영된다) */
dim.addEventListener('click', () => {
  closeCard();
  closeSheet();
});

/* ===== 스포일러 토글 ===== */
spoilerToggle.addEventListener('click', () => {
  spoiler = !spoiler;
  spoilerToggle.classList.toggle('is-on', spoiler);
  spoilerToggle.setAttribute('aria-checked', String(spoiler));
});

/* ===== 헤더 ===== */
function goBackToCommunity() {
  window.location.href = `${COMMUNITY_PAGE}?board=${boardKey}`;
}

document.getElementById('backBtn').addEventListener('click', goBackToCommunity);

/* 비어 있는 칸을 잠깐 표시하고 거기로 커서를 옮긴다 */
function pointOut(input) {
  input.classList.add('is-error');
  input.focus();
  content.scrollTop = 0;
}

document.getElementById('submitBtn').addEventListener('click', () => {
  const title = titleInput.value.trim();
  const text = textInput.value.trim();

  if (!title) return pointOut(titleInput);
  if (!text) return pointOut(textInput);

  // 테마 게시판의 후기는 관련 작품을 골라야 올릴 수 있어서 검색창을 대신 열어준다
  if (isThemeBoard && category === '후기' && !selectedWork) return openSheet();

  // 후기는 별점까지 매겨야 올릴 수 있어서 작성 카드를 대신 열어준다
  if (category === '후기' && rating === 0) return openCard();

  const post = {
    category,
    author: anonCheck.checked ? '익명' : userName(),
    anon: anonCheck.checked, // 익명으로 쓴 글은 이름을 바꿔도 계속 '익명'으로 보인다
    mine: true,              // 내가 쓴 글 (my / my_post 화면에서 모을 때 쓴다)
    title,
    text,
    spoiler,
    likes: 0,
    comments: 0,
    views: 0,
    time: '방금 전',
    createdAt: Date.now() // community에서 방금 쓴 글을 맨 위에 올릴 때 쓴다
  };

  /* 글에 붙는 작품 정보.
     작품 게시판에 쓴 후기는 그 게시판의 작품에 별점을 매긴 것으로 본다.
     테마 게시판에서는 직접 고른 작품이 붙는데, 후기가 아니면 별점 없이 이름만 붙는다
     (별점이 없는 작품 줄은 목록에서 별 대신 클립으로 보인다). */
  const workKey = WORKS[boardKey] ? boardKey : selectedWork;

  if (workKey && category === '후기') {
    post.work = { key: workKey, name: WORKS[workKey].title, score: rating.toFixed(1) };
  } else if (selectedWork) {
    post.work = { key: selectedWork, name: WORKS[selectedWork].title };
  }

  addNewPost(boardKey, post);
  goBackToCommunity();
});
