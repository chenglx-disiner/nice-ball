/* Select the appropriate interface without changing the original mobile templates. */
(function () {
  const query = new URLSearchParams(location.search),
    forced = query.get("view"),
    web = /\/web\/(?:index\.html)?$/.test(location.pathname),
    online = /^https?:$/.test(location.protocol);
  const root = new URL(web ? "../" : "./", location.href);
  function routeHash() {
    return window.NBLayout?.route?.() || location.hash || "#/home";
  }
  function open(target, force) {
    window.NBLayout?.save?.();
    const u = new URL(target === "web" ? "web/" : "./", root);
    if (force) u.searchParams.set("view", target);
    u.hash = routeHash();
    location.assign(u.href);
  }
  window.NBLayout = {
    openWeb: () => open("web", true),
    openMobile: () => open("mobile", true),
    route: null,
    save: null,
  };
  function select() {
    if (!online) return;
    const shouldWeb =
      forced === "web" || (forced !== "mobile" && innerWidth >= 900);
    if (shouldWeb && !web) {
      const u = new URL("web/", root);
      if (forced) u.searchParams.set("view", forced);
      u.hash = routeHash();
      location.replace(u.href);
    } else if (!shouldWeb && web) {
      const u = new URL("./", root);
      if (forced) u.searchParams.set("view", forced);
      u.hash = routeHash();
      location.replace(u.href);
    }
  }
  select();
  matchMedia("(min-width:900px)").addEventListener("change", () => {
    if (!forced) {
      window.NBLayout?.save?.();
      select();
    }
  });
})();
