// 记录"进入平台"的小程序（相当于考勤记录）
// 每次有学生打开课程主页，就在账本上记一笔：谁、什么时间、从哪个IP来的
// 注意：用户身份由 Netlify 服务端自动验证，无法伪造

const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  // 只接受 POST 请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: '只允许 POST 请求' })
    };
  }

  try {
    // 从 Netlify Identity 获取当前登录用户（服务端验证，可信）
    const user = context.clientContext && context.clientContext.user;

    // 打开名为 logs 的账本
    const store = getStore('logs');

    // 组装这一条记录
    const entry = {
      type: 'login',
      email: user ? user.email : '未知用户',
      userId: user ? user.sub : null,
      time: new Date().toISOString(),
      ip: event.headers['client-ip'] || event.headers['x-forwarded-for'] || '未知',
      userAgent: event.headers['user-agent'] || '未知'
    };

    // 生成唯一的记账编号（时间戳 + 随机数，保证不重号）
    const key = 'login/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);

    // 写入账本
    await store.set(key, JSON.stringify(entry));

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (error) {
    console.error('记录登录失败:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '记录失败' })
    };
  }
};
