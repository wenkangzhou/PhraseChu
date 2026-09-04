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
    ["I'll let you know.", "我到时候告诉你。", "I'll confirm once I know.", "我确定后告诉你。"],
  ],
  "taking-subway": [
    ["Which line should I take?", "我应该坐哪条线？", "What line do I need?", "我需要坐哪条线？"],
    ["Do I need to transfer?", "我需要换乘吗？", "Is there a direct train?", "有直达车吗？"],
    ["How many stops is it?", "还有几站？", "How much farther is it?", "还要走多远？"],
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

const additionalSeed: Record<string, SeedRow[]> = {
  "running-late": [
    ["Something came up at the last minute.", "临时出了点状况。", "I got held up at the last minute.", "我临时被事情耽搁了。", "B2"],
    ["Go ahead without me.", "你们不用等我，先开始吧。", "Don't wait for me to get started.", "不用等我到了再开始。"],
    ["I'll text you when I'm close.", "我快到的时候给你发消息。", "I'll let you know when I'm almost there.", "我差不多到的时候告诉你。"],
    ["Thanks for waiting for me.", "谢谢你等我。", "I appreciate you waiting.", "谢谢你愿意等。"],
  ],
  "making-plans": [
    ["Does sometime after six work?", "六点以后可以吗？", "Would after six be okay?", "六点以后方便吗？"],
    ["I'm flexible on the time.", "时间上我都可以。", "I can work around your schedule.", "我可以配合你的时间。", "B2"],
    ["Can we take a rain check?", "我们能改天再约吗？", "Could we do this another day?", "我们能换一天吗？", "B2"],
    ["Let's pencil it in for Friday.", "我们先暂定周五吧。", "Let's tentatively plan for Friday.", "我们暂时定在周五吧。", "B2"],
  ],
  "taking-subway": [
    ["Is this train going downtown?", "这趟车去市中心吗？", "Does this train head downtown?", "这趟车是往市中心方向吗？"],
    ["Let's wait for the next train.", "我们等下一班吧。", "The next one should be less crowded.", "下一班应该没那么挤。"],
    ["Which exit should we use?", "我们应该走哪个出口？", "What exit do we need?", "我们需要走哪个出口？"],
    ["The gate won't read my card.", "闸机读不了我的卡。", "My card won't scan.", "我的卡刷不出来。"],
  ],
  "taking-taxi": [
    ["Could you pull over up ahead?", "可以在前面靠边停吗？", "You can stop just past the light.", "过了红绿灯停就行。", "B2"],
    ["Could you avoid the toll roads?", "可以避开收费道路吗？", "I'd rather not take a toll road.", "我不太想走收费道路。", "B2"],
    ["The meter isn't running.", "计价器没有在走。", "Could you turn the meter on?", "可以打开计价器吗？"],
    ["Could you pop the trunk?", "可以打开后备箱吗？", "Could you open the trunk, please?", "请帮我打开后备箱好吗？"],
  ],
  "ordering-food": [
    ["Could I see the menu?", "可以给我看一下菜单吗？", "Can we get a couple of menus?", "可以给我们两份菜单吗？"],
    ["Does this contain any nuts?", "这个里面含坚果吗？", "Are there any nuts in this?", "这道菜里有坚果吗？"],
    ["Could I get the dressing on the side?", "沙拉酱可以另外放吗？", "Can you put the dressing on the side?", "可以把沙拉酱放在旁边吗？", "B2"],
    ["That's all for now.", "暂时就这些。", "I think that's everything.", "我想就这些了。"],
  ],
  "ordering-steak": [
    ["Could you make it medium instead?", "可以改成七分熟吗？", "I'd prefer it medium.", "我想要七分熟。"],
    ["Could I get the sauce on the side?", "酱汁可以另外放吗？", "Can you serve the sauce separately?", "可以把酱汁分开放吗？"],
    ["Is this cut very fatty?", "这个部位脂肪很多吗？", "Does this cut have much fat?", "这个部位肥吗？", "B2"],
    ["This could use another minute on the grill.", "这个可以再煎一分钟。", "Could you cook this a little longer?", "可以再多煎一会儿吗？", "B2"],
  ],
  "paying-bill": [
    ["Do you accept contactless payment?", "可以用非接触式支付吗？", "Can I tap to pay?", "我可以感应支付吗？"],
    ["Could I get a receipt?", "可以给我一张收据吗？", "Can I have the receipt, please?", "请把收据给我好吗？"],
    ["Let's split it evenly.", "我们平摊吧。", "Let's divide it equally.", "我们平均分吧。"],
    ["I'll send you my share.", "我把我那份转给你。", "I'll transfer you what I owe.", "我把欠你的那份转给你。", "B2"],
  ],
  "hotel-checkin": [
    ["Could I check in a little early?", "我可以提前一点入住吗？", "Is early check-in available?", "可以提前入住吗？"],
    ["The room hasn't been cleaned yet.", "房间还没有打扫。", "It looks like the room still needs cleaning.", "这个房间看起来还需要打扫。"],
    ["Could we get two extra towels?", "可以再给我们两条毛巾吗？", "Can you send up a couple of towels?", "可以送两条毛巾上来吗？"],
    ["Could I extend my stay by one night?", "我可以续住一晚吗？", "I'd like to stay one more night.", "我想再住一晚。", "B2"],
  ],
  "airport-checkin": [
    ["What time does boarding start?", "几点开始登机？", "When do we start boarding?", "我们什么时候开始登机？"],
    ["Is the flight on time?", "航班准点吗？", "Are we still scheduled to leave on time?", "我们仍然会准时起飞吗？"],
    ["Where can I print my boarding pass?", "我可以在哪里打印登机牌？", "Is there a kiosk for boarding passes?", "有打印登机牌的自助机吗？"],
    ["I have a connecting flight.", "我还要转机。", "I'm catching another flight after this one.", "这班之后我还要赶另一班飞机。"],
  ],
  directions: [
    ["Could you point it out on the map?", "你可以在地图上指出来吗？", "Could you show me where it is on the map?", "你能在地图上告诉我它在哪里吗？"],
    ["How long does it take on foot?", "走路要多久？", "About how long is the walk?", "走过去大概要多久？"],
    ["Did I pass it?", "我是不是走过了？", "Have I gone too far?", "我是不是走太远了？"],
    ["It's across from the bank.", "它在银行对面。", "It's right opposite the bank.", "它就在银行正对面。"],
  ],
  "small-talk": [
    ["How was your weekend?", "你周末过得怎么样？", "Did you do anything fun this weekend?", "你周末做了什么有意思的事吗？"],
    ["I've heard a lot about you.", "我听说过很多关于你的事。", "It's great to finally meet you.", "很高兴终于见到你。", "B2"],
    ["So, what brings you here?", "所以，你怎么会来这里？", "What made you decide to come?", "是什么让你决定来的？", "B2"],
    ["I'd better let you get back to it.", "我还是不打扰你继续忙了。", "I'll let you get back to what you were doing.", "你继续忙刚才的事吧。", "B2"],
  ],
  weather: [
    ["It's supposed to clear up later.", "晚些时候应该会放晴。", "The skies should clear later on.", "晚点天空应该会放晴。", "B2"],
    ["There's a nice breeze today.", "今天有阵很舒服的微风。", "The breeze feels really nice.", "这阵风感觉很舒服。"],
    ["It feels colder than it looks.", "体感比看起来更冷。", "It's chillier than I thought.", "比我想的更冷。"],
    ["We got caught in the rain.", "我们被雨淋了。", "It started raining while we were out.", "我们在外面时开始下雨了。"],
  ],
  suggestions: [
    ["Why don't we sleep on it?", "我们考虑一晚再决定吧。", "Let's think it over tonight.", "我们今晚再考虑一下。", "B2"],
    ["Maybe we should compare our options.", "也许我们应该比较一下选择。", "Let's look at the alternatives first.", "我们先看看其他方案吧。", "B2"],
    ["How about we meet halfway?", "我们各让一步怎么样？", "Maybe we can find a middle ground.", "也许我们能找到一个折中方案。", "B2"],
    ["We can always change it later.", "之后我们随时可以改。", "Nothing is set in stone yet.", "现在还没有最终定下来。", "B2"],
  ],
  agreeing: [
    ["You may be right about that.", "那件事上你可能是对的。", "I think you have a point there.", "我觉得你这点说得有道理。"],
    ["I'm with you on that.", "这件事我赞同你。", "We're on the same page there.", "这点上我们的想法一致。", "B2"],
    ["I agree up to a point.", "我在一定程度上同意。", "I agree with part of what you're saying.", "我同意你说的一部分。", "B2"],
    ["I'm not convinced that's the best option.", "我不太相信那是最好的选择。", "I'm still not sold on that idea.", "我还是不太认同那个想法。", "B2"],
  ],
  "asking-help": [
    ["Could you explain that one more time?", "你可以再解释一遍吗？", "Could you go over that again?", "你可以再讲一遍吗？"],
    ["Can you show me where I went wrong?", "你能告诉我哪里做错了吗？", "Could you point out my mistake?", "你可以指出我的错误吗？"],
    ["What am I missing here?", "我这里漏掉了什么？", "Is there something I'm overlooking?", "是不是有什么我没注意到？", "B2"],
    ["Thanks, I owe you one.", "谢谢，我欠你个人情。", "I'll return the favor sometime.", "下次我会还你这个人情。", "B2"],
  ],
  "work-progress": [
    ["We're on track to finish by Friday.", "我们有望按计划在周五前完成。", "We should still meet the Friday deadline.", "我们应该仍能赶上周五的截止日期。", "B2"],
    ["I'm waiting on a response.", "我在等回复。", "I can't move forward until I hear back.", "收到回复前我没法继续推进。", "B2"],
    ["This is taking longer than expected.", "这比预期花的时间更长。", "It's a bit more involved than I thought.", "这比我想的稍微复杂一些。", "B2"],
    ["I'll keep you posted.", "我会随时告诉你进展。", "I'll update you as things move along.", "有进展我会告诉你。", "B2"],
  ],
  bugs: [
    ["The issue seems to be intermittent.", "这个问题似乎是间歇性出现的。", "It only happens from time to time.", "它只是偶尔发生。", "B2"],
    ["It works after I refresh the page.", "刷新页面后就能用了。", "Reloading the page fixes it temporarily.", "重新加载页面能暂时解决。"],
    ["Could you send me a screenshot?", "你可以发一张截图给我吗？", "Can you capture what you're seeing?", "你能把看到的内容截下来吗？"],
    ["We need a temporary workaround.", "我们需要一个临时的解决办法。", "We need a short-term fix for now.", "我们现在需要一个短期修复方案。", "B2"],
  ],
  running: [
    ["I'm trying to keep a steady pace.", "我在努力保持稳定配速。", "I'm focusing on running at an even pace.", "我在专注于匀速跑。", "B2"],
    ["I need to work on my endurance.", "我需要提升耐力。", "I want to build up my stamina.", "我想增强体力。", "B2"],
    ["I had to slow down halfway through.", "跑到一半时我不得不减速。", "I eased off the pace halfway in.", "跑到一半时我放慢了配速。", "B2"],
    ["Let's do a short recovery run.", "我们来一次短距离恢复跑吧。", "Let's keep today's run short and easy.", "今天我们短距离轻松跑吧。"],
  ],
  "travel-talk": [
    ["We ended up staying an extra night.", "结果我们多住了一晚。", "We decided to extend the trip by a day.", "我们决定把旅行延长一天。", "B2"],
    ["The food was one of the highlights.", "美食是这次旅行的一大亮点。", "One of the best parts was the food.", "最棒的部分之一就是美食。", "B2"],
    ["I'd love to go back someday.", "我很想有一天再去。", "I'd definitely visit again.", "我肯定还会再去。"],
    ["We booked everything at the last minute.", "我们所有东西都是临时订的。", "The whole trip came together at the last minute.", "整趟旅行都是临时安排起来的。", "B2"],
  ],
  kids: [
    ["Use your inside voice, please.", "请小声一点。", "Let's use a quieter voice in here.", "我们在这里小声说话吧。"],
    ["Do you need help with that?", "你需要我帮忙吗？", "Would you like me to help you?", "你想让我帮你吗？"],
    ["Let's take turns.", "我们轮流来吧。", "You can have a turn after me.", "我之后轮到你。"],
    ["You need to put your shoes on.", "你需要把鞋穿上。", "Let's get your shoes on.", "我们把鞋穿上吧。"],
  ],
};

export const expressions: Expression[] = Object.entries(seed).flatMap(([scenarioId, rows]) => {
  const scenario = scenarioById(scenarioId);
  if (!scenario) throw new Error(`Unknown scenario: ${scenarioId}`);

  return [...rows, ...(additionalSeed[scenarioId] ?? [])].map(([text, meaning, variant, variantMeaning, level = "B1"], index) => {
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
