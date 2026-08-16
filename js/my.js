/* ===== 페이지 이동 (빈 값은 지금 화면) ===== */
const MY_POST_PAGE = 'my_post.html';

/* 내비게이터의 data-nav 값으로 갈 페이지를 찾는다 (my는 지금 화면이라 비워둔다) */
const NAV_PAGE = {
  bookmark: 'bookmark.html',
  home: 'home.html',
  my: ''
};

function goTo(page) {
  if (!page) return; // 지금 화면이면 이동하지 않음
  window.location.href = page;
}

/* ===== 프로필 =====
   바꾼 이름과 사진은 브라우저에 남는다 (js/data.js의 loadProfile / saveProfile).
   내가 쓴 게시글과 댓글도 저장해 둔 값이 아니라 여기서 바꾼 값을 보여준다. */
const profileImage = document.getElementById('profileImage');
const profileBtn = document.getElementById('profileBtn');
const photoInput = document.getElementById('photoInput');

const userNameText = document.getElementById('userName');
const nameInput = document.getElementById('nameInput');

function showProfile() {
  profileImage.src = userPhoto();
  userNameText.textContent = userName();
}

showProfile();

/* ===== 이름 바꾸기 =====
   연필을 누르면 이름 수정 카드가 뜨고, 카드에서 '수정'을 눌러야(또는 엔터를 쳐야) 바뀐다.
   취소를 누르거나 막을 누르면 고치기 전 이름 그대로다. */
const dim = document.getElementById('dim');
const nameCard = document.getElementById('nameCard');

function openNameCard() {
  nameInput.value = userName(); // 지금 이름을 넣어 두고 고치게 한다

  dim.hidden = false;
  nameCard.hidden = false;

  nameInput.focus();
  nameInput.select();
}

function closeNameCard() {
  dim.hidden = true;
  nameCard.hidden = true;
}

function saveName() {
  const name = nameInput.value.trim();
  if (!name) return closeNameCard(); // 빈 이름으로는 바꾸지 않는다

  const profile = loadProfile();
  profile.name = name;
  saveProfile(profile);

  showProfile();
  closeNameCard();
}

document.getElementById('nameEditBtn').addEventListener('click', openNameCard);
document.getElementById('nameConfirm').addEventListener('click', saveName);
document.getElementById('nameCancel').addEventListener('click', closeNameCard);
dim.addEventListener('click', closeNameCard);

nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    saveName();
  } else if (e.key === 'Escape') {
    closeNameCard();
  }
});

/* ===== 프로필 사진 바꾸기 =====
   사진을 그대로 저장하면 브라우저에 담을 수 있는 크기를 넘기 쉬워서,
   프로필에 보이는 크기(90px)의 세 배 정도로 줄여서 저장한다. */
const PHOTO_SIZE = 270;

function shrink(image) {
  // 짧은 쪽을 기준으로 가운데를 정사각형으로 잘라낸다 (화면에서도 가운데만 보인다)
  const side = Math.min(image.width, image.height);
  const canvas = document.createElement('canvas');

  canvas.width = PHOTO_SIZE;
  canvas.height = PHOTO_SIZE;

  canvas.getContext('2d').drawImage(
    image,
    (image.width - side) / 2, (image.height - side) / 2, side, side,
    0, 0, PHOTO_SIZE, PHOTO_SIZE
  );

  return canvas.toDataURL('image/jpeg', 0.85);
}

profileBtn.addEventListener('click', () => {
  photoInput.click(); // 파일 탐색기를 연다
});

photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    const image = new Image();

    image.onload = () => {
      const profile = loadProfile();
      profile.photo = shrink(image);
      saveProfile(profile);

      showProfile();
    };

    image.src = reader.result;
  };

  reader.readAsDataURL(file);

  // 같은 사진을 다시 골라도 change가 오도록 값을 비워둔다
  photoInput.value = '';
});

/* ===== 내가 작성한 게시글 ===== */
document.getElementById('postCount').textContent = `${myPosts().length}개`;

document.getElementById('postBar').addEventListener('click', () => {
  goTo(MY_POST_PAGE);
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
