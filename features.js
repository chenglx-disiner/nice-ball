"use strict";
/* Functionality layered over the original views. Original templates, colours and motion are retained. */
const nbQ = (s, r = document) => r.querySelector(s),
  nbQA = (s, r = document) => [...r.querySelectorAll(s)];
const nbEsc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const nbID = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const nbIcon = (n) =>
  `<span class="material-symbols-outlined" aria-hidden="true">${n}</span>`;
const nbBtn = (action, text, id = "", primary = true) =>
  `<button type="button" class="${primary ? "nb-primary" : "nb-secondary"}" data-nb="${action}" data-id="${nbEsc(id)}">${text}</button>`;
const nbEmpty = (t) => `<div class="nb-empty">${t}</div>`;
const nbAsset = (path) => nbAssetData[path] || path;
const nbKey = "nice-ball-original-v1";
const nbDefaults = () => ({
  version: 1,
  user: { name: "设计师_X", id: "NICE-888" },
  logged: false,
  likes: [],
  saved: [],
  footprints: [],
  works: [],
  draft: {
    template: "t1",
    color: "#FFFFFF",
    number: "23",
    textColor: "#000000",
    texture: "",
    scale: 1,
    showNumber: false,
  },
  members: [
    { id: "m1", name: "Captain Jack", number: "23", size: "XL" },
    { id: "m2", name: "Shooter Li", number: "10", size: "L" },
  ],
  selectedWork: null,
  confirmed: false,
  packaging: "标准环保包装",
  orders: [],
  notifications: [],
  messages: [],
  uploads: [],
  read: [],
  lastPrompt: "",
});
let nbData = nbDefaults(),
  nbCurrent = { name: "login", params: {} },
  nbEditorID = null,
  nbUndo = [],
  nbSearch = "",
  nbCategory = "",
  nbEditorTab = "palette",
  nbModalFocus = null,
  nbAIJob = 0,
  nbUploadURL = null;
try {
  const d = JSON.parse(localStorage.getItem(nbKey));
  if (
    d &&
    d.version === 1 &&
    Array.isArray(d.works) &&
    Array.isArray(d.members) &&
    Array.isArray(d.orders)
  )
    nbData = { ...nbDefaults(), ...d };
} catch {}
state.user = nbData.user;
const nbSave = () => {
  try {
    localStorage.setItem(nbKey, JSON.stringify(nbData));
  } catch {
    showToast("本机存储空间不足，请先导出备份。", "error");
  }
};
const nbLog = (text) => {
  nbData.notifications.unshift({ text, time: Date.now() });
  nbData.notifications = nbData.notifications.slice(0, 60);
  nbData.read = nbData.read.filter((x) => x !== "system");
};
const nbAllPosts = () => [
  ...state.recommendPosts,
  ...state.inspirationPosts,
  ...nbData.uploads,
];
state.recommendPosts.forEach(
  (p, i) => (p.category = [["穿搭", "球鞋"], ["热门"], ["热门"], ["热门"]][i]),
);
state.inspirationPosts.forEach((p) => (p.category = ["灵感"]));
const nbSourceRecommend = renderRecommend,
  nbSourceInspiration = renderInspiration;
function nbFiltered(list) {
  return list
    .filter(
      (p) =>
        (!nbCategory ||
          nbCategory === "热门" ||
          (p.category || []).includes(nbCategory)) &&
        (!nbSearch ||
          [p.title, p.subtitle]
            .join(" ")
            .toLowerCase()
            .includes(nbSearch.toLowerCase())),
    )
    .sort((a, b) =>
      nbCategory === "热门" ? parseFloat(b.likes) - parseFloat(a.likes) : 0,
    );
}
renderRecommend = function () {
  const all = state.recommendPosts;
  state.recommendPosts = nbFiltered(all);
  const html = state.recommendPosts.length
    ? nbSourceRecommend()
    : nbEmpty("没有找到相关内容<br>换个关键词或点击“推荐”清除筛选");
  state.recommendPosts = all;
  return html;
};
renderInspiration = function () {
  const all = state.inspirationPosts;
  state.inspirationPosts = nbFiltered([...all, ...nbData.uploads]);
  const html = nbSourceInspiration();
  state.inspirationPosts = all;
  return html;
};
const nbNavigateSource = router.navigate;
router.navigate = (name, p = {}) => {
  nbClose();
  nbAIJob++;
  if (name === "home" && p.tab) {
    nbCategory = "";
    nbSearch = "";
  }
  if (!views[name]) name = "home";
  if (name === "templateDetail") {
    if (p.work) {
      const w = nbData.works.find((x) => x.id === p.work);
      if (w) {
        nbData.draft = { ...w.design };
        nbEditorID = w.id;
        p = { id: w.design.template, name: w.name, work: w.id };
      }
    } else if (p.id && p.id !== nbData.draft.template) {
      nbData.draft = { ...nbDefaults().draft, template: p.id };
      nbEditorID = null;
      nbUndo = [];
      nbEditorTab = "palette";
    }
  }
  nbCurrent = { name, params: p };
  clearTimeout(router.pending);
  nbNavigateSource(name, p);
};
function nbAfterRender(name, p) {
  nbQA("#app-view img").forEach((im) => {
    const src = im.getAttribute("src");
    if (src && nbAssetData[src]) im.src = nbAsset(src);
  });
  const nav = nbQ("#bottom-nav");
  if (
    [
      "login",
      "creationMenu",
      "aiDesign",
      "templateList",
      "templateDetail",
      "detail",
    ].includes(name)
  ) {
    nav.inert = true;
    nav.style.transform = "translateY(calc(100% + 60px))";
  } else {
    nav.inert = false;
  }
  nbQA("#app-view button").forEach((b) => {
    b.classList.add("nb-a11y");
    if (!b.getAttribute("aria-label")) {
      const t = b.textContent.trim();
      b.setAttribute(
        "aria-label",
        {
          chevron_left: "返回",
          arrow_back: "返回",
          close: "关闭",
          undo: "撤销",
          filter_list: "筛选版型",
          share: "分享",
          favorite: "收藏",
          bookmark: "收藏",
        }[t] || t,
      );
    }
  });
  (
    ({
      login: nbEnhanceLogin,
      home: nbEnhanceHome,
      templateList: nbEnhanceTemplates,
      templateDetail: nbEnhanceEditor,
      detail: nbEnhanceDetail,
      collab: nbEnhanceCollab,
      messages: nbEnhanceMessages,
      profile: nbEnhanceProfile,
      aiDesign: nbEnhanceAI,
    })[name] || (() => {})
  )(p);
  nbQA("#app-view [onclick]:not(button)").forEach((el) => {
    el.setAttribute("role", "button");
    el.tabIndex = 0;
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        el.click();
      }
    });
  });
}
function nbRefresh() {
  router.navigate(nbCurrent.name, nbCurrent.params);
}
function nbOpen(title, html) {
  nbModalFocus = document.activeElement;
  const frame = nbQ("#phone-frame");
  nbQ(".nb-overlay")?.remove();
  const el = document.createElement("div");
  el.className = "nb-overlay";
  el.innerHTML = `<section class="nb-sheet no-scrollbar" role="dialog" aria-modal="true" aria-labelledby="nb-title"><header class="nb-sheet-head"><h2 id="nb-title">${nbEsc(title)}</h2><button type="button" class="nb-close" data-nb="close" aria-label="关闭弹窗">${nbIcon("close")}</button></header>${html}</section>`;
  frame.appendChild(el);
  nbQA("img", el).forEach((im) => {
    const src = im.getAttribute("src");
    if (src && nbAssetData[src]) im.src = nbAsset(src);
  });
  nbQ("#app-view").inert = true;
  nbQ("#bottom-nav").inert = true;
  requestAnimationFrame(() =>
    nbQ(".nb-sheet input:not([type=checkbox]),.nb-sheet button")?.focus(),
  );
  el.addEventListener("click", (e) => {
    if (e.target === el) nbClose();
  });
}
function nbClose() {
  nbQ(".nb-overlay")?.remove();
  const main = nbQ("#app-view");
  if (main) main.inert = false;
  const nav = nbQ("#bottom-nav");
  if (nav)
    nav.inert = [
      "login",
      "creationMenu",
      "aiDesign",
      "templateList",
      "templateDetail",
      "detail",
    ].includes(nbCurrent.name);
  if (nbModalFocus?.isConnected) nbModalFocus.focus();
  nbModalFocus = null;
  if (nbUploadURL) {
    URL.revokeObjectURL(nbUploadURL);
    nbUploadURL = null;
  }
}
function nbEnhanceLogin() {
  const phone = nbQ("#login-phone"),
    code = nbQ("#login-code");
  phone.maxLength = 11;
  phone.setAttribute("aria-label", "手机号");
  code.maxLength = 6;
  code.inputMode = "numeric";
  code.setAttribute("aria-label", "演示验证码");
  nbQA("#app-view button").find(
    (b) => b.textContent.trim() === "获取",
  ).onclick = () => {
    if (!/^1\d{10}$/.test(phone.value))
      return showToast("请输入 11 位手机号", "error");
    code.placeholder = "本地演示：123456";
    showToast("本地演示验证码：123456，不发送短信");
  };
  const enter = nbQ("#app-view button[onclick]");
  enter.onclick = () => {
    if (!/^1\d{10}$/.test(phone.value))
      return showToast("请输入 11 位手机号", "error");
    if (code.value !== "123456")
      return showToast("演示验证码为 123456，请点击“获取”查看", "error");
    nbData.logged = true;
    nbSave();
    router.navigate("home");
  };
  code.addEventListener("keydown", (e) => {
    if (e.key === "Enter") enter.click();
  });
}
function nbEnhanceHome() {
  const search = nbQ("#app-view input");
  search.value = nbSearch;
  search.setAttribute("aria-label", "搜索球衣和灵感");
  search.maxLength = 80;
  search.addEventListener("input", () => {
    nbSearch = search.value.trim();
    nbHomeContent();
  });
  search.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      search.blur();
    }
  });
  const profile = nbQ("#app-view .w-8.h-8.rounded-full");
  if (profile) {
    profile.onclick = () => router.navigate("profile");
    profile.setAttribute("role", "button");
    profile.tabIndex = 0;
    profile.setAttribute("aria-label", "打开我的资料");
  }
  for (const b of nbQA("#app-view button")) {
    const t = b.textContent.trim();
    if (["热门", "球鞋", "穿搭"].includes(t)) {
      b.onclick = () => {
        nbCategory = nbCategory === t ? "" : t;
        nbHomeContent();
        nbHomeChips();
      };
    }
  }
  nbHomeChips();
  nbBindPosts();
}
function nbHomeChips() {
  for (const b of nbQA("#app-view button")) {
    const t = b.textContent.trim();
    if (["热门", "球鞋", "穿搭"].includes(t)) {
      b.style.backgroundColor = nbCategory === t ? "#CCFF00" : "";
      b.style.color = nbCategory === t ? "#000" : "";
      b.setAttribute("aria-pressed", String(nbCategory === t));
    }
  }
}
function nbHomeContent() {
  const grid = nbQ("#app-view .masonry-grid");
  const parent = nbQ("#nb-results")?.parentElement || grid?.parentElement;
  if (!parent) return;
  parent.innerHTML = `<div id="nb-results">${state.currentHomeTab === "recommend" ? renderRecommend() : renderInspiration()}</div>`;
  nbBindPosts();
}
function nbBindPosts() {
  const list =
    state.currentHomeTab === "recommend"
      ? nbFiltered(state.recommendPosts)
      : nbFiltered([...state.inspirationPosts, ...nbData.uploads]);
  const cards = nbQA("#app-view .masonry-item").filter((el) =>
    el.hasAttribute("onclick"),
  );
  cards.forEach((card, i) => {
    const post = list[i];
    if (!post) return;
    card.dataset.post = post.id;
    card.onclick = () => router.navigate("detail", { post: String(post.id) });
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", post.title);
    card.onkeydown = (e) => {
      if (e.key === "Enter") {
        card.click();
      }
    };
    const heart = nbQA(".material-symbols-outlined", card).find(
      (x) => x.textContent.trim() === "favorite",
    );
    if (heart) {
      heart.parentElement.onclick = (e) => {
        e.stopPropagation();
        nbToggleLike(String(post.id), heart.parentElement);
      };
      heart.parentElement.setAttribute("role", "button");
      heart.parentElement.tabIndex = 0;
      heart.parentElement.setAttribute("aria-label", "点赞 " + post.title);
      if (nbData.likes.includes(String(post.id)))
        heart.parentElement.style.color = "#CCFF00";
    }
  });
  const upload = nbQ("#app-view .masonry-item.bg-acid-lime");
  if (upload) {
    upload.onclick = nbUploadSheet;
    upload.setAttribute("role", "button");
    upload.tabIndex = 0;
  }
}
function nbToggleLike(id, el) {
  const has = nbData.likes.includes(id);
  nbData.likes = has
    ? nbData.likes.filter((x) => x !== id)
    : [...nbData.likes, id];
  if (el) {
    el.style.color = has ? "" : "#CCFF00";
    el.setAttribute("aria-pressed", String(!has));
    const p = nbAllPosts().find((x) => String(x.id) === id),
      count = nbQ("span:last-child", el);
    if (p && count && count !== nbQ(".material-symbols-outlined", el))
      count.textContent =
        typeof p.likes === "number" ? p.likes + (has ? 0 : 1) : p.likes;
  }
  nbSave();
}
function nbEnhanceTemplates() {
  const buttons = nbQA("#app-view button");
  buttons.find((b) => b.textContent.trim() === "filter_list").onclick = () =>
    nbOpen(
      "筛选版型",
      `<p class="nb-small" style="margin-bottom:16px">选择需要的版型类型。</p><div class="nb-stack">${["全部", "篮球", "足球", "训练"].map((c) => nbBtn("template-filter", c, c, false)).join("")}</div>`,
    );
  buttons
    .filter((b) =>
      ["全部", "篮球", "足球", "训练"].includes(b.textContent.trim()),
    )
    .forEach(
      (b) => (b.onclick = () => nbFilterTemplates(b.textContent.trim())),
    );
}
function nbFilterTemplates(cat) {
  nbClose();
  nbQA("#app-view .masonry-item").forEach((el, i) => {
    const t = state.templates[i];
    el.style.display = cat === "全部" || t.tags.includes(cat) ? "" : "none";
  });
  nbQA("#app-view button")
    .filter((b) =>
      ["全部", "篮球", "足球", "训练"].includes(b.textContent.trim()),
    )
    .forEach((b) => {
      b.style.backgroundColor =
        b.textContent.trim() === cat ? "white" : "#1c1c1e";
      b.style.color = b.textContent.trim() === cat ? "black" : "white";
    });
  nbQ("#nb-template-empty")?.remove();
  if (
    !nbQA("#app-view .masonry-item").some((x) => x.style.display !== "none")
  ) {
    const el = document.createElement("div");
    el.id = "nb-template-empty";
    el.innerHTML = nbEmpty("当前没有足球版型<br>请选择篮球或训练版型");
    nbQ("#app-view .masonry-grid").append(el);
  }
}
function nbEnhanceEditor(p) {
  nbQ('#app-view button[onclick*="showToast"]').onclick = nbSaveWork;
  nbQA("#app-view button").find(
    (b) => b.textContent.trim() === "undo",
  ).onclick = () => {
    if (!nbUndo.length) return showToast("还没有可以撤销的编辑");
    nbData.draft = nbUndo.pop();
    nbSave();
    nbApplyDesign();
    nbEditorPanel();
  };
  nbQA("#app-view button")
    .filter((b) =>
      ["palette", "title", "texture"].includes(
        nbQ(".material-symbols-outlined", b)?.textContent.trim(),
      ),
    )
    .forEach(
      (b) =>
        (b.onclick = () => {
          nbEditorTab = nbQ(".material-symbols-outlined", b).textContent.trim();
          nbEditorPanel();
        }),
    );
  nbApplyDesign();
  if (nbEditorTab !== "palette") nbEditorPanel();
  const title = nbQ("#app-view .text-center .block.font-bold");
  if (p.work) {
    const w = nbData.works.find((x) => x.id === p.work);
    if (w) title.textContent = w.name;
  }
}
function nbCheckpoint() {
  nbUndo.push({ ...nbData.draft });
  nbUndo = nbUndo.slice(-30);
}
setJerseyColor = function (color) {
  nbCheckpoint();
  nbData.draft.color = color;
  nbData.draft.textColor = [
    "#000000",
    "#3B82F6",
    "#9333EA",
    "#EF4444",
  ].includes(color)
    ? "#FFFFFF"
    : "#000000";
  nbData.draft.showNumber = true;
  nbSave();
  nbApplyDesign();
  nbQA('#app-view button[onclick^="setJerseyColor"]').forEach((b) =>
    b.classList.toggle(
      "nb-select-active",
      b.getAttribute("onclick").includes(color),
    ),
  );
};
function nbApplyDesign() {
  const d = nbData.draft,
    layer = nbQ("#jersey-color-layer"),
    text = nbQ("#canvas-text"),
    canvas = nbQ("#jersey-canvas");
  if (!layer) return;
  if (d.color !== "#FFFFFF" || d.texture) {
    layer.style.backgroundColor = d.color;
    layer.style.mixBlendMode = "screen";
    layer.style.maskImage = `url(${nbAsset(`assets/mask-${d.template}.png`)})`;
    layer.style.webkitMaskImage = layer.style.maskImage;
    layer.style.maskSize = "contain";
    layer.style.webkitMaskSize = "contain";
    layer.style.maskPosition = "center";
    layer.style.maskRepeat = "no-repeat";
    layer.style.opacity = ".8";
    if (d.texture) {
      layer.style.backgroundImage = `url(${nbAsset(d.texture)})`;
      layer.style.backgroundSize = "cover";
    }
  } else {
    layer.style.backgroundColor = "#FFFFFF";
    layer.style.mixBlendMode = "multiply";
    layer.style.maskImage = "none";
    layer.style.backgroundImage = "none";
  }
  text.textContent = d.number;
  text.style.color = d.textColor;
  text.style.fontSize = 60 * d.scale + "px";
  if (d.showNumber) text.style.opacity = ".95";
  canvas.setAttribute("aria-label", `球衣预览，号码 ${d.number}`);
}
function nbEditorPanel() {
  const group = nbQ("#app-view .p-5.overflow-x-auto");
  if (!group) return;
  nbQA("#app-view button")
    .filter((b) =>
      ["palette", "title", "texture"].includes(
        nbQ(".material-symbols-outlined", b)?.textContent.trim(),
      ),
    )
    .forEach((b) => {
      b.style.color =
        nbQ(".material-symbols-outlined", b).textContent.trim() === nbEditorTab
          ? "#CCFF00"
          : "#6b7280";
    });
  if (nbEditorTab === "palette") {
    group.innerHTML = `<div class="flex gap-4 px-2">${["#FFFFFF", "#000000", "#CCFF00", "#EF4444", "#3B82F6", "#9333EA"].map((c) => `<button onclick="setJerseyColor('${c}')" aria-label="球衣配色 ${c}" style="background:${c}" class="w-12 h-12 rounded-full border border-white/20 shrink-0 shadow-lg ${nbData.draft.color === c ? "nb-select-active" : ""}"></button>`).join("")}</div>`;
    return;
  }
  if (nbEditorTab === "title") {
    group.innerHTML = `<div class="nb-fields nb-tab-panel"><label class="nb-label">球衣号码<input class="nb-input" id="nb-number" value="${nbEsc(nbData.draft.number)}" maxlength="2" inputmode="numeric" aria-label="球衣号码"></label><label class="nb-label">号码大小<input type="range" id="nb-number-scale" min="0.6" max="1.5" step="0.1" value="${nbData.draft.scale}" aria-label="号码大小"></label></div>`;
    nbQ("#nb-number").addEventListener("input", (e) => {
      nbCheckpoint();
      nbData.draft.number = e.target.value.replace(/\D/g, "").slice(0, 2);
      e.target.value = nbData.draft.number;
      nbData.draft.showNumber = true;
      if (nbData.draft.color === "#FFFFFF") nbData.draft.textColor = "#FFFFFF";
      nbSave();
      nbApplyDesign();
    });
    nbQ("#nb-number-scale").addEventListener("input", (e) => {
      nbCheckpoint();
      nbData.draft.scale = Number(e.target.value);
      nbSave();
      nbApplyDesign();
    });
    return;
  }
  group.innerHTML = `<div class="flex gap-3 nb-tab-panel">${[
    ["", "纯色"],
    ["assets/1765264653321.jpg", "网眼"],
    ["assets/1765264641079.jpg", "科技纹理"],
  ]
    .map(
      ([src, label]) =>
        `<button class="nb-secondary" data-nb="texture" data-id="${src}">${label}</button>`,
    )
    .join("")}</div>`;
}
function nbSaveWork() {
  if (!/^\d{1,2}$/.test(nbData.draft.number))
    return showToast("球衣号码请填写 0–99 的一至两位数字", "error");
  const w = nbData.works.find((x) => x.id === nbEditorID),
    t = state.templates.find((x) => x.id === nbData.draft.template);
  nbOpen(
    "保存设计",
    `<form data-nb-form="save-work" class="nb-stack"><label class="nb-label">作品名称<input class="nb-input" name="name" value="${nbEsc(w?.name || t.name + " · 我的设计")}" maxlength="30" required></label><p class="nb-small">保存在本机设计库，可用于球队协作或导出图片。</p><button class="nb-primary" type="submit">保存到设计库</button></form>`,
  );
}
function nbEnhanceDetail(p) {
  const post = nbAllPosts().find((x) => String(x.id) === String(p.post)),
    id = String(post?.id || "product");
  if (post) {
    const image = nbQ("#product-image");
    if (post.img) image.src = post.img;
    nbQ("#app-view h1").textContent = post.title;
    const subtitle = nbQ(
      '#app-view [class~="text-[11px]"].text-gray-400.font-mono',
    );
    if (subtitle) subtitle.textContent = post.subtitle + " // CUSTOM FIT";
  }
  if (!nbData.footprints.includes(id)) {
    nbData.footprints.unshift(id);
    nbSave();
  }
  const buttons = nbQA("#app-view button");
  const favorite = buttons.find(
    (b) =>
      nbQ(".material-symbols-outlined", b)?.textContent.trim() === "favorite",
  );
  favorite.onclick = () => {
    nbData.saved = nbData.saved.includes(id)
      ? nbData.saved.filter((x) => x !== id)
      : [...nbData.saved, id];
    favorite.style.color = nbData.saved.includes(id) ? "#CCFF00" : "";
    nbSave();
    showToast(nbData.saved.includes(id) ? "已收藏到心愿单" : "已取消收藏");
  };
  favorite.style.color = nbData.saved.includes(id) ? "#CCFF00" : "";
  buttons.find(
    (b) => nbQ(".material-symbols-outlined", b)?.textContent.trim() === "share",
  ).onclick = () => nbShare(id);
  buttons.find((b) => b.textContent.trim() === "立即购买").onclick = () =>
    nbCheckout(post);
}
let nbProductColor = "lime";
const nbChangeColorSource = changeColor;
changeColor = function (c) {
  nbProductColor = c;
  nbChangeColorSource(c);
  nbQA('#app-view button[onclick^="changeColor"]').forEach((b) => {
    b.classList.toggle(
      "nb-select-active",
      b.getAttribute("onclick").includes(c),
    );
  });
};
function nbShare(id) {
  nbOpen(
    "分享这件设计",
    `<p class="nb-small" style="margin-bottom:16px">本地演示可导出项目文件分享。发布后，可复制在线页面地址。</p><div class="nb-stack">${nbBtn("copy-link", "复制当前页面地址", id)}${nbBtn("close", "继续浏览", "", false)}</div>`,
  );
}
function nbCheckout(post) {
  nbOpen(
    "确认模拟订单",
    `<p class="nb-small" style="margin-bottom:18px">${nbEsc(post?.title || "CHAMPION PRO")} · ¥299 / 件<br>本地演示，不会扣款或发货，请使用示例收件信息。</p><form class="nb-stack" data-nb-form="checkout" data-post="${nbEsc(post?.id || "product")}"><div class="nb-fields"><label class="nb-label">尺码<select class="nb-input" name="size">${["S", "M", "L", "XL", "XXL", "3XL"].map((s) => `<option>${s}</option>`).join("")}</select></label><label class="nb-label">数量<input type="number" class="nb-input" name="quantity" min="1" max="99" value="1" required></label></div><div class="nb-fields"><label class="nb-label">收件人<input class="nb-input" name="name" maxlength="30" required></label><label class="nb-label">手机号<input class="nb-input" name="phone" pattern="1[0-9]{10}" inputmode="tel" maxlength="11" title="请输入11位手机号" required></label></div><label class="nb-label">地址<textarea class="nb-input" name="address" minlength="6" maxlength="200" required></textarea></label><div class="nb-between"><span class="nb-small">模拟合计</span><strong id="nb-total" class="text-acid-lime nb-mono">¥299</strong></div><label class="nb-choice"><input type="checkbox" required>我已知晓这是演示，不进行真实支付</label><button class="nb-primary" type="submit">提交模拟订单</button></form>`,
  );
  nbQ("[name=quantity]").oninput = (e) => {
    const n = Number(e.target.value);
    nbQ("#nb-total").textContent =
      "¥" + (Number.isInteger(n) && n > 0 && n <= 99 ? n * 299 : "—");
  };
}
function nbEnhanceCollab() {
  const roster = nbQ("#app-view .space-y-3");
  roster.innerHTML = nbData.members
    .map(
      (m) =>
        `<div class="flex justify-between items-center text-xs" role="button" tabindex="0" data-nb="member" data-id="${m.id}"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-[#333] border border-white/10 flex items-center justify-center font-bold text-white">${nbEsc(m.name.slice(0, 1))}</div><span class="text-gray-200 font-medium">${nbEsc(m.name)}</span></div><span class="font-mono text-gray-500">${nbEsc(m.size)} / #${nbEsc(m.number)}</span></div>`,
    )
    .join("");
  const online = nbQ('#app-view [class~="bg-acid-lime/20"]');
  if (online) online.textContent = nbData.members.length + " Members";
  const rosterHeader = nbQA("#app-view span").find(
    (x) => x.textContent.trim() === "TEAM ROSTER",
  );
  rosterHeader.parentElement.style.cursor = "pointer";
  rosterHeader.parentElement.onclick = nbRosterSheet;
  const tiles = nbQA("#app-view .grid>div");
  tiles.forEach((t) => {
    const label = t.textContent.trim();
    t.classList.add("nb-key-action");
    t.tabIndex = 0;
    t.setAttribute("role", "button");
    t.setAttribute("aria-label", label);
    t.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        t.click();
      }
    };
    if (label.includes("AR试穿"))
      t.onclick = () =>
        nbOpen(
          "AR 试穿 · 效果参考",
          `<img class="nb-upload-preview" src="assets/1765264674051.jpg" alt="原项目球衣穿着效果参考"><p class="nb-hint" style="margin-top:16px">这是原项目的穿着效果示例。实时 AR 试穿尚未接入，不调用相机，也不声称这是真实试穿。</p>`,
        );
    if (label.includes("尺码")) t.onclick = nbRosterSheet;
    if (label.includes("包装")) t.onclick = nbPackaging;
    if (label.includes("设计确认")) {
      t.onclick = nbTeamDesign;
      const status = nbQA("span", t).at(-1);
      status.textContent = nbData.confirmed
        ? "Confirmed"
        : nbData.selectedWork
          ? "Ready to confirm"
          : "Waiting...";
    }
  });
}
function nbRosterSheet() {
  nbOpen(
    "球队名单与尺码",
    `<div class="nb-stack"><p class="nb-small">点击队员编辑尺码和号码。重复号码会被拦截。</p><div>${nbData.members.map((m) => `<button class="nb-list-item" data-nb="member" data-id="${m.id}"><span class="nb-grow">${nbEsc(m.name)}</span><span class="nb-small nb-mono">${m.size} / #${m.number}</span>${nbIcon("edit")}</button>`).join("")}</div>${nbBtn("member-add", "添加队员")}${nbBtn("size-guide", "查看尺码参考", "", false)}</div>`,
  );
}
function nbMemberSheet(id) {
  const m = nbData.members.find((x) => x.id === id) || {
    name: "",
    number: "",
    size: "L",
  };
  nbOpen(
    id ? "编辑队员" : "添加队员",
    `<form class="nb-stack" data-nb-form="member" data-id="${nbEsc(id || "")}"><label class="nb-label">姓名<input class="nb-input" name="name" value="${nbEsc(m.name)}" maxlength="20" required></label><div class="nb-fields"><label class="nb-label">号码<input class="nb-input" name="number" value="${nbEsc(m.number)}" pattern="[0-9]{1,2}" inputmode="numeric" maxlength="2" required></label><label class="nb-label">尺码<select class="nb-input" name="size">${["S", "M", "L", "XL", "XXL", "3XL"].map((s) => `<option ${m.size === s ? "selected" : ""}>${s}</option>`).join("")}</select></label></div><p class="nb-error" id="nb-error" role="alert"></p><button class="nb-primary" type="submit">保存队员</button>${id ? nbBtn("member-remove", "移除队员", id, false) : ""}</form>`,
  );
}
function nbPackaging() {
  nbOpen(
    "选择包装",
    `<form class="nb-stack" data-nb-form="packaging">${["标准环保包装", "球队统一装箱", "单件独立包装"].map((p) => `<label class="nb-choice"><input type="radio" name="packaging" value="${p}" ${nbData.packaging === p ? "checked" : ""}>${p}</label>`).join("")}<p class="nb-small">包装选项仅保存在本机演示，不产生生产任务。</p><button class="nb-primary" type="submit">保存包装选择</button></form>`,
  );
}
function nbTeamDesign() {
  const w = nbData.works.find((w) => w.id === nbData.selectedWork);
  nbOpen(
    "球队设计确认",
    `<div class="nb-stack">${w ? `<div class="nb-hint"><strong class="text-white">${nbEsc(w.name)}</strong><br>号码：${nbEsc(w.design.number)} · ${nbData.members.length} 位成员<br>包装：${nbEsc(nbData.packaging)}</div>` : '<p class="nb-small">先从设计库选择本次球队的球衣。</p>'}${nbData.works.map((x) => nbBtn("select-work", (x.id === nbData.selectedWork ? "✓ " : "") + nbEsc(x.name), x.id, false)).join("")}${nbData.works.length ? nbBtn("confirm-design", nbData.confirmed ? "撤销本机设计确认" : "确认本机球队设计") : nbBtn("create", "先设计一件球衣")}<p class="nb-small">设计确认只作用于本机演示，不会通知其他队员。</p></div>`,
  );
}
function nbEnhanceMessages() {
  const counters = nbQA("#app-view .bg-acid-gray.rounded-2xl.p-4.mb-6>div");
  counters.forEach((el, i) => {
    el.style.cursor = "pointer";
    el.onclick = () =>
      i === 0
        ? nbSavedSheet("likes")
        : i === 1
          ? nbOpen("关注动态", nbEmpty("当前演示没有在线关注动态"))
          : nbOpen("提及我的", nbEmpty("当前演示没有在线提及记录"));
    el.setAttribute("role", "button");
    el.tabIndex = 0;
  });
  const rows = nbQA("#app-view .space-y-3>div");
  rows[0].onclick = nbSystemMessages;
  rows[1].onclick = nbChatSheet;
  rows.forEach((r, i) => {
    r.style.cursor = "pointer";
    r.setAttribute("role", "button");
    r.tabIndex = 0;
    r.setAttribute("aria-label", i ? "打开AI助手会话" : "打开系统通知");
  });
  if (nbData.notifications.length)
    nbQ("p", rows[0]).textContent = nbData.notifications[0].text;
}
function nbSystemMessages() {
  nbData.read.push("system");
  nbSave();
  nbOpen(
    "系统通知 · 本机记录",
    `<p class="nb-small">原型示例通知及实际操作记录均为演示内容。</p><div class="nb-stack" style="margin-top:16px">${nbData.notifications.length ? nbData.notifications.map((n) => `<div class="nb-hint"><span class="nb-small">${new Date(n.time).toLocaleDateString("zh-CN")}</span><br><span class="text-white">${nbEsc(n.text)}</span></div>`).join("") : nbEmpty("暂时没有新的操作记录<br>保存作品、确认设计或创建订单后会显示在这里")}</div>`,
  );
}
function nbChatSheet() {
  nbOpen(
    "AI 助手 · 本地会话",
    `<p class="nb-small">未连接真实 AI，输入仅保存在本机，不会收到虚构的在线回复。</p><div class="nb-log" role="log">${nbData.messages.length ? nbData.messages.map((m) => `<div class="nb-bubble me">${nbEsc(m.text)}</div>`).join("") : nbEmpty("写下你的设计想法，作为创作备忘。")}</div><form class="nb-row" data-nb-form="chat"><input name="text" class="nb-input" maxlength="500" placeholder="写下设计想法…" aria-label="消息内容" required><button type="submit" class="nb-close" aria-label="保存本地消息">${nbIcon("send")}</button></form>${nbBtn("ai", "进入原来的 AI 实验室", "", false)}`,
  );
  const log = nbQ(".nb-log");
  log.scrollTop = log.scrollHeight;
}
function nbEnhanceProfile() {
  const top = nbQ("#app-view .flex.items-center.gap-5");
  top.onclick = () =>
    nbOpen(
      "编辑资料",
      `<form class="nb-stack" data-nb-form="profile"><label class="nb-label">昵称<input name="name" class="nb-input" value="${nbEsc(nbData.user.name)}" maxlength="20" required></label><button type="submit" class="nb-primary">保存资料</button>${nbBtn("settings", "本机数据与备份", "", false)}</form>`,
    );
  top.setAttribute("role", "button");
  top.tabIndex = 0;
  top.style.cursor = "pointer";
  const stats = nbQA("#app-view .border-t.border-b>div");
  stats.forEach((el, i) => {
    nbQ("span", el).textContent = String(
      [nbData.saved.length, nbData.footprints.length, nbData.works.length][i],
    ).padStart(2, "0");
    el.setAttribute("role", "button");
    el.tabIndex = 0;
    el.style.cursor = "pointer";
    el.onclick = () =>
      i === 2 ? nbWorksSheet() : nbSavedSheet(i ? "footprints" : "saved");
  });
  const all = nbQA("#app-view span").find(
    (x) => x.textContent.trim() === "全部 >",
  );
  all.style.cursor = "pointer";
  all.onclick = () => nbOrdersSheet();
  nbQA("#app-view .flex.justify-between.px-2>div").forEach((el, i) => {
    el.style.cursor = "pointer";
    el.setAttribute("role", "button");
    el.tabIndex = 0;
    el.onclick = () =>
      nbOrdersSheet(["待付款", "待发货", "待收货", "待评价"][i]);
  });
}
function nbSavedSheet(kind = "saved") {
  const ids = kind === "likes" ? nbData.likes : nbData[kind],
    title = { likes: "我的点赞", saved: "心愿单", footprints: "浏览足迹" }[
      kind
    ];
  nbOpen(
    title,
    ids.length
      ? ids
          .map((id) => {
            const p = nbAllPosts().find((p) => String(p.id) === id);
            return `<button class="nb-list-item" data-nb="open-post" data-id="${nbEsc(id)}"><img class="nb-thumb" src="${nbEsc(p?.img || "assets/1765264649466.jpg")}" alt=""><span class="nb-grow">${nbEsc(p?.title || "CHAMPION PRO")}</span>${nbIcon("chevron_right")}</button>`;
          })
          .join("")
      : nbEmpty("暂时没有记录<br>浏览、点赞或收藏后，就能在这里找到"),
  );
}
function nbWorksSheet() {
  nbOpen(
    "设计库",
    `<div class="nb-stack">${nbData.works.length ? nbData.works.map((w) => `<button class="nb-list-item" data-nb="work-detail" data-id="${w.id}"><img class="nb-thumb" src="${state.templates.find((t) => t.id === w.design.template)?.img}" alt=""><span class="nb-grow"><strong>${nbEsc(w.name)}</strong><br><span class="nb-small">#${nbEsc(w.design.number)} · ${new Date(w.updated).toLocaleDateString("zh-CN")}</span></span>${nbIcon("chevron_right")}</button>`).join("") : nbEmpty("还没有保存的设计<br>到模版编辑器完成配色后，点击右上角保存")}${nbBtn("create", "继续创作")}</div>`,
  );
}
function nbWorkDetail(id) {
  const w = nbData.works.find((x) => x.id === id);
  if (!w) return;
  nbOpen(
    w.name,
    `<div class="nb-stack">${nbBtn("edit-work", "继续编辑", id)}${nbBtn("use-team", "用于球队确认", id, false)}${nbBtn("export-work", "导出设计 PNG", id, false)}${nbBtn("copy-work", "复制设计", id, false)}${nbBtn("delete-work", "删除这件设计", id, false)}</div>`,
  );
}
function nbOrdersSheet(status = "") {
  const list = nbData.orders.filter((o) => !status || o.status === status);
  nbOpen(
    "我的订单" + (status ? " · " + status : ""),
    `<p class="nb-small" style="margin-bottom:16px">本地模拟订单，不会扣款或发货。</p>${
      list.length
        ? [...list]
            .reverse()
            .map(
              (o) =>
                `<div class="nb-order"><div class="nb-between"><span class="nb-small nb-mono">${o.id}</span><span class="nb-pill">${o.status}</span></div><h3 style="font-size:14px;margin:12px 0">${nbEsc(o.title)}</h3><p class="nb-small">${o.size} · ${o.quantity} 件 · ${o.color}<br>${nbEsc(o.name)} · ${nbEsc(o.phone)}<br>${nbEsc(o.address)}</p><div class="nb-between" style="margin-top:12px"><strong class="text-acid-lime nb-mono">¥${o.total}</strong>${o.status === "待付款" ? `<button class="nb-link" data-nb="confirm-order" data-id="${o.id}">模拟付款</button><button class="nb-link" data-nb="cancel-order" data-id="${o.id}">取消</button>` : o.status === "待发货" ? '<span class="nb-small">演示流程已完成</span>' : ""}</div></div>`,
            )
            .join("")
        : nbEmpty("当前分类下没有订单")
    }`,
  );
}
function nbSettings() {
  nbOpen(
    "本机数据与备份",
    `<div class="nb-stack"><p class="nb-small">作品、队员和订单仅保存在当前浏览器，未接入云端。</p>${nbBtn("export-data", "导出完整备份")}<label class="nb-label">恢复 NICE BALL 原版备份<input type="file" class="nb-input" id="nb-import" accept=".json,application/json"></label>${nbBtn("reset", "重置本机演示数据", "", false)}${nbBtn("logout", "退出本地演示", "", false)}</div>`,
  );
}
function nbEnhanceAI() {
  nbQ("#prompt-input").value = nbData.lastPrompt;
  nbQ("#prompt-input").maxLength = 300;
  nbQ("#prompt-input").setAttribute("aria-label", "设计指令");
  nbQ("#generated-image").onclick = () =>
    nbOpen(
      "本地示例方案",
      `<p class="nb-small" style="margin-bottom:16px">当前展示的是原素材库中的效果示例。真实 AI 图像服务尚未接入。</p><div class="nb-stack">${nbBtn("ai-to-editor", "进入模版继续设计")}${nbBtn("close", "继续查看", "", false)}</div>`,
    );
}
handleAIGenerate = function () {
  const input = nbQ("#prompt-input"),
    prompt = input.value.trim();
  if (!prompt) return showToast("先输入你想要的风格关键词", "error");
  nbData.lastPrompt = prompt;
  nbSave();
  const job = ++nbAIJob,
    loader = nbQ("#ai-loader"),
    img = nbQ("#generated-image"),
    placeholder = nbQ("#ai-placeholder");
  loader.classList.remove("hidden");
  loader.classList.add("flex");
  setTimeout(() => {
    if (job !== nbAIJob || nbCurrent.name !== "aiDesign") return;
    img.onload = () => {
      loader.classList.add("hidden");
      loader.classList.remove("flex");
      img.classList.remove("hidden");
      placeholder.classList.add("hidden");
      img.alt = "本地设计效果示例，未连接真实AI";
      showToast("本地示例已就绪，未连接真实 AI");
    };
    img.onerror = () => {
      loader.classList.add("hidden");
      loader.classList.remove("flex");
      showToast("示例图片未能加载，请重试", "error");
    };
    img.src = /手稿|素描|线稿/.test(prompt)
      ? nbAsset("assets/1765264651401.jpg")
      : nbAsset("assets/1765264649466.jpg");
  }, 1500);
};
function nbUploadSheet() {
  nbOpen(
    "发布灵感手稿",
    `<form class="nb-stack" data-nb-form="upload"><label class="nb-label">灵感标题<input name="title" class="nb-input" maxlength="30" required></label><label class="nb-label">选择手稿图片<input type="file" id="nb-upload" class="nb-input" accept="image/png,image/jpeg,image/webp" required></label><p class="nb-small">图片将压缩并保存在本机，不能发布给其他人。请选择 5 MB 以内的图片。</p><button type="submit" class="nb-primary">保存到本机灵感区</button><p id="nb-error" class="nb-error" role="alert"></p></form>`,
  );
}
function nbDownload(content, name, type) {
  const url = URL.createObjectURL(new Blob([content], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function nbLoadImage(src) {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = src;
  });
}
async function nbExportWork(w) {
  try {
    const template = state.templates.find((t) => t.id === w.design.template),
      im = await nbLoadImage(nbAsset(template.img)),
      mask = await nbLoadImage(nbAsset(`assets/mask-${w.design.template}.png`)),
      c = document.createElement("canvas");
    c.width = c.height = 840;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, 840, 840);
    ctx.filter = "invert(1)";
    ctx.drawImage(im, 0, 0, 840, 840);
    ctx.filter = "none";
    const d = w.design;
    if (d.color !== "#FFFFFF" || d.texture) {
      const layer = document.createElement("canvas");
      layer.width = layer.height = 840;
      const l = layer.getContext("2d");
      l.drawImage(mask, 0, 0, 840, 840);
      l.globalCompositeOperation = "source-in";
      l.fillStyle = d.color;
      l.fillRect(0, 0, 840, 840);
      if (d.texture) {
        const t = await nbLoadImage(nbAsset(d.texture));
        l.drawImage(t, 0, 0, 840, 840);
      }
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.8;
      ctx.drawImage(layer, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    }
    if (d.showNumber) {
      ctx.fillStyle = d.textColor;
      ctx.font = `italic 900 ${180 * d.scale}px 'Space Mono',monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(d.number, 420, 420);
    }
    const blob = await new Promise((r) => c.toBlob(r, "image/png"));
    if (!blob) throw Error();
    nbDownload(blob, "NICE-BALL-" + w.name + ".png", "image/png");
    showToast("设计 PNG 已导出");
  } catch {
    showToast("导出失败，请通过本地服务打开项目后重试", "error");
  }
}
const nbActions = {
  close: nbClose,
  "template-filter": nbFilterTemplates,
  texture: (id) => {
    nbCheckpoint();
    nbData.draft.texture = id;
    nbSave();
    nbApplyDesign();
  },
  member: nbMemberSheet,
  "member-add": () =>
    nbData.members.length < 99
      ? nbMemberSheet()
      : showToast("最多支持 99 名队员", "error"),
  "member-remove": (id) =>
    nbOpen(
      "移除这位队员？",
      `<div class="nb-stack"><p class="nb-small">移除后需要重新确认球队设计。</p>${nbBtn("member-remove-do", "确认移除", id)}${nbBtn("close", "保留队员", "", false)}</div>`,
    ),
  "member-remove-do": (id) => {
    nbData.members = nbData.members.filter((x) => x.id !== id);
    nbData.confirmed = false;
    nbSave();
    nbClose();
    nbRefresh();
  },
  "size-guide": () =>
    nbOpen(
      "尺码参考",
      `<p class="nb-hint">仅供演示参考；真实生产前需以供应方打样尺寸为准。</p><div style="margin-top:16px">${[
        ["S", "70", "100"],
        ["M", "73", "106"],
        ["L", "76", "112"],
        ["XL", "79", "118"],
        ["XXL", "82", "124"],
        ["3XL", "85", "130"],
      ]
        .map(
          ([s, l, c]) =>
            `<div class="nb-list-item"><strong class="nb-grow">${s}</strong><span class="nb-small">衣长 ${l} cm / 胸围 ${c} cm</span></div>`,
        )
        .join("")}</div>`,
    ),
  "select-work": (id) => {
    nbData.selectedWork = id;
    nbData.confirmed = false;
    nbSave();
    nbTeamDesign();
  },
  "confirm-design": () => {
    if (!nbData.selectedWork) return showToast("请先选择一件设计", "error");
    if (!nbData.members.length) return showToast("请先添加队员", "error");
    nbData.confirmed = !nbData.confirmed;
    nbLog(nbData.confirmed ? "球队设计已在本机确认。" : "球队设计确认已撤销。");
    nbSave();
    nbClose();
    nbRefresh();
  },
  create: () => {
    nbClose();
    router.navigate("templateList");
  },
  ai: () => router.navigate("aiDesign"),
  "open-post": (id) => router.navigate("detail", { post: id }),
  "work-detail": nbWorkDetail,
  "edit-work": (id) => router.navigate("templateDetail", { work: id }),
  "use-team": (id) => {
    nbData.selectedWork = id;
    nbData.confirmed = false;
    nbSave();
    router.navigate("collab");
    showToast("已选为球队设计，点击设计确认继续");
  },
  "export-work": (id) => nbExportWork(nbData.works.find((x) => x.id === id)),
  "copy-work": (id) => {
    const w = nbData.works.find((x) => x.id === id);
    nbData.works.push({
      ...w,
      id: nbID(),
      name: w.name.slice(0, 25) + " · 副本",
      design: { ...w.design },
      updated: Date.now(),
    });
    nbSave();
    nbWorksSheet();
    showToast("设计已复制");
  },
  "delete-work": (id) =>
    nbOpen(
      "删除这件设计？",
      `<div class="nb-stack"><p class="nb-small">这个操作不能直接撤销，建议先导出备份。</p>${nbBtn("delete-work-do", "确认删除", id)}${nbBtn("close", "保留设计", "", false)}</div>`,
    ),
  "delete-work-do": (id) => {
    nbData.works = nbData.works.filter((x) => x.id !== id);
    if (nbData.selectedWork === id) {
      nbData.selectedWork = null;
      nbData.confirmed = false;
    }
    if (nbEditorID === id) nbEditorID = null;
    nbSave();
    nbWorksSheet();
  },
  "confirm-order": (id) => {
    const o = nbData.orders.find((x) => x.id === id);
    if (o?.status !== "待付款") return;
    o.status = "待发货";
    nbLog(`模拟订单 ${id} 已完成模拟付款，没有真实扣款。`);
    nbSave();
    nbOrdersSheet();
    showToast("模拟付款完成，没有真实扣款");
  },
  "cancel-order": (id) =>
    nbOpen(
      "取消模拟订单？",
      `<div class="nb-stack">${nbBtn("cancel-order-do", "确认取消", id)}${nbBtn("close", "保留订单", "", false)}</div>`,
    ),
  "cancel-order-do": (id) => {
    const o = nbData.orders.find((x) => x.id === id);
    if (o?.status === "待付款") o.status = "已取消";
    nbSave();
    nbOrdersSheet();
  },
  settings: nbSettings,
  "export-data": () => {
    nbDownload(
      JSON.stringify(nbData, null, 2),
      "NICE-BALL-original-backup.json",
      "application/json",
    );
    showToast("本机备份已导出");
  },
  reset: () =>
    nbOpen(
      "重置本机数据？",
      `<div class="nb-stack"><p class="nb-small">将清空作品、收藏和模拟订单，恢复原型初始数据。</p>${nbBtn("reset-do", "确认重置本机数据")}${nbBtn("close", "保留数据", "", false)}</div>`,
    ),
  "reset-do": () => {
    nbData = nbDefaults();
    state.user = nbData.user;
    nbEditorID = null;
    nbUndo = [];
    nbSearch = "";
    nbCategory = "";
    nbSave();
    router.navigate("login");
  },
  logout: () => {
    nbData.logged = false;
    nbSave();
    router.navigate("login");
  },
  "ai-to-editor": () => {
    nbData.draft = { ...nbDefaults().draft };
    nbEditorID = null;
    router.navigate("templateDetail", { id: "t1", name: "经典 V 领" });
  },
  "copy-link": async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      showToast("当前页面地址已复制");
    } catch {
      nbOpen(
        "复制页面地址",
        `<p class="nb-small">离线页面地址仅在本机有效。</p><input class="nb-input" value="${nbEsc(location.href)}" readonly aria-label="当前页面地址">`,
      );
    }
  },
  "import-do": () => {
    if (!nbPendingImport) return;
    nbData = nbPendingImport;
    nbPendingImport = null;
    state.user = nbData.user;
    nbEditorID = null;
    nbSave();
    router.navigate("profile");
    showToast("备份已恢复");
  },
};
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-nb]");
  if (b) {
    e.preventDefault();
    nbActions[b.dataset.nb]?.(b.dataset.id);
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nbQ(".nb-overlay")) {
    nbClose();
    return;
  }
  if (e.key === "Tab" && nbQ(".nb-overlay")) {
    const nodes = nbQA(
        ".nb-sheet button,.nb-sheet input,.nb-sheet textarea,.nb-sheet select",
      ).filter((x) => !x.disabled && x.offsetParent !== null),
      first = nodes[0],
      last = nodes.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }
  if (
    (e.key === "Enter" || e.key === " ") &&
    e.target.matches("[role=button]") &&
    !e.target.onkeydown
  ) {
    e.preventDefault();
    e.target.click();
  }
});
let nbPendingImport = null;
const nbValidDesign = (d) =>
  d &&
  ["t1", "t2", "t3"].includes(d.template) &&
  /^#[0-9a-f]{6}$/i.test(d.color) &&
  /^\d{1,2}$/.test(d.number) &&
  /^#[0-9a-f]{6}$/i.test(d.textColor) &&
  ["", "assets/1765264653321.jpg", "assets/1765264641079.jpg"].includes(
    d.texture,
  ) &&
  Number.isFinite(d.scale) &&
  d.scale >= 0.6 &&
  d.scale <= 1.5 &&
  typeof d.showNumber === "boolean";
function nbValidBackup(d) {
  const str = (s, n = 100) => typeof s === "string" && s.length <= n,
    arr = (a, n = 500) => Array.isArray(a) && a.length <= n;
  if (
    !d ||
    d.version !== 1 ||
    !d.user ||
    !str(d.user.name, 20) ||
    !str(d.user.id) ||
    typeof d.logged !== "boolean" ||
    !nbValidDesign(d.draft)
  )
    return false;
  if (
    !["likes", "saved", "footprints", "read"].every(
      (k) => arr(d[k]) && d[k].every((v) => str(v)),
    )
  )
    return false;
  if (
    !arr(d.works) ||
    !d.works.every(
      (w) =>
        str(w.id) &&
        str(w.name, 30) &&
        Number.isFinite(w.updated) &&
        nbValidDesign(w.design),
    )
  )
    return false;
  if (
    !arr(d.members, 99) ||
    !d.members.every(
      (m) =>
        str(m.id) &&
        str(m.name, 20) &&
        /^\d{1,2}$/.test(m.number) &&
        ["S", "M", "L", "XL", "XXL", "3XL"].includes(m.size),
    )
  )
    return false;
  if (
    typeof d.confirmed !== "boolean" ||
    !["标准环保包装", "球队统一装箱", "单件独立包装"].includes(d.packaging) ||
    !(d.selectedWork === null || str(d.selectedWork))
  )
    return false;
  if (
    !arr(d.orders) ||
    !d.orders.every(
      (o) =>
        str(o.id) &&
        str(o.title, 100) &&
        str(o.post) &&
        str(o.name, 30) &&
        /^1\d{10}$/.test(o.phone) &&
        str(o.address, 200) &&
        ["S", "M", "L", "XL", "XXL", "3XL"].includes(o.size) &&
        Number.isInteger(o.quantity) &&
        o.quantity > 0 &&
        o.quantity <= 99 &&
        o.total === o.quantity * 299 &&
        ["待付款", "待发货", "已取消"].includes(o.status) &&
        ["lime", "white", "purple"].includes(o.color),
    )
  )
    return false;
  if (
    !arr(d.notifications, 60) ||
    !d.notifications.every((n) => str(n.text, 500) && Number.isFinite(n.time))
  )
    return false;
  if (!arr(d.messages) || !d.messages.every((m) => str(m.text, 500)))
    return false;
  if (
    !arr(d.uploads, 30) ||
    !d.uploads.every(
      (p) =>
        str(p.id) &&
        str(p.title, 30) &&
        str(p.img, 400000) &&
        /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p.img),
    )
  )
    return false;
  return (
    str(d.lastPrompt, 300) &&
    Object.keys(d).every((k) => Object.keys(nbDefaults()).includes(k))
  );
}
document.addEventListener("change", async (e) => {
  if (e.target.id === "nb-import") {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024)
      return showToast("请选择 10 MB 以内的备份", "error");
    try {
      const d = JSON.parse(await f.text());
      if (!nbValidBackup(d)) throw Error();
      nbPendingImport = d;
      nbOpen(
        "恢复这份备份？",
        `<div class="nb-stack"><p class="nb-small">包含 ${d.works.length} 件设计、${d.members.length} 名队员、${d.orders.length} 个订单。会覆盖当前本机数据。</p>${nbBtn("import-do", "确认恢复备份")}${nbBtn("close", "取消恢复", "", false)}</div>`,
      );
    } catch {
      showToast("备份格式不正确，请选择本版本导出的完整文件", "error");
    }
  }
});
function nbError(t) {
  const el = nbQ("#nb-error");
  if (el) el.textContent = t;
  else showToast(t, "error");
}
document.addEventListener("submit", async (e) => {
  const f = e.target;
  if (!f.dataset.nbForm) return;
  e.preventDefault();
  if (!f.reportValidity()) return;
  const v = Object.fromEntries(new FormData(f));
  switch (f.dataset.nbForm) {
    case "save-work": {
      if (!v.name.trim()) return nbError("请填写作品名称");
      const existing = nbData.works.find((w) => w.id === nbEditorID);
      if (existing) {
        existing.name = v.name.trim();
        existing.design = { ...nbData.draft };
        existing.updated = Date.now();
      } else {
        const w = {
          id: nbID(),
          name: v.name.trim(),
          design: { ...nbData.draft },
          updated: Date.now(),
        };
        nbData.works.push(w);
        nbEditorID = w.id;
      }
      if (nbData.selectedWork === nbEditorID) nbData.confirmed = false;
      nbLog("保存设计「" + v.name.trim() + "」。");
      nbSave();
      nbOpen(
        "设计已保存",
        `<div class="nb-stack"><p class="nb-small">已存入本机设计库，原来的编辑画面保持不变。</p>${nbBtn("work-detail", "打开这件设计", nbEditorID)}${nbBtn("close", "继续编辑", "", false)}</div>`,
      );
      break;
    }
    case "member": {
      const id = f.dataset.id;
      if (!v.name.trim()) return nbError("请填写队员姓名");
      if (!/^\d{1,2}$/.test(v.number)) return nbError("请填写 0–99 的号码");
      if (
        nbData.members.some(
          (m) => m.id !== id && Number(m.number) === Number(v.number),
        )
      )
        return nbError("这个号码已经被使用，请换一个号码");
      if (!id && nbData.members.length >= 99)
        return nbError("最多支持 99 名队员");
      const m = {
        id: id || nbID(),
        name: v.name.trim(),
        number: v.number,
        size: v.size,
      };
      if (id) nbData.members = nbData.members.map((x) => (x.id === id ? m : x));
      else nbData.members.push(m);
      nbData.confirmed = false;
      nbSave();
      nbClose();
      nbRefresh();
      showToast("队员已保存，需要重新确认球队设计");
      break;
    }
    case "packaging":
      nbData.packaging = v.packaging;
      nbSave();
      nbClose();
      showToast("包装选择已保存");
      break;
    case "profile":
      if (!v.name.trim()) return nbError("请填写昵称");
      nbData.user.name = v.name.trim();
      state.user = nbData.user;
      nbSave();
      nbClose();
      nbRefresh();
      showToast("资料已保存");
      break;
    case "checkout": {
      const n = Number(v.quantity);
      if (!Number.isInteger(n) || n < 1 || n > 99)
        return nbError("数量应为 1–99 的整数");
      if (!v.name.trim() || v.address.trim().length < 6)
        return nbError("请补全收件人和详细地址");
      if (!/^1\d{10}$/.test(v.phone)) return nbError("请填写 11 位手机号");
      const p = nbAllPosts().find((p) => String(p.id) === f.dataset.post),
        o = {
          id: "NB" + Date.now().toString().slice(-9) + nbID().slice(-2),
          post: f.dataset.post,
          title: p?.title || "CHAMPION PRO",
          color: nbProductColor,
          size: v.size,
          quantity: n,
          name: v.name.trim(),
          phone: v.phone,
          address: v.address.trim(),
          total: n * 299,
          status: "待付款",
          created: Date.now(),
        };
      nbData.orders.push(o);
      nbLog("创建模拟订单 " + o.id + "，等待模拟确认。");
      nbSave();
      nbOrdersSheet();
      showToast("模拟订单已创建，未产生真实支付");
      break;
    }
    case "chat":
      if (!v.text.trim()) return;
      nbData.messages.push({ text: v.text.trim(), time: Date.now() });
      nbSave();
      nbChatSheet();
      break;
    case "upload": {
      if (!v.title.trim()) return nbError("请填写灵感标题");
      if (nbData.uploads.length >= 30)
        return nbError("本机最多保存 30 张手稿，请先导出备份");
      const file = nbQ("#nb-upload").files[0];
      if (
        !file ||
        !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
        file.size > 5 * 1024 * 1024
      )
        return nbError("请选择 5 MB 以内的 JPG、PNG 或 WebP 图片");
      const submit = nbQ("button[type=submit]", f);
      submit.disabled = true;
      try {
        nbUploadURL = URL.createObjectURL(file);
        const im = await nbLoadImage(nbUploadURL);
        if (!f.isConnected) return;
        const c = document.createElement("canvas"),
          ratio = Math.min(1, 640 / Math.max(im.width, im.height));
        c.width = Math.round(im.width * ratio);
        c.height = Math.round(im.height * ratio);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        const img = c.toDataURL("image/jpeg", 0.76);
        nbData.uploads.unshift({
          id: "u" + nbID(),
          title: v.title.trim(),
          subtitle: "MY SKETCH",
          likes: 0,
          img,
          category: ["灵感"],
        });
        nbSave();
        router.navigate("home", { tab: "inspiration" });
        showToast("手稿已保存到本机灵感区");
      } catch {
        nbError("图片无法读取，请换一张图片重试");
        submit.disabled = false;
      }
      break;
    }
  }
});

if (!nbValidBackup(nbData)) {
  nbData = nbDefaults();
  state.user = nbData.user;
}

// Optional browser sizing; default is the untouched original phone proportion.
const nbWebTools=document.createElement('aside');
nbWebTools.className='nb-web-tools';
nbWebTools.setAttribute('aria-label','网页版显示方式');
nbWebTools.innerHTML='<strong>NICE BALL.</strong><span>显示方式</span><button type="button" data-web-fit="original" aria-pressed="true">原版比例</button><button type="button" data-web-fit="wide" aria-pressed="false">适配窗口</button>';
document.body.append(nbWebTools);
function nbSetWebFit(value){const wide=value==='wide';document.body.classList.toggle('nb-web-fit',wide);nbQA('[data-web-fit]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.webFit==='wide')===wide)));try{sessionStorage.setItem('nice-ball-web-fit',wide?'wide':'original')}catch{}}
nbWebTools.addEventListener('click',e=>{const b=e.target.closest('[data-web-fit]');if(b)nbSetWebFit(b.dataset.webFit)});
try{nbSetWebFit(sessionStorage.getItem('nice-ball-web-fit')||'original')}catch{}
