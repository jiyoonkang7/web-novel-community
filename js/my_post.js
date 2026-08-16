/* ===== 페이지 이동 ===== */
const MY_PAGE = 'my.html';
const POST_PAGE = 'post.html';

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

/* 원래 게시글에 적힌 수 + 저장해 둔 만큼 더한 수 (community 화면과 같게 보이도록) */
function countsOf(post, saved) {
  return {
    likes: post.likes + (saved.liked ? 1 : 0),
    comments: post.comments + (saved.comments ? saved.comments.length : 0),
    views: post.views + (saved.views || 0)
  };
}

const postList = document.getElementById('postList');

const CATEGORY_CLASS = {
  '일반': 'cat-normal',
  '토론': 'cat-debate',
  '후기': 'cat-review'
};

/* ===== 게시글 그리기 (community 화면과 같은 모양) ===== */
function postMarkup({ post, boardKey, index }, store) {
  const counts = countsOf(post, store[`${boardKey}:${index}`] || {});

  // 스포일러가 있는 글은 내용 대신 '스포일러 포함'을 보여준다
  const text = post.spoiler
    ? '<p class="post-text is-spoiler cap-trim">스포일러 포함</p>'
    : `<p class="post-text cap-trim">${post.text}</p>`;

  /* 지우기 버튼은 이 화면에만 있다 (bookmark 화면의 북마크 버튼과 같은 자리).
     여기 있는 글은 전부 내가 쓴 글이라 어느 글에나 붙는다. */
  const remove = `<button class="post-delete" type="button" aria-label="게시글 삭제">
        <img class="icon-delete" src="assets/icon-delete.svg" alt="">
      </button>`;

  // 여러 게시판의 글이 섞여 있어서 게시판 키도 같이 들고 있어야 한다
  return `<article class="post" data-board="${boardKey}" data-index="${index}">
      <div class="post-cat">
        <span class="cat-chip ${CATEGORY_CLASS[post.category]}">${post.category}</span>
      </div>
      ${remove}
      <div class="post-body">
        <p class="post-title cap-trim">${post.title}</p>
        ${text}
      </div>
      ${workChipMarkup(post.work)}
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

/* 내가 쓴 글은 js/data.js의 myPosts()가 최근에 쓴 순서로 모아준다 */
function render() {
  const store = loadStore();
  const found = myPosts();

  postList.innerHTML = found.length
    ? found.map((item) => postMarkup(item, store)).join('')
    : '<p class="empty cap-trim">작성한 게시글이 없습니다.</p>';
}

render();

/* ===== 삭제 확인 카드 =====
   지우기를 누르면 바로 지우지 않고 정말 지울지 한 번 묻는다. */
const dim = document.getElementById('dim');
const deleteCard = document.getElementById('deleteCard');
const deleteTitle = document.getElementById('deleteTitle');

let deleteTarget = null; // { board, index }

function openDeleteCard(board, index, title) {
  deleteTarget = { board, index };
  deleteTitle.textContent = `‘${title}’`;

  dim.hidden = false;
  deleteCard.hidden = false;
}

function closeDeleteCard() {
  deleteTarget = null;
  dim.hidden = true;
  deleteCard.hidden = true;
}

document.getElementById('deleteConfirm').addEventListener('click', () => {
  if (deleteTarget) deleteMyPost(deleteTarget.board, deleteTarget.index);

  closeDeleteCard();
  render(); // 지운 글은 이 목록에서도 community에서도 사라진다
});

document.getElementById('deleteCancel').addEventListener('click', closeDeleteCard);
dim.addEventListener('click', closeDeleteCard);

/* ===== 게시글 누르기 =====
   지우기 버튼을 누르면 삭제 확인 카드가 뜨고, 그 밖을 누르면 그 글의 post 화면으로 간다.
   post 화면에는 from=mypost를 같이 넘겨서 뒤로 가기가 이 화면으로 돌아오게 한다. */
postList.addEventListener('click', (e) => {
  const article = e.target.closest('.post');
  if (!article) return;

  const { board, index } = article.dataset;

  if (e.target.closest('.post-delete')) {
    openDeleteCard(board, index, article.querySelector('.post-title').textContent);
    return;
  }

  window.location.href = `${POST_PAGE}?board=${board}&post=${index}&from=mypost`;
});

/* 뒤로 가기로 돌아오면 화면이 그대로 남아 있는 경우가 있어서 다시 그린다 */
window.addEventListener('pageshow', (e) => {
  if (e.persisted) render();
});

/* ===== 헤더 ===== */
document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = MY_PAGE;
});
