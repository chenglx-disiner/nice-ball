/* The two layouts share local user content; no cloud service or account sync is implied. */
(function () {
  const M = "nice-ball-original-v1",
    D = "nice-ball-demo-v1";
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const read = (k) => {
    try {
      return JSON.parse(localStorage.getItem(k) || "null");
    } catch {
      return null;
    }
  };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const safeColor = (s, f) => (/^#[0-9a-f]{6}$/i.test(s) ? s : f);
  const map = {
    p1: "product",
    p2: "1",
    p3: "3",
    p4: "101",
    p5: "web:p5",
    p6: "103",
    p7: "4",
    p8: "web:p8",
  };
  const inverse = Object.fromEntries(
    Object.entries(map).map(([w, m]) => [m, w]),
  );
  const toM = (id) => map[id] || String(id),
    toD = (id) => inverse[id] || String(id);
  const mobileDefaults = () => ({
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
    web: {},
  });
  const jersey = () => ({
    name: "主场 · VOLT",
    team: "NICE BALL",
    number: "23",
    player: "YOUR NAME",
    color: "#1a2218",
    accent: "#ccff00",
    pattern: "slash",
    type: "v",
    back: false,
  });
  const desktopDefaults = () => ({
    version: 1,
    user: { name: "设计师_X", bio: "把热爱穿在身上。", id: "NICE-888" },
    likes: [],
    saved: [],
    following: [],
    comments: {},
    works: [],
    members: [],
    teamName: "NICE 球队",
    teamDesign: null,
    confirmed: false,
    orders: [],
    cart: [],
    read: [],
    threads: { team: [], studio: [] },
    editor: jersey(),
    activity: [],
    prefs: {},
  });
  const mobile = () => {
    const m = read(M);
    return m?.version === 1 &&
      Array.isArray(m.works) &&
      Array.isArray(m.members) &&
      Array.isArray(m.orders)
      ? { ...mobileDefaults(), ...m }
      : mobileDefaults();
  };
  const deskDesign = (m, name, old = {}) => ({
    ...jersey(),
    ...old,
    name: name || old.name || "我的球衣设计",
    color: safeColor(m?.color, old.color || "#1a2218"),
    number: /^\d{1,2}$/.test(m?.number) ? m.number : old.number || "23",
    type: { t1: "v", t2: "round", t3: "tee" }[m?.template] || old.type || "v",
    accent: safeColor(
      m?.textColor,
      old.accent ||
        (/^#(?:ffffff|e6e5da)$/i.test(m?.color) ? "#28332a" : "#ccff00"),
    ),
  });
  const mobileDesign = (d, old = {}) => ({
    ...mobileDefaults().draft,
    ...old,
    template: { v: "t1", round: "t2", tee: "t3" }[d.type] || "t1",
    color: safeColor(d.color, "#FFFFFF"),
    number: /^\d{1,2}$/.test(d.number) ? d.number : old.number || "23",
    textColor: d.accent,
    showNumber: true,
  });
  const extra = [
    {
      id: "2",
      title: "2025 趋势",
      en: "FUTURE\nTRENDS.",
      author: "NICE 设计实验室",
      img: "1765264680523",
      category: "球衣",
      tag: "FUTURE TRENDS",
      likes: 1200,
      desc: "探索球衣设计的未来趋势，从版型、配色与材质寻找新的设计方向。",
      color: "#1a2218",
      accent: "#ccff00",
      pattern: "slash",
    },
    {
      id: "102",
      title: "矢量版型库",
      en: "VECTOR\nARCHIVE.",
      author: "NICE 设计实验室",
      img: "1765264641079",
      category: "手稿",
      tag: "VECTOR ARCHIVE",
      likes: 200,
      desc: "从标准球衣版型出发，探索属于自己的线条与结构。",
      color: "#172b46",
      accent: "#ccff00",
      pattern: "classic",
    },
    {
      id: "104",
      title: "大师设计手稿",
      en: "DRAW\nYOUR GAME.",
      author: "纸上得来",
      img: "1765264654621",
      category: "手稿",
      tag: "DESIGN ARCHIVE",
      likes: 999,
      desc: "用手绘线条记录运动中的灵感，让想法成为可以继续发展的设计。",
      color: "#283c5b",
      accent: "#ccff00",
      pattern: "stripe",
    },
  ];
  const extraMobile = [
    {
      id: "web:p5",
      title: "球鞋与球衣，一起找到节奏",
      subtitle: "MATCH DAY",
      img: "assets/1765264687525.jpg",
      likes: 462,
      category: ["球鞋", "穿搭"],
    },
    {
      id: "web:p8",
      title: "属于街头的第二套队服",
      subtitle: "OFF THE COURT",
      img: "assets/1765264665088.jpg",
      likes: 273,
      category: ["穿搭"],
    },
  ];
  function extendPosts(posts) {
    for (const p of [
      ...extra,
      ...mobile().uploads.map((u) => ({
        id: u.id,
        title: u.title,
        en: "MY\nSKETCH.",
        author: mobile().user.name,
        img: u.img,
        category: "手稿",
        tag: "MY SKETCH",
        likes: 0,
        desc: "保存在本机的灵感手稿。",
        color: "#1a2218",
        accent: "#ccff00",
        pattern: "classic",
      })),
    ])
      if (!posts.some((x) => x.id === p.id)) posts.push(p);
  }
  function toDesktop(m, base) {
    const d = clone(base || desktopDefaults()),
      x = m.web || {};
    d.user = {
      ...d.user,
      ...m.user,
      bio: m.user.bio ?? d.user.bio ?? "把热爱穿在身上。",
    };
    d.likes = [...new Set(m.likes.map(toD))];
    d.saved = [...new Set(m.saved.map(toD))];
    d.works = m.works.map((w) => ({
      id: w.id,
      design: deskDesign(w.design, w.name, w.webDesign),
      mobileDesign: clone(w.design),
      published: w.published || false,
      updated: w.updated,
    }));
    d.members = m.members.map((v, i) => ({
      ...v,
      role:
        v.role ||
        d.members.find((a) => a.id === v.id)?.role ||
        (i === 0 ? "队长" : "队员"),
    }));
    d.teamName = x.teamName || d.teamName || "NICE 球队";
    const selected = d.works.find((w) => w.id === m.selectedWork);
    d.teamDesign = selected
      ? { ...selected.design, sourceId: selected.id }
      : null;
    d.confirmed = Boolean(m.confirmed && selected);
    d.orders = m.orders.map((o) => {
      const w = o.webOrder || {},
        design =
          w.design ||
          deskDesign(
            {
              color:
                o.color === "white"
                  ? "#FFFFFF"
                  : o.color === "purple"
                    ? "#542e69"
                    : "#1a2218",
              number: "23",
              template: "t1",
            },
            o.title,
          );
      return {
        ...w,
        id: o.id,
        created: o.created || Date.now(),
        design,
        team: Boolean(w.team),
        members: w.members || null,
        quantity: o.quantity,
        size: w.size || o.size,
        recipient: o.name,
        phone: o.phone,
        address: o.address,
        total: o.quantity * 299,
        status:
          { 待付款: "待确认", 待发货: "已确认", 已取消: "已取消" }[o.status] ||
          "待确认",
        mobileOrder: clone({ ...o, webOrder: undefined }),
      };
    });
    for (const k of ["following", "comments", "cart", "read"])
      if (x[k]) d[k] = clone(x[k]);
    d.threads = x.threads ? clone(x.threads) : d.threads;
    const welcome = (d.threads.studio || []).filter((v) => !v.me);
    d.threads.studio = [
      ...welcome,
      ...m.messages.map((v) => ({
        text: v.text,
        me: true,
        time:
          v.displayTime ||
          new Date(v.time || Date.now()).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
      })),
    ];
    d.activity = clone(x.activity || d.activity || []);
    for (const n of [...m.notifications].reverse())
      if (!d.activity.some((a) => a.text === n.text))
        d.activity.push({
          text: n.text,
          time: new Date(n.time).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
    d.activity = d.activity.slice(-100);
    d.editor = deskDesign(
      m.draft,
      x.editor?.name || d.editor.name,
      x.editor || d.editor,
    );
    return d;
  }
  function saveDesktop(d) {
    const m = mobile();
    m.user = { ...m.user, ...d.user };
    m.likes = [...new Set(d.likes.map(toM))];
    m.saved = [...new Set(d.saved.map(toM))];
    m.works = d.works.map((w) => {
      const old = m.works.find((v) => v.id === w.id);
      return {
        id: w.id,
        name: w.design.name,
        design: mobileDesign(w.design, w.mobileDesign || old?.design),
        updated: w.updated,
        published: w.published,
        webDesign: clone(w.design),
      };
    });
    m.members = d.members.map((v) => ({ ...v }));
    m.selectedWork =
      d.teamDesign?.sourceId ||
      d.works.find(
        (w) =>
          w.design.name === d.teamDesign?.name &&
          w.design.color === d.teamDesign?.color,
      )?.id ||
      null;
    m.confirmed = Boolean(d.confirmed && m.selectedWork);
    m.orders = d.orders.map((o) => {
      const old = o.mobileOrder || m.orders.find((v) => v.id === o.id) || {};
      return {
        ...old,
        id: o.id,
        created: o.created,
        post: old.post || "product",
        title: o.design.name,
        color: old.color || "lime",
        size: ["S", "M", "L", "XL", "XXL", "3XL"].includes(o.size)
          ? o.size
          : "L",
        quantity: o.quantity,
        name: o.recipient,
        phone: o.phone,
        address: o.address,
        total: o.quantity * 299,
        status:
          { 待确认: "待付款", 已确认: "待发货", 已取消: "已取消" }[o.status] ||
          "待付款",
        webOrder: clone({ ...o, mobileOrder: undefined }),
      };
    });
    m.messages = d.threads.studio
      .filter((v) => v.me)
      .map((v) => ({ text: v.text, time: Date.now(), displayTime: v.time }));
    for (const a of d.activity)
      if (!m.notifications.some((n) => n.text === a.text))
        m.notifications.unshift({ text: a.text, time: Date.now() });
    m.notifications = m.notifications.slice(0, 60);
    m.draft = mobileDesign(d.editor, m.draft);
    m.web = {
      teamName: d.teamName,
      following: clone(d.following),
      comments: clone(d.comments),
      cart: clone(d.cart),
      read: clone(d.read),
      threads: clone(d.threads),
      activity: clone(d.activity),
      editor: clone(d.editor),
    };
    write(M, m);
    return m;
  }
  function saveMobile(m) {
    const d = toDesktop(m, read(D) || desktopDefaults());
    write(D, d);
  }
  function reset() {
    const m = mobileDefaults();
    write(M, m);
    write(D, toDesktop(m, desktopDefaults()));
  }
  function prepareExport(d) {
    return { ...clone(d), prefs: { ...d.prefs, mobileBackup: mobile() } };
  }
  function restoreExtras(snapshot) {
    if (!snapshot || typeof snapshot !== "object") return;
    const m = mobile();
    if (
      Array.isArray(snapshot.uploads) &&
      snapshot.uploads.length <= 30 &&
      snapshot.uploads.every(
        (p) =>
          typeof p.id === "string" &&
          p.id.length <= 100 &&
          typeof p.title === "string" &&
          p.title.length <= 30 &&
          typeof p.img === "string" &&
          p.img.length <= 400000 &&
          /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p.img),
      )
    )
      m.uploads = clone(snapshot.uploads);
    if (
      ["标准环保包装", "球队统一装箱", "单件独立包装"].includes(
        snapshot.packaging,
      )
    )
      m.packaging = snapshot.packaging;
    if (
      Array.isArray(snapshot.footprints) &&
      snapshot.footprints.every((v) => typeof v === "string" && v.length <= 100)
    )
      m.footprints = clone(snapshot.footprints);
    if (
      typeof snapshot.lastPrompt === "string" &&
      snapshot.lastPrompt.length <= 300
    )
      m.lastPrompt = snapshot.lastPrompt;
    write(M, m);
  }
  window.NBShared = {
    reset,
    prepareExport,
    restoreExtras,
    mobile,
    toDesktop,
    saveDesktop,
    saveMobile,
    extendPosts,
    extraMobile: () => clone(extraMobile),
    desktopDefaults,
    readDesktop: () => read(D),
    mobileKey: M,
    desktopKey: D,
  };
})();
