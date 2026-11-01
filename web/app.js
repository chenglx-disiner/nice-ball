"use strict";
/* NICE BALL · local interactive demo. No network services or payments. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const dateLabel = (v) =>
  new Date(v).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
const icons = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  team: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v2"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  message:
    '<path d="M21 11a8 8 0 0 1-8 8H7l-4 3V11a9 9 0 1 1 18 0Z"/><path d="M7 10h10M7 14h6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  heart:
    '<path class="fill-icon" d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/>',
  bookmark: '<path class="fill-icon" d="M5 3h14v18l-7-4-7 4Z"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  close: '<path d="m5 5 14 14M5 19 19 5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  settings:
    '<path d="m9 3-1 3-3 1-2 4 2 3 1 4 4 2 3-1 4-1 3-4-1-3-1-4-4-2Z"/><circle cx="12" cy="12" r="3"/>',
  bag: '<path d="M4 7h16l1 14H3Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
  shirt: '<path d="m8 3-5 3-2 5 5 2v8h12v-8l5-2-2-5-5-3a4 4 0 0 1-8 0Z"/>',
  spark:
    '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  edit: '<path d="m16 3 5 5L8 21H3v-5ZM13 6l5 5"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  shield:
    '<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Z"/><path d="m8 12 3 3 5-6"/>',
  send: '<path d="m22 2-7 20-4-9-9-4ZM22 2 11 13"/>',
  share:
    '<circle cx="18" cy="4" r="3"/><circle cx="5" cy="12" r="3"/><circle cx="18" cy="20" r="3"/><path d="m8 10 7-4M8 14l7 4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.01"/>',
  ball: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.5 5.5c8 1 12 5 13 13M18.5 5.5c-8 1-12 5-13 13"/>',
  box: '<path d="m12 2 10 5-10 5L2 7Zm-10 5v10l10 5 10-5V7M12 12v10M7 4.5l10 5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
};
const icon = (n) =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[n] || icons.grid}</svg>`;
const act = (name, id = "") =>
  `data-action="${name}"${id !== "" ? ` data-id="${esc(id)}"` : ""}`;
const go = (route, params = {}) => {
  const q = new URLSearchParams(params).toString();
  const h = `#/${route}${q ? "?" + q : ""}`;
  if (location.hash === h) render();
  else location.hash = h;
};
const navBtn = (route, label, i, active, extra = "") =>
  `<button class="nav-item ${active === route ? "active" : ""}" data-route="${route}" ${active === route ? 'aria-current="page"' : ""}>${icon(i)}<span>${label}</span>${extra}</button>`;
const logo = () =>
  '<div class="logo"><span class="logo-mark">NB</span><span class="logo-word">NICE<span>BALL.</span></span></div>';
const avatar = (name, cls = "") =>
  `<span class="avatar ${cls}" aria-hidden="true">${esc(String(name).slice(0, 1).toUpperCase())}</span>`;
const asset = (id) =>
  String(id).startsWith("data:image/")
    ? id
    : String(id).startsWith("assets/")
      ? "../" + id
      : `../assets/${id}.jpg`;
const posts = [
  {
    id: "p1",
    title: "把主场的态度，穿在身上",
    en: "OWN YOUR\nCOURT.",
    author: "NICE 设计实验室",
    img: "1765264649466",
    category: "球衣",
    tag: "ORIGINAL DESIGN",
    likes: 328,
    desc: "不止是一件球衣，更是属于自己的比赛宣言。以荧光绿切开深色底，流动的几何线条来自球场上的突破轨迹。每一次上场，都带上你的态度。",
    color: "#191f19",
    accent: "#ccff00",
    pattern: "slash",
  },
  {
    id: "p2",
    title: "复古不是过去，是另一种现在",
    en: "BACK TO\nTHE 90s.",
    author: "阿森的衣橱",
    img: "1765264647584",
    category: "穿搭",
    tag: "COURTSIDE STYLE",
    likes: 216,
    desc: "宽松球衣、牛仔短裤，再加一双旧球鞋。把九十年代的张扬配色穿进日常，场内场外，都是自己的主场。",
    color: "#532580",
    accent: "#f07f36",
    pattern: "stripe",
  },
  {
    id: "p3",
    title: "凌晨的球场，也有自己的光",
    en: "AFTER\nHOURS.",
    author: "COURT 研究所",
    img: "1765264645664",
    category: "球场",
    tag: "COURT CULTURE",
    likes: 899,
    desc: "当城市慢下来，球落地的声音反而更清晰。蓝紫色的夜场和荧光线条，是这一组夜行者配色的起点。",
    color: "#172b46",
    accent: "#cd77fa",
    pattern: "split",
  },
  {
    id: "p4",
    title: "从一张草稿，到下一次上场",
    en: "FROM\nSCRATCH.",
    author: "纸上得来",
    img: "1765264675409",
    category: "手稿",
    tag: "DESIGN PROCESS",
    likes: 156,
    desc: "先画版型，再找到图形和号码的平衡。领口、侧片、滚边，每个细节都能改变一件球衣的气质。从空白开始，也是一种风格。",
    color: "#e8e8db",
    accent: "#28332a",
    pattern: "classic",
  },
  {
    id: "p5",
    title: "球鞋与球衣，一起找到节奏",
    en: "MATCH\nDAY.",
    author: "MOMO",
    img: "1765264687525",
    category: "球鞋",
    tag: "DAILY ROTATION",
    likes: 462,
    desc: "让球鞋上的一抹颜色，成为球衣上的视觉线索。无需每个元素都一致，找到一个共同点，穿搭就有了自己的节奏。",
    color: "#432e64",
    accent: "#3edcca",
    pattern: "slash",
  },
  {
    id: "p6",
    title: "细节里，藏着运动的呼吸感",
    en: "FEEL THE\nTEXTURE.",
    author: "织物档案",
    img: "1765264653321",
    category: "材质",
    tag: "MATERIAL STUDY",
    likes: 187,
    desc: "网眼织物的轻盈、不同光线下的色彩变化，都是设计的一部分。将材质当作灵感，而不是设计完成后的最后选择。",
    color: "#17343b",
    accent: "#e37dc6",
    pattern: "stripe",
  },
  {
    id: "p7",
    title: "用线条建立自己的球场语言",
    en: "PLAY\nBY DESIGN.",
    author: "NICE 设计实验室",
    img: "1765264656469",
    category: "手稿",
    tag: "TACTICAL THINKING",
    likes: 305,
    desc: "跑位、传球与投篮，组成了球场上的图形系统。把战术线条转化为球衣上的装饰，让团队的默契成为看得见的标记。",
    color: "#122c34",
    accent: "#9fe6df",
    pattern: "split",
  },
  {
    id: "p8",
    title: "属于街头的第二套队服",
    en: "OFF\nTHE COURT.",
    author: "SUNDAY CLUB",
    img: "1765264665088",
    category: "穿搭",
    tag: "STREET UNIFORM",
    likes: 273,
    desc: "离开球场，也不必收起你的球队风格。让赛场的几何色块和街头的松弛轮廓，在日常穿搭里继续碰撞。",
    color: "#dc5c38",
    accent: "#54d2b1",
    pattern: "split",
  },
];
if (window.NBShared) NBShared.extendPosts(posts);
const defaultJersey = {
  name: "主场 · VOLT",
  team: "NICE BALL",
  number: "23",
  player: "YOUR NAME",
  color: "#1a2218",
  accent: "#ccff00",
  pattern: "slash",
  type: "v",
  back: false,
};
const baseData = () => ({
  version: 1,
  user: { name: "设计师_X", bio: "把热爱穿在身上。", id: "NICE-0888" },
  likes: [],
  saved: [],
  following: [],
  comments: {},
  works: [],
  members: [
    { id: "m1", name: "Captain Jack", number: "23", size: "XL", role: "队长" },
    { id: "m2", name: "Shooter Li", number: "10", size: "L", role: "队员" },
    { id: "m3", name: "小林", number: "07", size: "M", role: "队员" },
    { id: "m4", name: "阿森", number: "11", size: "L", role: "队员" },
  ],
  teamName: "NICE 球队",
  teamDesign: null,
  confirmed: false,
  orders: [],
  cart: [],
  read: [],
  threads: {
    team: [
      {
        text: "欢迎来到 NICE 球队！可以在协作中心核对队员的号码和尺码，再一起确认设计。",
        me: false,
        time: "10:30",
      },
    ],
    studio: [
      {
        text: "这里是本地消息演示。发出的消息会保存在当前浏览器；这次演示没有连接其他用户。",
        me: false,
        time: "09:41",
      },
    ],
  },
  editor: { ...defaultJersey },
  activity: [],
  prefs: {},
});
const STORAGE = "nice-ball-demo-v1";
let data,
  storageAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE) || "null");
  data =
    saved && validateBackup(saved) ? { ...baseData(), ...saved } : baseData();
} catch {
  data = baseData();
  storageAvailable = false;
}
if (window.NBShared) {
  const shared = NBShared.toDesktop(NBShared.mobile(), data);
  if (validateBackup(shared)) data = shared;
}
let route,
  params,
  currentModal = null,
  returnFocus = null,
  toastTimer,
  ideas = [],
  editorID = null;
let profileTab = "works";
const persist = () => {
  try {
    if (window.NBShared) NBShared.saveDesktop(data);
    localStorage.setItem(STORAGE, JSON.stringify(data));
  } catch {
    storageAvailable = false;
    toast("当前无法保存到浏览器，请在设置中导出备份。");
  }
};
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 3200);
}
const empty = (title, desc, action = "", label = "开始创作", i = "grid") =>
  `<div class="empty">${icon(i)}<h3>${esc(title)}</h3><p>${esc(desc)}</p>${action ? `<button class="primary" ${act(action)}>${esc(label)}${icon("arrow")}</button>` : ""}</div>`;
const badge = (text, cls = "") =>
  `<span class="badge ${cls}">${esc(text)}</span>`;
const pageHeading = (en, title, desc = "") =>
  `<div class="page-heading"><p class="eyebrow">${en}</p><h1>${title}</h1>${desc ? `<p>${desc}</p>` : ""}</div>`;
function jersey(d, tag = "") {
  const id = "j" + uid();
  const color = /^#[0-9a-f]{6}$/i.test(d.color) ? d.color : "#1a2218";
  const accent = /^#[0-9a-f]{6}$/i.test(d.accent) ? d.accent : "#ccff00";
  const neck =
    d.type === "round" ? "M108 30Q150 89 192 30" : "M108 30 150 76 192 30";
  const shape =
    d.type === "tee"
      ? "M108 30 65 48 22 100 63 132 83 108 83 334 217 334 217 108 237 132 278 100 235 48 192 30Q150 78 108 30Z"
      : "M108 30 79 42Q86 113 54 132L67 334 233 334 246 132Q214 113 221 42L192 30Q150 78 108 30Z";
  const patterns = {
    classic: `<path d="M63 310h174" stroke="${accent}" stroke-width="10"/>`,
    slash: `<path d="m12 165 286 116-5 34L6 200Z" fill="${accent}"/><path d="m-20 220 300 111" stroke="${accent}" stroke-width="5"/><path d="M220 40 130 343h38L245 70Z" fill="${accent}" opacity=".2"/>`,
    stripe: `<path d="M82 0v350M112 0v350M188 0v350M218 0v350" stroke="${accent}" stroke-width="13" opacity=".65"/>`,
    split: `<path d="m150 0 155 0v350H150Z" fill="${accent}" opacity=".65"/><path d="M0 263 300 167v35L0 298Z" fill="${accent}"/>`,
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 370" role="img" aria-label="${esc(d.team)} ${esc(d.number)} 号${d.back ? "背面" : "正面"}球衣${esc(tag)}"><defs><clipPath id="${id}clip"><path d="${shape}"/></clipPath><linearGradient id="${id}shade"><stop stop-color="#ffffff" stop-opacity=".13"/><stop offset=".3" stop-color="#ffffff" stop-opacity="0"/><stop offset=".7" stop-color="#000000" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity=".3"/></linearGradient><pattern id="${id}mesh" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".65" fill="#ffffff" opacity=".14"/></pattern></defs><path d="${shape}" fill="${color}" stroke="#ffffff" stroke-opacity=".17" stroke-width="1.5"/><g clip-path="url(#${id}clip)">${patterns[d.pattern] || patterns.classic}<rect width="300" height="360" fill="url(#${id}mesh)"/><rect width="300" height="360" fill="url(#${id}shade)"/></g><path d="${neck}" stroke="${accent}" stroke-width="7" fill="none"/><path d="M79 43Q87 111 56 131M221 43Q213 111 244 131" stroke="${accent}" stroke-width="6" fill="none"/><path d="M70 325h160" stroke="${accent}" stroke-width="2" opacity=".7"/><text x="150" y="132" text-anchor="middle" fill="${accent}" font-family="Helvetica,Arial,sans-serif" font-size="${d.back ? "17" : "20"}" font-weight="900" font-style="italic" letter-spacing="1" stroke="${color}" stroke-width=".4" paint-order="stroke">${esc((d.back ? d.player : d.team).toUpperCase().slice(0, 18))}</text><text x="150" y="236" text-anchor="middle" fill="${accent}" font-family="Impact,Arial Black,sans-serif" font-size="104" font-weight="900" font-style="italic" stroke="${color}" stroke-width="2" paint-order="stroke">${esc(d.number)}</text><rect x="82" y="298" width="32" height="13" rx="1" fill="${color}" stroke="${accent}" stroke-width=".5"/><text x="98" y="307" text-anchor="middle" fill="${accent}" font-family="Arial,sans-serif" font-size="5.5" font-weight="bold">NICE BALL</text><text x="216" y="313" fill="${accent}" font-family="Arial,sans-serif" font-size="7" font-style="italic" font-weight="bold">NB.</text></svg>`;
}
function render() {
  const raw = (location.hash.slice(2) || "home").split("?");
  route = raw[0] || "home";
  params = new URLSearchParams(raw[1] || "");
  const views = {
    home: homeView,
    detail: detailView,
    create: createView,
    templates: templatesView,
    editor: editorView,
    assistant: assistantView,
    team: teamView,
    messages: messagesView,
    chat: chatView,
    profile: profileView,
    orders: ordersView,
    settings: settingsView,
    cart: cartView,
  };
  if (!views[route]) {
    route = "home";
    history.replaceState(null, "", "#/home");
  }
  const active = ["detail"].includes(route)
    ? "home"
    : ["chat"].includes(route)
      ? "messages"
      : ["orders", "settings", "cart"].includes(route)
        ? "profile"
        : route;
  const unread = ["team", "studio", "system"].filter(
    (x) => !data.read.includes(x),
  ).length;
  const routeNames = {
    home: "发现灵感",
    detail: "灵感详情",
    create: "创作中心",
    templates: "球衣版型",
    editor: "设计工作台",
    assistant: "灵感助手",
    team: "球队协作",
    messages: "消息",
    chat: "会话",
    profile: "我的空间",
    orders: "我的订单",
    settings: "设置与数据",
    cart: "设计清单",
  };
  $("#app").innerHTML =
    `<div class="app-shell"><aside class="sidebar"><button data-route="home" aria-label="NICE BALL 首页">${logo()}</button><div><nav class="nav-list" aria-label="主导航">${navBtn("home", "发现灵感", "home", active)}${navBtn("team", "球队协作", "team", active)}${navBtn("messages", "消息", "message", active, unread ? `<span class="count">${unread}</span>` : "")}${navBtn("profile", "我的空间", "user", active)}</nav><button class="primary sidebar-create" data-route="create">${icon("plus")}开始创作</button></div><div class="sidebar-foot"><div class="local-label"><span class="dot"></span> 本地演示 · 自由探索</div><button class="nav-item" data-action="mobile-layout">${icon("shirt")}查看原版手机版</button><button class="row side-user" data-route="profile">${avatar(data.user.name)}<span class="grow"><strong>${esc(data.user.name)}</strong><br><span class="eyebrow">NICE CREATOR</span></span>${icon("chevron")}</button></div></aside><div class="workspace"><header class="topbar"><div class="breadcrumb">NICE BALL <span> / CREATIVE COMMUNITY </span> / <b>${routeNames[route]}</b></div><div class="top-actions"><form class="searchbox" data-form="search" role="search">${icon("search")}<input name="q" aria-label="搜索灵感" placeholder="搜索球衣、穿搭、灵感" value="${esc(route === "home" ? params.get("q") || "" : "")}" maxlength="80"><kbd>↵</kbd></form><button class="icon-btn" data-route="cart" aria-label="设计清单，${data.cart.length} 项">${icon("bag")}</button></div></header><header class="mobile-header"><button data-route="home" aria-label="NICE BALL 首页">${logo()}</button><div class="row"><button class="icon-btn" ${act("search-modal")} aria-label="搜索">${icon("search")}</button><button class="icon-btn" data-route="cart" aria-label="设计清单，${data.cart.length} 项">${icon("bag")}</button></div></header><main class="main" id="main" data-view="${route}" data-query="${esc(params.toString())}" tabindex="-1">${views[route]()}</main></div><nav class="bottom-nav" aria-label="移动主导航">${[
      ["home", "发现", "home"],
      ["team", "协作", "team"],
      ["create", "", "plus"],
      ["messages", "消息", "message"],
      ["profile", "我的", "user"],
    ]
      .map(
        ([r, l, i]) =>
          `<button data-route="${r}" class="${r === "create" ? "create-nav" : active === r ? "active" : ""}" ${active === r ? 'aria-current="page"' : ""} aria-label="${l || "开始创作"}">${icon(i)}${l ? `<span>${l}${r === "messages" && unread ? " · " + unread : ""}</span>` : ""}</button>`,
      )
      .join("")}</nav></div>`;
  if (route === "chat") {
    const log = $(".chat-log");
    log.scrollTop = log.scrollHeight;
  }
  if (!storageAvailable) toast("浏览器存储不可用，可在设置中导出备份。");
}
function postCard(p) {
  return `<article class="post-card"><button class="post-image" data-route="detail" data-params="id=${p.id}" aria-label="查看${esc(p.title)}"><img src="${asset(p.img)}" alt="${esc(p.title)}" loading="lazy"><span class="post-tag">${esc(p.tag)}</span><span class="image-title">${esc(p.en)}</span></button><h3><button data-route="detail" data-params="id=${p.id}">${esc(p.title)}</button></h3><div class="post-meta">${avatar(p.author)}<span>${esc(p.author)}</span><button class="like-mini ${data.likes.includes(p.id) ? "active" : ""}" ${act("like", p.id)} aria-label="${data.likes.includes(p.id) ? "取消点赞" : "点赞"}" aria-pressed="${data.likes.includes(p.id)}">${icon("heart")}<span>${p.likes + (data.likes.includes(p.id) ? 1 : 0)}</span></button></div></article>`;
}
function homeView() {
  const tab = params.get("tab") || "recommend",
    cat = params.get("cat") || "全部",
    q = (params.get("q") || "").trim();
  let list = posts.filter(
    (p) =>
      (cat === "全部" || p.category === cat) &&
      (!q ||
        [p.title, p.author, p.desc, p.category, p.en]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase())),
  );
  if (tab === "inspiration")
    list = list.filter((p) => ["手稿", "材质", "球场"].includes(p.category));
  if (tab === "popular") list.sort((a, b) => b.likes - a.likes);
  return `<div class="home-layout"><section>${!q ? `<div class="hero"><img src="${asset("1765264674051")}" alt="身穿黑绿球衣的篮球运动员"><div class="hero-content"><p class="eyebrow">FOR THE LOVE OF THE GAME</p><h1>你的主场，<br><em>由你设计。</em></h1><p>从一个灵感开始，定义你的下一件球衣。</p><button class="primary" data-route="create">开启我的设计${icon("arrow")}</button></div><span class="hero-number" aria-hidden="true">01 /</span></div><div class="ticker"><span><i class="dot"></i> DESIGNED BY YOU. PLAYED BY YOU.</span><span>NO LIMITS. JUST BASKETBALL.</span></div>` : pageHeading("SEARCH RESULTS", "找到你的下一个灵感", `搜索“${esc(q)}” · ${list.length} 条结果`)}<div class="tabs" role="tablist" aria-label="灵感频道">${[
    ["recommend", "为你推荐"],
    ["inspiration", "设计灵感"],
    ["popular", "本周热门"],
  ]
    .map(
      ([t, l]) =>
        `<button role="tab" aria-selected="${tab === t}" class="tab ${tab === t ? "active" : ""}" ${act("home-tab", t)}>${l}</button>`,
    )
    .join(
      "",
    )}</div><div class="chips" aria-label="内容分类">${["全部", "球衣", "穿搭", "球鞋", "球场", "手稿", "材质"].map((c) => `<button class="chip ${cat === c ? "active" : ""}" ${act("home-cat", c)} aria-pressed="${cat === c}">${c}</button>`).join("")}</div>${list.length ? `<div class="posts-grid">${list.map(postCard).join("")}</div>` : empty("暂时没有找到相关灵感", "试试其他关键词，或清除筛选看看。", "clear-search", "清除筛选", "search")}<footer class="helper-footer"><span>EVERY COURT HAS A STORY.</span><span>MAKE YOURS NICE. ↗</span></footer></section><aside class="aside-stack"><div class="daily"><p class="eyebrow">THE DESIGN STUDIO</p><h2>下一件，<br>为自己而设计。</h2><p>选一个版型，加一点你的态度。</p><div class="mini-jersey">${jersey(defaultJersey)}</div><button class="secondary full" data-route="templates">进入球衣工作台${icon("arrow")}</button></div><div class="team-mini"><div class="between"><h3>一起上场</h3>${badge(`${data.members.length} 人球队`, "neutral")}</div><p>${esc(data.teamName)} · 设计准备中</p><div class="between"><div class="avatar-stack">${data.members
    .slice(0, 4)
    .map((m) => avatar(m.name))
    .join(
      "",
    )}</div><button class="text-btn" data-route="team">查看球队${icon("chevron")}</button></div><div class="mini-progress"><span style="width:${data.confirmed ? 100 : data.teamDesign ? 70 : 30}%"></span></div><small class="muted">${data.confirmed ? "设计已确认，准备好上场。" : data.teamDesign ? "设计已选定，等待最终确认。" : "从队员信息到球衣，步调一致。"}</small></div><div><div class="between"><h3>灵感正在发生</h3><span class="eyebrow">HOT NOW</span></div>${[
    ["01", "复古球衣的回归", "穿搭"],
    ["02", "球场之外的球鞋", "球鞋"],
    ["03", "手稿里的无限可能", "手稿"],
  ]
    .map(
      ([n, t, c]) =>
        `<button class="topic-row" ${act("home-cat", c)}><span class="rank">${n}</span><span class="grow"><strong>${t}</strong><small>探索${c}灵感</small></span>${icon("arrow")}</button>`,
    )
    .join("")}</div></aside></div>`;
}
function detailView() {
  const p = posts.find((x) => x.id === params.get("id"));
  if (!p)
    return empty(
      "这条灵感不存在",
      "回到首页发现更多作品。",
      "clear-search",
      "返回首页",
    );
  const comments = data.comments[p.id] || [];
  return `<div class="back-head"><button class="icon-btn" ${act("back")} aria-label="返回">${icon("back")}</button><div><h1>灵感档案</h1><p class="eyebrow">INSPIRATION ARCHIVE</p></div><button class="icon-btn" style="margin-left:auto" ${act("share", p.id)} aria-label="分享灵感">${icon("share")}</button></div><div class="detail-layout"><img class="detail-art" src="${asset(p.img)}" alt="${esc(p.title)}"><section class="detail-copy"><div class="author-line">${avatar(p.author)}<div><h3>${esc(p.author)}</h3><span class="eyebrow">NICE CREATOR</span></div><button class="small-btn ${data.following.includes(p.author) ? "active" : ""}" ${act("follow", p.id)}>${data.following.includes(p.author) ? "已关注" : "+ 关注"}</button></div><h1>${esc(p.title)}</h1><p>${esc(p.desc)}</p><div class="row wrap" style="margin-top:16px">${badge("# " + p.category, "neutral")}${badge(p.tag, "neutral")}</div><div class="detail-actions"><button class="secondary ${data.likes.includes(p.id) ? "lime" : ""}" ${act("like", p.id)} aria-pressed="${data.likes.includes(p.id)}">${icon("heart")}<span>${p.likes + (data.likes.includes(p.id) ? 1 : 0)}</span></button><button class="secondary ${data.saved.includes(p.id) ? "lime" : ""}" ${act("bookmark", p.id)} aria-pressed="${data.saved.includes(p.id)}">${icon("bookmark")}${data.saved.includes(p.id) ? "已收藏" : "收藏灵感"}</button></div><button class="primary full" ${act("remix", p.id)}>${icon("shirt")}用这个配色开始设计${icon("arrow")}</button><div class="comments"><div class="between"><h3>聊聊这个灵感</h3><span class="muted">${comments.length}</span></div>${comments.length ? comments.map((c) => `<div class="comment"><div class="row">${avatar(c.author)}<strong>${esc(c.author)}</strong><span class="eyebrow" style="margin-left:auto">${dateLabel(c.time)}</span></div><p>${esc(c.text)}</p></div>`).join("") : '<p class="muted" style="font-size:12px;margin:16px 0">还没有留言，分享你的第一个想法。</p>'}<form class="comment-form" data-form="comment" data-id="${p.id}"><input name="text" aria-label="评论内容" placeholder="这个设计让你想到了什么？" required maxlength="300"><button class="primary" type="submit" aria-label="发表留言">${icon("send")}</button></form><p class="field-note" style="margin-top:10px">评论仅保存在本机，供演示使用。</p></div></section></div>`;
}
function createView() {
  return `${pageHeading("MAKE IT YOURS", "从热爱，到你的第一件球衣。", "选择一种开始方式，每一个灵感都有上场的机会。")}<div class="two-col"><section class="panel stack"><div class="row"><span class="badge">01 / DESIGN STUDIO</span>${icon("shirt")}</div><h2>从版型开始<br>把想法穿在身上。</h2><div class="mini-jersey" style="height:250px">${jersey(data.editor)}</div><p class="muted">选颜色、改号码、定图案。每一处细节，由你定义。</p><button class="primary" data-route="templates">选择球衣版型${icon("arrow")}</button><button class="text-btn" ${act("continue-editor")}>继续上次未保存的设计${icon("arrow")}</button></section><div class="stack"><section class="panel stack"><span class="badge purple">02 / IDEA LAB</span><h2>还没有方向？<br>先找一点灵感。</h2><p class="muted">输入风格、城市或颜色，组合三套可以继续编辑的球衣方案。</p><div class="notice">本地规则配色助手，可离线使用，未接入真实 AI 图像生成。</div><button class="secondary" data-route="assistant">探索设计方向${icon("spark")}</button></section><section class="panel"><div class="between"><h3>你的设计档案</h3>${badge(`${data.works.length} 件作品`, "neutral")}</div><p class="muted" style="margin:12px 0 16px">每一个小想法，都值得好好保存。</p><button class="text-btn" data-route="profile">打开我的作品库${icon("arrow")}</button></section></div></div>`;
}
const templates = [
  {
    type: "v",
    name: "经典 V 领",
    desc: "利落领线，致敬黄金年代。",
    color: "#1a2218",
    accent: "#ccff00",
    pattern: "slash",
  },
  {
    type: "round",
    name: "圆领比赛服",
    desc: "干净轮廓，专注每次上场。",
    color: "#22384c",
    accent: "#bce6f5",
    pattern: "stripe",
  },
  {
    type: "tee",
    name: "短袖训练服",
    desc: "从训练场，到每一天的日常。",
    color: "#e2ded2",
    accent: "#365344",
    pattern: "classic",
  },
];
function templatesView() {
  return `<div class="back-head"><button class="icon-btn" data-route="create" aria-label="返回创作中心">${icon("back")}</button><div><h1>好的设计，从版型开始。</h1><p class="eyebrow">CHOOSE YOUR CANVAS</p></div></div><div class="template-grid">${templates.map((t, i) => `<button class="template-card" ${act("choose-template", i)}>${jersey({ ...defaultJersey, ...t })}<h3>${t.name}</h3><p>${t.desc}</p><span class="small-btn">使用这个版型${icon("arrow")}</span></button>`).join("")}</div><div class="notice" style="margin-top:24px">所有版型都支持配色、图案、队名和号码编辑，正反面预览及矢量导出。</div>`;
}
function editorView() {
  const id = params.get("id");
  if (id && id !== editorID) {
    const w = data.works.find((w) => w.id === id);
    if (w) {
      data.editor = { ...w.design };
      editorID = id;
    } else
      return empty(
        "这件作品不存在",
        "可以从新设计开始。",
        "open-templates",
        "选择版型",
      );
  }
  const d = data.editor;
  return `<div class="back-head"><button class="icon-btn" data-route="create" aria-label="返回创作中心">${icon("back")}</button><div><h1>设计工作台</h1><p class="eyebrow">YOUR VISION. YOUR JERSEY.</p></div><div class="actions"><button class="secondary" ${act("export-jersey")} aria-label="导出 SVG 球衣设计">${icon("download")}导出</button><button class="primary" ${act("save-design")}>保存作品${icon("check")}</button></div></div><div class="editor-layout"><div class="preview-stage"><span class="preview-label eyebrow">NICE BALL / STUDIO 01</span><span class="preview-corner">矢量设计预览</span><div id="jersey-preview" style="display:contents">${jersey(d)}</div><div class="preview-tools"><button class="small-btn ${!d.back ? "active" : ""}" ${act("side", "front")} aria-pressed="${!d.back}">正面</button><button class="small-btn ${d.back ? "active" : ""}" ${act("side", "back")} aria-pressed="${d.back}">背面</button></div></div><form class="controls" id="editor-controls" data-form="editor"><div class="control-group"><h3>01 / 作品信息</h3><div class="stack"><label class="label">作品名称<input data-editor="name" value="${esc(d.name)}" maxlength="30" required></label><div class="field-row"><label class="label">球队名称<input data-editor="team" value="${esc(d.team)}" maxlength="18" required></label><label class="label">球衣号码<input data-editor="number" value="${esc(d.number)}" inputmode="numeric" pattern="[0-9]{1,2}" maxlength="2" required></label></div><label class="label">背面球员名<input data-editor="player" value="${esc(d.player)}" maxlength="18" required></label></div></div><div class="control-group"><h3>02 / 球衣底色</h3><div class="swatches">${["#1a2218", "#e6e5da", "#283c5b", "#542e69", "#963f33", "#214d47"].map((c) => `<button type="button" class="swatch ${d.color === c ? "active" : ""}" style="--swatch:${c}" ${act("base-color", c)} aria-label="底色 ${c}" aria-pressed="${d.color === c}"></button>`).join("")}</div><div class="field-row" style="margin-top:16px"><label class="label">自选底色<input type="color" data-editor="color" value="${esc(d.color)}"></label><label class="label">号码 / 图案色<input type="color" data-editor="accent" value="${esc(d.accent)}"></label></div></div><div class="control-group"><h3>03 / 图案风格</h3><div class="segmented">${[
    ["classic", "纯粹"],
    ["slash", "斜切"],
    ["stripe", "条纹"],
    ["split", "拼色"],
  ]
    .map(
      ([p, n]) =>
        `<button type="button" class="${d.pattern === p ? "active" : ""}" ${act("pattern", p)} aria-pressed="${d.pattern === p}">${n}</button>`,
    )
    .join(
      "",
    )}</div></div><div class="control-group"><h3>04 / 领型与轮廓</h3><div class="segmented">${[
    ["v", "V 领"],
    ["round", "圆领"],
    ["tee", "短袖"],
  ]
    .map(
      ([p, n]) =>
        `<button type="button" class="${d.type === p ? "active" : ""}" ${act("jersey-type", p)} aria-pressed="${d.type === p}">${n}</button>`,
    )
    .join(
      "",
    )}</div></div><p class="field-note">编辑进度自动保存在本机。点击“保存作品”收录到作品库。预览为设计示意，颜色以实际生产打样为准。</p><button class="secondary full" type="button" ${act("publish-design")}>保存并发布到我的展示库${icon("arrow")}</button></form></div>`;
}
function assistantView() {
  return `${pageHeading("IDEA LAB / LOCAL PALETTE ASSISTANT", "给灵感一个起点。", "说说你想要的球衣气质，探索三种可以继续编辑的方向。")}<div class="two-col"><form class="panel stack" data-form="ideas"><label class="label">描述你的设计灵感<textarea name="prompt" id="idea-prompt" placeholder="例如：夜晚的球场、荧光绿、锋利的几何线条" required maxlength="200"></textarea></label><div class="row wrap"><button type="button" class="prompt-example" ${act("prompt", "复古紫金配色，九十年代条纹球衣")}>复古紫金 / 90s</button><button type="button" class="prompt-example" ${act("prompt", "海边的蓝色，干净的极简球衣")}>海岸蓝 / 极简</button><button type="button" class="prompt-example" ${act("prompt", "夜晚球场，黑绿配色，锋利的线条")}>黑绿 / 夜行者</button></div><button class="primary" type="submit">组合三套设计方向${icon("spark")}</button></form><div class="panel stack"><span class="badge purple">让灵感先跑起来</span><h2>从描述，走进设计工作台。</h2><p class="muted">助手会识别颜色和风格关键词，组合配色、图案与版型。选择喜欢的方案，再把它变成自己的作品。</p><p class="notice">这是可离线运行的本地规则助手，未接入真实 AI，不会生成照片或发送你的输入。</p></div></div><section id="ideas-result">${ideas.length ? renderIdeas() : ""}</section>`;
}
function renderIdeas() {
  return `<div class="section-head"><div><p class="eyebrow">THREE WAYS TO PLAY</p><h2>让这个想法，继续往前。</h2></div><span class="muted">3 套方案</span></div><div class="assistant-result">${ideas.map((d, i) => `<article class="idea-card">${jersey(d)}<h3>${esc(d.name)}</h3><p>${["保留你的灵感，强调主色表达。", "换一个视角，让线条先说话。", "尝试不同轮廓，打开新的可能。"][i]}</p><button class="secondary full" ${act("use-idea", i)}>继续编辑${icon("arrow")}</button></article>`).join("")}</div>`;
}
function teamView() {
  const d = data.teamDesign;
  const count = data.members.length;
  const price = count * 299;
  return `${pageHeading("BETTER TOGETHER", "一支球队，同一个主场。", "把队员信息和球衣设计放在一起，让每一次上场都有默契。")}<div class="team-banner"><div class="emblem">${icon("shield")}</div><div class="grow"><h1>${esc(data.teamName)}</h1><p>${count} 名成员 · ${data.confirmed ? "设计已确认" : "筹备下一次共同上场"}</p></div><button class="small-btn" ${act("team-name")}>编辑队名${icon("edit")}</button>${badge(data.confirmed ? "已确认" : "设计进行中", data.confirmed ? "" : "neutral")}</div><div class="two-col"><div class="stack"><section class="panel"><div class="between" style="margin-bottom:24px"><div><h2>球队名单</h2><p class="field-note">核对号码与尺码，避免重复和遗漏。</p></div><button class="small-btn" ${act("member-add")}>${icon("plus")}添加队员</button></div>${count ? `<table class="roster"><thead><tr><th>队员</th><th>号码</th><th>尺码</th><th><span class="sr-only">编辑</span></th></tr></thead><tbody>${data.members.map((m) => `<tr><td><div class="row">${avatar(m.name)}<div>${esc(m.name)}<div class="field-note">${esc(m.role)}</div></div></div></td><td class="mono"># ${esc(m.number)}</td><td class="mono">${esc(m.size)}</td><td><button class="icon-btn" ${act("member-edit", m.id)} aria-label="编辑队员 ${esc(m.name)}">${icon("edit")}</button></td></tr>`).join("")}</tbody></table>` : empty("球队等你来组建", "先添加第一位队员，再选择球衣设计。", "member-add", "添加第一位队员", "team")}<button class="text-btn" ${act("size-guide")} style="margin-top:16px">${icon("info")}查看尺码参考</button></section><div class="notice">球队协作是本机演示。添加成员和设计确认不会通知其他人，也不会产生真实订单。</div></div><section class="panel stack"><div class="between"><h2>本次球队设计</h2><button class="text-btn" ${act("select-team-design")}>${d ? "更换设计" : "选择设计"}${icon("chevron")}</button></div>${d ? `<div class="mini-jersey" style="height:240px">${jersey({ ...d, back: false })}</div><h3>${esc(d.name)}</h3><label class="confirm-box"><input type="checkbox" id="team-confirm" ${data.confirmed ? "checked" : ""}>我已核对设计、队员号码与尺码</label><div class="between"><span class="muted">${count} 件 × ¥299</span><span class="money"><small>¥</small>${price}</span></div><button class="primary full" ${act("team-order")} ${!data.confirmed || !count ? "disabled" : ""}>创建球队模拟订单${icon("arrow")}</button>${!data.confirmed ? '<p class="field-note">先勾选确认，再创建订单。</p>' : ""}` : `${empty("为球队选一件球衣", "可以从已保存的作品中选择，或现在开始设计。", "select-team-design", "选择球队设计", "shirt")}`}</section></div>`;
}
const threadMeta = {
  team: { name: "NICE 球队讨论", icon: "team", desc: "队员信息与设计沟通" },
  studio: { name: "NICE 设计工作室", icon: "shirt", desc: "本地消息体验" },
  system: { name: "系统与操作记录", icon: "box", desc: "作品、订单与球队动态" },
};
function messagesView() {
  return `${pageHeading("STAY IN THE LOOP", "让灵感，保持联系。", "球队沟通、设计记录和你的每一步进展。")}<div class="between" style="margin-bottom:12px"><span class="muted">全部消息 · 本地演示</span><button class="text-btn" ${act("read-all")}>全部标为已读${icon("check")}</button></div><section class="panel">${Object.entries(
    threadMeta,
  )
    .map(([id, m]) => {
      const thread = data.threads[id] || [];
      const last = thread[thread.length - 1];
      return `<button class="list-item" data-route="chat" data-params="id=${id}"><span class="avatar">${icon(m.icon)}</span><span class="grow"><strong>${m.name}</strong><p>${id === "system" ? (data.activity.length ? esc(data.activity[data.activity.length - 1].text) : "欢迎来到 NICE BALL。下一件球衣，由你定义。") : esc(last?.text.slice(0, 45) || m.desc)}</p></span>${!data.read.includes(id) ? '<span class="unread" aria-label="未读"></span>' : ""}<span class="time">${last?.time || "今天"}</span>${icon("chevron")}</button>`;
    })
    .join(
      "",
    )}</section><p class="field-note" style="margin-top:20px">演示会话不连接真实用户，发出的消息仅保存在当前浏览器。</p>`;
}
function chatView() {
  const id = params.get("id") || "team",
    m = threadMeta[id];
  if (!m)
    return empty(
      "没有找到这段会话",
      "从消息列表打开其他会话。",
      "open-messages",
      "返回消息",
    );
  if (!data.read.includes(id)) {
    data.read.push(id);
    persist();
  }
  const system = id === "system";
  const items = system
    ? [
        {
          text: "欢迎来到 NICE BALL。本地演示已准备好，开始记录你的创作。",
          time: "今天",
        },
        ...data.activity,
      ]
    : data.threads[id] || [];
  return `<div class="chat-layout"><div class="back-head"><button class="icon-btn" data-route="messages" aria-label="返回消息">${icon("back")}</button><div><h1>${m.name}</h1><p class="eyebrow">LOCAL DEMO / PRIVATE ON THIS DEVICE</p></div></div><div class="notice">${system ? "这里记录本机的作品保存、球队更新和模拟订单。" : "这是本地演示会话。消息不会发送给他人，也没有在线客服或自动回复。"}</div><div class="chat-log" aria-label="消息记录" role="log">${items.map((x) => `<div class="chat-message ${x.me ? "me" : ""}"><div class="bubble">${esc(x.text)}</div><span class="time">${x.me ? "我 · " : ""}${esc(x.time)}</span></div>`).join("")}</div>${!system ? `<form class="chat-form" data-form="chat" data-id="${id}"><input name="text" placeholder="写下你的想法…" aria-label="消息内容" maxlength="500" required autocomplete="off"><button class="primary" type="submit" aria-label="发送本地消息">${icon("send")}</button></form>` : ""}</div>`;
}
function workCard(w) {
  return `<article class="work-card"><button class="work-art full" data-route="editor" data-params="id=${w.id}" aria-label="编辑作品 ${esc(w.design.name)}">${jersey({ ...w.design, back: false })}</button><div class="work-info"><div class="between"><h3>${esc(w.design.name)}</h3>${badge(w.published ? "已发布" : "草稿", w.published ? "" : "neutral")}</div><p>${dateLabel(w.updated)} · ${esc(w.design.team)} / #${esc(w.design.number)}</p><div class="work-actions"><button class="small-btn" data-route="editor" data-params="id=${w.id}">编辑</button><button class="small-btn" ${act("work-team", w.id)}>用于球队</button><button class="small-btn" ${act("work-menu", w.id)} aria-label="更多作品操作">···</button></div></div></article>`;
}
function profileView() {
  const tab = params.get("tab") || profileTab;
  return `<div class="profile-head">${avatar(data.user.name, "big")}<div class="grow"><h1>${esc(data.user.name)}</h1><p>${esc(data.user.bio)}</p><span class="eyebrow">${esc(data.user.id)} / NICE CREATOR</span></div><button class="secondary" ${act("edit-profile")}>编辑资料${icon("edit")}</button><button class="icon-btn" data-route="settings" aria-label="设置与数据">${icon("settings")}</button></div><div class="stats"><div class="stat"><strong>${String(data.works.length).padStart(2, "0")}</strong><span>设计作品</span></div><div class="stat"><strong>${String(data.saved.length).padStart(2, "0")}</strong><span>收藏灵感</span></div><div class="stat"><strong>${String(data.following.length).padStart(2, "0")}</strong><span>正在关注</span></div><div class="stat"><strong>${String(data.orders.length).padStart(2, "0")}</strong><span>模拟订单</span></div></div><div class="between" style="margin-bottom:24px"><button class="secondary" data-route="orders">${icon("box")}我的模拟订单${icon("chevron")}</button><button class="text-btn" data-route="create">新建设计${icon("plus")}</button></div><div class="tabs" role="tablist" aria-label="个人作品分类">${[
    ["works", "我的作品"],
    ["saved", "收藏灵感"],
    ["following", "我的关注"],
  ]
    .map(
      ([v, l]) =>
        `<button class="tab ${tab === v ? "active" : ""}" ${act("profile-tab", v)} role="tab" aria-selected="${tab === v}">${l}</button>`,
    )
    .join("")}</div>${
    tab === "works"
      ? data.works.length
        ? `<div class="work-grid">${[...data.works]
            .sort((a, b) => b.updated - a.updated)
            .map(workCard)
            .join("")}</div>`
        : empty(
            "第一件代表作，等你来设计。",
            "选择一个版型，把你的球队、号码和态度放进去。",
            "open-templates",
            "开始第一件作品",
            "shirt",
          )
      : tab === "saved"
        ? data.saved.length
          ? `<div class="posts-grid">${posts
              .filter((p) => data.saved.includes(p.id))
              .map(postCard)
              .join("")}</div>`
          : empty(
              "给喜欢的灵感留个位置。",
              "打开灵感详情，点击收藏，就能在这里再次找到。",
              "clear-search",
              "发现灵感",
              "bookmark",
            )
        : data.following.length
          ? `<section class="panel">${data.following.map((name) => `<div class="list-item">${avatar(name)}<div class="grow"><strong>${esc(name)}</strong><p>NICE 创作者</p></div><button class="small-btn" ${act("unfollow", name)}>已关注</button></div>`).join("")}</section>`
          : empty(
              "找到与你同频的创作者。",
              "在灵感详情关注作者，建立你的灵感圈。",
              "clear-search",
              "发现创作者",
              "user",
            )
  }`;
}
function ordersView() {
  const filter = params.get("status") || "all";
  const list = data.orders.filter(
    (o) => filter === "all" || o.status === filter,
  );
  return `${pageHeading("MY ORDERS / SIMULATION", "每一件设计，都有去处。", "演示订单不会扣款、发货或产生真实交易。")}<div class="chips">${[
    ["all", "全部"],
    ["待确认", "待确认"],
    ["已确认", "已确认"],
    ["已取消", "已取消"],
  ]
    .map(
      ([s, l]) =>
        `<button class="chip ${s === filter ? "active" : ""}" data-route="orders" data-params="status=${s}">${l}</button>`,
    )
    .join("")}</div>${
    list.length
      ? [...list]
          .reverse()
          .map(
            (o) =>
              `<article class="order-card"><div class="between"><span class="mono">${esc(o.id)} / ${dateLabel(o.created)}</span>${badge(o.status, o.status === "已确认" ? "" : "neutral")}</div><div class="row"><div class="order-art">${jersey({ ...o.design, back: false })}</div><div class="grow"><h3>${esc(o.design.name)}</h3><p>${esc(o.design.team)} · ${o.quantity} 件${o.team ? " · 球队订单" : ""}</p><p>收件人：${esc(o.recipient)} · ${esc(o.phone)}</p><p>${esc(o.address)}</p>${o.members ? `<p>队员：${o.members.map((m) => `${esc(m.name)} #${esc(m.number)} / ${esc(m.size)}`).join("；")}</p>` : `<p>${esc(o.size)} / #${esc(o.design.number)}</p>`}</div><span class="money"><small>¥</small>${o.total}</span></div><div class="between"><span class="field-note">模拟订单 · 无真实支付</span><div class="row">${o.status === "待确认" ? `<button class="small-btn" ${act("cancel-order", o.id)}>取消订单</button><button class="small-btn active" ${act("confirm-order", o.id)}>模拟确认</button>` : o.status === "已确认" ? '<span class="field-note">演示流程完成</span>' : ""}</div></div></article>`,
          )
          .join("")
      : empty(
          "这里还没有订单。",
          "保存一件作品后，可创建个人或球队模拟订单。",
          "open-templates",
          "去设计一件",
          "box",
        )
  }`;
}
function cartView() {
  return `${pageHeading("YOUR LINEUP", "把喜欢的设计，放进计划。", "这是本机设计清单，支持模拟下单，不会产生真实交易。")}<div class="stack">${data.cart.length ? data.cart.map((item) => `<article class="panel"><div class="row"><div class="order-art" style="width:100px;height:120px">${jersey({ ...item.design, back: false })}</div><div class="grow"><h3>${esc(item.design.name)}</h3><p class="muted">${esc(item.design.team)} / #${esc(item.design.number)}</p><p class="money" style="font-size:21px;margin-top:8px"><small>¥</small>299 <small class="muted">/ 件</small></p></div><button class="icon-btn" ${act("remove-cart", item.id)} aria-label="从清单移除 ${esc(item.design.name)}">${icon("trash")}</button></div><div class="between" style="margin-top:16px"><span class="field-note">按当前设计快照创建订单</span><button class="primary" ${act("cart-checkout", item.id)}>模拟下单${icon("arrow")}</button></div></article>`).join("") : empty("下一件球衣，还在灵感里。", "在作品库中打开作品的更多操作，将设计加入清单。", "open-templates", "开始设计", "bag")}</div>`;
}
function settingsView() {
  return `${pageHeading("YOUR SPACE / YOUR DATA", "让每一次创作，都好好留下。", "资料、作品和演示数据都保存在当前浏览器。")}<div class="two-col"><section class="panel stack"><h2>创作数据</h2><p class="muted">清理浏览器数据或换浏览器时，本机记录不会自动同步。导出一份备份，之后可以重新导入。</p><div class="notice">当前有 ${data.works.length} 件作品、${data.members.length} 名队员、${data.orders.length} 个模拟订单。</div><button class="primary" ${act("export-data")}>${icon("download")}导出完整数据备份</button><label class="label">从 NICE BALL 备份恢复<input type="file" id="import-data" class="file-input" accept=".json,application/json"></label><p class="field-note">导入前会提示确认；恢复将覆盖本机当前数据。建议先导出备份。</p></section><section class="panel stack"><h2>关于这个版本</h2><div class="row">${logo()}${badge("DEMO v1.0", "neutral")}</div><p class="muted">球衣设计与球队协作的完整交互演示。全部图片随应用保存，核心功能无需联网。</p><div class="notice">未接入：真实登录、云端存储、多人协作、支付、物流、AR 试穿或 AI 图像接口。灵感助手使用本地配色规则。</div><button class="danger" ${act("reset-confirm")}>重置本机演示数据</button></section></div>`;
}
function logActivity(text) {
  data.activity.push({
    text,
    time: new Date().toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });
  data.activity = data.activity.slice(-100);
  data.read = data.read.filter((x) => x !== "system");
}
function updatePreview() {
  const el = $("#jersey-preview");
  if (el) el.innerHTML = jersey(data.editor);
  persist();
}
function validateDesign() {
  const d = data.editor;
  if (!d.name.trim() || !d.team.trim() || !d.player.trim()) {
    toast("请补全作品名、球队名称和球员名。");
    return false;
  }
  if (!/^\d{1,2}$/.test(d.number)) {
    toast("球衣号码请填写 0–99 的一至两位数字。");
    return false;
  }
  return true;
}
function saveDesign(publish = false) {
  if (!validateDesign()) return null;
  const d = {
    ...data.editor,
    name: data.editor.name.trim(),
    team: data.editor.team.trim(),
    player: data.editor.player.trim(),
  };
  let w = data.works.find((w) => w.id === editorID);
  if (w) {
    w.design = d;
    w.updated = Date.now();
    w.published = publish || w.published;
  } else {
    w = { id: uid(), design: d, updated: Date.now(), published: publish };
    data.works.push(w);
    editorID = w.id;
    history.replaceState(null, "", `#/editor?id=${w.id}`);
  }
  if (data.teamDesign?.sourceId === w.id) {
    data.teamDesign = { ...w.design, sourceId: w.id };
    data.confirmed = false;
  }
  logActivity(`${publish ? "发布" : "保存"}作品「${d.name}」。`);
  persist();
  return w;
}
function openEditor(d) {
  data.editor = { ...defaultJersey, ...d };
  editorID = null;
  persist();
  go("editor");
}
function showModal(title, body) {
  returnFocus = document.activeElement;
  $("#modal-root").innerHTML =
    `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="modal-header"><h2 id="dialog-title">${title}</h2><button class="icon-btn" ${act("close-modal")} aria-label="关闭弹窗">${icon("close")}</button></div>${body}</section></div>`;
  document.body.classList.add("modal-open");
  requestAnimationFrame(() =>
    $(
      ".modal input:not([type=checkbox]),.modal textarea,.modal button",
    )?.focus(),
  );
}
function closeModal() {
  currentModal = null;
  $("#modal-root").innerHTML = "";
  document.body.classList.remove("modal-open");
  if (returnFocus?.isConnected) returnFocus.focus();
}
function showSuccess(title, text) {
  showModal(
    title,
    `<div style="text-align:center"><div class="success-icon">${icon("check")}</div><h3>${title}</h3><p class="muted" style="margin:12px 0 24px">${text}</p><button class="primary full" ${act("close-modal")}>继续探索${icon("arrow")}</button></div>`,
  );
}
function memberModal(id) {
  const m = data.members.find((x) => x.id === id) || {
    name: "",
    number: "",
    size: "L",
    role: "队员",
  };
  showModal(
    id ? "编辑队员" : "添加新队员",
    `<form data-form="member" data-id="${esc(id || "")}" class="stack"><label class="label">队员姓名<input name="name" value="${esc(m.name)}" maxlength="20" required></label><div class="field-row"><label class="label">球衣号码<input name="number" value="${esc(m.number)}" inputmode="numeric" pattern="[0-9]{1,2}" title="0–99 的一至两位数字" maxlength="2" required></label><label class="label">尺码<select name="size">${["S", "M", "L", "XL", "XXL", "3XL"].map((s) => `<option ${s === m.size ? "selected" : ""}>${s}</option>`).join("")}</select></label></div><label class="label">球队角色<select name="role">${["队员", "队长", "教练"].map((s) => `<option ${s === m.role ? "selected" : ""}>${s}</option>`).join("")}</select></label><p class="error" id="form-error" role="alert"></p><button class="primary" type="submit">保存队员${icon("check")}</button>${id ? `<button class="text-btn delete-text" type="button" ${act("member-delete", id)}>从名单移除这位队员</button>` : ""}</form>`,
  );
}
function teamDesignModal() {
  showModal(
    "选择球队设计",
    `<p class="modal-sub">选择一件已保存的作品，或先创建一件新球衣。</p>${data.works.length ? `<div class="stack">${data.works.map((w) => `<button class="secondary" style="justify-content:flex-start" ${act("work-team", w.id)}>${icon("shirt")}<span class="grow">${esc(w.design.name)}</span>${icon("arrow")}</button>`).join("")}</div>` : empty("还没有保存的作品", "完成设计并保存后，就可以为球队选择。", "open-templates", "先去设计", "shirt")}`,
  );
}
let checkoutSnapshot = null;
function checkout(design, team = false, cartID = null) {
  const qty = team ? data.members.length : 1;
  checkoutSnapshot = {
    design: JSON.parse(JSON.stringify(design)),
    team,
    quantity: qty,
    cartID,
    members: team ? JSON.parse(JSON.stringify(data.members)) : null,
  };
  showModal(
    "创建模拟订单",
    `<p class="modal-sub">${team ? "球队统一定制" : "个人球衣"} · ${esc(design.name)}<br>不会扣款或实际发货，请使用示例收件信息体验。</p><form data-form="checkout" class="stack"><div class="field-row"><label class="label">收件人<input name="recipient" placeholder="例如：小陈" maxlength="30" required autocomplete="off"></label><label class="label">联系电话<input name="phone" placeholder="11 位手机号" inputmode="tel" pattern="1[0-9]{10}" maxlength="11" title="请填写 11 位手机号" required autocomplete="off"></label></div><label class="label">收件地址<textarea name="address" placeholder="填写省市区及详细地址（至少 6 个字）" minlength="6" maxlength="200" required autocomplete="off"></textarea></label>${team ? `<div class="notice">共 ${qty} 位队员，号码与尺码将按当前球队名单生成。</div>` : `<div class="field-row"><label class="label">尺码<select name="size">${["S", "M", "L", "XL", "XXL", "3XL"].map((s) => `<option ${s === "L" ? "selected" : ""}>${s}</option>`).join("")}</select></label><label class="label">数量<input type="number" name="quantity" id="checkout-quantity" min="1" max="99" step="1" value="1" required></label></div>`}<div class="between"><span class="muted">模拟合计</span><span class="money" id="checkout-total"><small>¥</small>${qty * 299}</span></div><label class="confirm-box"><input type="checkbox" name="demo" required>我了解这是演示订单，不会发生实际支付。</label><p class="error" id="form-error" role="alert"></p><button class="primary" type="submit">提交模拟订单${icon("arrow")}</button></form>`,
  );
}
function downloadFile(content, name, type) {
  const a = document.createElement("a"),
    url = URL.createObjectURL(new Blob([content], { type }));
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportJersey(d) {
  downloadFile(
    `<?xml version="1.0" encoding="UTF-8"?>\n${jersey(d)}`,
    `NICE-BALL-${d.name.replace(/[^\w\u4e00-\u9fa5-]/g, "_")}.svg`,
    "image/svg+xml",
  );
  toast("已导出可缩放的 SVG 球衣设计。");
}
const actions = {
  "mobile-layout": () => {
    persist();
    NBLayout.openMobile();
  },
  "search-modal": () =>
    showModal(
      "寻找下一个灵感",
      `<form data-form="search" class="stack"><label class="label">搜索球衣、穿搭、球场或创作者<input name="q" placeholder="试试：复古、黑绿、手稿" maxlength="80" required></label><button class="primary" type="submit">搜索灵感${icon("search")}</button></form>`,
    ),
  "home-tab": (id) => {
    const q = Object.fromEntries(params);
    q.tab = id;
    go("home", q);
  },
  "home-cat": (id) => {
    const q = route === "home" ? Object.fromEntries(params) : {};
    q.cat = id;
    go("home", q);
  },
  "clear-search": () => go("home"),
  "open-templates": () => {
    closeModal();
    go("templates");
  },
  "open-messages": () => go("messages"),
  like: (id, el) => {
    const has = data.likes.includes(id);
    data.likes = has ? data.likes.filter((x) => x !== id) : [...data.likes, id];
    persist();
    if (route === "detail") render();
    else {
      el.classList.toggle("active", !has);
      el.setAttribute("aria-pressed", String(!has));
      el.setAttribute("aria-label", has ? "点赞" : "取消点赞");
      const p = posts.find((p) => p.id === id);
      $("span", el).textContent = p.likes + (has ? 0 : 1);
    }
  },
  bookmark: (id) => {
    const has = data.saved.includes(id);
    data.saved = has ? data.saved.filter((x) => x !== id) : [...data.saved, id];
    persist();
    render();
    toast(has ? "已取消收藏。" : "灵感已收藏，可在“我的空间”查看。");
  },
  follow: (id) => {
    const author = posts.find((x) => x.id === id)?.author;
    if (!author) return;
    const has = data.following.includes(author);
    data.following = has
      ? data.following.filter((x) => x !== author)
      : [...data.following, author];
    persist();
    render();
    toast(has ? "已取消关注。" : `已关注 ${author}。`);
  },
  unfollow: (name) => {
    data.following = data.following.filter((x) => x !== name);
    persist();
    render();
  },
  share: async (id) => {
    const url = new URL(location.href);
    url.hash = "/detail?id=" + id;
    try {
      await navigator.clipboard.writeText(url.href);
      toast("灵感页面地址已复制。");
    } catch {
      showModal(
        "分享灵感",
        `<p class="modal-sub">此地址需要在同一份 App 中打开。离线文件分享时，请一并发送整个项目或单文件版本。</p><label class="label">页面地址<input value="${esc(url.href)}" readonly onclick="this.select()"></label>`,
      );
    }
  },
  remix: (id) => {
    const p = posts.find((x) => x.id === id);
    openEditor({
      ...defaultJersey,
      name: p.title.slice(0, 18) + " · 灵感款",
      color: p.color,
      accent: p.accent,
      pattern: p.pattern,
    });
  },
  "choose-template": (id) =>
    openEditor({
      ...defaultJersey,
      ...templates[Number(id)],
      name: templates[Number(id)].name + " · 我的设计",
    }),
  "continue-editor": () => {
    editorID = null;
    go("editor");
  },
  "base-color": (id) => {
    data.editor.color = id;
    persist();
    render();
  },
  pattern: (id) => {
    data.editor.pattern = id;
    persist();
    render();
  },
  "jersey-type": (id) => {
    data.editor.type = id;
    persist();
    render();
  },
  side: (id) => {
    data.editor.back = id === "back";
    persist();
    render();
  },
  "save-design": () => {
    const w = saveDesign();
    if (w)
      showModal(
        "作品已保存",
        `<div class="success-icon">${icon("check")}</div><p class="muted" style="text-align:center;margin-bottom:24px">「${esc(w.design.name)}」已收录到本机作品库。</p><div class="stack"><button class="primary" ${act("work-team", w.id)}>用于球队设计${icon("team")}</button><button class="secondary" ${act("view-works")}>查看我的作品${icon("arrow")}</button><button class="text-btn" ${act("close-modal")}>留在工作台继续编辑</button></div>`,
      );
  },
  "publish-design": () => {
    const w = saveDesign(true);
    if (w) {
      toast("已发布到本机个人展示库。");
      go("profile", { tab: "works" });
    }
  },
  "view-works": () => {
    closeModal();
    go("profile", { tab: "works" });
  },
  "export-jersey": () => {
    if (validateDesign()) exportJersey(data.editor);
  },
  prompt: (id) => {
    $("#idea-prompt").value = id;
    $("#idea-prompt").focus();
  },
  "use-idea": (id) => openEditor(ideas[Number(id)]),
  "team-name": () =>
    showModal(
      "编辑球队名称",
      `<form data-form="team-name" class="stack"><label class="label">球队名称<input name="name" value="${esc(data.teamName)}" required maxlength="24"></label><button class="primary" type="submit">保存队名${icon("check")}</button></form>`,
    ),
  "member-add": () => {
    if (data.members.length >= 99) return toast("球队最多支持 99 名队员。");
    memberModal();
  },
  "member-edit": (id) => memberModal(id),
  "member-delete": (id) => {
    const m = data.members.find((x) => x.id === id);
    showModal(
      "移除这位队员？",
      `<p class="muted">${esc(m.name)} 将从本机球队名单移除，已有订单中的队员信息不受影响。</p><div class="modal-actions"><button class="secondary" ${act("member-edit", id)}>返回编辑</button><button class="danger" ${act("member-delete-do", id)}>移除队员</button></div>`,
    );
  },
  "member-delete-do": (id) => {
    data.members = data.members.filter((x) => x.id !== id);
    data.confirmed = false;
    logActivity("球队名单已更新，请重新确认设计与尺码。");
    persist();
    closeModal();
    render();
    toast("队员已移除，请重新确认球队信息。");
  },
  "size-guide": () =>
    showModal(
      "球衣尺码参考",
      `<p class="modal-sub">仅用于演示选码，实际尺寸请以生产方的打样数据为准。</p><table class="roster"><thead><tr><th>尺码</th><th>衣长 / cm</th><th>胸围 / cm</th></tr></thead><tbody>${[
        ["S", 70, 100],
        ["M", 73, 106],
        ["L", 76, 112],
        ["XL", 79, 118],
        ["XXL", 82, 124],
        ["3XL", 85, 130],
      ]
        .map((s) => `<tr>${s.map((x) => `<td>${x}</td>`).join("")}</tr>`)
        .join(
          "",
        )}</tbody></table><p class="field-note" style="margin-top:16px">按现有合身球衣平铺测量，结合个人穿着偏好选择。</p>`,
    ),
  "select-team-design": teamDesignModal,
  "work-team": (id) => {
    const w = data.works.find((w) => w.id === id);
    if (!w) return;
    data.teamDesign = { ...w.design, sourceId: w.id };
    data.confirmed = false;
    logActivity(`为球队选择设计「${w.design.name}」。`);
    persist();
    closeModal();
    go("team");
    toast("已选为球队设计，请核对队员信息并确认。");
  },
  "team-order": () => {
    if (data.confirmed && data.members.length && data.teamDesign)
      checkout(data.teamDesign, true);
  },
  "read-all": () => {
    data.read = ["team", "studio", "system"];
    persist();
    render();
    toast("全部消息已标记为已读。");
  },
  "profile-tab": (id) => {
    profileTab = id;
    go("profile", { tab: id });
  },
  "edit-profile": () =>
    showModal(
      "编辑我的资料",
      `<form data-form="profile" class="stack"><label class="label">昵称<input name="name" value="${esc(data.user.name)}" maxlength="20" required></label><label class="label">个人简介<textarea name="bio" maxlength="100">${esc(data.user.bio)}</textarea></label><button class="primary" type="submit">保存资料${icon("check")}</button></form>`,
    ),
  "work-menu": (id) => {
    const w = data.works.find((x) => x.id === id);
    showModal(
      esc(w.design.name),
      `<div class="stack"><button class="secondary" ${act("work-export", id)}>${icon("download")}导出 SVG 设计</button><button class="secondary" ${act("work-copy", id)}>${icon("plus")}复制为新作品</button><button class="secondary" ${act("work-cart", id)}>${icon("bag")}加入设计清单</button><button class="secondary" ${act("work-publish", id)}>${icon("share")}${w.published ? "取消本机发布" : "发布到本机展示库"}</button><button class="danger" ${act("work-delete", id)}>${icon("trash")}删除作品</button></div>`,
    );
  },
  "work-export": (id) =>
    exportJersey(data.works.find((w) => w.id === id).design),
  "work-copy": (id) => {
    const w = data.works.find((w) => w.id === id);
    data.works.push({
      id: uid(),
      design: { ...w.design, name: w.design.name.slice(0, 25) + " · 副本" },
      updated: Date.now(),
      published: false,
    });
    persist();
    closeModal();
    render();
    toast("已复制为一件独立作品。");
  },
  "work-cart": (id) => {
    const w = data.works.find((w) => w.id === id);
    data.cart.push({ id: uid(), design: { ...w.design } });
    persist();
    closeModal();
    toast("已加入设计清单。");
    go("cart");
  },
  "work-publish": (id) => {
    const w = data.works.find((w) => w.id === id);
    w.published = !w.published;
    persist();
    closeModal();
    render();
    toast(w.published ? "已发布到本机展示库。" : "已取消本机发布。");
  },
  "work-delete": (id) =>
    showModal(
      "删除这件作品？",
      `<p class="muted">删除后无法直接恢复。历史订单会保留快照；当前球队作品删除后需重新选择。</p><div class="modal-actions"><button class="secondary" ${act("close-modal")}>保留作品</button><button class="danger" ${act("work-delete-do", id)}>删除作品</button></div>`,
    ),
  "work-delete-do": (id) => {
    data.works = data.works.filter((x) => x.id !== id);
    if (data.teamDesign?.sourceId === id) {
      data.teamDesign = null;
      data.confirmed = false;
    }
    if (editorID === id) editorID = null;
    persist();
    closeModal();
    render();
    toast("作品已删除。");
  },
  "remove-cart": (id) => {
    data.cart = data.cart.filter((x) => x.id !== id);
    persist();
    render();
    toast("已从设计清单移除。");
  },
  "cart-checkout": (id) => {
    const item = data.cart.find((x) => x.id === id);
    if (item) checkout(item.design, false, id);
  },
  "cancel-order": (id) =>
    showModal(
      "取消这个模拟订单？",
      `<p class="muted">这不会产生退款或其他真实交易。</p><div class="modal-actions"><button class="secondary" ${act("close-modal")}>保留订单</button><button class="danger" ${act("cancel-order-do", id)}>取消模拟订单</button></div>`,
    ),
  "cancel-order-do": (id) => {
    const o = data.orders.find((x) => x.id === id);
    if (o?.status === "待确认") {
      o.status = "已取消";
      logActivity(`模拟订单 ${id} 已取消。`);
      persist();
      closeModal();
      render();
      toast("模拟订单已取消。");
    }
  },
  "confirm-order": (id) => {
    const o = data.orders.find((x) => x.id === id);
    if (o?.status === "待确认") {
      o.status = "已确认";
      logActivity(`模拟订单 ${id} 已确认，演示流程完成。`);
      persist();
      render();
      showSuccess(
        "模拟订单已确认",
        "演示流程已完成。没有实际扣款，也不会安排发货。",
      );
    }
  },
  "export-data": () => {
    downloadFile(
      JSON.stringify(
        window.NBShared ? NBShared.prepareExport(data) : data,
        null,
        2,
      ),
      "NICE-BALL-backup.json",
      "application/json",
    );
    toast("完整数据备份已导出。");
  },
  "reset-confirm": () =>
    showModal(
      "重置本机数据？",
      `<p class="muted">作品、收藏、队员和模拟订单都会恢复初始状态。建议先导出数据备份。</p><div class="stack" style="margin-top:20px"><button class="secondary" ${act("export-data")}>先导出备份</button><button class="danger" ${act("reset-do")}>确认重置本机数据</button></div>`,
    ),
  "reset-do": () => {
    if (window.NBShared) NBShared.reset();
    data = window.NBShared
      ? NBShared.toDesktop(NBShared.mobile(), baseData())
      : baseData();
    editorID = null;
    ideas = [];
    persist();
    closeModal();
    go("home");
    toast("已恢复初始演示数据。");
  },
  "import-do": () => {
    if (!currentModal) return;
    data = currentModal;
    if (window.NBShared && data.prefs?.mobileBackup) {
      NBShared.restoreExtras(data.prefs.mobileBackup);
      delete data.prefs.mobileBackup;
      NBShared.extendPosts(posts);
    }
    editorID = null;
    ideas = [];
    persist();
    closeModal();
    go("profile");
    toast("备份已恢复。");
  },
  "close-modal": closeModal,
  back: () => {
    if (history.length > 1) history.back();
    else go("home");
  },
};
document.addEventListener("click", (e) => {
  const b = e.target.closest("button,[data-action]");
  if (b) {
    if (b.disabled) return;
    if (b.dataset.route) {
      closeModal();
      go(
        b.dataset.route,
        Object.fromEntries(new URLSearchParams(b.dataset.params || "")),
      );
      return;
    }
    if (b.dataset.action) {
      const action = actions[b.dataset.action];
      if (action) action(b.dataset.id, b);
    }
  }
  if (e.target.classList.contains("modal-backdrop")) closeModal();
});
document.addEventListener("input", (e) => {
  const key = e.target.dataset.editor;
  if (key) {
    data.editor[key] = e.target.value;
    if (key === "number")
      data.editor[key] = e.target.value = e.target.value
        .replace(/\D/g, "")
        .slice(0, 2);
    updatePreview();
    if (key === "color")
      $$('[data-action="base-color"]').forEach((b) => {
        const is = b.dataset.id === data.editor.color;
        b.classList.toggle("active", is);
        b.setAttribute("aria-pressed", is);
      });
  }
  if (e.target.id === "checkout-quantity") {
    const n = Number(e.target.value);
    $("#checkout-total").innerHTML =
      `<small>¥</small>${Number.isInteger(n) && n > 0 && n <= 99 ? n * 299 : "—"}`;
  }
});
document.addEventListener("change", async (e) => {
  if (e.target.id === "team-confirm") {
    data.confirmed = e.target.checked;
    persist();
    render();
  }
  if (e.target.id === "import-data") {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast("备份文件过大，请选择 5 MB 以内的 JSON 文件。");
      return;
    }
    try {
      const d = JSON.parse(await f.text());
      const result = validateBackup(d);
      if (!result) throw Error("invalid");
      showModal(
        "恢复这份备份？",
        `<p class="muted">包含 ${d.works.length} 件作品、${d.members.length} 名队员和 ${d.orders.length} 个模拟订单。恢复会覆盖当前本机数据。</p><div class="modal-actions"><button class="secondary" ${act("close-modal")}>取消</button><button class="primary" ${act("import-do")}>恢复备份</button></div>`,
      );
      currentModal = d;
    } catch {
      toast("无法读取这份备份，请选择由 NICE BALL 导出的完整 JSON 文件。");
    }
    e.target.value = "";
  }
});
function formError(text) {
  const el = $("#form-error");
  if (el) el.textContent = text;
  else toast(text);
}
document.addEventListener("submit", (e) => {
  const f = e.target;
  if (!f.dataset.form) return;
  e.preventDefault();
  if (!f.reportValidity()) return;
  const fields = Object.fromEntries(new FormData(f));
  const kind = f.dataset.form;
  if (kind === "search") {
    const q = (fields.q || "").trim();
    closeModal();
    go("home", q ? { q } : {});
    return;
  }
  if (kind === "comment") {
    const text = fields.text.trim();
    if (!text) {
      toast("先写下你的想法，再发表留言。");
      return;
    }
    const id = f.dataset.id;
    data.comments[id] = [
      ...(data.comments[id] || []),
      { id: uid(), author: data.user.name, text, time: Date.now() },
    ];
    persist();
    render();
    toast("留言已保存在本机。");
    return;
  }
  if (kind === "ideas") {
    const p = fields.prompt.trim();
    if (!p) {
      toast("写几个风格或颜色关键词，再组合方案。");
      return;
    }
    const palette = /紫|复古|金/.test(p)
      ? ["#462855", "#f6be55"]
      : /蓝|海|冷/.test(p)
        ? ["#1b4663", "#acdfee"]
        : /红|热|火/.test(p)
          ? ["#792c2c", "#f4d5ae"]
          : /白|极简|干净/.test(p)
            ? ["#e6e5da", "#3c5140"]
            : ["#1a2218", "#ccff00"];
    ideas = [
      {
        ...defaultJersey,
        name: p.slice(0, 12) + " · 原点",
        color: palette[0],
        accent: palette[1],
        pattern: /极简|纯/.test(p) ? "classic" : "slash",
      },
      {
        ...defaultJersey,
        name: p.slice(0, 12) + " · 变奏",
        color: palette[1],
        accent: palette[0],
        pattern: "stripe",
        type: "round",
      },
      {
        ...defaultJersey,
        name: p.slice(0, 12) + " · 新场",
        color: palette[0],
        accent: palette[1],
        pattern: "split",
        type: "tee",
      },
    ];
    $("#ideas-result").innerHTML = renderIdeas();
    $("#ideas-result").scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
    toast("三套本地设计方案已组合完成。");
    return;
  }
  if (kind === "member") {
    const id = f.dataset.id;
    if (!id && data.members.length >= 99)
      return formError("球队最多支持 99 名队员。");
    if (!fields.name.trim()) return formError("请填写队员姓名。");
    if (!/^\d{1,2}$/.test(fields.number))
      return formError("号码请填写 0–99 的一至两位数字。");
    if (
      data.members.some(
        (m) => m.id !== id && Number(m.number) === Number(fields.number),
      )
    )
      return formError("这个号码已有队员使用，请换一个号码。");
    const m = {
      id: id || uid(),
      name: fields.name.trim(),
      number: fields.number,
      size: fields.size,
      role: fields.role,
    };
    if (id) data.members = data.members.map((x) => (x.id === id ? m : x));
    else data.members.push(m);
    data.confirmed = false;
    logActivity(`更新队员「${m.name}」：#${m.number} / ${m.size}。`);
    persist();
    closeModal();
    render();
    toast("队员信息已保存，请重新确认球队设计。");
    return;
  }
  if (kind === "team-name") {
    if (!fields.name.trim()) return formError("请填写球队名称。");
    data.teamName = fields.name.trim();
    persist();
    closeModal();
    render();
    toast("球队名称已更新。");
    return;
  }
  if (kind === "profile") {
    if (!fields.name.trim()) return formError("请填写昵称。");
    data.user.name = fields.name.trim();
    data.user.bio = fields.bio.trim();
    persist();
    closeModal();
    render();
    toast("资料已保存。");
    return;
  }
  if (kind === "chat") {
    const text = fields.text.trim();
    if (!text) return toast("写下消息内容后再发送。");
    const id = f.dataset.id;
    if (!["team", "studio"].includes(id)) return;
    data.threads[id].push({
      text,
      me: true,
      time: new Date().toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    persist();
    render();
    $(".chat-form input")?.focus();
    return;
  }
  if (kind === "checkout") {
    if (!checkoutSnapshot) return;
    const s = checkoutSnapshot,
      n = s.team ? s.quantity : Number(fields.quantity);
    if (!Number.isInteger(n) || n < 1 || n > 99)
      return formError("数量请填写 1–99 之间的整数。");
    if (!fields.recipient.trim() || fields.address.trim().length < 6)
      return formError("请补全收件人，并填写至少 6 个字的详细地址。");
    if (!/^1\d{10}$/.test(fields.phone))
      return formError("请填写 11 位手机号。");
    if (!fields.demo) return formError("请勾选演示订单说明。");
    const order = {
      id:
        "NB-" +
        Date.now().toString().slice(-9) +
        "-" +
        uid().slice(-3).toUpperCase(),
      created: Date.now(),
      design: s.design,
      team: s.team,
      members: s.members,
      quantity: n,
      size: fields.size || "按球队名单",
      recipient: fields.recipient.trim(),
      phone: fields.phone,
      address: fields.address.trim(),
      total: n * 299,
      status: "待确认",
    };
    data.orders.push(order);
    if (s.cartID) data.cart = data.cart.filter((x) => x.id !== s.cartID);
    logActivity(`创建模拟订单 ${order.id}，${n} 件球衣。`);
    persist();
    checkoutSnapshot = null;
    closeModal();
    go("orders");
    toast("模拟订单已创建，点击“模拟确认”可完成演示。");
    return;
  }
});
function validateBackup(d) {
  const str = (v, max = 500) => typeof v === "string" && v.length <= max;
  const arr = (v, max = 2000) => Array.isArray(v) && v.length <= max;
  const validDesign = (x) =>
    x &&
    str(x.name, 30) &&
    str(x.team, 18) &&
    str(x.player, 18) &&
    /^\d{1,2}$/.test(x.number) &&
    /^#[0-9a-f]{6}$/i.test(x.color) &&
    /^#[0-9a-f]{6}$/i.test(x.accent) &&
    ["classic", "slash", "stripe", "split"].includes(x.pattern) &&
    ["v", "round", "tee"].includes(x.type) &&
    typeof x.back === "boolean";
  if (
    !d ||
    d.version !== 1 ||
    !d.user ||
    !str(d.user.name, 20) ||
    !str(d.user.bio, 100) ||
    !str(d.user.id, 40) ||
    !validDesign(d.editor)
  )
    return false;
  for (const k of ["likes", "saved", "following", "read"])
    if (!arr(d[k]) || !d[k].every((v) => str(v, 100))) return false;
  if (
    !arr(d.works) ||
    !d.works.every(
      (w) =>
        str(w.id, 80) &&
        validDesign(w.design) &&
        Number.isFinite(w.updated) &&
        typeof w.published === "boolean",
    )
  )
    return false;
  if (
    !arr(d.members, 99) ||
    !d.members.every(
      (m) =>
        str(m.id, 80) &&
        str(m.name, 20) &&
        /^\d{1,2}$/.test(m.number) &&
        ["S", "M", "L", "XL", "XXL", "3XL"].includes(m.size) &&
        ["队员", "队长", "教练"].includes(m.role),
    )
  )
    return false;
  if (
    !str(d.teamName, 24) ||
    typeof d.confirmed !== "boolean" ||
    (d.teamDesign !== null && !validDesign(d.teamDesign))
  )
    return false;
  if (
    !arr(d.cart) ||
    !d.cart.every((c) => str(c.id, 80) && validDesign(c.design))
  )
    return false;
  if (
    !arr(d.orders) ||
    !d.orders.every(
      (o) =>
        str(o.id, 80) &&
        Number.isFinite(o.created) &&
        validDesign(o.design) &&
        Number.isInteger(o.quantity) &&
        o.quantity > 0 &&
        o.quantity <= 99 &&
        o.total === o.quantity * 299 &&
        str(o.recipient, 30) &&
        str(o.phone, 20) &&
        str(o.address, 200) &&
        str(o.size, 50) &&
        ["待确认", "已确认", "已取消"].includes(o.status) &&
        (o.members === null ||
          (arr(o.members, 99) &&
            o.members.every(
              (m) => str(m.name, 20) && str(m.number, 2) && str(m.size, 4),
            ))),
    )
  )
    return false;
  if (
    !d.comments ||
    typeof d.comments !== "object" ||
    Array.isArray(d.comments) ||
    Object.keys(d.comments).length >
      posts.length + (d.prefs?.mobileBackup?.uploads?.length || 0)
  )
    return false;
  for (const [id, comments] of Object.entries(d.comments))
    if (
      !(
        posts.some((p) => p.id === id) ||
        d.prefs?.mobileBackup?.uploads?.some((p) => p.id === id)
      ) ||
      !arr(comments) ||
      !comments.every(
        (c) => str(c.author, 20) && str(c.text, 300) && Number.isFinite(c.time),
      )
    )
      return false;
  if (
    !d.threads ||
    !["team", "studio"].every(
      (k) =>
        arr(d.threads[k]) &&
        d.threads[k].every(
          (m) =>
            str(m.text, 500) && typeof m.me === "boolean" && str(m.time, 20),
        ),
    )
  )
    return false;
  if (
    !arr(d.activity, 100) ||
    !d.activity.every((m) => str(m.text, 500) && str(m.time, 20))
  )
    return false;
  const keys = Object.keys(baseData());
  return Object.keys(d).every((k) => keys.includes(k));
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $(".modal")) {
    closeModal();
    return;
  }
  if (e.key === "Tab" && $(".modal")) {
    const nodes = $$(
      'button,input,textarea,select,a[href],[tabindex="0"]',
      $(".modal"),
    ).filter((x) => !x.disabled && x.offsetParent !== null);
    const first = nodes[0],
      last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
window.addEventListener("hashchange", () => {
  closeModal();
  render();
  window.scrollTo(0, 0);
  $("#main")?.focus({ preventScroll: true });
});
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE) {
    try {
      if (window.NBShared) NBShared.extendPosts(posts);
      const incoming = JSON.parse(e.newValue);
      if (validateBackup(incoming)) {
        data = incoming;
        render();
        toast("已同步此浏览器另一个窗口的更新。");
      }
    } catch {}
  }
});
render();

if (window.NBLayout) {
  NBLayout.save = persist;
  NBLayout.route = () => location.hash || "#/home";
}
