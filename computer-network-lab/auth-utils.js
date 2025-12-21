// auth-utils.js：Auth0 通用初始化脚本
let auth0Client = null;

// 初始化 Auth0 客户端
async function initAuth0() {
  if (!auth0Client) {
    // 引入 Auth0 SDK（如果页面没单独引入，这里兜底）
    if (!window.createAuth0Client) {
      const script = document.createElement('script');
      script.src = 'https://cdn.auth0.com/js/auth0-spa-js/2.1/auth0-spa-js.production.js';
      script.async = true;
      document.head.appendChild(script);
      await new Promise(resolve => script.onload = resolve);
    }

    // 初始化客户端（替换为你的 Auth0 Domain 和 Client ID）
    auth0Client = await createAuth0Client({
      domain: "dev-h2db85qqcj17fjnp.eu.auth0.com",
      clientId: "X0wGZvSMQolpwtUMHl2JBKW2ETmWV2Ah",
      authorizationParams: {
        // 登录成功后跳转的目标页面（核心！指向main-page.html）
        redirect_uri: `${window.location.origin}/html/main-page.html`
      }
    });

    // 处理登录回调：Auth0 登录成功后会带 code/state 参数跳转，这里完成校验
    if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
      await auth0Client.handleRedirectCallback();
      // 清除 URL 中的回调参数（可选，让地址栏更干净）
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
  return auth0Client;
}

// 封装登录方法（供按钮调用）
async function login() {
  const auth0 = await initAuth0();
  // 触发 Auth0 登录界面，指定登录模式
  await auth0.loginWithRedirect({
    authorizationParams: { screen_hint: 'login' }
  });
}

// 封装注册方法（供按钮调用）
async function register() {
  const auth0 = await initAuth0();
  // 触发 Auth0 注册界面
  await auth0.loginWithRedirect({
    authorizationParams: { screen_hint: 'signup' }
  });
}

// 封装退出登录方法
async function logout() {
  const auth0 = await initAuth0();
  await auth0.logout({
    logoutParams: {
      // 退出后跳回首页
      returnTo: `${window.location.origin}/index.html`
    }
  });
}

// 检查是否已登录
async function isLoggedIn() {
  const auth0 = await initAuth0();
  return await auth0.isAuthenticated();
}

// 页面加载时自动初始化
window.onload = initAuth0;