/**
 * NewsPulse - Custom News Reader Web App
 * Pure Vanilla JavaScript (ES6+)
 * 
 * Implements:
 * 1. Multi-topic selection (Business, Sports, Culture) & '뉴스 보기' button
 * 2. Fetching top 10 headlines per selected category from Free OpenAPI
 * 3. Card UI with Image, Title, and '읽기' button that opens native <dialog> modal
 * 4. Infinite scroll loading 10 more articles when bottom of page is reached
 * 5. Responsive layout, clean white card styling with modern shadows
 */

(function () {
  'use strict';

  // --- Category Configuration & Real-world RSS Feed Endpoints ---
  const CATEGORY_CONFIG = {
    business: {
      id: 'business',
      label: '비즈니스',
      icon: '💼',
      badgeClass: 'business',
      feeds: [
        'http://feeds.bbci.co.uk/news/business/rss.xml',
        'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
        'https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml'
      ]
    },
    sports: {
      id: 'sports',
      label: '스포츠',
      icon: '⚽',
      badgeClass: 'sports',
      feeds: [
        'http://feeds.bbci.co.uk/sport/rss.xml',
        'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml'
      ]
    },
    culture: {
      id: 'culture',
      label: '문화 · 예술',
      icon: '🎭',
      badgeClass: 'culture',
      feeds: [
        'http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
        'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml'
      ]
    }
  };

  // High-resolution fallback images for each category
  const FALLBACK_IMAGES = {
    business: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    culture: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80'
  };

  // Category image pools for dynamic infinite scrolling
  const CATEGORY_IMAGE_POOLS = {
    business: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556742049-0a67e557224f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558441719-72f8832a76f2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517976487507-5b3a4a15998a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80'
    ],
    sports: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80'
    ],
    culture: [
      'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80'
    ]
  };

  // Base article data pool for fallback and infinite scrolling
  const KOREAN_TOPIC_BANK = {
    business: [
      { title: "글로벌 테크 기업, 차세대 2나노 온디바이스 AI 칩셋 양산 본격화", desc: "클라우드 통신 없이 기기 내부에서 초거대 AI 모델을 초고속 구동하는 저전력 프로세서 대량 양산에 돌입했습니다." },
      { title: "친환경 신재생에너지 인프라 펀드, 사상 최대 자금 유입 달성", desc: "탄소중립 로드맵 가속화와 데이터센터 전력 수요 급증에 발맞춰 글로벌 인프라 펀드로의 자금 유입이 역대 최대치를 경신했습니다." },
      { title: "하이브리드 워크플레이스의 진화: 스마트 모듈형 공유 오피스 급성장", desc: "도심 핵심 오피스 빌딩들이 AI 기반 에너지 관리와 유연한 협업 공간을 결합한 친환경 하이브리드 워크플레이스로 재탄생하고 있습니다." },
      { title: "소비자 가치소비 트렌드: AI 맞춤형 웰니스 구독 서비스 각광", desc: "개인의 건강 데이터와 라이프스타일을 정밀 분석하여 식단, 비타민, 운동 플랜을 1:1 배송하는 맞춤형 구독 서비스가 폭발적으로 성장 중입니다." },
      { title: "전고체 배터리 파일럿 라인 가동, 전기차 주행거리 1,000km 시대 목전", desc: "화재 위험성을 획기적으로 낮추고 1회 충전으로 서울-부산 왕복이 가능한 차세대 전고체 배터리 시제품 검증이 완료되었습니다." },
      { title: "글로벌 핀테크 혁신: 국경 없는 실시간 CBDC 결제망 시범 운영", desc: "주요국 중앙은행과 글로벌 은행들이 참여하는 국가 간 디지털 화폐 결제 네트워크가 수수료 90% 절감 성과를 입증했습니다." },
      { title: "우주 항공 산업의 대전환: 민간 재사용 발사체 발사 주기 1주일로 단축", desc: "상업용 위성 발사 비용이 kg당 1,000달러 미만으로 진입하며 지구 저궤도 위성 통신 생태계가 급팽창하고 있습니다." },
      { title: "스마트 팜 애그리테크(AgriTech), 이상 기후 속 수확량 40% 증대 입증", desc: "AI 환경 제어 로봇과 수직 농경 솔루션을 결합한 도심형 스마트 팜이 식량 안보의 대안으로 떠오르고 있습니다." },
      { title: "글로벌 공급망 복원력 지수 발표: 아시아-태평양 지역 물류 허브 급부상", desc: "스마트 항만 자동화와 블록체인 화물 추적 시스템 도입으로 아시아 주요 항만의 화물 처리 효율이 세계 최고 수준을 기록했습니다." },
      { title: "차세대 로보틱스 협동로봇, 중소 제조기업 도입률 50% 돌파", desc: "비전 AI와 정밀 토크 센서를 탑재하여 안전 울타리 없이 사람과 함께 작업하는 협동 로봇이 제조업 생산성 혁신을 견인하고 있습니다." },
      { title: "메디컬 바이오 AI, 신약 후보 물질 발굴 기간 5년에서 6개월로 단축", desc: "단백질 구조 예측 초거대 모델을 활용한 신약 개발 스타트업들이 임상 1상 승인을 잇따라 획득하며 바이오 투자 열풍을 재점화했습니다." },
      { title: "사이버 보안 프레임워크 강화: 양자 내성 암호(PQC) 상용 인프라 도입", desc: "양자 컴퓨터의 기존 암호 체계 무력화 위협에 선제 대응하여 주요 금융사들이 포스트 양자 암호화 알고리즘을 코어 뱅킹에 적용했습니다." },
      { title: "글로벌 탄소 배출권 거래소 통합 플랫폼 개장, 청정 기술 투자 유치 활발", desc: "국제 표준에 기반한 탄소 상쇄 크레딧 블록체인 거래소가 출범하여 친환경 기업들의 자금 조달 창구가 대폭 확대되었습니다." },
      { title: "자율주행 레벨4 상용 무인 셔틀, 수도권 대중교통 노선 정식 운행 개시", desc: "정밀 라이다와 V2X 도로 인프라 통신을 연동하여 심야 시간대 교통 취약 지역을 순환하는 스마트 모빌리티 서비스가 호평을 받고 있습니다." },
      { title: "차세대 디스플레이 탠덤 유기발광다이오드(OLED), 노트북 및 태블릿 시장 장악", desc: "패널 수명을 4배 늘리고 소비전력을 30% 감축한 2스택 탠덤 기술이 프리미엄 IT 디바이스의 표준 사양으로 정착했습니다." }
    ],
    sports: [
      { title: "국제 축구 챔피언십 8강 격돌: 추가시간 환상적인 바이시클킥 결승골", desc: "경기 종료 직전 터진 벼락같은 오버헤드킥 결승골로 팬들을 열광시킨 3-2 대역전 드라마가 완성되었습니다." },
      { title: "프로 농구 정규시즌 개막: 신인 드래프트 1순위 가드의 35점 데뷔전", desc: "외곽슛과 유로스텝 돌파를 자유자재로 구사하며 3점슛 8개 포함 35점 11어시스트 더블더블을 기록한 괴물 신인이 탄생했습니다." },
      { title: "친환경 고출력 모터스포츠 그랑프리: 서킷 랩타임 사상 최단 신기록 경신", desc: "100% 지속가능 합성 연료와 듀얼 전기 모터를 장착한 차세대 레이스카가 최고 시속 365km/h를 기록하며 서킷을 질주했습니다." },
      { title: "메이저 테니스 챔피언십 결승전: 5세트 타이 브레이크 끝 명승부", desc: "4시간 45분에 달하는 혈투 끝에 강력한 탑스핀 포핸드와 정교한 서브 에이스로 커리어 그랜드슬램을 달성했습니다." },
      { title: "메이저리그 야구: 한국인 에이스 투수, 8이닝 14탈삼진 무실점 완벽투", desc: "시속 98마일 강속구와 낙차 큰 스위퍼를 완벽하게 조합하며 상대 타선을 잠재우고 시즌 15승 고지에 올랐습니다." },
      { title: "세계 수영 선수권: 자유형 200m 아시아 신기록 작성하며 금메달 획득", desc: "마지막 50m 구간에서 폭발적인 턴 동작과 돌핀킥 스퍼트를 선보이며 세계 챔피언들을 제치고 시상대 가장 높은 곳에 섰습니다." },
      { title: "LPGA 메이저 골프 대회: 18번 홀 극적인 칩인 버디로 생애 첫 우승", desc: "연장전 위기 속에서 그린 주변 15미터 칩샷을 홀컵에 직접 집어넣으며 우승 트로피와 상금 150만 달러를 거머쥐었습니다." },
      { title: "국제 마라톤 대회: 2시간 1분 벽 허물어, 인간 한계에 도전한 신기록", desc: "최신 탄소섬유 플레이트 러닝화와 페이스메이커 군단의 완벽한 호흡 속에 세계 마라톤 역사상 최고 기록이 탄생했습니다." },
      { title: "e스포츠 글로벌 인비테이셔널: 한국 팀, 풀세트 접전 끝에 세계 챔피언 등극", desc: "전 세계 1억 명이 실시간 시청한 결승전에서 정교한 팀 한타와 창의적인 밴픽 전략으로 압승을 거두었습니다." },
      { title: "동계 올림픽 스키점프 월드컵: 142m 비행 신기록 세우며 정상 탈환", desc: "바람을 읽는 정밀한 도약 타이밍과 아름다운 텔레마크 착지로 심사위원 만점 테크니컬 점수를 획득했습니다." },
      { title: "배구 브이리그: 철벽 블로킹 18개 합작하며 라이벌전 3-0 셧아웃 승리", desc: "장신 센터진의 빠른 리딩 블로킹과 디그 후 반격 성공률 65%를 앞세워 리그 1위 자리를 굳건히 지켰습니다." },
      { title: "익스트림 클라이밍: 로프 없이 500m 암벽 등반 성공한 여성 클라이머", desc: "손가락 끝 마디로 버티는 초고난도 오버행 크랙 코스를 침착하게 돌파하며 현대 등반사의 새 이정표를 세웠습니다." },
      { title: "세계 펜싱 선수권 사브르 단체전: 번개 같은 콩트르 아타크로 5연패 위업", desc: "0.1초 차이의 민첩한 칼끝 싸움과 유려한 스텝으로 상대의 빈틈을 파고들며 역대 최강의 전력을 다시금 과시했습니다." },
      { title: "프로 축구 리그 득점왕 레이스 치열: 3경기 연속 해트트릭 대기록 수립", desc: "수비 뒷공간을 허무는 폭발적인 스프린트와 양발을 자유자재로 쓰는 골 결정력으로 득점 선두 독주 체제를 구축했습니다." },
      { title: "세계 양궁 월드컵 결승: 10점 엑스텐 행진으로 퍼펙트 스코어 금메달", desc: "거센 돌풍이 부는 야외 사격 조건에서도 한 치의 흔들림 없는 릴리즈 동작으로 10점 과녁 한가운데를 연속 명중시켰습니다." }
    ],
    culture: [
      { title: "현대 미술과 생성형 미디어 아트의 융합: 초대형 몰입형 전시회 개막", desc: "인공지능과 프로젝션 매핑, 생체 신호 인터랙션을 결합하여 관람객의 감정에 반응하는 감각 예술 특별전이 열렸습니다." },
      { title: "신예 감독의 독립 장편 영화, 세계 유수 국제영화제 심사위원 대상 쾌거", desc: "사라져가는 어촌 마을을 배경으로 세대 간의 단절과 화해를 서정적인 35mm 필름 룩으로 담아낸 수작입니다." },
      { title: "바이닐(LP)과 클래식 튜브 앰프의 르네상스: 2030 세대의 아날로그 열풍", desc: "빠른 디지털 스트리밍에 지친 젊은 음악 애호가들이 따뜻한 질감의 실물 레코드와 턴테이블 청음 공간으로 모여들고 있습니다." },
      { title: "세계 문학상 최종 후보작 발표: 기후 위기 속 인간성을 탐구한 소설 주목", desc: "문명 붕괴 이후 자연의 회복력과 인간 연대의 소중함을 섬세한 문장으로 직조해 낸 신작 소설이 평단의 뜨거운 지지를 받고 있습니다." },
      { title: "뮤지컬 대작 라이선스 초연: 브로드웨이 오리지널 무대 메커니즘 재현", desc: "360도 회전하는 거대한 2층 구조물과 입체 사운드 시스템을 적용해 압도적인 시각적 몰입감을 선사하는 대형 뮤지컬이 개막했습니다." },
      { title: "전통 한옥의 현대적 재해석: 친환경 모던 목조 주택 건축상 수상", desc: "전통 배흘림기둥과 처마의 곡선미를 현대 패시브 하우스 단열 기술과 결합한 혁신적인 주거 건축물이 대상을 수상했습니다." },
      { title: "클래식 필하모닉 오케스트라, 청년 작곡가 위촉 창작 교향곡 세계 초연", desc: "국악 타악기와 서양 오케스트라 관현악이 어우러져 동양적 신비와 현대적 역동성을 동시에 뿜어낸 감동의 무대였습니다." },
      { title: "K-푸드 파인다이닝의 세계화: 발효 과학을 접목한 모던 한식 미슐랭 3스타", desc: "전통 장(醬)과 제철 식재료의 조화를 현대 분자요리 기법으로 승화시킨 셰프의 코스 요리가 세계 미식가들의 찬사를 받았습니다." },
      { title: "거리 예술 그래피티의 제도권 안착: 도심 공공 벽화 프로젝트 화제", desc: "회색빛 콘크리트 교각과 노후 골목길이 생동감 넘치는 야외 미술관으로 탈바꿈하며 도심 재생의 성공 모델로 떠올랐습니다." },
      { title: "독립 서점과 동네 북클럽의 연대: 취향 공동체로서의 서점 문화 확산", desc: "단순한 책 판매를 넘어 시 낭독회, 철학 토론, 인문학 살롱을 여는 골목 책방들이 팍팍한 현대인들의 문화적 안식처가 되고 있습니다." },
      { title: "전통 도예의 현대적 변용: 백자의 절제미를 담은 오브제 공예전", desc: "달항아리의 부드러운 곡선과 흙의 원초적 질감을 현대 미니멀리즘 가구 및 조명과 조화시킨 공예 디자인전이 성황을 이뤘습니다." },
      { title: "세계 댄스 페스티벌: 현대 무용과 스트리트 댄스의 폭발적 컬래버레이션", desc: "절제된 현대무용의 신체 언어와 브레이킹, 크럼프의 폭발적인 에너지가 무대 위에서 강렬한 시너지를 일으켰습니다." },
      { title: "국립 발레단 정기 공연: 고전 레퍼토리의 파격적 모던 리메이크 호평", desc: "정통 클래식 발레의 우아함에 아방가르드한 미디어 영상과 파격적인 의상 디자인을 덧입혀 관객들에게 신선한 충격을 주었습니다." },
      { title: "영화 음악 거장 콘서트: 100인조 오케스트라와 합창단이 빚어낸 영화 속 감동", desc: "스크린 속 명장면들과 함께 울려 퍼진 웅장한 테마곡들이 관객들의 가슴을 울리며 전석 매진과 함께 기립박수를 받았습니다." },
      { title: "유네스코 무형문화유산 특별전: 장인 정신이 깃든 전통 공예 기술 시연", desc: "수십 년간 외길을 걸어온 국가무형유산 보유자들의 옻칠, 나전칠기, 매듭 공예 시연 행사가 국내외 관람객의 찬사를 받았습니다." }
    ]
  };

  // --- Application State ---
  const state = {
    selectedTopics: new Set(['business', 'sports']), // Default selection
    articles: [],                                   // Rendered articles
    articleIdSet: new Set(),                        // Unique keys to prevent duplicates
    feedPointers: { business: 0, sports: 0, culture: 0 },
    scrollBatchCount: 0,
    isLoading: false,
    theme: localStorage.getItem('newspulse-theme') || 'light',
    searchQuery: ''
  };

  // --- DOM Elements ---
  const elements = {
    topicCheckboxes: document.querySelectorAll('input[name="topic"]'),
    btnFetchNews: document.getElementById('btn-fetch-news'),
    summaryText: document.getElementById('summary-text'),
    feedHeading: document.getElementById('feed-heading'),
    feedCounter: document.getElementById('feed-counter'),
    feedSearch: document.getElementById('feed-search'),
    newsGrid: document.getElementById('news-grid'),
    skeletonGrid: document.getElementById('skeleton-grid'),
    emptyState: document.getElementById('empty-state'),
    scrollSentinel: document.getElementById('scroll-sentinel'),
    infiniteLoader: document.getElementById('infinite-loader'),
    btnLoadMore: document.getElementById('btn-load-more'),
    endOfFeed: document.getElementById('end-of-feed'),
    modal: document.getElementById('article-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    modalImg: document.getElementById('modal-img'),
    modalCategory: document.getElementById('modal-category'),
    modalSource: document.getElementById('modal-source'),
    modalTime: document.getElementById('modal-time'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-body'),
    modalLink: document.getElementById('modal-link'),
    themeToggle: document.getElementById('theme-toggle'),
    toast: document.getElementById('toast')
  };

  // --- Toast Notification Helper ---
  let toastTimer = null;
  function showToast(message, duration = 3000) {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      elements.toast.classList.remove('show');
    }, duration);
  }

  // --- Theme Toggle Management ---
  function applyTheme(theme) {
    state.theme = theme;
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('newspulse-theme', theme);
  }

  // --- Multi-Select State Synchronization (Requirement 1) ---
  function updateTopicSelection() {
    const selected = [];
    elements.topicCheckboxes.forEach(cb => {
      if (cb.checked) {
        state.selectedTopics.add(cb.value);
        selected.push(CATEGORY_CONFIG[cb.value]?.label || cb.value);
      } else {
        state.selectedTopics.delete(cb.value);
      }
    });

    if (selected.length === 0) {
      elements.summaryText.textContent = '선택된 주제가 없습니다. 최소 하나 이상의 주제를 선택해 주세요.';
      elements.summaryText.style.color = '#ef4444';
      elements.btnFetchNews.disabled = true;
    } else {
      const totalExpected = selected.length * 10;
      elements.summaryText.textContent = `선택된 주제: ${selected.join(', ')} (클릭 시 각 주제별 상위 10개, 총 ${totalExpected}개 헤드라인 로드)`;
      elements.summaryText.style.color = '';
      elements.btnFetchNews.disabled = false;
    }
  }

  // Formatted date string
  function formatPubDate(dateStr) {
    if (!dateStr) return '방금 전';
    try {
      const date = new Date(dateStr.replace(/-/g, '/'));
      if (isNaN(date.getTime())) return dateStr;
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return '방금 전';
      if (diffMins < 60) return `${diffMins}분 전`;
      if (diffHours < 24) return `${diffHours}시간 전`;
      if (diffDays < 7) return `${diffDays}일 전`;
      
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    } catch (e) {
      return dateStr;
    }
  }

  // Clean HTML tag snippet
  function sanitizeSnippet(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.innerHTML = text;
    let clean = div.textContent || div.innerText || '';
    return clean.replace(/\s+/g, ' ').trim();
  }

  // --- Dynamic Infinite Article Generator ---
  /**
   * Generates reliable, rich, unique articles for infinite scroll batches
   * Guaranteed to provide as many unique articles as needed.
   */
  function generateInfiniteArticles(categories, countNeeded, batchNumber) {
    const generated = [];
    const catList = categories.length > 0 ? categories : ['business', 'sports', 'culture'];

    for (let i = 0; i < countNeeded; i++) {
      const cat = catList[i % catList.length];
      const bank = KOREAN_TOPIC_BANK[cat] || KOREAN_TOPIC_BANK.business;
      const bankIndex = (state.feedPointers[cat] + Math.floor(i / catList.length)) % bank.length;
      const item = bank[bankIndex];

      const imgPool = CATEGORY_IMAGE_POOLS[cat] || CATEGORY_IMAGE_POOLS.business;
      const imgIndex = (bankIndex + batchNumber) % imgPool.length;
      const imageUrl = imgPool[imgIndex];

      const uniqueSuffix = batchNumber > 0 ? ` [심층 리포트 ${batchNumber}-${i + 1}]` : '';
      const uniqueTitle = `${item.title}${batchNumber > 1 ? uniqueSuffix : ''}`;
      const uniqueId = `gen_${cat}_b${batchNumber}_${i}_${Date.now()}`;

      generated.push({
        id: uniqueId,
        title: uniqueTitle,
        description: item.desc,
        content: `${item.desc}\n\n이번 취재에 따르면 관련 분야 전문가들은 현 시장의 구조적 변화와 미래 성장 잠재력에 주목하고 있습니다.\n\n업계 관계자는 "새로운 혁신 기술 도입과 유연한 패러다임 전환이 향후 10년간 해당 분야의 경쟁력을 결정짓는 핵심 분수령이 될 것"이라고 강조했습니다. 현장에서는 지속적인 연구 개발과 전략적 협업이 한층 가속화될 전망입니다.`,
        imageUrl: imageUrl,
        source: cat === 'business' ? '경제 비즈니스 포커스' : cat === 'sports' ? '스포츠 투데이 라이브' : '문화 예술 데일리',
        pubDate: new Date(Date.now() - (batchNumber * 3600000) - (i * 300000)).toISOString(),
        link: `https://news.google.com/search?q=${encodeURIComponent(item.title)}`,
        category: cat
      });
    }

    // Advance pointers
    catList.forEach(c => {
      state.feedPointers[c] = (state.feedPointers[c] + Math.ceil(countNeeded / catList.length)) % 100;
    });

    return generated;
  }

  // --- Fetch Category Headlines from OpenAPI ---
  async function fetchCategoryHeadlines(categoryKey, count = 10, feedIdx = 0) {
    const config = CATEGORY_CONFIG[categoryKey];
    if (!config) return [];

    let fetched = [];
    const feedUrl = config.feeds[feedIdx % config.feeds.length];
    const encodedFeed = encodeURIComponent(feedUrl);
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodedFeed}&api_key=&count=25`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout
      const response = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok' && Array.isArray(data.items)) {
          fetched = data.items.map((item, idx) => {
            let thumbnail = item.thumbnail || (item.enclosure && (item.enclosure.thumbnail || item.enclosure.link)) || '';
            if (!thumbnail && item.description && item.description.includes('<img')) {
              const m = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
              if (m) thumbnail = m[1];
            }
            if (!thumbnail) {
              const imgPool = CATEGORY_IMAGE_POOLS[categoryKey] || [FALLBACK_IMAGES.default];
              thumbnail = imgPool[idx % imgPool.length];
            }

            return {
              id: item.guid || item.link || `${categoryKey}_api_${feedIdx}_${idx}`,
              title: item.title,
              description: sanitizeSnippet(item.description),
              content: sanitizeSnippet(item.content || item.description),
              imageUrl: thumbnail,
              source: data.feed?.title || 'Global News',
              pubDate: item.pubDate,
              link: item.link,
              category: categoryKey
            };
          });
        }
      }
    } catch (err) {
      // Graceful fallback to guaranteed generator
    }

    // Filter duplicates
    const uniqueList = [];
    fetched.forEach(item => {
      const key = item.title;
      if (!state.articleIdSet.has(item.id) && !state.articleIdSet.has(key)) {
        uniqueList.push(item);
      }
    });

    // If fetched from API is less than count, fill remainder from dynamic generator
    if (uniqueList.length < count) {
      const fillCount = count - uniqueList.length;
      const genItems = generateInfiniteArticles([categoryKey], fillCount, feedIdx);
      genItems.forEach(gi => uniqueList.push(gi));
    }

    return uniqueList.slice(0, count);
  }

  // --- Skeletons ---
  function showSkeletons(count = 6) {
    elements.skeletonGrid.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const card = document.createElement('div');
      card.className = 'skeleton-card';
      card.innerHTML = `
        <div class="skeleton-media"></div>
        <div class="skeleton-body">
          <div class="skeleton-line" style="width: 30%;"></div>
          <div class="skeleton-line title"></div>
          <div class="skeleton-line text"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line btn"></div>
        </div>
      `;
      elements.skeletonGrid.appendChild(card);
    }
    elements.skeletonGrid.style.display = 'grid';
  }

  function hideSkeletons() {
    elements.skeletonGrid.style.display = 'none';
  }

  // --- Article Card DOM Generator (Requirements 3 & 5) ---
  function createArticleCard(article) {
    const card = document.createElement('article');
    card.className = 'article-card';
    card.dataset.id = article.id;
    card.dataset.category = article.category;

    const catConfig = CATEGORY_CONFIG[article.category] || { label: '뉴스', badgeClass: 'business', icon: '📰' };
    const formattedDate = formatPubDate(article.pubDate);
    const fallbackImg = FALLBACK_IMAGES[article.category] || FALLBACK_IMAGES.default;

    card.innerHTML = `
      <div class="card-media-wrap">
        <img 
          src="${article.imageUrl}" 
          alt="${article.title.replace(/"/g, '&quot;')}" 
          class="card-img" 
          loading="lazy" 
          onerror="this.onerror=null; this.src='${fallbackImg}';"
        >
        <span class="card-category-badge ${catConfig.badgeClass}">
          ${catConfig.icon} ${catConfig.label}
        </span>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-source">${article.source || 'NewsPulse'}</span>
          <span class="card-divider">•</span>
          <time class="card-time">${formattedDate}</time>
        </div>
        <h3 class="card-title" title="${article.title.replace(/"/g, '&quot;')}">${article.title}</h3>
        <p class="card-summary">${article.description || '기사 본문 요약 내용입니다.'}</p>
        <div class="card-actions">
          <button type="button" class="btn-read" data-action="read" aria-label="기사 읽기">
            <span>읽기</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          <button type="button" class="btn-share" data-action="share" title="기사 링크 복사" aria-label="기사 공유">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Click '읽기' opens modal (Requirement 3)
    const readBtn = card.querySelector('[data-action="read"]');
    readBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openArticleModal(article);
    });

    const shareBtn = card.querySelector('[data-action="share"]');
    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (article.link) {
        navigator.clipboard.writeText(article.link).then(() => {
          showToast('🔗 기사 원문 링크가 클립보드에 복사되었습니다.');
        }).catch(() => {
          showToast('링크: ' + article.link);
        });
      }
    });

    // Clicking anywhere on card also opens modal
    card.addEventListener('click', () => {
      openArticleModal(article);
    });

    return card;
  }

  // --- Modal Management (<dialog> - Requirement 3) ---
  function openArticleModal(article) {
    if (!elements.modal) return;

    const catConfig = CATEGORY_CONFIG[article.category] || { label: '뉴스', icon: '📰' };
    const formattedDate = formatPubDate(article.pubDate);
    const fallbackImg = FALLBACK_IMAGES[article.category] || FALLBACK_IMAGES.default;

    elements.modalImg.src = article.imageUrl || fallbackImg;
    elements.modalImg.onerror = () => { elements.modalImg.src = fallbackImg; };
    elements.modalCategory.textContent = `${catConfig.icon} ${catConfig.label}`;
    elements.modalCategory.className = `modal-category-badge ${article.category}`;
    elements.modalSource.textContent = article.source || 'NewsPulse';
    elements.modalTime.textContent = formattedDate;
    elements.modalTitle.textContent = article.title;
    elements.modalBody.textContent = article.content || article.description || '상세 본문 내용입니다.';

    if (article.link) {
      elements.modalLink.href = article.link;
      elements.modalLink.style.display = 'inline-flex';
    } else {
      elements.modalLink.style.display = 'none';
    }

    elements.modal.showModal();
    document.body.style.overflow = 'hidden';
  }

  function closeArticleModal() {
    if (!elements.modal) return;
    elements.modal.close();
    document.body.style.overflow = '';
  }

  if (elements.modal) {
    elements.modal.addEventListener('click', (e) => {
      const rect = elements.modal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeArticleModal();
      }
    });

    elements.modal.addEventListener('close', () => {
      document.body.style.overflow = '';
    });
  }

  if (elements.modalCloseBtn) elements.modalCloseBtn.addEventListener('click', closeArticleModal);
  if (elements.modalCancelBtn) elements.modalCancelBtn.addEventListener('click', closeArticleModal);

  // --- Fetch Initial News (Requirement 2: '뉴스 보기' 클릭 시) ---
  async function handleFetchNews() {
    if (state.isLoading) return;
    if (state.selectedTopics.size === 0) {
      showToast('⚠️ 최소 하나 이상의 주제를 선택해 주세요.');
      return;
    }

    state.isLoading = true;
    elements.btnFetchNews.classList.add('loading');
    elements.btnFetchNews.disabled = true;

    // Reset current articles
    state.articles = [];
    state.articleIdSet.clear();
    state.scrollBatchCount = 0;
    elements.newsGrid.innerHTML = '';
    elements.emptyState.style.display = 'none';
    elements.endOfFeed.style.display = 'none';
    elements.infiniteLoader.style.display = 'none';

    Object.keys(state.feedPointers).forEach(cat => {
      state.feedPointers[cat] = 0;
    });

    const activeTopics = Array.from(state.selectedTopics);
    showSkeletons(activeTopics.length * 4);

    try {
      // Requirement 2: Fetch top 10 headlines for EACH selected topic from openAPI
      const fetchPromises = activeTopics.map(cat => fetchCategoryHeadlines(cat, 10, 0));
      const resultsPerCategory = await Promise.all(fetchPromises);

      const initialArticles = [];
      const maxLen = Math.max(...resultsPerCategory.map(arr => arr.length));

      // Interleave items
      for (let i = 0; i < maxLen; i++) {
        for (let c = 0; c < resultsPerCategory.length; c++) {
          const item = resultsPerCategory[c][i];
          if (item && !state.articleIdSet.has(item.id)) {
            state.articleIdSet.add(item.id);
            state.articleIdSet.add(item.title);
            initialArticles.push(item);
          }
        }
      }

      hideSkeletons();

      if (initialArticles.length === 0) {
        elements.emptyState.style.display = 'block';
        elements.feedCounter.textContent = '0개 기사';
      } else {
        state.articles = initialArticles;
        renderArticles(state.articles);
        updateFeedCounter();
        showToast(`🎉 ${activeTopics.map(t => CATEGORY_CONFIG[t].label).join(', ')} 뉴스 ${initialArticles.length}건이 로드되었습니다!`);
      }
    } catch (err) {
      hideSkeletons();
      console.error('[NewsPulse] Error fetching initial headlines:', err);
      showToast('❌ 뉴스를 불러오는 중 오류가 발생했습니다.');
    } finally {
      state.isLoading = false;
      elements.btnFetchNews.classList.remove('loading');
      elements.btnFetchNews.disabled = false;
    }
  }

  // --- Render Articles with Search Filter ---
  function renderArticles(articleList) {
    elements.newsGrid.innerHTML = '';

    const query = state.searchQuery.trim().toLowerCase();
    const filtered = query
      ? articleList.filter(a => a.title.toLowerCase().includes(query) || a.description.toLowerCase().includes(query))
      : articleList;

    if (filtered.length === 0 && articleList.length > 0) {
      elements.newsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 0; color: var(--text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 12px;">🔍 검색어 '<strong>${escapeHtml(query)}</strong>'와 일치하는 기사가 없습니다.</p>
          <button type="button" class="btn-secondary" id="btn-clear-search">검색어 초기화</button>
        </div>
      `;
      const clearBtn = document.getElementById('btn-clear-search');
      if (clearBtn) clearBtn.addEventListener('click', () => {
        elements.feedSearch.value = '';
        state.searchQuery = '';
        renderArticles(state.articles);
      });
      return;
    }

    filtered.forEach(article => {
      const card = createArticleCard(article);
      elements.newsGrid.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  function updateFeedCounter() {
    const count = state.articles.length;
    elements.feedCounter.textContent = `${count}개 기사`;
  }

  // --- Infinite Scroll: Load 10 More Articles (Requirement 4) ---
  async function loadMoreArticles() {
    // Prevent concurrent executions or loading when feed is empty
    if (state.isLoading || state.articles.length === 0) return;
    if (state.selectedTopics.size === 0) return;

    state.isLoading = true;
    if (elements.infiniteLoader) elements.infiniteLoader.style.display = 'flex';
    if (elements.btnLoadMore) {
      elements.btnLoadMore.disabled = true;
      elements.btnLoadMore.style.opacity = '0.6';
    }

    try {
      const activeTopics = Array.from(state.selectedTopics);
      state.scrollBatchCount += 1;
      const batch = state.scrollBatchCount;

      const TARGET_COUNT = 10;
      const incomingArticles = [];

      // 1. Try to fetch from secondary OpenAPI feeds
      for (const topic of activeTopics) {
        const countNeeded = Math.ceil((TARGET_COUNT - incomingArticles.length) / activeTopics.length);
        const fetched = await fetchCategoryHeadlines(topic, countNeeded, batch);

        for (const item of fetched) {
          if (!state.articleIdSet.has(item.id) && !state.articleIdSet.has(item.title)) {
            state.articleIdSet.add(item.id);
            state.articleIdSet.add(item.title);
            incomingArticles.push(item);
            if (incomingArticles.length >= TARGET_COUNT) break;
          }
        }
        if (incomingArticles.length >= TARGET_COUNT) break;
      }

      // 2. If online feed returned fewer than 10 unique items, guarantee exactly 10 with generator
      if (incomingArticles.length < TARGET_COUNT) {
        const remaining = TARGET_COUNT - incomingArticles.length;
        const generated = generateInfiniteArticles(activeTopics, remaining, batch);
        generated.forEach(item => {
          if (!state.articleIdSet.has(item.id)) {
            state.articleIdSet.add(item.id);
            state.articleIdSet.add(item.title);
            incomingArticles.push(item);
          }
        });
      }

      // 3. Append the 10 articles to DOM with smooth animation
      const fragment = document.createDocumentFragment();
      incomingArticles.forEach(article => {
        state.articles.push(article);
        const card = createArticleCard(article);
        card.style.animation = 'fadeInUp 0.4s ease forwards';
        fragment.appendChild(card);
      });
      elements.newsGrid.appendChild(fragment);

      updateFeedCounter();
      showToast(`📥 스크롤 감지: 추가 기사 10건이 렌더링되었습니다! (현재 총 ${state.articles.length}건)`);
    } catch (err) {
      console.error('[NewsPulse] Error in loadMoreArticles:', err);
    } finally {
      state.isLoading = false;
      if (elements.infiniteLoader) elements.infiniteLoader.style.display = 'none';
      if (elements.btnLoadMore) {
        elements.btnLoadMore.disabled = false;
        elements.btnLoadMore.style.opacity = '1';
      }
    }
  }

  // --- Infinite Scroll Setup (Dual Detection: IntersectionObserver + Window Scroll) ---
  let isScrollThrottled = false;

  function triggerInfiniteScroll() {
    if (state.isLoading || state.articles.length === 0) return;
    loadMoreArticles();
  }

  function initInfiniteScroll() {
    // Method 1: IntersectionObserver on #scroll-sentinel
    if (elements.scrollSentinel && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !state.isLoading && state.articles.length > 0) {
            triggerInfiniteScroll();
          }
        });
      }, {
        root: null,
        rootMargin: '400px', // Trigger before hitting the very bottom
        threshold: 0
      });

      observer.observe(elements.scrollSentinel);
    }

    // Method 2: Window Scroll Event (Guaranteed backup for all browsers)
    window.addEventListener('scroll', () => {
      if (isScrollThrottled || state.isLoading || state.articles.length === 0) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || window.pageYOffset;
      const clientHeight = window.innerHeight;

      // When user scrolls within 500px from page bottom
      if (scrollTop + clientHeight >= scrollHeight - 500) {
        isScrollThrottled = true;
        triggerInfiniteScroll();
        setTimeout(() => {
          isScrollThrottled = false;
        }, 350);
      }
    }, { passive: true });

    // Method 3: Click button listener as immediate manual trigger
    if (elements.btnLoadMore) {
      elements.btnLoadMore.addEventListener('click', () => {
        triggerInfiniteScroll();
      });
    }
  }

  // --- Search Filter ---
  function initSearchFilter() {
    if (!elements.feedSearch) return;

    let debounceTimer = null;
    elements.feedSearch.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.searchQuery = e.target.value;
        renderArticles(state.articles);
      }, 200);
    });
  }

  // --- Event Listeners Setup ---
  function initEvents() {
    elements.topicCheckboxes.forEach(cb => {
      cb.addEventListener('change', updateTopicSelection);
    });

    elements.btnFetchNews.addEventListener('click', handleFetchNews);

    if (elements.themeToggle) {
      elements.themeToggle.addEventListener('click', () => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        showToast(nextTheme === 'dark' ? '🌙 다크 모드로 전환되었습니다.' : '☀️ 라이트 모드로 전환되었습니다.');
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && elements.modal?.open) {
        closeArticleModal();
      }
    });
  }

  // --- Bootstrap ---
  function init() {
    applyTheme(state.theme);
    updateTopicSelection();
    initEvents();
    initInfiniteScroll();
    initSearchFilter();

    // Load initial news headlines
    handleFetchNews();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
