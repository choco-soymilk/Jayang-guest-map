import type { Language } from '../types/place';

export interface Translations {
  app_title: string;
  app_subtitle: string;
  search_placeholder: string;
  all_categories: string;
  food: string;
  cafe: string;
  pub: string;
  attraction: string;
  get_directions: string;
  recommended_menus: string;
  opening_hours: string;
  hotel_distance: string;
  price: string;
  qr_code: string;
  scan_qr_desc: string;
  admin_login: string;
  admin_panel: string;
  logout: string;
  no_places_found: string;
  hotel_hub_label: string;
  wifi_info: string;
  featured_spot: string;
  close: string;
  add_new_place: string;
  delete_confirm: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    app_title: 'Guest Map',
    app_subtitle: 'Curated Gourmet & Hotspots for Hotel Guests',
    search_placeholder: 'Search places, BBQ, cafe, sushi...',
    all_categories: 'All Spots',
    food: 'Food 🍖',
    cafe: 'Cafe ☕',
    pub: 'Pub & Bar 🍺',
    attraction: 'Attractions 🏛️',
    get_directions: 'Get Directions (Google Maps)',
    recommended_menus: 'Must-Try Menus',
    opening_hours: 'Opening Hours',
    hotel_distance: 'From Hotel',
    price: 'Price Range',
    qr_code: 'Scan QR Code',
    scan_qr_desc: 'Scan with your smartphone to open Guest Map anywhere in Korea!',
    admin_login: 'Manager Login',
    admin_panel: 'Admin Spot Manager',
    logout: 'Sign Out',
    no_places_found: 'No matching recommendations found.',
    hotel_hub_label: 'Your Hotel',
    wifi_info: 'Guest Wi-Fi',
    featured_spot: 'Staff Pick ⭐',
    close: 'Close',
    add_new_place: 'Add New Recommended Spot',
    delete_confirm: 'Are you sure you want to delete this place?'
  },
  kr: {
    app_title: '게스트 맵',
    app_subtitle: '호텔 투숙객 전용 엄선 맛집 & 핫플 가이드',
    search_placeholder: '맛집, 삼겹살, 카페, 술집, 명소 검색...',
    all_categories: '전체 보기',
    food: '맛집 🍖',
    cafe: '카페 ☕',
    pub: '술집/바 🍺',
    attraction: '관광/명소 🏛️',
    get_directions: '구글 지도 길찾기',
    recommended_menus: '대표 추천 메뉴',
    opening_hours: '영업시간',
    hotel_distance: '숙소에서 거리',
    price: '가격대',
    qr_code: 'QR 코드 스캔',
    scan_qr_desc: '스마트폰 카메라로 스캔하여 홈 화면에 앱으로 추가하세요!',
    admin_login: '관리자 로그인',
    admin_panel: '맛집 관리자 파널',
    logout: '로그아웃',
    no_places_found: '검색 조건에 맞는 맛집이 없습니다.',
    hotel_hub_label: '현재 숙소 위치',
    wifi_info: '투숙객 Wi-Fi 정보',
    featured_spot: '호텔 추천 ⭐',
    close: '닫기',
    add_new_place: '신규 맛집/핫플 등록',
    delete_confirm: '이 장소를 정말 삭제하시겠습니까?'
  },
  jp: {
    app_title: 'ゲストマップ',
    app_subtitle: 'ホテル宿泊者専用 グルメ＆スポットガイド',
    search_placeholder: 'お店、焼肉、カフェ、居酒屋を検索...',
    all_categories: 'すべて',
    food: 'グルメ 🍖',
    cafe: 'カフェ ☕',
    pub: '居酒屋・バー 🍺',
    attraction: '観光・名所 🏛️',
    get_directions: 'Googleマップで経路案内',
    recommended_menus: 'おすすめメニュー',
    opening_hours: '営業時間',
    hotel_distance: 'ホテルからの距離',
    price: '価格帯',
    qr_code: 'QRコード',
    scan_qr_desc: 'スマホでスキャンして簡単アプリ登録！',
    admin_login: '管理者ログイン',
    admin_panel: 'スポット管理',
    logout: 'ログアウト',
    no_places_found: '該当するおすすめスポットが見つかりません。',
    hotel_hub_label: 'ご宿泊ホテル',
    wifi_info: 'Wi-Fi情報',
    featured_spot: 'おすすめ ⭐',
    close: '閉じる',
    add_new_place: '新しいスポットを追加',
    delete_confirm: 'このスポットを削除しますか？'
  },
  cn: {
    app_title: '宾客地图',
    app_subtitle: '酒店住客专属 美食与景点推荐指南',
    search_placeholder: '搜索美食、烤肉、咖啡厅、酒吧...',
    all_categories: '全部',
    food: '美食 🍖',
    cafe: '咖啡 ☕',
    pub: '酒吧 🍺',
    attraction: '景点 🏛️',
    get_directions: '谷歌地图导航',
    recommended_menus: '招牌推荐菜品',
    opening_hours: '营业时间',
    hotel_distance: '距离酒店',
    price: '人均消费',
    qr_code: '扫码使用',
    scan_qr_desc: '手机扫码即可随身使用指南！',
    admin_login: '管理员登录',
    admin_panel: '景点管理面板',
    logout: '退出登录',
    no_places_found: '未找到符合条件的推荐。',
    hotel_hub_label: '您的入住酒店',
    wifi_info: '客房 Wi-Fi',
    featured_spot: '酒店精选 ⭐',
    close: '关闭',
    add_new_place: '添加新推荐地点',
    delete_confirm: '确定要删除此地点吗？'
  }
};
