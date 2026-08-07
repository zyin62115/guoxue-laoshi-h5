(function exposeChartMethods(global) {
  const iconPaths = {
    bazi: `<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="15"/><path d="M32 17v5M47 32h-5M32 47v-5M17 32h5M32 25v9l7 4"/>`,
    dunjia: `<path d="M14 13c6-3 12-3 18 0v38c-6-3-12-3-18 0V13ZM50 13c-6-3-12-3-18 0v38c6-3 12-3 18 0V13Z"/><path d="M20 22h7M20 30h7M37 22h7M37 30h7"/>`,
    qimen: `<rect x="12" y="12" width="40" height="40" rx="4"/><path d="M25 12v40M39 12v40M12 25h40M12 39h40"/><circle cx="32" cy="32" r="5"/>`,
    yinpan: `<path d="m32 8 8 4 8 8 4 12-4 12-8 8-8 4-8-4-8-8-4-12 4-12 8-8 8-4Z"/><path d="M32 20a12 12 0 1 0 0 24 6 6 0 0 0 0-12 6 6 0 0 1 0-12Z"/><circle cx="32" cy="26" r="1.5"/><circle cx="32" cy="38" r="1.5"/>`,
    meihua: `<path d="M32 29c-13-3-14-15-7-18 5-2 8 4 7 12M32 29c3-13 15-14 18-7 2 5-4 8-12 7M32 29c13 3 14 15 7 18-5 2-8-4-7-12M32 29c-3 13-15 14-18 7-2-5 4-8 12-7"/><circle cx="32" cy="29" r="5"/><path d="M35 34c5 7 9 12 15 17"/>`,
    liuyao: `<circle cx="32" cy="32" r="21"/><circle cx="32" cy="32" r="14"/><circle cx="32" cy="32" r="6"/><path d="M32 11v42M11 32h42"/>`,
    ziwei: `<circle cx="32" cy="32" r="7"/><ellipse cx="32" cy="32" rx="24" ry="11"/><ellipse cx="32" cy="32" rx="11" ry="24" transform="rotate(35 32 32)"/><path d="m48 14 1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5 1.5-4Z"/>`,
    name: `<path d="M15 13h27l7 7v31H15V13Z"/><path d="M42 13v8h8M22 27h18M22 35h14M22 43h10"/><path d="m45 38 7 7-13 9-5 1 2-5 9-12Z"/>`,
    number: `<rect x="11" y="14" width="42" height="36" rx="4"/><path d="M18 22h28M18 30h28M18 38h28M18 46h28"/><circle cx="25" cy="22" r="3"/><circle cx="39" cy="30" r="3"/><circle cx="30" cy="38" r="3"/><circle cx="43" cy="46" r="3"/>`,
    direction: `<path d="M9 47 22 28l8 11 7-10 18 18"/><circle cx="32" cy="38" r="15"/><path d="m37 31-3 9-9 3 3-9 9-3Z"/>`,
    flying: `<rect x="12" y="12" width="40" height="40" rx="3"/><path d="M25 12v40M39 12v40M12 25h40M12 39h40"/><path d="m32 21 2.5 7.5H42l-6 4.5 2.2 7-6.2-4-6.2 4 2.2-7-6-4.5h7.5L32 21Z"/>`,
    library: `<path d="M13 14c7-3 13-2 19 2v36c-6-4-12-5-19-2V14ZM51 14c-7-3-13-2-19 2v36c6-4 12-5 19-2V14Z"/><path d="M22 27h4M20 35h8M38 27h6M38 35h6"/>`,
    kangxi: `<path d="M14 10h30l7 7v37H18c-3 0-5-2-5-5s2-5 5-5h26V10"/><path d="M22 19h15M22 27h19M22 35h15"/><path d="M44 10v34"/>`,
    calendar: `<rect x="12" y="16" width="40" height="38" rx="5"/><path d="M12 26h40M22 10v12M42 10v12M20 36h6M38 36h6M20 46h6M38 46h6"/>`,
  };

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
    { id: "library", name: "观复字库", category: "文化工具", tone: "blue", desc: "古文字形与文化释义", action: "开始查询", external: true, fields: [
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
    return `<svg viewBox="0 0 64 64" aria-hidden="true">${iconPaths[method.id]}</svg>`;
  }

  global.ChartMethods = Object.freeze({ getMethod, iconMarkup, methods });
})(window);
