/* ===== 페이지 이동 (빈 값은 지금 화면이거나 아직 만들지 않은 페이지) ===== */
const POST_PAGE = 'post.html';

/* 내비게이터의 data-nav 값으로 갈 페이지를 찾는다 (bookmark는 지금 화면이라 비워둔다) */
const NAV_PAGE = {
  bookmark: '',
  home: 'home.html',
  my: 'my.html'
};

function goTo(page) {
  if (!page) return; // 지금 화면이거나 아직 만들지 않은 페이지면 이동하지 않음
  window.location.href = page;
}

/* ===== 저장해 둔 값 (localStorage) =====
   post 페이지에서 북마크를 누르면 그 게시글에 bookmarked와 누른 시각(bookmarkedAt)이 남는다.
   이 화면은 게시판을 가리지 않고 bookmarked가 켜진 글만 모아서 보여준다.
   저장 형태는 js/post.js 위쪽 주석에 정리해 두었다. */
const STORAGE_KEY = 'deutgeul:posts';

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {}; // 저장된 값이 깨져 있으면 없는 셈 친다
  }
}

function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    // 저장이 막혀 있으면(용량 초과 등) 이번 화면에서만 유지된다
  }
}

/* 원래 게시글에 적힌 수 + 저장해 둔 만큼 더한 수 (community 화면과 같게 보이도록) */
function countsOf(post, saved) {
  return {
    likes: post.likes + (saved.liked ? 1 : 0),
    comments: post.comments + (saved.comments ? saved.comments.length : 0),
    views: post.views + (saved.views || 0)
  };
}

/* 북마크한 게시글을 최근에 북마크한 순서로 모은다.
   글이 어느 게시판의 몇 번째 글인지도 같이 들고 다녀야 post 페이지로 넘길 수 있다.
   (bookmarkedAt이 없는 예전 기록은 0으로 봐서 뒤로 밀린다) */
function bookmarkedPosts() {
  const store = loadStore();
  const found = [];

  Object.keys(BOARDS).forEach((key) => {
    BOARDS[key].posts.forEach((post, index) => {
      const saved = store[`${key}:${index}`] || {};
      // my_post에서 지운 글은 북마크해 뒀더라도 보여주지 않는다
      if (saved.bookmarked && !post.deleted) found.push({ post, boardKey: key, index, saved });
    });
  });

  return found.sort((a, b) => (b.saved.bookmarkedAt || 0) - (a.saved.bookmarkedAt || 0));
}

/* 북마크 풀기 - 목록에서 바로 누를 수 있다 */
function removeBookmark(boardKey, index) {
  const store = loadStore();
  const saved = store[`${boardKey}:${index}`];
  if (!saved) return;

  saved.bookmarked = false;
  saved.bookmarkedAt = 0;
  saveStore(store);
}

const postList = document.getElementById('postList');

const CATEGORY_CLASS = {
  '일반': 'cat-normal',
  '토론': 'cat-debate',
  '후기': 'cat-review'
};

/* ===== 게시글 그리기 (community 화면과 같은 모양 + 북마크 버튼) ===== */
function postMarkup({ post, boardKey, index, saved }) {
  const counts = countsOf(post, saved);

  // 스포일러가 있는 글은 내용 대신 '스포일러 포함'을 보여준다
  const text = post.spoiler
    ? '<p class="post-text is-spoiler cap-trim">스포일러 포함</p>'
    : `<p class="post-text cap-trim">${post.text}</p>`;

  /* 작품이 붙은 글에만 작품 줄이 붙는다 (js/data.js의 workChipMarkup).
     후기는 글쓴이가 매긴 별점이, 작품을 연결한 일반 / 토론 글은 클립이 오른쪽에 온다 */
  const work = workChipMarkup(post.work);

  /* 북마크 버튼은 이 화면에만 있다 (community 목록에는 붙이지 않는다).
     목록에 있는 글은 전부 북마크한 글이라 항상 눌린 상태로 그린다.
     색을 채워야 해서 assets/icon-bookmark.svg의 path를 그대로 넣었다. */
  const bookmark = `<button class="post-bookmark is-on" type="button"
              aria-pressed="true" aria-label="북마크 취소">
        <svg class="icon-bookmark" width="15" height="19" viewBox="0 0 15 19"
             fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M14.5 0.5H0.5V18.5L7.0625 15.5811L14.5 18.5V0.5Z"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>`;

  // 여러 게시판의 글이 섞여 있어서 게시판 키도 같이 들고 있어야 한다
  return `<article class="post" data-board="${boardKey}" data-index="${index}">
      <div class="post-cat">
        <span class="cat-chip ${CATEGORY_CLASS[post.category]}">${post.category}</span>
      </div>
      ${bookmark}
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

function render() {
  const found = bookmarkedPosts();

  postList.innerHTML = found.length
    ? found.map(postMarkup).join('')
    : '<p class="empty cap-trim">북마크한 게시글이 없습니다.</p>';
}

render();

/* ===== 게시글 누르기 =====
   북마크 버튼을 누르면 북마크만 풀고, 그 밖을 누르면 그 글의 post 화면으로 간다.
   post 화면에는 from=bookmark를 같이 넘겨서 뒤로 가기가 이 화면으로 돌아오게 한다.
   (글을 지우는 건 my_post 화면에서만 한다) */
postList.addEventListener('click', (e) => {
  const article = e.target.closest('.post');
  if (!article) return;

  const { board, index } = article.dataset;

  if (e.target.closest('.post-bookmark')) {
    removeBookmark(board, index);
    render(); // 북마크를 푼 글은 목록에서 사라진다
    return;
  }

  window.location.href = `${POST_PAGE}?board=${board}&post=${index}&from=bookmark`;
});

/* 북마크를 풀고 돌아왔을 때 화면이 그대로 남아 있는 경우가 있어서 다시 그린다 */
window.addEventListener('pageshow', (e) => {
  if (e.persisted) render();
});

/* ===== 내비게이터 =====
   누른 버튼을 켜주고, 갈 페이지가 있으면 그 화면으로 넘어간다. */
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    navItems.forEach((other) => other.classList.remove('is-active'));
    item.classList.add('is-active');

    goTo(NAV_PAGE[item.dataset.nav]);
  });
});
