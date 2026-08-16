/* ===== 공용 데이터 =====
   community 페이지(목록)와 post 페이지(상세)가 같은 게시글을 봐야 해서
   게시판 데이터를 이 파일로 뺐다. 두 페이지 모두 다른 스크립트보다 먼저 읽는다.

   spoiler가 true인 글도 text를 채워둔다.
   목록에서는 community.js가 '스포일러 포함'으로 가려서 보여주고,
   상세에서는 post.js가 안내 문구를 붙인 뒤 내용을 그대로 보여준다. */

/* 로그인한 사용자.
   my 화면에서 이름 / 사진을 바꿀 수 있어서, 실제로 화면에 쓸 때는
   아래 userName() / userPhoto()로 지금 값을 꺼내 쓴다 (아직 안 바꿨으면 이 값이 나온다). */
const USER_NICKNAME = 'june';
const USER_PHOTO = 'assets/profile.jpg';

/* ===== 작품 정보 =====
   후기 게시글의 별점 배너, home의 내 게시판 카드, search 화면의 표지 배너가 같이 쓴다.
     author   : 작가 이름 (search 화면에서 작품명과 함께 검색 대상이 된다)
     like     : 작품을 좋아요한 수
     tag      : 장르 해시태그 (search 화면의 '장르별 검색'에서 쓴다. GENRES에 있는 값)
     score    : 작품 전체 별점 (글쓴이가 매긴 별점은 게시글의 work.score에 있다)
     newPosts : home의 내 게시판 카드에 보이는 '새 게시글 +N'
     desc     : 작품 소개글 (home의 추천 배너 / post의 작품 배너에서 쓴다)
     link     : 작품을 볼 수 있는 플랫폼 주소.
                작품 게시판의 후기 글에서 작품 배너를 누르면 이 주소가 새 탭으로 열린다.
                비워 두면 눌러도 아무 일도 일어나지 않으니 알게 되는 대로 채워 넣을 것.
                (home.html '오늘의 추천 작품' 배너의 data-link와 같은 주소다)
     titleLines : 배너나 검색창처럼 두 줄로 놓아도 되는 자리에서 쓸 제목.
                적어두지 않은 작품은 title을 그대로 한 줄로 쓴다 (아래 workTitleLines)
   key는 BOARDS의 작품 게시판 key와 같다 (배너를 누르면 그 게시판으로 간다) */

/* search 화면에 이 순서대로 해시태그가 놓인다 */
const GENRES = ['판타지', '현대판타지', '로맨스판타지', '무협', '로맨스'];

const WORKS = {
  gwaechul: {
    title: '괴담에 떨어져도 출근을 해야 하는구나',
    author: '백덕수',
    like: '130666',
    newPosts: 128,
    titleLines: '괴담에 떨어져도\n출근을 해야 하는구나',
    cover: 'assets/괴출.jpg',
    link: 'https://page.kakao.com/content/65171279/',
    score: '4.8',
    desc: '소중한 연차까지 내고 갈 정도로 좋아하던\n\'어떤 현대판타지\' 팝업 이벤트. 그리고 그날, 그 현판 ...',
    tag: ['판타지', '현대판타지']
  },
  jeondoksi: {
    title: '전지적 독자 시점',
    author: '싱숑',
    like: '186349',
    newPosts: 51,
    cover: 'assets/전독시.jpg',
    link: 'https://series.naver.com/novel/detail.series?productNo=3400123',
    score: '4.8',
    desc: '[오직 나만이, 이 세계의 결말을 알고 있다.]\n무려 3149편에 달하는 장편 판타지 소설, \'멸망한 세계 ...',
    tag: ['판타지', '현대판타지']
  },
  eobadeung: {
    title: '어두운 바다의 등불이 되어',
    author: '연산호',
    like: '34321',
    newPosts: 74,
    cover: 'assets/어바등.jpg',
    link: 'https://series.naver.com/novel/detail.series?productNo=8063866',
    score: '4.7',
    desc: '검은 파도 위로 등불 하나가 흔들렸다.\n그 빛을 따라가면 무엇이 있는지, 아무도 알려주지 ...',
    tag: ['판타지', '현대판타지']
  },
  naeseupgeup: {
    title: '내가 키운 S급들',
    author: '근서',
    like: '83278',
    newPosts: 57,
    cover: 'assets/내스급.png',
    link: 'https://series.naver.com/novel/detail.series?productNo=3777351',
    score: '4.7',
    desc: '내가 키운 아이들이 세상을 구하는 S급이 되었다.\n그런데 왜 다들 나만 쳐다보고 있는 거지? ...',
    tag: ['판타지', '현대판타지']
  },
  hwagwi: {
    title: '화산귀환',
    author: '비가',
    like: '221412',
    newPosts: 187,
    cover: 'assets/화귀.jpg',
    link: 'https://series.naver.com/novel/detail.series?productNo=4130558',
    score: '4.8',
    desc: '대 화산파 13대 제자. 천하삼대검수(天下三代劍手).\n매화검존(梅花劍尊) 청명(靑明) 천하를 혼란에 ...',
    tag: ['무협']
  },
  demosjuk: {
    title: '데뷔 못하면 죽는 병 걸림',
    author: '백덕수',
    like: '141352',
    newPosts: 96,
    cover: 'assets/데못죽.jpg',
    link: 'https://page.kakao.com/content/56325530/',
    score: '4.8',
    desc: '4년차 공시생, 낯선 몸에 빙의해 3년 전으로 돌아왔다.\n그리고 그의 눈앞에 나타난 갑작스러운 상태창의 협박! ...',
    tag: ['판타지', '현대판타지']
  },
  machasal: {
    title: '마법명가 차남으로 살아남기',
    author: '자연주의',
    like: '73216',
    newPosts: 42,
    cover: 'assets/마차살.jpg',
    link: 'https://page.kakao.com/content/60707231/',
    score: '4.7',
    desc: '푸른 빛이 도는 검은 독액이 눈앞에서 흔들렸다.\n형이 부드러운 미소를 지으며 나긋하게 말했다. “지금 ...',
    tag: ['판타지']
  },
  eosinki: {
    title: '어린 신인데 키워주시죠',
    author: '강토공',
    like: '11410',
    newPosts: 33,
    cover: 'assets/어신키.png',
    link: 'https://page.kakao.com/content/69299983/',
    score: '4.7',
    desc: '부상으로 은퇴한 전직 프로게이머. 은퇴 이후 게임만\n하면서 살았는데…. 내가 하던 게임이 현실이 되었다. ...',
    tag: ['판타지', '현대판타지']
  },
  ichakheon: {
    title: '이세계 착각 헌터',
    author: '대대원',
    like: '98214',
    newPosts: 61,
    cover: 'assets/이착헌.png',
    link: 'https://ridibooks.com/books/5211000001',
    score: '4.7',
    desc: '[나는 F급 헌터로 환생했다.\n...쟤들이 그렇게 취급을 안 해줘서 문제지.]',
    tag: ['판타지', '현대판타지']
  }
};

/* home에서 community.html?board=게시판키 형태로 넘겨주면 된다.
   (gwaechul 게시판만 Figma 시안 그대로이고, 나머지는 예시 데이터) */
const BOARDS = {
  /* --- 내 게시판 (작품별) --- */
  gwaechul: {
    title: '괴담에 떨어져도 출근을 해야 하는구나',
    posts: [
      {
        category: '일반',
        author: '야근금지',
        title: '주인공 괴담한테 오염된 거니.....',
        text: '지금 괴담한테 쫓기면서 하하 웃고있는데 이거 맞나요',
        spoiler: false,
        likes: 26, comments: 4, views: 76, time: '28분 전'
      },
      {
        category: '토론',
        author: '사원증분실',
        title: '백사헌 대체 얼마나 무리하는거지',
        text: '지사 넘어가고 나서부터 계속 혼자 다 떠안고 가는 것 같은데\n대체 주인공을 얼마나 좋아하는거임',
        spoiler: true,
        likes: 89, comments: 13, views: 198, time: '52분 전'
      },
      {
        category: '후기',
        author: '괴담퇴근러',
        title: '무서운 거 못 보는 사람도 볼 수 있음',
        text: '왜냐하면 주인공이 괴담을 걍 파괴함...',
        spoiler: false,
        work: { key: 'gwaechul', name: '괴담에 떨어져도 출근을 해야 하는구나', score: '5.0' },
        likes: 42, comments: 2, views: 120, time: '1시간 전'
      },
      {
        category: '일반',
        author: '오늘도정시퇴근',
        title: '지사가 본사보다 더한 듯....',
        text: '본사는 그래도 사람 말이 통했는데 여긴 그냥 다들 눈이 돌아가 있음\n특히 마지막에 나온 과장 진짜 소름이었다',
        spoiler: true,
        likes: 52, comments: 4, views: 145, time: '1시간 전'
      }
    ]
  },

  jeondoksi: {
    title: '전지적 독자 시점',
    posts: [
      {
        category: '일반',
        author: '멸살법정독',
        title: '전독시 영화? 무슨소리야',
        text: '우리소설이랑 웹툰밖에 없잖아 그게 무슨소리냐고',
        spoiler: false,
        likes: 163, comments: 18, views: 1863, time: '1일 전'
      },
      {
        category: '토론',
        author: '성좌아님',
        title: '이 장면 다들 어떻게 읽었어?',
        text: '김독자가 마지막에 그 선택을 한 게 진짜 본인 의지였을까\n나는 그 앞부터 이미 각오한 거라고 봤는데 다들 어떻게 읽었는지 궁금하다',
        spoiler: true,
        likes: 88, comments: 6, views: 940, time: '2일 전'
      },
      {
        category: '후기',
        author: '독자님',
        title: '완독하고 한동안 아무것도 못 읽음',
        text: '500편이 순식간에 지나감',
        spoiler: false,
        work: { key: 'jeondoksi', name: '전지적 독자 시점', score: '4.8' },
        likes: 210, comments: 3, views: 2450, time: '6일 전'
      }
    ]
  },

  eobadeung: {
    title: '어두운 바다의 등불이 되어',
    posts: [
      {
        category: '일반',
        author: '등대지기',
        title: '삽화 새로 나온 거 봤어?',
        text: '분위기 진짜 미쳤더라 표지도 바뀐 듯',
        spoiler: false,
        likes: 74, comments: 12, views: 388, time: '3시간 전'
      },
      {
        category: '후기',
        author: '밤바다',
        title: '초반만 넘기면 순삭입니다',
        text: '문체가 진짜 취향이었음',
        spoiler: false,
        work: { key: 'eobadeung', name: '어두운 바다의 등불이 되어', score: '4.7' },
        likes: 96, comments: 2, views: 712, time: '5시간 전'
      },
      {
        category: '토론',
        author: '해무',
        title: '결말 해석 좀 같이 해보자',
        text: '마지막 장면이 현실인지 아닌지부터 의견이 갈리는 것 같은데\n나는 등불이 꺼지지 않았다는 쪽으로 읽었다',
        spoiler: true,
        likes: 41, comments: 11, views: 503, time: '1일 전'
      }
    ]
  },

  naeseupgeup: {
    title: '내가 키운 S급들',
    posts: [
      {
        category: '일반',
        author: '길드마스터',
        title: '오늘 회차 실화냐',
        text: '읽다가 소리 질렀음 진짜',
        spoiler: false,
        likes: 57, comments: 9, views: 264, time: '40분 전'
      },
      {
        category: '토론',
        author: '각성자',
        title: '이 캐릭터 서사 어떻게 생각해?',
        text: '나는 이번 화에서 드러난 과거가 오히려 캐릭터를 납득시켜줬다고 보는데\n너무 늦게 풀렸다는 의견도 많더라',
        spoiler: true,
        likes: 133, comments: 7, views: 1102, time: '3일 전'
      }
    ]
  },

  /* search 화면에서 내 게시판에 새로 추가할 수 있는 작품들.
     아직 아무도 글을 쓰지 않은 게시판이라 posts를 비워 둔다
     (community 화면이 '아직 게시글이 없습니다.'를 대신 보여준다) */
  hwagwi: { title: '화산귀환', posts: [] },
  demosjuk: { title: '데뷔 못하면 죽는 병 걸림', posts: [] },
  machasal: { title: '마법명가 차남으로 살아남기', posts: [] },
  eosinki: { title: '어린 신인데 키워주시죠', posts: [] },
  ichakheon: { title: '이세계 착각 헌터', posts: [] },

  /* --- 테마 게시판 (작품을 가리지 않는 주제별 게시판) --- */
  sumeun: {
    title: '숨은 명작 추천',
    posts: [
      {
        category: '후기',
        author: '표지수집가',
        title: '조회수 낮은데 이게 왜 안 유명해',
        text: '표지만 보고 지나쳤던 내가 부끄럽다',
        spoiler: false,
        work: { key: 'eobadeung', name: '어두운 바다의 등불이 되어', score: '4.7' },
        likes: 118, comments: 10, views: 903, time: '2시간 전'
      },
      {
        category: '일반',
        author: '완결러버',
        title: '완결난 명작 좀 추천해줘',
        text: '연재 기다리는 게 너무 힘들어서 완결작만 찾고 있음',
        spoiler: false,
        likes: 64, comments: 12, views: 512, time: '6시간 전'
      },
      {
        category: '토론',
        author: '취향탐험',
        title: '숨은 명작의 기준이 뭐라고 생각해?',
        text: '조회수인지 완성도인지 기준이 다 다른 것 같은데\n나는 그냥 내가 다시 읽게 되는 작품이 명작이라고 본다',
        spoiler: true,
        likes: 45, comments: 15, views: 470, time: '1일 전'
      },
      {
        category: '후기',
        author: '진입장벽',
        title: '초반 3편만 참으면 인생작 됩니다',
        text: '진입장벽만 넘기면 진짜 순삭임',
        spoiler: false,
        work: { key: 'naeseupgeup', name: '내가 키운 S급들', score: '4.7' },
        likes: 87, comments: 2, views: 688, time: '2일 전'
      }
    ]
  },

  character: {
    title: '캐릭터 모음.zip',
    posts: [
      {
        category: '일반',
        author: '최애수집',
        title: '이 캐릭터 때문에 입덕했다 하는 사람',
        text: '나는 첫 등장 장면부터 그냥 넘어갔음',
        spoiler: false,
        likes: 152, comments: 15, views: 1740, time: '35분 전'
      },
      {
        category: '토론',
        author: '서브가본체',
        title: '주인공보다 서브가 더 좋은 작품 있어?',
        text: '주인공 서사가 약할 때 서브가 다 끌고 가는 경우가 은근 많은 것 같은데\n다들 그런 작품 하나씩 있지 않나',
        spoiler: true,
        likes: 96, comments: 17, views: 1128, time: '3시간 전'
      },
      {
        category: '후기',
        author: '서사중독',
        title: '캐릭터 하나로 500편 끌고 가는 힘',
        text: '서사 붙는 순간 소름 돋았음',
        spoiler: false,
        work: { key: 'jeondoksi', name: '전지적 독자 시점', score: '4.8' },
        likes: 204, comments: 0, views: 2310, time: '1일 전'
      },
      {
        category: '일반',
        author: '무해한독자',
        title: '무해한 최애 캐릭터 모음',
        text: '읽다 보면 그냥 지켜주고 싶어지는 애들',
        spoiler: false,
        likes: 73, comments: 14, views: 640, time: '4일 전'
      }
    ]
  },

  hacha: {
    title: '하차한 이유',
    posts: [
      {
        category: '후기',
        author: '중도하차',
        title: '설정은 좋았는데 전개가 너무 늘어짐',
        text: '100편쯤에서 놓았습니다',
        spoiler: false,
        work: { key: 'gwaechul', name: '괴담에 떨어져도 출근을 해야 하는구나', score: '3.5' },
        likes: 61, comments: 16, views: 812, time: '1시간 전'
      },
      {
        category: '토론',
        author: '북마크정리',
        title: '이 전개에서 하차한 사람 나뿐이야?',
        text: '갑자기 인물들이 다 성격이 바뀐 것 같아서 그 화에서 멈췄는데\n나중에 회수된다는 얘기가 있어서 다시 볼까 고민 중이다',
        spoiler: true,
        likes: 108, comments: 19, views: 1394, time: '5시간 전'
      },
      {
        category: '일반',
        author: '다시읽기',
        title: '하차했다가 다시 읽은 작품 있어?',
        text: '시간 지나고 다시 보면 괜찮아지는 경우도 있더라',
        spoiler: false,
        likes: 39, comments: 8, views: 385, time: '2일 전'
      }
    ]
  }
};

/* ===== 댓글 =====
   게시글마다 그 글에 달린 댓글을 미리 적어둔다. key는 '게시판키:글번호'.
   댓글 하나는 이렇게 생겼다.
     order   : 작성 순서 (1이 가장 먼저 쓴 댓글)
     person  : 익명일 때 사람을 구분하는 값. 같은 값이면 같은 익명 번호를 받는다.
     name    : 실명일 때 보여줄 닉네임 (NICKNAMES에 있는 이름)
     time    : TIMES에 있는 값. 게시글이 올라온 시간보다 나중이어야 한다.
     text    : 댓글 내용
     replies : 이 댓글에 달린 답글 (답글에는 답글이 달리지 않는다)

   답글은 화면에서 달린 댓글 바로 아래에 붙지만 order는 실제로 쓴 순서라,
   나중에 쓴 답글이 먼저 쓴 댓글 사이에 끼어들 수 있다.
   익명 번호(익명 1, 익명 2...)는 화면 순서가 아니라 이 order를 따라 매긴다.

   한 게시글의 댓글 개수는 BOARDS의 comments와 같아야 한다 (답글도 한 개로 센다). */

/* 댓글에 쓰는 닉네임 */
const NICKNAMES = [
  '냐냐냥', '카페인중독', '하룰라라', '출근을하게되..', '독자',
  'Z999', '박박문대', '배세진의99번째머리카락', '감옥에서누가돌아왓게', '티카',
  '루카스아스카니엔추종자', 'rlaehrwk', '스포방지', '데못죽정주행'
];

/* 댓글에 쓰는 시간 (오래된 순서) */
const TIMES = [
  '3일 전', '2일 전', '1일 전', '20시간 전', '12시간 전', '8시간 전',
  '5시간 전', '3시간 전', '2시간 전', '1시간 전', '48분 전', '35분 전',
  '28분 전', '20분 전', '15분 전', '10분 전', '6분 전', '3분 전', '1분 전'
];

const COMMENTS = {
  'gwaechul:0': [
    { order: 1, person: 'a', time: '20분 전', text: '이미 오염된듯요...', replies: [
      { order: 2, person: 'b', time: '18분 전', text: '아제발요' },
      { order: 4, person: 'd', time: '10분 전', text: '내일까지 어케 기다려....' }
    ] },
    { order: 3, person: 'c', time: '12분 전', text: '안돼.....' }
  ],

  'gwaechul:1': [
    { order: 1, person: 'c', time: '48분 전', text: '이번 화 보고 진짜 백사헌 걱정됐음', replies: [
      { order: 13, name: '냐냐냥', time: '3분 전', text: '저도요 표정이 계속 안 좋아지던데' }
    ] },
    { order: 2, name: '카페인중독', time: '48분 전', text: '다들 왜 아무도 말려주는 사람이 없지', replies: [
      { order: 5, name: '하룰라라', time: '28분 전', text: '말려도 안 들을 것 같음 이미 결심한 얼굴이라' }
    ] },
    { order: 3, person: 'a', time: '35분 전', text: '지사 넘어가고부터 진짜 혼자 다 짊어지는 느낌' },
    { order: 4, name: '출근을하게되..', time: '35분 전', text: '주인공 아끼는 마음이 너무 커서 그런 듯' },
    { order: 6, person: 'd', time: '20분 전', text: '저러다 큰일 나는 거 아닌지 걱정되네요' },
    { order: 7, name: '냐냐냥', time: '20분 전', text: '다음 화에서 좀 쉬었으면 좋겠다' },
    { order: 8, name: '독자', time: '15분 전', text: '작가님 제발 백사헌 좀 챙겨주세요' },
    { order: 9, person: 'a', time: '15분 전', text: '이 캐릭터 서사 진짜 탄탄하게 잘 짜여진 듯' },
    { order: 10, person: 'c', time: '10분 전', text: '맞아요 그래서 더 몰입돼요' },
    { order: 11, name: 'Z999', time: '6분 전', text: '저도 계속 신경쓰이는 캐릭터' },
    { order: 12, name: '박박문대', time: '6분 전', text: '빨리 다음 화 보고 싶다' },
  ],

  'gwaechul:2': [
    { order: 1, person: 'b', time: '48분 전', text: '이거 완전 공감. 저도 호러 진짜 못 보는데 재밌게 봤어요', replies: [
      { order: 2, name: '감옥에서누가돌아왓게', time: '15분 전', text: '저도 주인공이 다 처리해줘서 마음 편하게 봤습니다' }
    ] }
  ],

  'gwaechul:3': [
    { order: 1, person: 'a', time: '48분 전', text: '백사헌 과장 등장씬 보고 소름 돋았습니다' },
    { order: 2, name: '배세진의99번째머리카락', time: '48분 전', text: '본사는 그래도 정상인이 있었는데 지사는 진짜...' },
    { order: 3, name: 'Z999', time: '35분 전', text: '저 화 보고 며칠 동안 계속 생각났어요' },
    { order: 4, person: 'c', time: '28분 전', text: '다음 화에서는 좀 다른 인물 나왔으면' },
  ],

  'jeondoksi:0': [
    { order: 1, name: '배세진의99번째머리카락', time: '20시간 전', text: '그거 아마 웹툰 영상화 소식 잘못 들으신 듯(영원히 영화를 회피하게 되...)', replies: [
      { order: 4, name: '카페인중독', time: '8시간 전', text: '맞아요 애니메이션 얘기였던 것 같아요' },
      { order: 12, name: '루카스아스카니엔추종자', time: '35분 전', text: '...우리 영화 없잖아요 왜 그러신담...^^..ㅜㅡㅠ' }
    ] },
    { order: 2, name: '독자', time: '20시간 전', text: '루머 진짜 빨리 퍼지네요', replies: [
      { order: 8, name: '배세진의99번째머리카락', time: '2시간 전', text: '그러니까요 확인 안 하고 퍼뜨리는 사람들 너무 많음' },
    ] },
    { order: 3, person: 'e', time: '12시간 전', text: '영화화되면 좋을 것 같긴 한데 분량이...', replies: [
      { order: 14, name: '티카', time: '28분 전', text: '500편을 영화로 어떻게 압축함 하... (그래서 망했잔아!!! 영화 나오기 전부터 걱정했는데 젠장)' }
    ] },
    { order: 5, person: 'e', time: '5시간 전', text: '드라마화라면 또 모르겠는데', replies: [
      { order: 13, name: '박박문대', time: '28분 전', text: '그것도 스케일이 너무 커서 힘들 듯' }
    ] },
    { order: 6, name: '하룰라라', time: '5시간 전', text: '없던 걸로...' },
    { order: 7, person: 'd', time: '3시간 전', text: '진짜 영화 안 본 눈 사고 싶다(n)' },
    { order: 9, name: '티카', time: '1시간 전', text: '우리는 이런 걸 원하지 않았어요.....' },
    { order: 10, person: 'd', time: '1시간 전', text: '엉엉슨....' },
    { order: 11, name: '티카', time: '48분 전', text: '아니 무슨 인물들이 2d보다 납작해져가지곤...' },
    { order: 15, name: '출근을하게되..', time: '20분 전', text: '우리 웹툰화까지는 좋았잖아 왜 그래' },
    { order: 16, name: '티카', time: '15분 전', text: 'ㅡ,ㅜ,ㅡㅠㅠㅠ' },
    { order: 17, person: 'a', time: '10분 전', text: '자 이제 우리는 원작이랑 웹툰만 있는 거임. 영화나 드라마? 그게 뭔데.', replies: [
      { order: 18, name: '냐냐냥', time: '10분 전', text: '그게 맞는 듯' }
    ] }
  ],

  'jeondoksi:1': [
    { order: 1, person: 'b', time: '1일 전', text: '저는 진짜 본인 의지였다고 봐요', replies: [
      { order: 5, name: 'Z999', time: '8시간 전', text: '저도 동의. 이미 각오한 상태였다고 생각해요' },
    ] },
    { order: 2, person: 'b', time: '1일 전', text: '근데 뭔가 강요된 선택 같기도 하고' },
    { order: 3, person: 'a', time: '20시간 전', text: '저는 두 감정이 다 있었다고 봐요' },
    { order: 4, person: 'c', time: '12시간 전', text: '다시 읽어보니까 복선이 꽤 있었더라고요' },
    { order: 6, person: 'd', time: '5시간 전', text: '그 복선 저도 나중에 발견했어요' },
  ],

  'jeondoksi:2': [
    { order: 1, name: '감옥에서누가돌아왓게', time: '3일 전', text: '저도 완독하고 한동안 다른 소설이 눈에 안 들어왔어요', replies: [
      { order: 2, name: '티카', time: '3일 전', text: '그 마음 너무 이해됩니다' }
    ] },
    { order: 3, person: 'f', time: '2일 전', text: '500편이 진짜 순삭이었어요 저도' },
  ],

  'eobadeung:0': [
    { order: 1, person: 'c', time: '2시간 전', text: '표지 새로 나온 거 보고 놀랐어요', replies: [
      { order: 11, person: 'c', time: '3분 전', text: '볼 때마다 색감이 진짜 예쁘더라고요' }
    ] },
    { order: 2, name: '루카스아스카니엔추종자', time: '2시간 전', text: '분위기가 확 달라진 느낌', replies: [
      { order: 8, name: '냐냐냥', time: '15분 전', text: '맞아요 더 무겁고 진지해진 느낌' }
    ] },
    { order: 3, name: '출근을하게되..', time: '1시간 전', text: '삽화가님 실력 진짜 대단하신 듯', replies: [
      { order: 9, person: 'c', time: '10분 전', text: '인정합니다 매번 기대돼요' }
    ] },
    { order: 4, name: '박박문대', time: '48분 전', text: '다음 삽화는 또 언제 나올까요' },
    { order: 5, person: 'c', time: '35분 전', text: '이번 표지가 제일 마음에 들어요' },
    { order: 6, person: 'c', time: '28분 전', text: '저는 예전 표지도 좋았는데' },
    { order: 7, name: '루카스아스카니엔추종자', time: '20분 전', text: '둘 다 각자 매력있는 듯' },
    { order: 10, person: 'a', time: '6분 전', text: '빨리 원본 사이즈로 보고 싶다' },
    { order: 12, person: 'c', time: '1분 전', text: '굿즈로 나오면 좋겠어요' }
  ],

  'eobadeung:1': [
    { order: 1, name: '스포방지', time: '3시간 전', text: '초반에 살짝 어려운 감은 있었는데 넘기고 나니까 진짜 순삭이었어요', replies: [
      { order: 2, person: 'd', time: '3시간 전', text: '저도 그 부분 참고 봤는데 결국 인생작 됐네요' },
    ] }
  ],

  'eobadeung:2': [
    { order: 1, name: '배세진의99번째머리카락', time: '20시간 전', text: '저는 마지막 장면 현실이라고 봐요', replies: [
      { order: 2, name: '냐냐냥', time: '20시간 전', text: '저는 은유적인 장면이라고 생각했는데' },
    ] },
    { order: 3, person: 'd', time: '12시간 전', text: '등불이 꺼지지 않았다는 해석 저도 좋아합니다' },
    { order: 4, name: '출근을하게되..', time: '8시간 전', text: '결말 열어둔 게 오히려 여운 있어서 좋았어요', replies: [
      { order: 11, name: '박박문대', time: '35분 전', text: '맞아요 딱 떨어지는 결말보다 나은 듯' }
    ] },
    { order: 5, person: 'b', time: '5시간 전', text: '저는 좀 아쉬웠어요 확실하게 알려줬으면' },
    { order: 6, person: 'c', time: '3시간 전', text: '저도 재해석 여지가 좋긴 한데 답답하긴 했어요' },
    { order: 7, name: '배세진의99번째머리카락', time: '3시간 전', text: '그래서 다들 해석이 갈리나 봐요' },
    { order: 8, person: 'd', time: '2시간 전', text: '재독하면 또 다르게 읽히더라고요' },
    { order: 9, name: '감옥에서누가돌아왓게', time: '1시간 전', text: '저는 세 번 읽고 나서야 이해됐어요' },
    { order: 10, person: 'e', time: '48분 전', text: '역시 다시 읽어야 하는 소설이네요' }
  ],

  'naeseupgeup:0': [
    { order: 1, name: '카페인중독', time: '35분 전', text: '저도 읽다가 소리 질렀어요 진짜', replies: [
      { order: 2, name: '루카스아스카니엔추종자', time: '35분 전', text: '그 전개 진짜 예상 못했죠' }
    ] },
    { order: 3, name: '냐냐냥', time: '28분 전', text: '오늘 회차 미쳤다 진짜' },
    { order: 4, name: '감옥에서누가돌아왓게', time: '20분 전', text: '작가님 대체 무슨 생각이신지' },
    { order: 5, person: 'a', time: '15분 전', text: '심장 떨려서 두 번 읽었어요' },
    { order: 6, name: '감옥에서누가돌아왓게', time: '10분 전', text: '다음 화 예고 보고 더 놀랐어요' },
    { order: 7, name: '하룰라라', time: '6분 전', text: '댓글창 반응 다 똑같네요' },
    { order: 8, name: '박박문대', time: '3분 전', text: '이 소설 진짜 물오른 듯' },
    { order: 9, person: 'a', time: '1분 전', text: '다음 화 기다리기 힘드네요' }
  ],

  'naeseupgeup:1': [
    { order: 1, name: 'Z999', time: '2일 전', text: '저는 이번에 드러난 과거 보고 캐릭터가 이해됐어요', replies: [
      { order: 2, name: '데못죽정주행', time: '1일 전', text: '저도요 그동안의 행동이 다 납득되더라고요' }
    ] },
    { order: 3, person: 'c', time: '20시간 전', text: '근데 너무 늦게 풀린 감은 있어요' },
    { order: 4, person: 'b', time: '12시간 전', text: '맞아요 초반에 조금씩 흘렸으면 더 좋았을 듯' },
    { order: 5, person: 'c', time: '8시간 전', text: '그래도 지금이라도 나와서 다행이에요' },
    { order: 6, person: 'c', time: '3시간 전', text: '이 캐릭터 다시 보게 됐어요' },
    { order: 7, name: '데못죽정주행', time: '2시간 전', text: '다음 화에서 더 풀렸으면 좋겠네요' }
  ],

  'sumeun:0': [
    { order: 1, person: 'a', time: '1시간 전', text: '저도 표지만 보고 넘겼었는데 완전 후회했어요'},
    { order: 2, name: '독자', time: '1시간 전', text: '이 작품 진짜 저평가된 것 같아요' },
    { order: 3, name: '출근을하게되..', time: '48분 전', text: '표지 리뉴얼 하면 더 유명해질 듯' },
    { order: 4, name: 'rlaehrwk', time: '48분 전', text: '홍보가 부족한 것 같아요 내용은 진짜 좋은데', replies: [
      { order: 5, person: 'b', time: '35분 전', text: '맞아요 주변에 계속 추천하고 있어요' },
      { order: 8, name: '배세진의99번째머리카락', time: '20분 전', text: '저도 추천 리스트에 항상 넣습니다' }
    ] },
    { order: 6, name: '배세진의99번째머리카락', time: '28분 전', text: '숨은 명작 맞는 듯' },
    { order: 7, name: '냐냐냥', time: '28분 전', text: '이런 글 볼 때마다 감사해요 덕분에 알게 됐어요' },
    { order: 9, name: 'rlaehrwk', time: '15분 전', text: '더 많은 사람들이 봤으면' },
    { order: 10, person: 'c', time: '15분 전', text: '저도 이제 막 읽기 시작했는데 기대되네요' },
  ],

  'sumeun:1': [
    { order: 1, person: 'b', time: '5시간 전', text: '저는 전독시 추천드려요 완결작이에요', replies: [
      { order: 7, name: 'Z999', time: '28분 전', text: '전독시 진짜 명작이죠 강력 추천' }
    ] },
    { order: 2, person: 'c', time: '3시간 전', text: '괴출도 완결이면 좋을 텐데 아직 연재중이죠' },
    { order: 3, name: '배세진의99번째머리카락', time: '2시간 전', text: '어바등도 좋아요 분량도 적당하고', replies: [
      { order: 4, name: '카페인중독', time: '1시간 전', text: '저도 어바등 완독했는데 여운 오래갔어요' }
    ] },
    { order: 5, name: '배세진의99번째머리카락', time: '48분 전', text: '완결작 위주로 보는 것도 나름 장점 있어요' },
    { order: 6, person: 'a', time: '35분 전', text: '연재 기다리는 스트레스가 없죠' },
    { order: 8, name: 'rlaehrwk', time: '20분 전', text: '저는 그래도 연재 기다리는 재미도 좋아요' },
    { order: 9, person: 'c', time: '15분 전', text: '취향 차이인 것 같습니다' },
    { order: 10, person: 'a', time: '10분 전', text: '다들 추천 감사해요 읽어볼게요' },
    { order: 11, name: '배세진의99번째머리카락', time: '6분 전', text: '재밌게 보세요' },
    { order: 12, person: 'a', time: '3분 전', text: '완결작 리스트 만들어봐야겠네요' }
  ],

  'sumeun:2': [
    { order: 1, person: 'a', time: '20시간 전', text: '저는 다시 읽게 되는 작품이 명작이라고 봐요', replies: [
      { order: 2, name: '카페인중독', time: '20시간 전', text: '저도 그 기준에 동의해요' }
    ] },
    { order: 3, person: 'c', time: '12시간 전', text: '저는 완성도가 더 중요하다고 생각해요' },
    { order: 4, name: '스포방지', time: '8시간 전', text: '조회수는 운도 많이 작용하는 것 같아서', replies: [
      { order: 12, person: 'f', time: '35분 전', text: '맞아요 홍보나 타이밍도 크게 작용하죠' }
    ] },
    { order: 5, name: '티카', time: '5시간 전', text: '명작의 기준은 사람마다 다른 것 같긴 해요' },
    { order: 6, person: 'e', time: '5시간 전', text: '저는 결말까지 좋아야 명작이라고 생각해요' },
    { order: 7, name: '하룰라라', time: '3시간 전', text: '저는 캐릭터가 오래 기억에 남으면 명작이라고 봐요', replies: [
      { order: 10, name: '루카스아스카니엔추종자', time: '1시간 전', text: '저도 그 의견에 공감합니다' }
    ] },
    { order: 8, person: 'f', time: '2시간 전', text: '다들 기준이 다양해서 재밌네요 이 토론', replies: [
      { order: 15, person: 'f', time: '20분 전', text: '그러니까요 덕분에 새로운 관점 알게 됐어요' }
    ] },
    { order: 9, person: 'e', time: '1시간 전', text: '결국 개인 취향인 것 같아요' },
    { order: 11, name: '스포방지', time: '48분 전', text: '그래도 어느 정도 공통된 기준은 있는 듯' },
    { order: 13, name: '티카', time: '28분 전', text: '이 글 덕분에 다시 생각해보게 됐네요' },
    { order: 14, name: '스포방지', time: '28분 전', text: '좋은 토론이었습니다' }
  ],

  'sumeun:3': [
    { order: 1, person: 'd', time: '1일 전', text: '저도 초반 3편 힘들었는데 넘기고 나니까 인생작 됐어요' },
    { order: 2, person: 'd', time: '20시간 전', text: '진입장벽 진짜 실화네요 그래도 볼 가치 있음' }
  ],

  'character:0': [
    { order: 1, person: 'e', time: '28분 전', text: '저는 첫 등장씬부터 완전 입덕했어요', replies: [
      { order: 7, name: '티카', time: '20분 전', text: '그 등장씬 진짜 임팩트 있었죠' },
      { order: 9, name: '하룰라라', time: '20분 전', text: '저도 그 장면 보고 캐릭터 팬 됐어요' }
    ] },
    { order: 2, name: '감옥에서누가돌아왓게', time: '28분 전', text: '저는 중반부 대사 하나 때문에 입덕했어요' },
    { order: 3, name: '루카스아스카니엔추종자', time: '28분 전', text: '저는 초반엔 별로였는데 갈수록 좋아지더라고요', replies: [
      { order: 5, person: 'd', time: '28분 전', text: '저도 처음엔 몰랐는데 알고 보니 최애가 됨' },
      { order: 6, person: 'd', time: '20분 전', text: '매력이 늦게 터지는 캐릭터인 듯' },
      { order: 13, person: 'c', time: '15분 전', text: '다들 비슷한 것 같아요 저도요' }
    ] },
    { order: 4, person: 'e', time: '28분 전', text: '이 캐릭터는 볼 때마다 새로운 매력 발견해요', replies: [
      { order: 10, name: 'rlaehrwk', time: '20분 전', text: '저도 볼수록 좋아지는 캐릭터예요' },
    ] },
    { order: 8, person: 'e', time: '20분 전', text: '최애 캐릭터 투표하면 여기서 1등일 듯' },
    { order: 11, name: 'Z999', time: '15분 전', text: '저도 인정합니다' },
    { order: 12, name: '카페인중독', time: '15분 전', text: '저 캐릭터 굿즈 나오면 무조건 삽니다' },
    { order: 14, name: '냐냐냥', time: '15분 전', text: '저도 살 예정입니다' },
    { order: 15, name: '하룰라라', time: '10분 전', text: '다들 같은 마음이시네요' }
  ],

  'character:1': [
    { order: 1, name: '독자', time: '2시간 전', text: '저는 어바등의 서브가 주인공보다 좋았어요' },
    { order: 2, person: 'b', time: '2시간 전', text: '저도 비슷한 경험 있어요' },
    { order: 3, name: '독자', time: '2시간 전', text: '서사가 약한 주인공보다 서브가 더 매력적일 때가 많죠', replies: [
      { order: 8, name: 'Z999', time: '35분 전', text: '맞아요 서브가 극을 끌고 가는 경우 많은 듯' }
    ] },
    { order: 4, person: 'c', time: '1시간 전', text: '저는 오히려 주인공이 항상 더 좋았어요', replies: [
      { order: 11, name: '티카', time: '28분 전', text: '저는 반반인 것 같아요 작품마다 달라요' },
      { order: 13, name: '루카스아스카니엔추종자', time: '20분 전', text: '저도 케이스 바이 케이스인 듯' }
    ] },
    { order: 5, name: 'Z999', time: '1시간 전', text: '서브 캐릭터 서사도 잘 짜인 작품이 진짜 명작이죠' },
    { order: 6, name: '박박문대', time: '48분 전', text: '동의합니다' },
    { order: 7, name: '배세진의99번째머리카락', time: '48분 전', text: '저도 서브 팬인 경우가 많아요' },
    { order: 9, name: 'rlaehrwk', time: '35분 전', text: '서브가 좋으면 재독할 때 더 재밌더라고요' },
    { order: 10, person: 'b', time: '35분 전', text: '맞아요 그런 작품 다시 보게 됨' },
    { order: 12, name: '스포방지', time: '28분 전', text: '저는 조연 서사 강한 작품 좋아합니다', replies: [
      { order: 14, name: '출근을하게되..', time: '20분 전', text: '저도요 조연 팬이 많아지면 작품이 더 풍부해지는 듯' }
    ] },
    { order: 15, person: 'a', time: '15분 전', text: '다들 취향 다양하네요' },
    { order: 16, name: 'Z999', time: '15분 전', text: '이런 토론 재밌어요' },
    { order: 17, person: 'a', time: '10분 전', text: '저도 잘 읽었습니다' }
  ],

  'character:2': [
  ],

  'character:3': [
    { order: 1, name: '감옥에서누가돌아왓게', time: '3일 전', text: '저 지켜주고 싶은 캐릭터 리스트 있어요', replies: [
      { order: 6, name: '독자', time: '8시간 전', text: '저도 비슷한 리스트 있는데 겹치는 것 같아요' }
    ] },
    { order: 2, person: 'b', time: '2일 전', text: '무해한 캐릭터들 진짜 힐링이에요', replies: [
      { order: 3, name: '티카', time: '1일 전', text: '맞아요 읽다가 마음이 편해지는 캐릭터들이죠' },
      { order: 5, name: '독자', time: '12시간 전', text: '저도 힐링용으로 자주 찾아봅니다' }
    ] },
    { order: 4, person: 'd', time: '20시간 전', text: '이 리스트 보고 새로운 캐릭터 알게 됐어요' },
    { order: 7, name: '스포방지', time: '5시간 전', text: '저도 추천할 캐릭터 있는데 나중에 올려볼게요' },
    { order: 8, person: 'c', time: '3시간 전', text: '기대하고 있겠습니다' },
    { order: 9, name: '출근을하게되..', time: '2시간 전', text: '이런 글 자주 올려주세요', replies: [
      { order: 10, person: 'c', time: '1시간 전', text: '저도 좋아요' }
    ] },
    { order: 11, person: 'b', time: '48분 전', text: '무해한 캐릭터 모음 시리즈로 계속 나왔으면' },
    { order: 12, name: '카페인중독', time: '35분 전', text: '저도 동의합니다' },
    { order: 13, person: 'b', time: '28분 전', text: '다음 편 기대할게요' },
    { order: 14, name: '티카', time: '20분 전', text: '좋은 글 감사합니다' },
  ],

  'hacha:0': [
    { order: 1, person: 'c', time: '48분 전', text: '저도 비슷한 이유로 잠깐 쉬었다가 다시 봤어요', replies: [
      { order: 12, name: '루카스아스카니엔추종자', time: '6분 전', text: '저는 아직도 그 부분에서 멈춰있어요' },
      { order: 14, name: '데못죽정주행', time: '3분 전', text: '저도 그 화 넘기기가 힘들더라고요' }
    ] },
    { order: 2, name: '독자', time: '48분 전', text: '설정 자체는 진짜 좋았는데 전개 속도가 아쉬웠어요' },
    { order: 3, name: 'Z999', time: '35분 전', text: '중후반부터는 다시 재밌어져요 참고 보시길' },
    { order: 4, person: 'd', time: '35분 전', text: '저도 그 얘기 듣고 다시 도전해볼까 고민중이에요' },
    { order: 5, person: 'd', time: '28분 전', text: '고민하지 마시고 넘겨보세요 나중에 몰아치듯 전개돼요' },
    { order: 6, name: '독자', time: '28분 전', text: '그 말 듣고 다시 볼 용기 생기네요' },
    { order: 7, person: 'c', time: '20분 전', text: '저도 결국 완독했는데 후반부가 진짜 좋았어요' },
    { order: 8, person: 'c', time: '20분 전', text: '몇 화쯤부터 다시 재밌어지나요', replies: [
      { order: 10, person: 'c', time: '10분 전', text: '저는 대략 150화쯤부터였던 것 같아요' }
    ] },
    { order: 9, name: 'Z999', time: '15분 전', text: '150화면 꽤 늘어지긴 하네요 그래도 참을 만은 해요' },
    { order: 11, person: 'a', time: '10분 전', text: '저도 참고해서 다시 시도해볼게요' },
    { order: 13, person: 'c', time: '6분 전', text: '완독하신 분들 말 믿고 다시 봐야겠어요' },
    { order: 15, name: '냐냐냥', time: '3분 전', text: '화이팅입니다' },
    { order: 16, name: '티카', time: '1분 전', text: '저도 응원할게요' }
  ],

  'hacha:1': [
    { order: 1, person: 'd', time: '3시간 전', text: '저도 인물들 성격 갑자기 바뀐 것 같아서 놓았어요', replies: [
      { order: 5, person: 'd', time: '1시간 전', text: '저는 그래도 회수된다는 말 듣고 다시 볼까 해요' }
    ] },
    { order: 2, person: 'c', time: '3시간 전', text: '저는 그 화 이후로 아예 손을 놨어요', replies: [
      { order: 4, person: 'a', time: '2시간 전', text: '저도 비슷한 시점에서 하차했네요' },
      { order: 11, person: 'b', time: '20분 전', text: '저도 거기서 멈췄다가 아직 못 돌아갔어요' },
      { order: 12, name: '독자', time: '20분 전', text: '회수된다는 소문이 진짜인지 궁금하네요' },
      { order: 13, name: '루카스아스카니엔추종자', time: '15분 전', text: '저도 그게 궁금해서 찾아봤는데 확실친 않더라고요' },
      { order: 19, name: '루카스아스카니엔추종자', time: '1분 전', text: '결국 직접 읽어봐야 알 것 같아요' }
    ] },
    { order: 3, person: 'a', time: '2시간 전', text: '저는 그 전개도 나름 이해는 됐어요', replies: [
      { order: 6, person: 'a', time: '48분 전', text: '저도 처음엔 당황했는데 다시 보니 납득 가더라고요' },
      { order: 14, name: '루카스아스카니엔추종자', time: '10분 전', text: '저도 재독하고 나서야 이해했어요' }
    ] },
    { order: 7, name: '냐냐냥', time: '48분 전', text: '재독하면 다르게 보이는 소설인 듯' },
    { order: 8, person: 'd', time: '35분 전', text: '저는 아직 재독할 용기가 안 나네요' },
    { order: 9, name: 'rlaehrwk', time: '28분 전', text: '천천히 다시 도전해보세요' },
    { order: 10, name: 'rlaehrwk', time: '28분 전', text: '저는 이미 세 번째 재독중입니다' },
    { order: 15, name: '루카스아스카니엔추종자', time: '10분 전', text: '대단하시네요' },
    { order: 16, person: 'e', time: '6분 전', text: '저도 재독 리스트에 추가해야겠어요' },
    { order: 17, name: '감옥에서누가돌아왓게', time: '3분 전', text: '다들 애정이 대단하시네요' },
    { order: 18, person: 'd', time: '3분 전', text: '그만큼 매력있는 작품이니까요' }
  ],

  'hacha:2': [
    { order: 1, name: '카페인중독', time: '1일 전', text: '저는 전독시 하차했다가 완결 후에 정주행했어요' },
    { order: 2, name: '출근을하게되..', time: '20시간 전', text: '저도 어바등 그렇게 다시 봤어요' },
    { order: 3, name: '스포방지', time: '12시간 전', text: '시간 지나서 보니까 훨씬 재밌더라고요' },
    { order: 4, name: '데못죽정주행', time: '8시간 전', text: '저는 아직 다시 볼 용기가 안 나는 작품이 있어요' },
    { order: 5, name: '출근을하게되..', time: '5시간 전', text: '천천히 마음 편해지면 다시 보세요' },
    { order: 6, name: '독자', time: '3시간 전', text: '저도 그런 작품 하나 있어요' },
    { order: 7, person: 'a', time: '2시간 전', text: '다들 하나쯤은 있나 보네요' },
    { order: 8, person: 'c', time: '1시간 전', text: '재도전 화이팅입니다' }
  ]
};

const DEFAULT_BOARD = 'gwaechul';

/* 주소창의 board 값을 실제로 존재하는 게시판 key로 바꿔준다 */
function resolveBoardKey(key) {
  return BOARDS[key] ? key : DEFAULT_BOARD;
}

/* ===== write 페이지에서 쓴 게시글 (localStorage) =====
   글을 올린 뒤에도 남아 있어야 해서 브라우저에 게시판별로 따로 저장해 둔다.
   저장해 둔 모양은 { 게시판키: [게시글, 게시글, ...] } 이고,
   게시글 하나는 위 BOARDS의 게시글과 같은 모양에 createdAt(쓴 시각)이 하나 더 붙는다.

   조회수 / 하트 / 댓글은 'deutgeul:posts'에 '게시판키:글번호'로 저장되니까
   새 글은 반드시 그 게시판 목록 '뒤에' 붙여서 원래 글들의 번호가 밀리지 않게 한다.
   목록에서 위로 올리는 건 번호가 아니라 createdAt으로 community.js가 정한다. */
const NEW_POSTS_KEY = 'deutgeul:newPosts';

function loadNewPosts() {
  try {
    return JSON.parse(localStorage.getItem(NEW_POSTS_KEY)) || {};
  } catch (e) {
    return {}; // 저장된 값이 깨져 있으면 없는 셈 친다
  }
}

function saveNewPosts(stored) {
  try {
    localStorage.setItem(NEW_POSTS_KEY, JSON.stringify(stored));
  } catch (e) {
    // 저장이 막혀 있으면(용량 초과 등) 이번 화면에서만 유지된다
  }
}

/* write 페이지에서 등록을 누르면 이 함수로 글을 저장한다 */
function addNewPost(key, post) {
  const stored = loadNewPosts();

  stored[key] = stored[key] || [];
  stored[key].push(post);

  saveNewPosts(stored);
  BOARDS[key].posts.push(post);
}

/* my_post 화면에서 지운 글.
   목록에서 안 보이게 표시만 하고 자리는 남겨 둔다.
   조회수 / 하트 / 북마크 / 댓글이 '게시판키:글번호'로 저장돼 있어서
   글을 배열에서 빼버리면 뒤에 있는 글들의 번호가 하나씩 밀려 남의 기록을 물려받게 된다.
   지운 글은 community / bookmark / my_post 목록에서 모두 걸러진다. */
function deleteMyPost(boardKey, index) {
  const post = BOARDS[boardKey] && BOARDS[boardKey].posts[index];
  if (!post || !post.mine) return; // 내가 쓴 글만 지울 수 있다

  post.deleted = true;

  // 저장해 둔 글에도 표시해 둬야 다음에 들어와도 지워진 채로 있다 (쓴 시각으로 같은 글을 찾는다)
  const stored = loadNewPosts();
  const target = (stored[boardKey] || []).filter((item) => item.createdAt === post.createdAt)[0];

  if (target) {
    target.deleted = true;
    saveNewPosts(stored);
  }
}

/* 저장해 둔 글을 각 게시판 뒤에 붙인다.
   이 파일을 읽는 페이지(community / post / write)는 모두 붙은 상태로 보게 된다. */
(function attachNewPosts() {
  const stored = loadNewPosts();

  Object.keys(stored).forEach((key) => {
    if (!BOARDS[key]) return; // 없어진 게시판에 쓴 글은 건너뛴다
    stored[key].forEach((post) => BOARDS[key].posts.push(post));
  });
})();

/* 내가 쓴 글만 모은다 (최근에 쓴 글이 맨 위, 지운 글은 뺀다).
   write 페이지에서 올린 글에는 mine이 붙어 있어서 그것만 골라내면 된다.
   my 화면의 개수와 my_post 화면의 목록이 같이 쓴다. */
function myPosts() {
  const found = [];

  Object.keys(BOARDS).forEach((key) => {
    BOARDS[key].posts.forEach((post, index) => {
      if (post.mine && !post.deleted) found.push({ post, boardKey: key, index });
    });
  });

  return found.sort((a, b) => (b.post.createdAt || 0) - (a.post.createdAt || 0));
}

/* ===== 내 게시판 (localStorage) =====
   home의 '내 게시판'에 놓인 작품 목록이다.
   search 화면에서 표지를 눌러 작품을 추가하면 여기에 쌓인다.
   저장해 둔 값이 없으면 처음 네 작품을 담은 채로 시작한다. */
const MY_BOARDS_KEY = 'deutgeul:myBoards';
const DEFAULT_MY_BOARDS = ['gwaechul', 'jeondoksi', 'eobadeung', 'naeseupgeup'];

function loadMyBoards() {
  let keys;

  try {
    keys = JSON.parse(localStorage.getItem(MY_BOARDS_KEY));
  } catch (e) {
    keys = null; // 저장된 값이 깨져 있으면 없는 셈 친다
  }

  if (!Array.isArray(keys)) keys = DEFAULT_MY_BOARDS.slice();

  return keys.filter((key) => WORKS[key]); // 없어진 작품은 빼고 준다
}

function hasMyBoard(key) {
  return loadMyBoards().indexOf(key) !== -1;
}

/* search 화면에서 '예'를 눌렀을 때. 이미 있으면 아무것도 하지 않는다 */
function addMyBoard(key) {
  const keys = loadMyBoards();
  if (!WORKS[key] || keys.indexOf(key) !== -1) return;

  keys.push(key);

  try {
    localStorage.setItem(MY_BOARDS_KEY, JSON.stringify(keys));
  } catch (e) {
    // 저장이 막혀 있으면(용량 초과 등) 이번 화면에서만 유지된다
  }
}

/* ===== 내 프로필 (localStorage) =====
   my 화면에서 바꾼 이름과 프로필 사진을 담아 둔다.
     name  : 바꾼 닉네임 (안 바꿨으면 없다)
     photo : 고른 사진을 data URL로 담아 둔 것 (안 바꿨으면 없다)
   내가 쓴 게시글과 댓글은 저장해 둔 이름 대신 항상 지금 값을 보여준다. */
const PROFILE_KEY = 'deutgeul:profile';

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};
  } catch (e) {
    return {}; // 저장된 값이 깨져 있으면 없는 셈 친다
  }
}

function saveProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    // 저장이 막혀 있으면(사진이 너무 크거나 용량 초과) 이번 화면에서만 유지된다
  }
}

function userName() {
  return loadProfile().name || USER_NICKNAME;
}

function userPhoto() {
  return loadProfile().photo || USER_PHOTO;
}

/* 배너나 검색창처럼 두 줄로 놓아도 되는 자리에서 쓸 작품 제목.
   줄바꿈 자리를 정해 둔 작품(titleLines)은 그 모양대로 준다.
   받는 쪽은 \n이 살아나도록 CSS에 white-space: pre-line을 같이 줘야 한다. */
function workTitleLines(key) {
  const work = WORKS[key];
  if (!work) return '';
  return work.titleLines || work.title;
}

/* ===== 게시글에 붙는 작품 줄 =====
   community / bookmark / my_post 목록이 같이 쓴다.
   후기 글은 글쓴이가 매긴 별점이 있어서 별과 점수를 보여주고,
   일반 / 토론 글에 연결한 작품은 별점이 없어서 대신 클립 아이콘을 보여준다. */
function workChipMarkup(work) {
  if (!work) return '';

  const right = work.score
    ? `<span class="work-score">
         <img class="icon-rating-star" src="assets/icon-rating-star.svg" alt="별점">
         <span class="cap-trim">${work.score}</span>
       </span>`
    : '<img class="icon-link" src="assets/icon-link.svg" alt="연결한 작품">';

  return `<div class="post-work">
       <div class="work-chip">
         <p class="work-name cap-trim">${work.name}</p>
         ${right}
       </div>
     </div>`;
}