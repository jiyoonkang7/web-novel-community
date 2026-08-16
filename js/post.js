/* ===== 페이지 이동 ===== */
const COMMUNITY_PAGE = 'community.html';
const BOOKMARK_PAGE = 'bookmark.html';
const MY_POST_PAGE = 'my_post.html';

/* ===== 어떤 글을 열지 정하기 =====
   community에서 post.html?board=게시판키&post=글번호 형태로 넘어온다.
   bookmark에서 들어온 경우에는 &from=bookmark가 붙는다 (뒤로 갈 곳이 달라진다).
   게시판 데이터(BOARDS / WORKS / USER_NICKNAME)는 js/data.js에 있다. */
const params = new URLSearchParams(window.location.search);
const boardKey = resolveBoardKey(params.get('board'));
const board = BOARDS[boardKey];

const postIndex = Math.min(
  Math.max(Number(params.get('post')) || 0, 0),
  board.posts.length - 1
);
const post = board.posts[postIndex];

/* ===== 저장해 둔 값 (localStorage) =====
   글을 나갔다 들어와도 조회수 / 하트 / 북마크 / 내가 쓴 댓글이 남아 있어야 해서
   브라우저에 게시글마다 따로 저장해 둔다. key는 '게시판키:글번호' (community와 같다).
     views      : 이 글을 열어본 횟수 (원래 조회수에 더해서 보여준다. 새로고침은 세지 않는다)
     liked      : 하트를 누른 상태인지
     bookmarked : 북마크를 누른 상태인지
     bookmarkedAt : 북마크를 누른 시각. bookmark 화면이 최근에 누른 글부터 보여줄 때 쓴다
     comments   : 내가 쓴 댓글. 한 개는 이렇게 생겼다.
                  { order, person, name, text, time, parentOrder }
                  parentOrder가 있으면 그 order를 가진 댓글에 달린 답글이고,
                  null이면 새 댓글이다.

   community 페이지도 이 값을 읽어서 늘어난 조회수 / 하트 수 / 댓글 수를 보여준다. */
const STORAGE_KEY = 'deutgeul:posts';
const postKey = `${boardKey}:${postIndex}`;

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

const store = loadStore();
const saved = store[postKey] || (store[postKey] = {});
saved.comments = saved.comments || [];
saved.views = saved.views || 0;

/* 글을 열 때마다 조회수가 1씩 올라간다.
   단, 새로고침은 글에 다시 들어온 게 아니라서 세지 않는다.
   (어떻게 들어왔는지는 브라우저가 알려준다. 'reload'면 새로고침이다) */
const navigation = performance.getEntriesByType('navigation')[0];

if (!navigation || navigation.type !== 'reload') {
  saved.views += 1;
  saveStore(store);
}

const CATEGORY_CLASS = {
  '일반': 'cat-normal',
  '토론': 'cat-debate',
  '후기': 'cat-review'
};

/* ===== 댓글 데이터 =====
   이 글에 달린 댓글은 js/data.js의 COMMENTS에 게시글별로 적혀 있다.
   댓글 항목이 어떻게 생겼는지도 그쪽 주석에 정리해 두었다. */
const comments = COMMENTS[`${boardKey}:${postIndex}`] || [];

/* ===== 익명 번호 =====
   먼저 댓글을 단 사람부터 익명 1, 익명 2... 를 받는다.
   같은 사람이 또 쓰면 번호는 그대로다. */
const anonNumbers = new Map();
let nextAnonNumber = 1;

function anonNumberOf(person) {
  if (!anonNumbers.has(person)) {
    anonNumbers.set(person, nextAnonNumber);
    nextAnonNumber += 1;
  }
  return anonNumbers.get(person);
}

function flatten(roots) {
  const all = [];
  roots.forEach((comment) => {
    all.push(comment);
    comment.replies.forEach((reply) => all.push(reply));
  });
  return all;
}

// 손으로 적은 댓글은 답글이 없으면 replies를 생략할 수 있게 여기서 채워둔다
comments.forEach((comment) => {
  comment.replies = comment.replies || [];
});

/* 저장해 둔 내 댓글을 원래 자리에 다시 붙인다.
   먼저 쓴 것부터 저장돼 있어서 답글이 달릴 댓글은 항상 그 전에 자리를 잡는다.
   id는 아래에서 다른 댓글과 같이 새로 매긴다. */
saved.comments.forEach((item) => {
  const comment = {
    order: item.order,
    person: item.person,
    name: item.name,
    text: item.text,
    time: item.time,
    mine: true, // 저장해 둔 댓글은 전부 내가 쓴 댓글이다 (이름 / 사진을 지금 값으로 보여준다)
    replies: []
  };

  const parent = item.parentOrder == null
    ? null
    : comments.find((root) => root.order === item.parentOrder);

  if (parent) parent.replies.push(comment);
  else comments.push(comment);
});

/* 댓글마다 번호를 붙여두면 답글을 어디에 달지 찾기 쉽다 */
let nextId = 1;
let nextOrder = 1;
let commentTotal = 0;

flatten(comments).forEach((comment) => {
  comment.id = nextId;
  nextId += 1;
  commentTotal += 1;
  nextOrder = Math.max(nextOrder, comment.order + 1);
});

// 익명 번호는 화면 순서가 아니라 작성 순서(order)대로 매긴다
flatten(comments)
  .slice()
  .sort((a, b) => a.order - b.order)
  .forEach((comment) => {
    if (comment.person) anonNumberOf(comment.person);
  });

/* 내가 쓴 댓글은 my 화면에서 이름을 바꿨을 수 있어서 저장해 둔 이름 대신 지금 이름을 쓴다
   (익명으로 단 댓글은 이름을 바꿔도 계속 '익명 N'이다) */
function displayName(comment) {
  if (comment.person) return `익명 ${anonNumbers.get(comment.person)}`;
  return comment.mine ? userName() : comment.name;
}

/* 프로필 사진도 마찬가지로 내가 쓴 것만 지금 사진으로 보여준다 */
function displayPhoto(mine) {
  return mine ? userPhoto() : 'assets/profile.jpg';
}

/* 게시글 글쓴이 이름 (내가 쓴 글이면 지금 이름, 익명으로 올렸으면 그대로 '익명') */
function authorName() {
  return post.mine && !post.anon ? userName() : post.author;
}

/* ===== 게시글 그리기 ===== */
const likeBtn = document.getElementById('likeBtn');
const likeCount = document.getElementById('likeCount');
const commentCount = document.getElementById('commentCount');
const commentList = document.getElementById('commentList');
const bookmarkBtn = document.getElementById('bookmarkBtn');
const ratingBanner = document.getElementById('ratingBanner');

const postCategory = document.getElementById('postCategory');

document.getElementById('postAuthor').textContent = authorName();
document.getElementById('postAvatar').src = displayPhoto(post.mine && !post.anon);
document.getElementById('postTime').textContent = post.time;
document.getElementById('postTitle').textContent = post.title;
document.getElementById('postText').textContent = post.text;
// 조회수는 원래 수에 이 글을 열어본 만큼 더한 값이다 (방금 연 것도 포함)
document.getElementById('postViews').textContent = `${post.views + saved.views} 조회`;

postCategory.textContent = post.category;
postCategory.classList.add(CATEGORY_CLASS[post.category]);

/* 하트는 눌러둔 상태를 그대로 되살린다 */
let liked = saved.liked === true;
let likes = post.likes + (liked ? 1 : 0);

likeCount.textContent = likes;
likeBtn.classList.toggle('is-on', liked);
likeBtn.setAttribute('aria-pressed', String(liked));

commentCount.textContent = commentTotal;

/* 작품이 붙은 게시글이면 작품 배너를 보여준다.
   후기 글에는 글쓴이가 매긴 별점과 작품 전체 별점이 나란히 붙고,
   작품만 연결한 일반 / 토론 글에는 home의 추천 배너처럼 전체 별점만 붙는다. */
if (post.work) {
  const work = WORKS[post.work.key];

  document.getElementById('ratingCover').src = work.cover;
  document.getElementById('ratingCover').alt = work.title;
  // 배너는 두 줄까지 쓸 수 있어서 줄바꿈 자리를 정해 둔 작품은 그 모양대로 보여준다
  document.getElementById('ratingTitle').textContent = workTitleLines(post.work.key);
  document.getElementById('ratingDesc').textContent = work.desc;

  if (post.work.score) {
    document.getElementById('ratingUser').textContent = authorName();    // 별점을 매긴 사람
    document.getElementById('ratingMine').textContent = post.work.score; // 그 사람이 준 별점
  } else {
    /* 별점이 전체 별점 하나뿐이면 home의 추천 작품 배너와 똑같이 보여준다
       (나란히 놓을 때만 회색이고, 혼자 있을 때는 빨간 별이다) */
    document.querySelector('.rating-mine').hidden = true;
    document.querySelector('.rating-score.is-all').classList.remove('is-all');
  }

  document.getElementById('ratingAll').textContent = work.score;       // 작품 전체 별점
  ratingBanner.hidden = false;

  /* 배너를 누르면
       작품 게시판의 글  : 이미 그 작품의 게시판을 보고 있으니 작품을 볼 수 있는 곳으로 보낸다
                          (주소를 아직 안 넣어 둔 작품이면 아무 일도 하지 않는다)
       테마 게시판의 글  : 그 작품의 게시판으로 간다.
                          돌아올 자리를 fb(게시판) / fp(글 번호)로 같이 넘겨서
                          그 게시판에서 뒤로 가기를 누르면 이 글로 되돌아오게 한다 */
  ratingBanner.addEventListener('click', () => {
    if (WORKS[boardKey]) {
      if (work.link) window.open(work.link, '_blank', 'noopener');
      return;
    }

    window.location.href =
      `${COMMUNITY_PAGE}?board=${post.work.key}&from=post&fb=${boardKey}&fp=${postIndex}`;
  });
}

/* ===== 댓글 그리기 ===== */
function commentBody(comment) {
  return `<span class="avatar"><img src="${displayPhoto(comment.mine && !comment.person)}" alt=""></span>
      <div class="comment-main">
        <div class="comment-head">
          <p class="comment-name cap-trim">${displayName(comment)}</p>
          <p class="comment-time cap-trim">${comment.time}</p>
        </div>
        <p class="comment-text cap-trim">${comment.text}</p>
      </div>`;
}

function commentMarkup(comment, rootId) {
  const isReply = comment.id !== rootId;

  const body = isReply
    ? `<img class="icon-reply-arrow" src="assets/icon-reply-arrow.svg" alt="답글">
       <div class="reply-box">${commentBody(comment)}</div>`
    : commentBody(comment);

  return `<li class="comment${isReply ? ' is-reply' : ''}"
              data-id="${comment.id}" data-root="${rootId}" tabindex="0">${body}</li>`;
}

function renderComments() {
  commentList.innerHTML = comments
    .map((comment) => [comment].concat(comment.replies)
      .map((item) => commentMarkup(item, comment.id))
      .join(''))
    .join('');

  // 답글을 달려고 고른 댓글은 배경을 살짝 다르게 둔다
  if (replyTo) {
    commentList
      .querySelectorAll(`.comment[data-id="${replyTo.id}"]`)
      .forEach((el) => el.classList.add('is-target'));
  }
}

/* ===== 하트 / 북마크 =====
   (하트를 켜둔 상태는 게시글을 그릴 때 이미 되살려 두었다) */
const bookmarked = saved.bookmarked === true;
bookmarkBtn.classList.toggle('is-on', bookmarked);
bookmarkBtn.setAttribute('aria-pressed', String(bookmarked));

likeBtn.addEventListener('click', () => {
  liked = !liked;
  likes += liked ? 1 : -1;

  likeCount.textContent = likes;
  likeBtn.classList.toggle('is-on', liked);
  likeBtn.setAttribute('aria-pressed', String(liked));

  saved.liked = liked; // 나갔다 와도 누른 상태가 남아 있게 저장해 둔다
  saveStore(store);
});

bookmarkBtn.addEventListener('click', () => {
  const on = !bookmarkBtn.classList.contains('is-on');
  bookmarkBtn.classList.toggle('is-on', on);
  bookmarkBtn.setAttribute('aria-pressed', String(on));

  saved.bookmarked = on;
  saved.bookmarkedAt = on ? Date.now() : 0; // bookmark 화면에서 최근에 누른 글이 위로 오게
  saveStore(store);
});

/* ===== 헤더 (들어온 화면으로 돌아간다) =====
   bookmark / my_post에서 들어왔으면 그 화면으로, 아니면 이 글이 있던 게시판으로 돌아간다.
   from=search / from=post는 그 게시판을 어디에서 열었는지를 적어둔 것이라
   게시판으로 가되 그 표시를 그대로 들고 가서 게시판의 뒤로 가기도 제자리를 찾게 한다. */
const from = params.get('from');

const BACK_PAGE = {
  bookmark: BOOKMARK_PAGE,
  mypost: MY_POST_PAGE
};

function boardTrail() {
  if (from === 'search') return '&from=search';
  if (from === 'post') return `&from=post&fb=${params.get('fb')}&fp=${params.get('fp')}`;
  return '';
}

document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = BACK_PAGE[from] || `${COMMUNITY_PAGE}?board=${boardKey}${boardTrail()}`;
});

/* ===== 댓글 작성 ===== */
const commentForm = document.getElementById('commentForm');
const commentInput = document.getElementById('commentInput');
const anonCheck = document.getElementById('anonCheck');

const MY_PERSON = 'me'; // 내가 익명으로 쓴 댓글은 전부 같은 번호를 쓴다

let replyTo = null; // { id, rootId, name } - 답글을 달 대상

function findRoot(rootId) {
  return comments.find((comment) => comment.id === rootId);
}

function setReplyTo(target) {
  replyTo = target;

  commentInput.placeholder = target
    ? `${target.name}에게 답글`
    : '댓글을 남겨보세요.';

  renderComments();
  commentInput.focus();
}

/* 댓글을 누르면 그 댓글에 답글을 단다 (한 번 더 누르면 취소) */
commentList.addEventListener('click', (e) => {
  const item = e.target.closest('.comment');
  if (!item) return;

  const id = Number(item.dataset.id);
  if (replyTo && replyTo.id === id) {
    setReplyTo(null);
    return;
  }

  setReplyTo({
    id,
    rootId: Number(item.dataset.root),
    name: item.querySelector('.comment-name').textContent
  });
});

commentList.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  if (!e.target.classList.contains('comment')) return;
  e.preventDefault();
  e.target.click();
});

commentInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && replyTo) setReplyTo(null);
});

commentForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const text = commentInput.value.trim();
  if (!text) return;

  const anonymous = anonCheck.checked;
  const comment = {
    id: nextId,
    order: nextOrder,
    person: anonymous ? MY_PERSON : null,
    name: anonymous ? null : userName(),
    text,
    time: '방금 전',
    mine: true,
    replies: []
  };

  nextId += 1;
  nextOrder += 1;
  commentTotal += 1;

  if (anonymous) anonNumberOf(MY_PERSON);

  // 답글 대상이 있으면 그 댓글에, 없으면 새 댓글로 단다
  const root = replyTo ? findRoot(replyTo.rootId) : null;
  if (root) root.replies.push(comment);
  else comments.push(comment);

  /* 나갔다 들어와도 남아 있도록 저장해 둔다.
     id는 글을 열 때마다 새로 매기니까 자리를 찾을 수 있는 order만 저장한다. */
  saved.comments.push({
    order: comment.order,
    person: comment.person,
    name: comment.name,
    text: comment.text,
    time: comment.time,
    parentOrder: root ? root.order : null
  });
  saveStore(store);

  commentCount.textContent = commentTotal;
  commentInput.value = '';

  setReplyTo(null);

  // 방금 쓴 댓글이 보이도록 내려준다
  const added = commentList.querySelector(`.comment[data-id="${comment.id}"]`);
  if (added) added.scrollIntoView({ block: 'center', behavior: 'smooth' });
});

renderComments();