// auth-utils.js：Netlify Identity 通用初始化脚本
// 替换原来的 Auth0 方案，改用 Netlify 内置的身份认证服务
// 使用方法：在 HTML 中引入 Netlify Identity Widget + 本文件

// 等待 netlify-identity-widget 加载完成
function waitForIdentity() {
  return new Promise((resolve) => {
    if (window.netlifyIdentity) {
      resolve(window.netlifyIdentity);
      return;
    }
    // 每 100ms 检查一次，最多等 5 秒
    let attempts = 0;
    const timer = setInterval(() => {
      if (window.netlifyIdentity || attempts > 50) {
        clearInterval(timer);
        resolve(window.netlifyIdentity);
      }
      attempts++;
    }, 100);
  });
}

// 初始化 Identity
async function initIdentity() {
  const identity = await waitForIdentity();
  if (!identity) {
    console.error('Netlify Identity SDK 未加载，请检查 HTML 中的 script 标签');
    return null;
  }
  identity.init();
  return identity;
}

// 打开登录弹窗
async function login() {
  const identity = await initIdentity();
  if (identity) {
    identity.open('login');
  }
}

// 打开注册弹窗
async function register() {
  const identity = await initIdentity();
  if (identity) {
    identity.open('signup');
  }
}

// 退出登录
async function logout() {
  const identity = await initIdentity();
  if (identity) {
    identity.logout();
  }
}

// 检查是否已登录
async function isLoggedIn() {
  const identity = await initIdentity();
  if (!identity) return false;
  const user = identity.currentUser();
  return !!user;
}

// 获取当前用户信息
async function getCurrentUser() {
  const identity = await initIdentity();
  if (!identity) return null;
  return identity.currentUser();
}

// 获取当前用户的邮箱（用于显示）
async function getCurrentUserEmail() {
  const user = await getCurrentUser();
  return user ? user.email : null;
}

// 获取 JWT token（用于调用后端 API，后续加日志功能时用）
async function getToken() {
  const identity = await initIdentity();
  if (!identity) return null;
  const user = identity.currentUser();
  if (!user) return null;
  return await user.jwt();
}

// 页面加载时自动初始化
document.addEventListener('DOMContentLoaded', function() {
  initIdentity().then(identity => {
    if (!identity) return;

    // 登录成功事件
    identity.on('login', (user) => {
      console.log('登录成功:', user.email);
    });

    // 退出登录事件
    identity.on('logout', () => {
      console.log('已退出登录');
      // 退出后跳回首页
      if (window.location.pathname.includes('/html/')) {
        window.location.href = '../index.html';
      }
    });
  }).catch(error => {
    console.error('Identity 初始化失败:', error);
  });
});
