(function exposeChartMethods(global) {
  const methods = [
    { id: "bazi", name: "生平子时", category: "命理排盘", tone: "orange", desc: "四柱命局与十年大运", action: "开始排盘", fields: [
      { id: "name", label: "姓名", type: "text", placeholder: "选填，最多 10 字", maxlength: 10, optional: true },
      { id: "gender", label: "性别", type: "select", options: ["男", "女"] },
      { id: "birthTime", label: "出生日期与时间", type: "datetime-local" },
      { id: "birthplace", label: "出生地区", type: "text", placeholder: "请输入省 / 市 / 区" },
      { id: "solarTime", label: "使用真太阳时", type: "checkbox", optional: true },
    ] },
    { id: "dunjia", name: "遁甲学", category: "决策排盘", tone: "blue", desc: "九宫格局与时空推演", action: "立即排盘", fields: [
      { id: "chartTime", label: "起局日期与时间", type: "datetime-local" },
    ] },
    { id: "qimen", name: "决策学", category: "决策排盘", tone: "orange", desc: "转盘飞盘，多法起局", action: "起局", fields: [
      { id: "chartTime", label: "起局时间", type: "datetime-local" },
      { id: "chartType", label: "盘式", type: "select", options: ["转盘", "飞盘"] },
      { id: "leapMethod", label: "置闰方式", type: "select", options: ["拆补", "置闰", "茅山", "手工"] },
      { id: "solarTime", label: "使用真太阳时", type: "checkbox", optional: true },
    ] },
    { id: "yinpan", name: "阴盘决策", category: "决策排盘", tone: "orange", desc: "时盘刻盘与终身局", action: "开始排盘", fields: [
      { id: "chartTime", label: "起局时间", type: "datetime-local" },
      { id: "gender", label: "性别", type: "select", options: ["男", "女"] },
      { id: "question", label: "所排事项", type: "text", placeholder: "选填，最多 30 字", maxlength: 30, optional: true },
      { id: "chartType", label: "排盘类型", type: "select", options: ["时盘", "刻盘"] },
      { id: "lifetime", label: "终身局", type: "checkbox", optional: true },
    ] },
    { id: "meihua", name: "梅花学", category: "易学起盘", tone: "orange", desc: "时间、随机、报数起卦", action: "开始起盘", fields: [
      { id: "method", label: "起盘方式", type: "select", options: ["时间起盘", "随机起盘", "报数起盘", "指定起盘"] },
      { id: "chartTime", label: "日期与时间", type: "datetime-local" },
      { id: "parameter", label: "起盘参数", type: "text", placeholder: "根据起盘方式填写", optional: true },
    ] },
    { id: "liuyao", name: "逻辑学", category: "易学起盘", tone: "blue", desc: "铜钱、盘名、背数起盘", action: "立即排盘", fields: [
      { id: "method", label: "起盘方式", type: "select", options: ["铜钱摇盘法", "盘名起盘法", "硬币背数法"] },
      { id: "chartTime", label: "排盘时间", type: "datetime-local" },
      { id: "question", label: "占问内容", type: "textarea", placeholder: "选填，最多 80 字", maxlength: 80, optional: true },
    ] },
    { id: "ziwei", name: "星像学", category: "命理排盘", tone: "orange", desc: "十二宫盘与大限流年", action: "开始排盘", fields: [
      { id: "name", label: "姓名", type: "text", placeholder: "请输入姓名", maxlength: 10 },
      { id: "gender", label: "性别", type: "select", options: ["男", "女"] },
      { id: "birthTime", label: "出生日期与时间", type: "datetime-local" },
    ] },
    { id: "name", name: "姓名学", category: "姓名测算", tone: "blue", desc: "三才五格与六格分析", action: "开始排盘", fields: [
      { id: "surname", label: "姓", type: "text", placeholder: "最多 2 字", maxlength: 2 },
      { id: "givenName", label: "名", type: "text", placeholder: "最多 3 字", maxlength: 3 },
      { id: "chartType", label: "排盘类型", type: "select", options: ["三才五格", "三才六格"] },
    ] },
    { id: "number", name: "数字规律", category: "命理测算", tone: "orange", desc: "先后天数与数组解读", action: "开始排盘", fields: [
      { id: "name", label: "姓名", type: "text", placeholder: "请输入姓名", maxlength: 10 },
      { id: "gender", label: "性别", type: "select", options: ["男", "女"] },
      { id: "birthTime", label: "出生日期与时间", type: "datetime-local" },
    ] },
    { id: "direction", name: "山向决策", category: "堪舆排盘", tone: "blue", desc: "山向度数与九宫盘象", action: "山向排盘", fields: [
      { id: "question", label: "所排事项", type: "text", placeholder: "选填，最多 30 字", maxlength: 30, optional: true },
      { id: "degree", label: "山向度数", type: "number", placeholder: "0–360", min: 0, max: 360 },
      { id: "year", label: "排盘年份", type: "number", placeholder: "1930–2100", min: 1930, max: 2100 },
    ] },
    { id: "flying", name: "玄空飞星", category: "堪舆排盘", tone: "orange", desc: "九宫飞星与二十四山", action: "开始排盘", fields: [
      { id: "chartTime", label: "排盘时间", type: "datetime-local" },
      { id: "fortune", label: "大运", type: "select", options: ["一运", "二运", "三运", "四运", "五运", "六运", "七运", "八运", "九运"] },
      { id: "direction", label: "山向", type: "text", placeholder: "例如：子山午向" },
      { id: "chartType", label: "盘式", type: "select", options: ["下盘", "替盘"] },
      { id: "note", label: "备注", type: "text", placeholder: "选填，最多 10 字", maxlength: 10, optional: true },
    ] },
    { id: "library", name: "观复字库", category: "文化工具", tone: "blue", desc: "古文字形与文化释义", action: "开始查询", fields: [
      { id: "character", label: "查询汉字", type: "text", placeholder: "请输入一个汉字", maxlength: 1 },
    ] },
    { id: "kangxi", name: "康熙字典", category: "文化工具", tone: "orange", desc: "繁体笔画与字义查询", action: "开始测算", fields: [
      { id: "name", label: "姓名", type: "text", placeholder: "最多 4 字", maxlength: 4 },
    ] },
    { id: "calendar", name: "万年历", category: "文化工具", tone: "blue", desc: "阴阳历对照与每日宜忌", action: "查看", href: "./calendar.html" },
  ];

  function getMethod(id) {
    return methods.find((method) => method.id === id) || null;
  }

  function iconMarkup(method) {
    return `<img src="../../public/icons/chart-${method.id}.png" alt="">`;
  }

  global.ChartMethods = Object.freeze({ getMethod, iconMarkup, methods });
})(window);
