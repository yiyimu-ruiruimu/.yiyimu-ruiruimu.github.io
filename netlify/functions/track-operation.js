// 记录"操作行为"的小程序
// 学生在课程平台里做的关键操作（切换阶段、打开实验等）都会记一笔
// 用户身份由 Netlify 服务端自动验证，无法伪造

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
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: '未登录，不记录' })
      };
    }

    // 解析前端传来的操作内容
    let body = {};
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      body = {};
    }
    const action = (body.action || '未知操作').slice(0, 100);
    const target = (body.target || '').slice(0, 200);

    // 打开账本
    const store = getStore('logs');

    // 组装这一条记录
    const entry = {
      type: 'operation',
      email: user.email,
      userId: user.sub,
      action: action,
      target: target,
      time: new Date().toISOString(),
      ip: event.headers['client-ip'] || event.headers['x-forwarded-for'] || '未知'
    };

    // 生成唯一编号并写入
    const key = 'op/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    await store.set(key, JSON.stringify(entry));

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (error) {
    console.error('记录操作失败:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '记录失败' })
    };
  }
};
