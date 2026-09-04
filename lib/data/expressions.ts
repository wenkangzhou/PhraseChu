import type { Expression, Level } from "@/types/domain";
import { scenarioById } from "./catalog";

type SeedRow = [text: string, meaning: string, variant: string, variantMeaning: string, level?: Level];

const seed: Record<string, SeedRow[]> = {
  "running-late": [
    ["I'm running late.", "我要迟到了。", "I'm going to be late.", "我要晚到了。"],
    ["I'm running about ten minutes late.", "我大概要迟到十分钟。", "I'm about ten minutes behind.", "我大概晚十分钟。"],
    ["Sorry I'm late.", "抱歉我迟到了。", "Sorry to keep you waiting.", "抱歉让你久等了。"],
    ["I'm on my way.", "我已经在路上了。", "I'm heading over now.", "我现在正赶过去。"],
    ["I'll be there in ten minutes.", "我十分钟后到。", "I should be there by eight.", "我应该八点前到。"],
    ["Traffic is worse than I expected.", "路况比我想象的更差。", "I got stuck in traffic.", "我堵在路上了。", "B2"],
  ],
  "making-plans": [
    ["Are you free this weekend?", "你这周末有空吗？", "Do you have any plans this weekend?", "你这周末有什么安排吗？"],
    ["What time works for you?", "几点对你方便？", "When would be good for you?", "你什么时候方便？"],
    ["That works for me.", "我可以，那个时间合适。", "That sounds good to me.", "我觉得可以。"],
    ["I'm good with that.", "我觉得可以。", "That works on my end.", "我这边没问题。"],
    ["Let's play it by ear.", "我们到时候看情况吧。", "We can decide when we get there.", "我们到了再决定。", "B2"],
    ["I'll let you know.", "我到时候告诉你。", "I'll get back to you.", "我晚点回复你。"],
  ],
  "taking-subway": [
    ["Which line should I take?", "我应该坐哪条线？", "What line do I need?", "我需要坐哪条线？"],
    ["Do I need to transfer?", "我需要换乘吗？", "Is there a direct train?", "有直达车吗？"],
    ["How many stops is it?", "还有几站？", "How far is it from here?", "离这里有多远？"],
    ["This train is packed.", "这班车挤满了。", "It's really crowded today.", "今天真的很挤。"],
    ["I think we missed our stop.", "我觉得我们坐过站了。", "We went one stop too far.", "我们多坐了一站。"],
    ["Let's get off at the next stop.", "我们下一站下车吧。", "We should get off here.", "我们应该在这里下车。"],
  ],
  "taking-taxi": [
    ["Could you take me to this address?", "可以送我去这个地址吗？", "I'm going to this address.", "我要去这个地址。"],
    ["How long will it take?", "大概要多久？", "How far is it from here?", "从这里过去有多远？"],
    ["Could you drop me off here?", "可以让我在这里下车吗？", "Right here is fine.", "停这里就可以。"],
    ["Please take the fastest route.", "请走最快的路线。", "Whichever way is fastest is fine.", "哪条路最快就走哪条。"],
    ["Can I pay by card?", "可以刷卡吗？", "Do you take cards?", "你们接受刷卡吗？"],
    ["Could you turn the air down a little?", "可以把空调调小一点吗？", "Could you make it a little warmer?", "可以调暖一点吗？", "B2"],
  ],
  "ordering-food": [
    ["What do you recommend?", "你推荐什么？", "What's popular here?", "这里什么最受欢迎？"],
    ["Can I get this without onions?", "这个可以不要洋葱吗？", "Could you leave out the onions?", "可以不放洋葱吗？"],
    ["I'm not really into spicy food.", "我不是很喜欢辣的。", "I can't handle much spice.", "我不太能吃辣。", "B2"],
    ["I'll have the same.", "我要和他一样的。", "I'll get what she's having.", "我要和她一样的。"],
    ["Could we get some water?", "可以给我们一些水吗？", "Can we have two glasses of water?", "可以给我们两杯水吗？"],
    ["We're ready to order.", "我们可以点餐了。", "I think we're ready.", "我想我们准备好了。"],
  ],
  "ordering-steak": [
    ["Can I get the filet mignon?", "我可以要一份菲力牛排吗？", "I'll have the filet mignon.", "我要菲力牛排。", "B2"],
    ["Medium rare, please.", "五分熟，谢谢。", "I'd like it medium rare.", "我要五分熟。"],
    ["What does that come with?", "那道菜配什么？", "What sides are included?", "包含哪些配菜？"],
    ["Could I swap the fries for a salad?", "我可以把薯条换成沙拉吗？", "Can I get a salad instead of fries?", "我可以用沙拉代替薯条吗？", "B2"],
    ["This is a little overcooked.", "这个有点煎过头了。", "I ordered this medium rare.", "我点的是五分熟。", "B2"],
    ["The steak is really tender.", "这牛排真的很嫩。", "It practically melts in your mouth.", "它几乎入口即化。", "B2"],
  ],
  "paying-bill": [
    ["Could we get the check?", "可以买单吗？", "Can we have the bill, please?", "请给我们账单好吗？"],
    ["Can we split the bill?", "我们可以分开买单吗？", "Could we pay separately?", "我们可以各付各的吗？"],
    ["I'll get this one.", "这次我来付。", "This one's on me.", "这次我请客。"],
    ["Is service included?", "服务费包含了吗？", "Does this include the tip?", "这里包含小费了吗？"],
    ["Can we get this to go?", "这个可以打包吗？", "Could you box this up for us?", "可以帮我们把这个打包吗？"],
    ["Keep the change.", "不用找了。", "You can keep the change.", "零钱不用找了。"],
  ],
  "hotel-checkin": [
    ["I have a reservation under Chen.", "我用 Chen 这个名字订了房。", "The booking is under Chen.", "预订人是 Chen。"],
    ["Is breakfast included?", "包含早餐吗？", "Does the room come with breakfast?", "房间含早餐吗？"],
    ["What time is check-out?", "几点退房？", "When do I need to check out?", "我需要几点退房？"],
    ["Could I get a room on a higher floor?", "可以给我高楼层的房间吗？", "Do you have anything on a higher floor?", "有更高楼层的房间吗？", "B2"],
    ["The Wi-Fi doesn't seem to be working.", "Wi-Fi 好像不能用。", "I can't connect to the Wi-Fi.", "我连不上 Wi-Fi。"],
    ["Could you hold my luggage?", "可以帮我寄存行李吗？", "Can I leave my bags here?", "我可以把行李放在这里吗？"],
  ],
  "airport-checkin": [
    ["I'd like to check in for my flight.", "我想办理登机手续。", "I'm here to check in.", "我是来办理登机的。"],
    ["Can I have an aisle seat?", "可以给我一个靠过道的座位吗？", "Is an aisle seat available?", "有靠过道的座位吗？"],
    ["Do I need to check this bag?", "这个包需要托运吗？", "Can I take this as a carry-on?", "这个可以随身带吗？"],
    ["Where is the security checkpoint?", "安检口在哪里？", "Which way is security?", "安检往哪边走？"],
    ["Has the gate changed?", "登机口变了吗？", "Is it still the same gate?", "还是原来的登机口吗？"],
    ["The flight has been delayed.", "航班延误了。", "We're running about an hour behind.", "我们大约晚一个小时。"],
  ],
  directions: [
    ["Excuse me, how do I get to the station?", "请问，去车站怎么走？", "Could you tell me the way to the station?", "可以告诉我去车站怎么走吗？"],
    ["Is it within walking distance?", "走路能到吗？", "Can I walk there from here?", "我可以从这里走过去吗？", "B2"],
    ["Am I going the right way?", "我走的方向对吗？", "Is this the way to downtown?", "这是去市中心的方向吗？"],
    ["It's just around the corner.", "就在拐角附近。", "It's right around the corner.", "就在前面的拐角处。"],
    ["Go straight for two blocks.", "直走两个街区。", "Keep going straight.", "继续直走。"],
    ["You can't miss it.", "你肯定能看到。", "It'll be on your left.", "它会在你的左手边。"],
  ],
  "small-talk": [
    ["How's your day going?", "你今天过得怎么样？", "How's everything going?", "最近怎么样？"],
    ["What have you been up to?", "你最近在忙什么？", "What have you been doing lately?", "你最近都在做什么？", "B2"],
    ["It's been a while.", "好久不见。", "Long time no see.", "好久不见。"],
    ["That sounds like fun.", "听起来很有意思。", "That must have been fun.", "那一定很有趣。"],
    ["How do you know everyone here?", "你是怎么认识这里这些人的？", "How do you know the host?", "你怎么认识主人的？"],
    ["It was nice talking to you.", "很高兴和你聊天。", "I'm glad we got to chat.", "很高兴我们聊了聊。"],
  ],
  weather: [
    ["It's nicer out than I expected.", "外面天气比我想象的好。", "The weather turned out great.", "结果天气很好。"],
    ["It looks like it's going to rain.", "看起来要下雨了。", "It might rain later.", "晚点可能会下雨。"],
    ["It's been so humid lately.", "最近一直很潮湿。", "The humidity is intense today.", "今天湿度很高。", "B2"],
    ["The temperature dropped overnight.", "夜里气温下降了。", "It got much colder overnight.", "一夜之间冷了很多。", "B2"],
    ["It's perfect weather for a run.", "这是跑步的好天气。", "I couldn't ask for better weather.", "天气好得不能再好了。", "B2"],
    ["Make sure you bring a jacket.", "记得带件外套。", "You might want to bring a jacket.", "你最好带件外套。"],
  ],
  suggestions: [
    ["Why don't we try somewhere new?", "我们为什么不试试新地方？", "How about trying somewhere new?", "试试新地方怎么样？"],
    ["We could go for a walk.", "我们可以去散散步。", "Do you feel like taking a walk?", "你想去散步吗？"],
    ["You might want to book ahead.", "你最好提前预订。", "I'd book in advance if I were you.", "如果我是你，我会提前预订。", "B2"],
    ["I'd recommend going early.", "我建议早点去。", "It's better if you go early.", "早点去比较好。"],
    ["Let's keep it simple.", "我们简单一点吧。", "There's no need to overthink it.", "没必要想得太复杂。", "B2"],
    ["It's worth a try.", "值得一试。", "It wouldn't hurt to try.", "试一下也无妨。", "B2"],
  ],
  agreeing: [
    ["I completely agree.", "我完全同意。", "I couldn't agree more.", "我非常同意。"],
    ["That's a good point.", "你说得有道理。", "I hadn't thought of it that way.", "我之前没那样想过。", "B2"],
    ["I see what you mean.", "我明白你的意思。", "I get where you're coming from.", "我理解你的立场。", "B2"],
    ["I'm not sure I agree.", "我不确定我同意。", "I see it a little differently.", "我的看法有点不同。"],
    ["That depends on the situation.", "那要看具体情况。", "It really depends.", "这确实要看情况。"],
    ["Let's agree to disagree.", "我们保留各自意见吧。", "We may have to disagree on this one.", "这件事上我们可能意见不同。", "B2"],
  ],
  "asking-help": [
    ["Could you give me a hand?", "你能帮我一下吗？", "Could you help me out?", "你能帮帮我吗？"],
    ["Would you mind showing me how?", "你介意示范一下吗？", "Can you walk me through it?", "你能带我过一遍吗？", "B2"],
    ["I'm having trouble with this.", "我做这个有点困难。", "I can't seem to get this to work.", "我好像弄不成这个。"],
    ["Could you take a quick look?", "你能快速看一下吗？", "Do you have a minute to look at this?", "你有时间看一下这个吗？"],
    ["I really appreciate your help.", "非常感谢你的帮助。", "Thanks, that was really helpful.", "谢谢，这真的很有帮助。"],
    ["I've got it from here.", "接下来我自己来就行。", "I can take it from here.", "后面我可以自己处理。", "B2"],
  ],
  "work-progress": [
    ["I should be able to get it done today.", "我今天应该能搞定。", "I can probably finish it today.", "我今天大概能完成。", "B2"],
    ["I'm still working on it.", "我还在处理。", "It's still in progress.", "还在进行中。"],
    ["I'll take a look.", "我来看一下。", "Let me have a look.", "让我看一下。"],
    ["Let me check.", "我确认一下。", "Give me a moment to check.", "给我一点时间确认。"],
    ["I haven't figured it out yet.", "我还没搞明白。", "I'm still trying to work it out.", "我还在想办法解决。", "B2"],
    ["I'll get back to you.", "我晚点回复你。", "I'll follow up once I know more.", "有更多信息后我会跟进。", "B2"],
  ],
  bugs: [
    ["It looks like a bug.", "看起来像是个 Bug。", "This seems to be a bug.", "这似乎是个 Bug。"],
    ["I can reproduce the issue.", "我可以复现这个问题。", "I managed to reproduce it.", "我成功复现了。", "B2"],
    ["It only happens on mobile.", "它只在移动端发生。", "I only see it on my phone.", "我只在手机上遇到。"],
    ["The page keeps crashing.", "这个页面一直崩溃。", "The app closes unexpectedly.", "应用会意外关闭。"],
    ["I'll dig into the logs.", "我会深入检查日志。", "I'll check the logs for clues.", "我会查看日志寻找线索。", "B2"],
    ["The fix is ready for review.", "修复已经可以评审了。", "I've opened a pull request with the fix.", "我已经提交了修复的 PR。", "B2"],
  ],
  running: [
    ["I went for a run this morning.", "我今天早上去跑步了。", "I got a run in this morning.", "我今天早上抽空跑了步。"],
    ["I'm training for a marathon.", "我正在备战马拉松。", "I've got a marathon coming up.", "我很快要参加马拉松。"],
    ["I'm taking it easy today.", "我今天轻松跑。", "Today is an easy run.", "今天是轻松跑。"],
    ["My legs feel heavy.", "我感觉腿很沉。", "My legs haven't recovered yet.", "我的腿还没恢复。"],
    ["I managed to push through.", "我还是坚持过去了。", "I kept going even though it was hard.", "虽然很难，我还是坚持了。", "B2"],
    ["I ran out of energy near the end.", "快结束的时候我没力了。", "I hit the wall near the end.", "快结束时我撞墙了。", "B2"],
  ],
  "travel-talk": [
    ["I've always wanted to go there.", "我一直想去那里。", "That place has been on my list for years.", "那个地方在我的愿望清单上很多年了。"],
    ["How long are you staying?", "你要待多久？", "When are you heading back?", "你什么时候回去？"],
    ["We went a little off the beaten path.", "我们去了比较小众的地方。", "We stayed away from the tourist areas.", "我们避开了旅游区。", "B2"],
    ["The view was breathtaking.", "景色美得令人屏息。", "The view was absolutely stunning.", "景色真的绝美。", "B2"],
    ["I like to travel light.", "我喜欢轻装旅行。", "I only bring the essentials.", "我只带必需品。"],
    ["It was worth the long trip.", "这么远的旅程很值得。", "I'd make the trip again.", "我愿意再去一次。"],
  ],
  kids: [
    ["Did you have fun today?", "你今天玩得开心吗？", "What was the best part of your day?", "你今天最开心的是什么？"],
    ["Let's get ready for bed.", "我们准备睡觉吧。", "It's almost bedtime.", "快到睡觉时间了。"],
    ["Take your time.", "慢慢来。", "There's no need to rush.", "不用着急。"],
    ["You can try again.", "你可以再试一次。", "Let's give it another try.", "我们再试一次吧。"],
    ["I'm proud of you for trying.", "我为你的尝试感到骄傲。", "You did a great job sticking with it.", "你坚持下来做得很好。", "B2"],
    ["Please put your toys away.", "请把玩具收好。", "Let's clean up together.", "我们一起收拾吧。"],
  ],
};

export const expressions: Expression[] = Object.entries(seed).flatMap(([scenarioId, rows]) => {
  const scenario = scenarioById(scenarioId);
  if (!scenario) throw new Error(`Unknown scenario: ${scenarioId}`);

  return rows.map(([text, meaning, variant, variantMeaning, level = "B1"], index) => {
    const id = `${scenarioId}-${index + 1}`;
    const keywordTags = text
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 4)
      .slice(0, 3);

    return {
      id,
      text,
      meaning,
      level,
      themeId: scenario.themeId,
      scenarioId,
      frequency: 8,
      usefulness: 9,
      examples: [{ id: `${id}-example`, english: text, chinese: meaning }],
      variants: [{ id: `${id}-variant`, text: variant, meaning: variantMeaning }],
      notes: index === 0 ? `A natural expression for ${scenario.title.toLowerCase()}.` : undefined,
      tags: [scenario.themeId, scenarioId, ...keywordTags],
      source: "seed" as const,
      createdAt: "2026-09-04T00:00:00.000Z",
    };
  });
});
