(function initializeDailyGuides(global) {
  const themes = [
    { focus: "心绪", action: "先安顿内心，再理清轻重", result: "方向会在安静中渐渐明朗", good: "静心梳理", avoid: "急于求成" },
    { focus: "专注", action: "收拢精力，做好眼前一事", result: "微小进展也能积成笃定", good: "专注当下", avoid: "贪多分心" },
    { focus: "沟通", action: "放缓语气，认真听完对方", result: "真诚回应更容易换来理解", good: "坦诚交流", avoid: "意气争辩" },
    { focus: "行动", action: "把想法化成一个具体步骤", result: "迈出第一步便会打开新局", good: "立即行动", avoid: "反复犹豫" },
    { focus: "学习", action: "温故知新，补齐薄弱之处", result: "日积小功终能看见成长", good: "沉心学习", avoid: "浅尝辄止" },
    { focus: "整理", action: "清理积压，也为生活留白", result: "有序的环境会带来清明", good: "收纳清理", avoid: "继续拖延" },
    { focus: "休息", action: "放慢脚步，照顾身体感受", result: "养足精神才能从容应对", good: "规律作息", avoid: "过度劳累" },
    { focus: "关系", action: "多给身边的人一分善意", result: "温暖往来会滋养彼此", good: "关怀他人", avoid: "冷言相向" },
    { focus: "边界", action: "分清责任，守住内心尺度", result: "懂得取舍才能安稳前行", good: "量力而行", avoid: "勉强逞强" },
    { focus: "复盘", action: "回看得失，记下真实经验", result: "看清来路便能走稳下一程", good: "总结反思", avoid: "重蹈旧误" },
    { focus: "新事", action: "带着准备尝试新的可能", result: "勇敢探索会带来新的眼界", good: "开启新事", avoid: "畏缩不前" },
    { focus: "财务", action: "核清收支，珍惜手中所得", result: "稳健安排比一时冲动长久", good: "理性规划", avoid: "冲动消费" },
    { focus: "工作", action: "明确重点，依次完成任务", result: "稳扎稳打自会赢得信任", good: "推进要事", avoid: "本末倒置" },
    { focus: "家庭", action: "耐心陪伴，主动表达关心", result: "家中和气会成为心的依靠", good: "陪伴家人", avoid: "忽略感受" },
    { focus: "健康", action: "留意饮食起居与身体信号", result: "细心养护能积蓄长久活力", good: "舒展身心", avoid: "透支体力" },
    { focus: "选择", action: "核对事实，再听一听本心", result: "不被催促便更容易选对方向", good: "审慎决定", avoid: "盲目跟随" },
    { focus: "耐心", action: "允许事情按自己的节奏生长", result: "守得住过程才能等到花开", good: "耐心等待", avoid: "拔苗助长" },
    { focus: "观察", action: "留心细节，也看清前后关联", result: "先察后行可以少走弯路", good: "核对细节", avoid: "粗心大意" },
    { focus: "合作", action: "讲清目标，也尊重不同意见", result: "彼此补位会让事情更顺畅", good: "协力共进", avoid: "独断专行" },
    { focus: "感恩", action: "记得所得，也回应他人善意", result: "心怀珍惜会看见更多丰盛", good: "表达感谢", avoid: "视为当然" },
    { focus: "取舍", action: "放下无益消耗，留下真正重要", result: "轻装之后道路会更加开阔", good: "果断取舍", avoid: "纠缠不休" },
    { focus: "准备", action: "提前检查，把基础做得扎实", result: "有备而行便能减少慌乱", good: "提前筹备", avoid: "临时应付" },
    { focus: "节奏", action: "张弛有度，不与旁人比较", result: "走稳自己的路便自有收获", good: "从容安排", avoid: "急躁冒进" },
  ];

  const patterns = [
    (theme) => [
      `今日从${theme.focus}处用心，稳住步伐，`,
      `${theme.action}，不慌不忙，`,
      `${theme.result}。`,
    ],
    (theme) => [
      `晨起观照${theme.focus}，宜缓不宜急，`,
      `${theme.action}，专心投入，`,
      `${theme.result}。`,
    ],
    (theme) => [
      `顺势而行，先照看好${theme.focus}，`,
      `${theme.action}，一步一程，`,
      `${theme.result}。`,
    ],
    (theme) => [
      `心定事明，今日留意${theme.focus}，`,
      `${theme.action}，守正而行，`,
      `${theme.result}。`,
    ],
    (theme) => [
      `不疾不徐，从${theme.focus}中寻找秩序，`,
      `${theme.action}，把握分寸，`,
      `${theme.result}。`,
    ],
    (theme) => [
      `今日贵在守稳${theme.focus}，少些纷扰，`,
      `${theme.action}，循序渐进，`,
      `${theme.result}。`,
    ],
    (theme) => [
      `向内求静，向外照见${theme.focus}，`,
      `${theme.action}，认真落步，`,
      `${theme.result}。`,
    ],
    (theme) => [
      `岁月从容，今日以${theme.focus}为念，`,
      `${theme.action}，留有余地，`,
      `${theme.result}。`,
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
