/* ===== 페이지 이동 (빈 값은 아직 만들지 않은 페이지 - 추후 채워넣을 것) ===== */
const NOTIFICATION_PAGE = '';
const SEARCH_PAGE = 'search.html';
const COMMUNITY_PAGE = 'community.html';

/* 내비게이터의 data-nav 값으로 갈 페이지를 찾는다 (home은 지금 화면이라 비워둔다) */
const NAV_PAGE = {
  bookmark: 'bookmark.html',
  home: '',
  my: 'my.html'
};

function goTo(page) {
  if (!page) return; // 아직 만들지 않은 페이지면 이동하지 않음
  window.location.href = page;
}

document.getElementById('notificationBtn').addEventListener('click', () => {
  goTo(NOTIFICATION_PAGE);
});

document.getElementById('searchBarBtn').addEventListener('click', () => {
  goTo(SEARCH_PAGE);
});

/* ===== 마우스 드래그로 가로 스크롤 =====
   마우스일 때만 직접 처리하고, 터치/펜은 브라우저 기본 스크롤에 맡긴다. */
function enableDragScroll(el, onDragEnd) {
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
    if (onDragEnd) onDragEnd(moved);
  }

  el.addEventListener('pointerdown', (e) => {
    // 터치로 눌렀을 때도 초기화해야 이전 드래그 때문에 탭이 막히지 않는다
    moved = false;
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    dragging = true;
    startX = e.clientX;
    startScrollLeft = el.scrollLeft;
    el.classList.add('dragging');

    /* setPointerCapture는 쓰지 않는다.
       캡처를 걸면 마우스를 뗄 때 mouseup이 이 요소로 재지정되고,
       click의 target이 배너가 아니라 이 요소가 되어 배너 클릭이 먹지 않는다.
       대신 window에서 나머지 드래그를 듣는다 (요소 밖으로 나가도 따라온다). */
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  });

  // 드래그로 끝난 동작이 클릭으로 이어지지 않게 막는다
  el.addEventListener('click', (e) => {
    if (!moved) return;
    moved = false; // 드래그 직후 한 번만 막고, 다음 클릭은 그대로 통과시킨다
    e.preventDefault();
    e.stopPropagation();
  }, true);

  // 이미지의 기본 드래그(고스트 이미지) 방지
  el.addEventListener('dragstart', (e) => e.preventDefault());
}

/* ===== 테마 게시판 실린더 ===== */
const themeSlider = document.getElementById('themeSlider');
const dots = document.querySelectorAll('#dotIndicator .dot');

const BANNER_WIDTH = 349;
const GAP = 20;
const STEP = BANNER_WIDTH + GAP; // 369

function currentIndex() {
  const index = Math.round(themeSlider.scrollLeft / STEP);
  return Math.max(0, Math.min(dots.length - 1, index));
}

// 드래그를 놓으면 가장 가까운 배너로 맞춰준다
function snapToBanner() {
  themeSlider.scrollTo({ left: currentIndex() * STEP, behavior: 'smooth' });
}

enableDragScroll(themeSlider, snapToBanner);

// 방향키로 이동
themeSlider.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    themeSlider.scrollBy({ left: STEP, behavior: 'smooth' });
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    themeSlider.scrollBy({ left: -STEP, behavior: 'smooth' });
  }
});

// 스크롤 위치에 따라 dot indicator 갱신
let scrollTicking = false;

function updateDots() {
  const index = currentIndex();
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
  scrollTicking = false;
}

themeSlider.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(updateDots);
    scrollTicking = true;
  }
});

/* ===== 내 게시판 =====
   내 게시판에 담긴 작품은 js/data.js가 들고 있다 (search 화면에서 추가하면 뒤에 붙는다).
   작품 정보(표지 / 별점 / 좋아요 수)도 WORKS에 있는 값을 그대로 쓴다. */
function boardCardMarkup(key) {
  const work = WORKS[key];

  return `<article class="board-card" data-board="${key}" role="button" tabindex="0">
      <img class="board-cover" src="${work.cover}" alt="${work.title}">
      <div class="board-detail">
        <p class="board-name">${work.title}</p>
        <p class="board-new">새 게시글 +${work.newPosts}</p>
        <div class="board-meta">
          <span class="meta-group">
            <img class="icon-star" src="assets/icon-star.svg" alt="별점">
            <span class="score">${work.score}</span>
          </span>
          <span class="meta-group">
            <img class="icon-heart" src="assets/icon-heart.svg" alt="좋아요">
            <span class="likes">${work.like}</span>
          </span>
        </div>
      </div>
    </article>`;
}

/* 맨 끝에는 작품을 더 담으러 가는 + 버튼이 붙는다 (누르면 search로 간다) */
const ADD_BUTTON = `<button class="board-add" id="boardAddBtn" type="button" aria-label="작품 추가">
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5V19M5 12H19"
            stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  </button>`;

document.getElementById('boardList').innerHTML =
  loadMyBoards().map(boardCardMarkup).join('') + ADD_BUTTON;

document.getElementById('boardAddBtn').addEventListener('click', () => {
  goTo(SEARCH_PAGE);
});

/* ===== 내 게시판 (자유 드래그) ===== */
enableDragScroll(document.getElementById('boardStrip'));

/* ===== 배너 클릭 =====
   Enter / Space로도 눌릴 수 있게 같은 동작을 키보드에도 붙인다.
   (드래그로 넘긴 경우는 enableDragScroll의 click 가로채기가 막아준다) */
function onActivate(el, run) {
  el.addEventListener('click', run);
  el.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    run();
  });
}

/* 테마 게시판 / 내 게시판 배너 -> 해당 게시판의 community 화면
   게시판 키는 data-board에 들어 있다 (js/community.js의 BOARDS와 같은 키) */
document.querySelectorAll('[data-board]').forEach((banner) => {
  onActivate(banner, () => {
    goTo(`${COMMUNITY_PAGE}?board=${banner.dataset.board}`);
  });
});

/* 오늘의 추천 작품 배너 -> 작품의 플랫폼 페이지 (새 탭) */
document.querySelectorAll('[data-link]').forEach((banner) => {
  onActivate(banner, () => {
    window.open(banner.dataset.link, '_blank', 'noopener');
  });
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
