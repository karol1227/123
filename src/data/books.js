/** 书籍库：按心情匹配推荐与摘录 */
export const books = {
  "little-prince": {
    title: "《小王子》",
    author: "圣埃克苏佩里",
    excerpt:
      "「只有用心才能看得清楚，本质的东西眼睛是看不见的。」你在人群里说的那些话，也许正是在等待一个能用心听懂的人。",
    excerptFrom: "狐狸与小王子的对话",
  },
  "grocery": {
    title: "《解忧杂货店》",
    author: "东野圭吾",
    excerpt:
      "「人与人之间往往都在互相伤害，但也在互相治愈。」那些说不出口的委屈，并不是不重要，只是还没有遇到合适的时机与对象。",
    excerptFrom: "浪矢杂货店的信",
  },
  "stationery": {
    title: "《山茶文具店》",
    author: "小川糸",
    excerpt:
      "「字，是写给自己看的，也是写给别人看的。」你不必把感受整理得完美，慢慢写、慢慢说，本身就是一种疗愈。",
    excerptFrom: "代笔人的工作笔记",
  },
  "frog": {
    title: "《蛤蟆先生去看心理医生》",
    author: "罗伯特·戴博德",
    excerpt:
      "「必须完成的事情，唯有靠你自己完成。」但完成不等于独自硬扛——允许自己求助，也是成长的一部分。",
    excerptFrom: "苍鹭与蛤蟆的对话",
  },
  "life-worth": {
    title: "《人间值得》",
    author: "中村恒子",
    excerpt:
      "「人生不必太用力，坦率地接受每一天。」感到疲惫时，不必逼自己立刻振作，先休息，也是一种前进。",
    excerptFrom: "中村恒子的人生笔记",
  },
  "mindfulness": {
    title: "《正念的奇迹》",
    author: "一行禅师",
    excerpt:
      "「当下是你唯一真正拥有的时刻。」当生活太满、太急，不妨先停下来，呼吸一下——你不需要一次解决所有事。",
    excerptFrom: "正念修习篇",
  },
  "cloud": {
    title: "《云边有个小卖部》",
    author: "张嘉佳",
    excerpt:
      "「有些人不属于自己，但是遇见了也弥足珍贵。」被理解很难，但你值得被温柔对待，包括被你自己。",
    excerptFrom: "云边镇的故事",
  },
  "three": {
    title: "《我们仨》",
    author: "杨绛",
    excerpt:
      "「世间好物不坚牢，彩云易散琉璃脆。」生活不总是「挺好」，承认复杂与脆弱，反而是一种真实的力量。",
    excerptFrom: "杨绛回忆录",
  },
  "courage": {
    title: "《被讨厌的勇气》",
    author: "岸见一郎 / 古贺史健",
    excerpt:
      "「决定我们自身的不是过去的经历，而是我们赋予经历的意义。」说「没事」的背后，也许藏着还没准备好讲述的故事——那也没关系。",
    excerptFrom: "哲人与青年的对话",
  },
};

const scenarioBookMap = {
  fine: "courage",
  whatever: "life-worth",
  forget: "grocery",
  good: "three",
  trouble: "cloud",
  busy: "mindfulness",
};

const moodBookRules = [
  {
    keywords: ["没事", "没关系", "不用担心", "真的没事"],
    emotions: ["隐忍", "孤独", "渴望被看见"],
    bookId: "courage",
    reason: "你习惯把感受藏起来，这本书会温柔地告诉你：被看见、被理解，是可以慢慢练习的事。",
  },
  {
    keywords: ["随便", "都行", "你决定", "听你的"],
    emotions: ["疲惫", "失落"],
    bookId: "life-worth",
    reason: "当你觉得「什么都无所谓」时，往往是因为太累了。这本书像一位温和的长辈，陪你把节奏慢下来。",
  },
  {
    keywords: ["算了", "不重要", "无所谓"],
    emotions: ["失望", "委屈"],
    bookId: "grocery",
    reason: "那些选择「算了」的时刻，心里其实还留着温度。这本书关于被倾听、被回应，也许能触碰到你。",
  },
  {
    keywords: ["忙", "没时间", "以后再说", "等有空"],
    emotions: ["压力", "回避"],
    bookId: "mindfulness",
    reason: "你需要的也许不是更努力，而是片刻的喘息。这本书教你如何在忙碌里，找回一点属于自己的空间。",
  },
  {
    keywords: ["不用", "别麻烦", "自己来", "不用管"],
    emotions: ["体贴", "自我压抑", "孤独"],
    bookId: "cloud",
    reason: "不想麻烦别人，是因为你太在意他人。这本书会提醒你：接受一点照顾，并不是软弱。",
  },
  {
    keywords: ["挺好", "还不错", "都可以", "还行"],
    emotions: ["礼貌", "回避", "复杂"],
    bookId: "three",
    reason: "当「挺好」成为习惯，真实的感受可能被藏了起来。这本书关于亲情与失去，温柔而诚实。",
  },
  {
    keywords: ["累", "疲惫", "撑不住", "好难"],
    emotions: ["疲惫", "无助"],
    bookId: "stationery",
    reason: "疲惫时需要被温柔对待，而不是被催促。这本书的字里行间，都是缓慢而细致的治愈。",
  },
  {
    keywords: ["孤独", "一个人", "没人", "没人懂"],
    emotions: ["孤独", "渴望连接"],
    bookId: "little-prince",
    reason: "孤独感往往来自「无人懂我」。这本书会告诉你：真正的连接，从「用心看见」开始。",
  },
];

const defaultBookId = "little-prince";
const defaultReason =
  "每颗心都有它此刻需要的文字。这本书关于理解与陪伴，愿其中某句话，能轻轻落在你心上。";

export function recommendBook(text, analysis = {}, scenarioId = null) {
  let bookId = defaultBookId;
  let reason = defaultReason;

  if (scenarioId && scenarioBookMap[scenarioId]) {
    bookId = scenarioBookMap[scenarioId];
    const rule = moodBookRules.find((r) => r.bookId === bookId);
    reason = rule?.reason || defaultReason;
  } else {
    const normalized = (text || "").trim();
    for (const rule of moodBookRules) {
      const keywordHit = rule.keywords.some((kw) => normalized.includes(kw));
      const emotionHit = (analysis.emotions || []).some((e) =>
        rule.emotions.some((re) => e.includes(re) || re.includes(e))
      );
      if (keywordHit || emotionHit) {
        bookId = rule.bookId;
        reason = rule.reason;
        break;
      }
    }
  }

  const book = books[bookId] || books[defaultBookId];
  const emotion = analysis.emotions?.[0];

  return {
    ...book,
    reason: emotion
      ? reason.replace(/^/, `感受到你此刻的「${emotion}」，`)
      : reason,
  };
}
