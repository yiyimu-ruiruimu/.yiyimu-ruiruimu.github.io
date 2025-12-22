// auth-utils.js：Auth0 通用初始化脚本
let auth0Client = null;

async function initAuth0() {
  if (!auth0Client) {
    try {
      // 检查SDK是否已加载
      if (typeof createAuth0Client === 'undefined') {
         // 重试机制
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (typeof createAuth0Client === 'undefined') {
          throw new Error('Auth0 SDK 未加载，请检查HTML中的script标签');
        }
      }
      // Netlify环境适配 - 使用相对路径
      const currentOrigin = window.location.origin;
      const redirectPath = window.location.pathname.includes('/html/') ? 
        '/html/main-page.html' : '/main-page.html';

      auth0Client = await createAuth0Client({
        domain: "dev-h2db85qqcj17fjnp.eu.auth0.com",
        clientId: "8cfYo5uJGKxjFV5qe6DOz8HRWKH32BvT",
        authorizationParams: {
          redirect_uri: `${window.location.origin}/html/main-page.html`
        },
        cacheLocation: 'localstorage'
      });

      // 处理登录回调
      if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
        await auth0Client.handleRedirectCallback();
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      console.error('Auth0初始化失败:', error);
      alert('认证服务初始化失败: ' + error.message);
      throw error;
    }
  }
  return auth0Client;
}

async function login() {
  try {
    const auth0 = await initAuth0();
    await auth0.loginWithRedirect({
      authorizationParams: { 
        screen_hint: 'login',
        redirect_uri: `${window.location.origin}/html/main-page.html`
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    alert('登录失败: ' + error.message);
  }
}

async function register() {
  try {
    const auth0 = await initAuth0();
    await auth0.loginWithRedirect({
      authorizationParams: { 
        screen_hint: 'signup',
        redirect_uri: `${window.location.origin}/html/main-page.html`
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    alert('注册失败: ' + error.message);
  }
}

async function logout() {
  try {
    const auth0 = await initAuth0();
    await auth0.logout({
      logoutParams: {
        returnTo: `${window.location.origin}/index.html`
      }
    });
  } catch (error) {
    console.error('退出登录失败:', error);
    alert('退出登录失败: ' + error.message);
  }
}

async function isLoggedIn() {
  try {
    const auth0 = await initAuth0();
    return await auth0.isAuthenticated();
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return false;
  }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
  initAuth0().catch(error => {
    console.error('初始化失败:', error);
  });
});