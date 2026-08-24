// 管理员查账小程序
// 只有管理员邮箱能调用，返回账本里的记录
// 用法：GET /api/get-logs?type=login （查登录记录）
//       GET /api/get-logs?type=operation （查操作记录）
//       GET /api/get-logs （两种都查）

const { getStore } = require('@netlify/blobs');

// 管理员邮箱列表（只有这些邮箱能看日志）
const ADMIN_EMAILS = ['272989398@qq.com'];

// 最多返回多少条（防止一次拉太多）
const MAX_ENTRIES = 500;

exports.handler = async (event, context) => {
  try {
    // 验证调用者是管理员
    const user = context.clientContext && context.clientContext.user;
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: '无权访问：仅管理员可查看日志' })
      };
    }

    const type = (event.queryStringParameters && event.queryStringParameters.type) || 'all';
    const store = getStore('logs');

    // 准备返回的日志
    const loginLogs = [];
    const operationLogs = [];

    // 查登录记录
    if (type === 'all' || type === 'login') {
      const { blobs } = await store.list({ prefix: 'login/' });
      for (const b of blobs.slice(0, MAX_ENTRIES)) {
        try {
          const data = await store.get(b.key, { type: 'json' });
          if (data) loginLogs.push(data);
        } catch (e) { /* 跳过坏数据 */ }
      }
      // 最新的排在最前面
      loginLogs.sort((a, b) => new Date(b.time) - new Date(a.time));
    }

    // 查操作记录
    if (type === 'all' || type === 'operation') {
      const { blobs } = await store.list({ prefix: 'op/' });
      for (const b of blobs.slice(0, MAX_ENTRIES)) {
        try {
          const data = await store.get(b.key, { type: 'json' });
          if (data) operationLogs.push(data);
        } catch (e) { /* 跳过坏数据 */ }
      }
      operationLogs.sort((a, b) => new Date(b.time) - new Date(a.time));
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loginLogs: loginLogs,
        operationLogs: operationLogs
      })
    };
  } catch (error) {
    console.error('查询日志失败:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '查询失败' })
    };
  }
};
