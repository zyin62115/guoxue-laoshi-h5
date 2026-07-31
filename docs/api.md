# 本地数据 API

项目没有后端 API。`src/js/shared.js` 通过 `window.GuoxueApp` 暴露共享状态和本地存储能力，页面脚本必须先加载 `shared.js`，再加载对应业务脚本。

问答回复由 `src/js/app.js` 中的本地关键词规则模拟，不代表已接入真实 AI 服务。八字档案、额度和历史会话仅保存在当前浏览器中。
