(function initializeDailyGuides(global) {
  const themes = [
    { focus: "心绪", action: "安顿内心", result: "方向渐明", good: "静心梳理", avoid: "急于求成" },
    { focus: "专注", action: "专注一事", result: "积小成多", good: "专注当下", avoid: "贪多分心" },
    { focus: "沟通", action: "耐心倾听", result: "彼此理解", good: "坦诚交流", avoid: "意气争辩" },
    { focus: "行动", action: "迈出一步", result: "新局渐开", good: "立即行动", avoid: "反复犹豫" },
    { focus: "学习", action: "温故知新", result: "日有所长", good: "沉心学习", avoid: "浅尝辄止" },
    { focus: "整理", action: "清理积压", result: "心境清明", good: "收纳清理", avoid: "继续拖延" },
    { focus: "休息", action: "放缓脚步", result: "精神渐足", good: "规律作息", avoid: "过度劳累" },
    { focus: "关系", action: "多存善意", result: "温暖相生", good: "关怀他人", avoid: "冷言相向" },
    { focus: "边界", action: "守好尺度", result: "内心安稳", good: "量力而行", avoid: "勉强逞强" },
    { focus: "复盘", action: "回看得失", result: "来路更清", good: "总结反思", avoid: "重蹈旧误" },
    { focus: "新事", action: "勇于尝试", result: "眼界渐开", good: "开启新事", avoid: "畏缩不前" },
    { focus: "财务", action: "核清收支", result: "安排稳健", good: "理性规划", avoid: "冲动消费" },
    { focus: "工作", action: "明确重点", result: "进展可期", good: "推进要事", avoid: "本末倒置" },
    { focus: "家庭", action: "用心陪伴", result: "家和心安", good: "陪伴家人", avoid: "忽略感受" },
    { focus: "健康", action: "养护身心", result: "活力渐生", good: "舒展身心", avoid: "透支体力" },
    { focus: "选择", action: "核对事实", result: "方向自明", good: "审慎决定", avoid: "盲目跟随" },
    { focus: "耐心", action: "静待生长", result: "终见花开", good: "耐心等待", avoid: "拔苗助长" },
    { focus: "观察", action: "留心细节", result: "少走弯路", good: "核对细节", avoid: "粗心大意" },
    { focus: "合作", action: "彼此补位", result: "事情顺畅", good: "协力共进", avoid: "独断专行" },
    { focus: "感恩", action: "记得所得", result: "心见丰盛", good: "表达感谢", avoid: "视为当然" },
    { focus: "取舍", action: "放下纷扰", result: "前路开阔", good: "果断取舍", avoid: "纠缠不休" },
    { focus: "准备", action: "提前检查", result: "行事从容", good: "提前筹备", avoid: "临时应付" },
    { focus: "节奏", action: "张弛有度", result: "自有收获", good: "从容安排", avoid: "急躁冒进" },
  ];

  const patterns = [
    (theme) => [
      `今日留意${theme.focus}，稳步而行。`,
      `${theme.action}，不慌不忙。`,
      `${theme.result}，自见从容。`,
    ],
    (theme) => [
      `晨起观照${theme.focus}，宜缓宜稳。`,
      `${theme.action}，专心投入。`,
      `${theme.result}，自有回响。`,
    ],
    (theme) => [
      `顺势而行，照看${theme.focus}。`,
      `${theme.action}，一步一程。`,
      `${theme.result}，水到渠成。`,
    ],
    (theme) => [
      `心定事明，守好${theme.focus}。`,
      `${theme.action}，守正而行。`,
      `${theme.result}，从容可期。`,
    ],
    (theme) => [
      `不疾不徐，安顿${theme.focus}。`,
      `${theme.action}，把握分寸。`,
      `${theme.result}，心自安然。`,
    ],
    (theme) => [
      `今日守稳${theme.focus}，少些纷扰。`,
      `${theme.action}，循序渐进。`,
      `${theme.result}，静候佳音。`,
    ],
    (theme) => [
      `向内求静，照见${theme.focus}。`,
      `${theme.action}，认真落步。`,
      `${theme.result}，终有所成。`,
    ],
    (theme) => [
      `岁月从容，以${theme.focus}为念。`,
      `${theme.action}，留有余地。`,
      `${theme.result}，来日方长。`,
    ],
  ];

  const guides = patterns.flatMap((pattern) =>
    themes.map((theme) => ({
      lines: pattern(theme),
      good: theme.good,
      avoid: theme.avoid,
    })),
  );

  const signatures = new Set(guides.map((guide) => guide.lines.join("")));
  if (guides.length !== 184 || signatures.size !== guides.length) {
    throw new Error("今日指引数据必须包含 184 条不重复内容");
  }

  global.GuoxueDailyGuides = Object.freeze(
    guides.map((guide) => Object.freeze({
      lines: Object.freeze(guide.lines),
      good: guide.good,
      avoid: guide.avoid,
    })),
  );
})(window);
