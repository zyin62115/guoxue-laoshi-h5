(function initializeChatReplies(global) {
  const rules = [
    {
      keywords: ["生病", "疾病", "症状", "药物", "治疗", "医院", "法律", "律师", "诉讼", "合同"],
      reply:
        "这件事涉及专业判断，国学的修身之道可以帮助你安定心绪，却不能替代医生、律师或其他专业人士的意见。\n\n先保存相关信息并尽快咨询合适的专业人员；在等待期间，照顾好自己的作息与情绪，不要独自承担风险。",
    },
    {
      keywords: ["学习", "考试", "读书", "成绩", "复习", "功课"],
      reply:
        "学贵有恒，不在一时之速。先把最重要的一门功课定下来，每日专注一段固定时间，温故而知新。\n\n心静则思清，步稳则路远。今日先完成一个可以落实的小目标，积累自然会显现。",
    },
    {
      keywords: ["工作", "事业", "选择", "机会", "职业", "辞职", "创业"],
      reply:
        "事缓则圆，谋定而后动。先分清哪些是你能掌握的，哪些需要等待时机，再从最重要的一步开始。\n\n不必急于求成，也不要因犹豫停滞。把眼前可做之事做好，局面会在行动中逐渐明朗。",
    },
    {
      keywords: ["焦虑", "烦恼", "难过", "压力", "迷茫", "情绪", "害怕"],
      reply:
        "心有所扰时，先不急着作决定。停一停，缓缓呼吸，把纷杂的念头写下来，只处理眼前最要紧的一件事。\n\n静能生定，定能生慧。允许自己慢一点，情绪安稳之后，再看问题往往会多一条路。",
    },
    {
      keywords: ["家庭", "朋友", "感情", "相处", "沟通", "父母", "伴侣"],
      reply:
        "和而不同，是相处之道。先听清彼此真正关切的是什么，再用平和而具体的话表达自己的感受与边界。\n\n诚恳不等于勉强，体谅也不是一味退让。留一分余地，关系才有转圜和生长的空间。",
    },
  ];

  const fallback =
    "你所问之事，不妨先从正心开始：看清自己的真实愿望，也看清眼前的条件与限制。\n\n把大问题拆成今天能够完成的一小步，做完再观其变化。顺势而为，并非等待，而是在合适的方向上稳稳前行。";

  function getReply(question, context = null, hasImage = false) {
    if (hasImage) {
      const imageReply = question
        ? `我已收到你上传的图片和补充问题“${question}”。当前为前端演示，我暂时不能识别图片内容；你可以继续用文字描述图片中希望咨询的部分。`
        : "我已收到你上传的图片。当前为前端演示，我暂时不能识别图片内容；你可以继续用文字描述图片中希望咨询的部分。";
      return context
        ? `关于《${context.sectionTitle}》，${imageReply}`
        : imageReply;
    }
    const matched = rules.find((rule) =>
      rule.keywords.some((keyword) => question.includes(keyword)),
    );
    const reply = matched ? matched.reply : fallback;
    return context
      ? `结合你在《${context.sectionTitle}》报告中的特点来看，${reply}`
      : reply;
  }

  global.GuoxueChatReplies = Object.freeze({ getReply });
})(window);
