/* ===== 페이지 이동 ===== */
const HOME_PAGE = 'home.html';
const SEARCH_PAGE = 'search.html';
const WRITE_PAGE = 'write.html';
const POST_PAGE = 'post.html';

/* ===== 게시판 데이터 =====
   community 페이지는 home에서 게시판을 눌렀을 때 열리는 화면이라
   게시판 이름과 게시글이 게시판마다 다르다.
   home에서 community.html?board=게시판키 형태로 넘겨주면 된다.

   BOARDS / DEFAULT_BOARD / resolveBoardKey는 js/data.js에 있다.
   post 페이지도 같은 게시글을 보여줘야 해서 따로 뺐다. */
const params = new URLSearchParams(window.location.search);
const boardKey = resolveBoardKey(params.get('board'));
const board = BOARDS[boardKey];

/* ===== 이 게시판을 어디에서 열었는지 =====
   뒤로 가기가 돌아갈 자리가 달라져서 주소에 표시가 붙어 온다.
     from=search : search에서 표지를 눌러 들어왔다 → search로 돌아간다
     from=post   : 어떤 글의 작품 배너를 눌러 들어왔다 → 그 글로 돌아간다
                   (fb = 그 글이 있던 게시판, fp = 그 글의 번호)
   글을 열었다 돌아와도 그대로 남도록 post로 넘어갈 때 이 표시를 같이 넘긴다. */
const from = params.get('from');
const fromBoard = params.get('fb');
const fromPost = params.get('fp');

const trail = from === 'search' ? '&from=search'
  : (from === 'post' ? `&from=post&fb=${fromBoard}&fp=${fromPost}` : '');

/* ===== 저장해 둔 값 (localStorage) =====
   post 페이지에서 글을 열거나 하트를 누르거나 댓글을 달면 그 내용이 브라우저에 남는다.
   목록에도 늘어난 조회수 / 하트 수 / 댓글 수를 같이 보여줘야 해서 여기서도 읽는다.
   무엇을 어떤 모양으로 저장하는지는 js/post.js 위쪽 주석에 정리해 두었다. */
const STORAGE_KEY = 'deutgeul:posts';

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {}; // 저장된 값이 깨져 있으면 없는 셈 친다
  }
}

/* 원래 게시글에 적힌 수 + 저장해 둔 만큼 더한 수 */
function countsOf(post, index, store) {
  const saved = store[`${boardKey}:${index}`] || {};

  return {
    likes: post.likes + (saved.liked ? 1 : 0),
    comments: post.comments + (saved.comments ? saved.comments.length : 0),
    views: post.views + (saved.views || 0)
  };
}

/* ===== 화면 상태 ===== */
let selectedCategory = null; // null이면 '전체'
let hideSpoiler = false;
let isMenuOpen = false;

const postList = document.getElementById('postList');
const boardTitle = document.getElementById('boardTitle');
const categoryBtn = document.getElementById('categoryBtn');
const categoryLabel = document.getElementById('categoryLabel');
const categoryMenu = document.getElementById('categoryMenu');
const categoryOptions = document.querySelectorAll('.category-option');
const spoilerToggle = document.getElementById('spoilerToggle');
const dim = document.getElementById('dim');

const CATEGORY_CLASS = {
  '일반': 'cat-normal',
  '토론': 'cat-debate',
  '후기': 'cat-review'
};

/* ===== 게시글 그리기 =====
   counts는 countsOf가 만든 값으로, 원래 수에 post 페이지에서 늘어난 만큼이 더해져 있다. */
function postMarkup(post, index, counts) {
  // 스포일러가 있는 글은 내용 대신 '스포일러 포함'을 보여준다
  const text = post.spoiler
    ? '<p class="post-text is-spoiler cap-trim">스포일러 포함</p>'
    : `<p class="post-text cap-trim">${post.text}</p>`;

  /* 작품이 붙은 글에만 작품 줄이 붙는다 (js/data.js의 workChipMarkup).
     후기는 글쓴이가 매긴 별점이, 작품을 연결한 일반 / 토론 글은 클립이 오른쪽에 온다 */
  const work = workChipMarkup(post.work);

  // data-index는 post 페이지로 넘길 글 번호다 (필터와 무관한 원래 순서)
  return `<article class="post" data-index="${index}">
      <div class="post-cat">
        <span class="cat-chip ${CATEGORY_CLASS[post.category]}">${post.category}</span>
      </div>
      <div class="post-body">
        <p class="post-title cap-trim">${post.title}</p>
        ${text}
      </div>
      ${work}
      <div class="post-footer">
        <div class="post-reactions">
          <span class="reaction">
            <img class="icon-like" src="assets/icon-like.svg" alt="마음">
            <span class="cap-trim">${counts.likes}</span>
          </span>
          <span class="reaction">
            <img class="icon-comment" src="assets/icon-comment.svg" alt="댓글">
            <span class="cap-trim">${counts.comments}</span>
          </span>
        </div>
        <div class="post-info">
          <span class="cap-trim">조회 ${counts.views}</span>
          <span class="cap-trim">${post.time}</span>
        </div>
      </div>
    </article>`;
}

function visiblePosts() {
  // 걸러낸 뒤에도 원래 글 번호를 알아야 해서 index를 같이 들고 다닌다
  return board.posts
    .map((post, index) => ({ post, index }))
    .filter(({ post }) => {
      if (post.deleted) return false; // my_post에서 지운 내 글
      if (selectedCategory && post.category !== selectedCategory) return false;
      if (hideSpoiler && post.spoiler) return false;
      return true;
    })
    /* write에서 쓴 글은 목록 뒤에 붙어 있으니 여기서 위로 올린다 (늦게 쓴 글이 맨 위).
       원래 글들은 createdAt이 없어서 0으로 묶여 적어둔 순서 그대로 남는다. */
    .sort((a, b) => (b.post.createdAt || 0) - (a.post.createdAt || 0));
}

function render() {
  // 저장해 둔 값은 그릴 때마다 새로 읽는다 (post 페이지에서 바뀌었을 수 있다)
  const store = loadStore();
  const found = visiblePosts();

  /* search에서 갓 추가한 작품처럼 아직 글이 하나도 없는 게시판도 있다 */
  postList.innerHTML = found.length
    ? found.map(({ post, index }) => postMarkup(post, index, countsOf(post, index, store))).join('')
    : '<p class="empty cap-trim">아직 게시글이 없습니다.</p>';
}

boardTitle.textContent = board.title;
render();

/* ===== 게시글을 누르면 그 글의 post 화면으로 ===== */
postList.addEventListener('click', (e) => {
  const article = e.target.closest('.post');
  if (!article) return;

  // 어디에서 들어왔는지도 같이 넘겨야 글에서 돌아왔을 때 뒤로 갈 곳이 그대로 남는다
  window.location.href = `${POST_PAGE}?board=${boardKey}&post=${article.dataset.index}${trail}`;
});

/* 뒤로 가기로 돌아오면 화면이 그대로 남아 있는 경우가 있어서 다시 그린다 */
window.addEventListener('pageshow', (e) => {
  if (e.persisted) render();
});

/* ===== 헤더 / 글쓰기 버튼 ===== */
/* 들어온 자리로 돌아간다 (search / 작품 배너를 눌렀던 글 / 아니면 home) */
document.getElementById('backBtn').addEventListener('click', () => {
  if (from === 'search') {
    window.location.href = SEARCH_PAGE;
  } else if (from === 'post' && BOARDS[fromBoard]) {
    window.location.href = `${POST_PAGE}?board=${fromBoard}&post=${fromPost}`;
  } else {
    window.location.href = HOME_PAGE;
  }
});

/* 글쓰기 버튼을 누르면 지금 보고 있는 게시판에 글을 쓰러 간다.
   write 페이지의 뒤로 가기 / 등록도 이 게시판으로 돌아온다. */
document.getElementById('writeBtn').addEventListener('click', () => {
  window.location.href = `${WRITE_PAGE}?board=${boardKey}`;
});

/* ===== 카테고리 선택 dropdown ===== */
function openMenu() {
  isMenuOpen = true;
  dim.hidden = false;
  categoryMenu.hidden = false;
  categoryBtn.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  isMenuOpen = false;
  dim.hidden = true;
  categoryMenu.hidden = true;
  categoryBtn.setAttribute('aria-expanded', 'false');
}

categoryBtn.addEventListener('click', () => {
  if (isMenuOpen) closeMenu();
  else openMenu();
});

dim.addEventListener('click', closeMenu);

categoryOptions.forEach((option) => {
  option.addEventListener('click', () => {
    const value = option.dataset.category || null; // '전체'는 값이 비어 있다

    // 이미 고른 카테고리를 다시 눌러도 '전체'로 돌아간다
    selectedCategory = selectedCategory === value ? null : value;
    categoryLabel.textContent = selectedCategory || '전체';

    categoryOptions.forEach((other) => {
      const otherValue = other.dataset.category || null;
      other.classList.toggle('is-selected', otherValue === selectedCategory);
    });

    closeMenu();
    render();
  });
});

/* ===== 스포일러 숨기기 토글 ===== */
spoilerToggle.addEventListener('click', () => {
  hideSpoiler = !hideSpoiler;
  spoilerToggle.classList.toggle('is-on', hideSpoiler);
  spoilerToggle.setAttribute('aria-checked', String(hideSpoiler));
  render();
});