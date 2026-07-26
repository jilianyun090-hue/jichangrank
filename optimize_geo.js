const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, 'source', '_posts');

// Helper to extract description from front matter
function getMetaDescription(frontMatter) {
  const match = frontMatter.match(/^description:\s*["']?(.*?)["']?$/m);
  return match ? match[1].trim() : '';
}

// Define replacements for known common headings
const headingReplacements = [
  // 1. General airport and proxy guidelines
  { pattern: /2026年最新机场推荐\s*-\s*稳定高速节点深度解析/i, replacement: "2026年最新且好用稳定的翻墙机场有哪些？最新测速推荐榜单", level: "h2" },
  { pattern: /2026年最新机场推荐/i, replacement: "2026年最新且好用稳定的翻墙机场有哪些？最新测速推荐榜单", level: "h2" },
  { pattern: /为什么选择我们的机场推荐/i, replacement: "为什么选择本站推荐的翻墙机场？有哪些挑选标准？", level: "h3" },
  { pattern: /2026\s*年度顶级机场推荐榜单/i, replacement: "2026年顶级稳定好用的机场推荐排行榜", level: "h2" },
  { pattern: /2026\s*年极具性价比的平价机场精选/i, replacement: "2026年高性价比平价便宜机场有哪些推荐？", level: "h2" },
  { pattern: /科学上网与机场使用避坑指南/i, replacement: "购买与使用科学上网机场有哪些避坑指南与注意事项？", level: "h2" },
  { pattern: /选择平价机场的[“\"]避坑指南[”\"]/i, replacement: "挑选平价便宜机场有哪些注意事项与避坑指南？", level: "h3" },
  { pattern: /选择平价机场的[“\"]避坑指南[”\"]/i, replacement: "挑选平价便宜机场有哪些注意事项与避坑指南？", level: "h2" },
  { pattern: /避坑指南/i, replacement: "购买和使用科学上网机场有哪些避坑指南与注意事项？", level: "h3" },
  { pattern: /不要迷信[“\"]永久免费[”\"]与[“\"]一次性买断[”\"]/i, replacement: "为什么不能迷信“永久免费”和“一次性买断”的机场？", level: "h3" },
  { pattern: /什么是中转与专线/i, replacement: "机场的直连、BGP中转和IPLC/IEPL专线有什么区别？", level: "h3" },
  { pattern: /如何选择合适的套餐流量/i, replacement: "如何根据自己的日常使用情况选择合适的机场套餐流量？", level: "h3" },
  { pattern: /客户端的选择/i, replacement: "科学上网机场有哪些常用且好用的客户端推荐？", level: "h3" },
  { pattern: /便宜机场的适用场景与不足/i, replacement: "便宜平价机场适合哪些使用场景？有哪些局限性？", level: "h2" },
  { pattern: /为什么会有这么便宜的机场/i, replacement: "为什么有些翻墙机场套餐能做到如此便宜？它的成本是如何控制的？", level: "h3" },
  { pattern: /结语/i, replacement: "2026年关于科学上网机场选购的总结与建议", level: "h2" },

  // 2. Individual Airport Reviews
  { pattern: /山水云机场深度评测\s*：\s*中转直连双线，高性价比之选/i, replacement: "山水云机场深度评测：它的线路与性价比表现如何？", level: "h2" },
  { pattern: /秒秒云机场深度评测\s*：\s*中转高速，多媒体GPT全解锁/i, replacement: "秒秒云机场深度评测：它的多媒体与GPT解锁表现如何？", level: "h2" },
  { pattern: /拼好连机场深度评测\s*：\s*BGP\+IEPL专线保障，无视晚高峰/i, replacement: "拼好连机场深度评测：它的高峰抗压与设备限制表现如何？", level: "h2" },
  { pattern: /Lumina机场深度评测\s*：\s*Hysteria2\/AnyTLS 双协议，GoMAMI中转/i, replacement: "Lumina机场深度评测：它的底层协议与中转架构表现如何？", level: "h2" },
  { pattern: /99吧机场深度评测\s*：\s*SS协议加密通道，99台共享王/i, replacement: "99吧机场深度评测：它的SS协议安全性与多设备共享表现如何？", level: "h2" },

  { pattern: /24小时中文客服支持/i, replacement: "该机场是否提供24小时中文客服与售后支持？", level: "h3" },
  { pattern: /性价比分析/i, replacement: "该机场的套餐价格定位与性价比如何？", level: "h3" },
  { pattern: /宇记官网便于记忆/i, replacement: "宇记官网如何记忆？有哪些访问便利？", level: "h3" },
  { pattern: /完全不限连接设备/i, replacement: "该机场在多设备连接上有哪些优势？", level: "h3" },
  { pattern: /灵活实惠的套餐/i, replacement: "该机场的套餐资费和灵活度如何？", level: "h3" },
  { pattern: /SS协议安全防封/i, replacement: "该机场采用SS协议有哪些安全防封优势？", level: "h3" },
  { pattern: /超强设备登陆限制/i, replacement: "该机场在设备登录限制上有何独特优势？", level: "h3" },
  { pattern: /年付低至7\.5元\/月/i, replacement: "该机场年付套餐的性价比表现如何？", level: "h3" },
  { pattern: /购买提示/i, replacement: "购买该机场有哪些注意事项与提示？", level: "h3" },

  // 3. Subscription Links and Guides
  { pattern: /什么是节点订阅链接/i, replacement: "什么是机场节点订阅链接？它起什么作用？", level: "h3" },
  { pattern: /订阅链接的工作原理/i, replacement: "机场订阅链接的具体工作原理是怎样的？", level: "h3" },
  { pattern: /如何防止订阅链接泄露/i, replacement: "如何防止订阅链接泄露并保障流量安全？", level: "h3" },
  { pattern: /常见订阅更新失败及排障/i, replacement: "遇到订阅更新失败有哪些常见原因和排错方法？", level: "h3" },
  { pattern: /1\.\s*软件设置问题/i, replacement: "如何检查和排查客户端的软件设置问题？", level: "h3" },
  { pattern: /2\.\s*线路故障/i, replacement: "机场线路故障时该如何排查与切换？", level: "h3" },
  { pattern: /3\.\s*套餐过期或流量耗尽/i, replacement: "遇到套餐过期或流量耗尽该如何处理？", level: "h3" },

  // 4. Grok AI Guide
  { pattern: /什么是Grok AI/i, replacement: "什么是Grok AI大模型？它有什么特点？", level: "h3" },
  { pattern: /为什么国内无法直接使用Grok/i, replacement: "为什么国内无法直接注册 and 使用Grok？有哪些限制？", level: "h3" },
  { pattern: /准备工作\s*：\s*稳定干净的翻墙节点/i, replacement: "注册Grok需要做哪些节点和网络准备工作？", level: "h3" },
  { pattern: /第一步\s*：\s*获取海外虚拟手机号/i, replacement: "注册Grok时如何获取海外虚拟手机号？", level: "h3" },
  { pattern: /第二步\s*：\s*注册并订阅X Premium/i, replacement: "如何注册X账号并完成Premium订阅以使用Grok？", level: "h3" },
  { pattern: /总结与展望/i, replacement: "2026年Grok使用体验的总结与未来展望", level: "h3" },

  // 5. Shadowrocket Guide
  { pattern: /什么是Shadowrocket\s*（小火箭）/i, replacement: "什么是Shadowrocket（小火箭）客户端？它有什么用途？", level: "h3" },
  { pattern: /第一步\s*：\s*获取美区 Apple ID/i, replacement: "如何获取或注册美区 Apple ID 下载小火箭？", level: "h3" },
  { pattern: /第二步\s*：\s*下载与安装/i, replacement: "iOS设备上如何安全地下载和安装Shadowrocket？", level: "h3" },
  { pattern: /第三步\s*：\s*导入机场节点订阅/i, replacement: "iOS小火箭如何一键导入机场节点订阅？", level: "h3" },
  { pattern: /进阶配置\s*：\s*规则分流与延迟测试/i, replacement: "小火箭如何进行进阶分流规则配置与延迟测试？", level: "h3" },
  { pattern: /常见报错与解决办法/i, replacement: "使用小火箭翻墙有哪些常见报错和解决方法？", level: "h3" },

  // 6. ChatGPT Guide
  { pattern: /🤖\s*ChatGPT 国内使用完整指南\s*（2026 最新版）/i, replacement: "🤖 ChatGPT在国内如何稳定使用？2026最新完整指南", level: "h2" },
  { pattern: /核心前提\s*：\s*你需要一个干净的网络环境\s*（原生 IP）/i, replacement: "核心前提：为什么使用ChatGPT需要一个干净的原生IP网络环境？", level: "h2" },
  { pattern: /为什么我连上了机场还是打不开 ChatGPT/i, replacement: "为什么我连上了机场还是打不开ChatGPT？原理解析", level: "h3" },
  { pattern: /解决方案\s*：\s*使用原生 IP \/ 高级专线节点/i, replacement: "如何通过原生IP和高级专线节点解决ChatGPT访问受限问题？", level: "h3" },
  { pattern: /2026 版 ChatGPT 注册与防封号指南/i, replacement: "2026最新版国内如何注册ChatGPT账号？有哪些实用的防封号指南？", level: "h2" },
  { pattern: /第一步\s*：\s*准备注册材料/i, replacement: "注册ChatGPT需要提前准备哪些材料和环境？", level: "h3" },
  { pattern: /第二步\s*：\s*注册流程/i, replacement: "2026年最新ChatGPT注册的具体图文步骤是什么？", level: "h3" },
  { pattern: /🚨\s*绝对不可忽视的\s*[“\"]防封号[”\"]\s*守则/i, replacement: "🚨 注册并使用ChatGPT有哪些绝对不可忽视的“防封号”守则？", level: "h3" },
  { pattern: /国内免翻墙的替代方案\s*（镜像站与 API）/i, replacement: "国内有哪些免翻墙的ChatGPT替代方案（如国内镜像站与大模型API）？", level: "h2" },
  { pattern: /1\.\s*国内直接可用的优质 AI 大模型/i, replacement: "国内目前有哪些直接可用且优质的国产AI大模型？", level: "h3" },
  { pattern: /2\.\s*第三方套壳\/镜像网站/i, replacement: "什么是第三方ChatGPT套壳与镜像网站？使用时有哪些风险？", level: "h3" },
  { pattern: /进阶玩法\s*：\s*如何写出高质量的 Prompt\s*（提示词）/i, replacement: "进阶技巧：日常使用ChatGPT时如何写出高质量的Prompt提示词？", level: "h2" }
];

function mapHeadingToQuestion(text, level) {
  // If already ends with a question mark (with or without markdown formatting/wrapping)
  if (text.endsWith('？') || text.endsWith('?') || text.endsWith('？**') || text.endsWith('?**') || text.endsWith('？**"') || text.endsWith('?**"')) {
    return text;
  }

  // Pre-clean bold tags for matching
  const cleanText = text.replace(/\*\*/g, '').trim();

  // 1. Try dictionary matching first (highest priority)
  for (const rule of headingReplacements) {
    if (rule.level === level) {
      if (rule.pattern.test(cleanText)) {
        return rule.replacement;
      }
    }
  }

  // 2. Check if heading starts with a list number/letter.
  // E.g. "1. 飞鸟机场", "### 2.", "### 一、", "### ①", "### (1)"
  const isListNumber = /^\d+[\.、\s]/i.test(cleanText) || /^[一二三四五六七八九十]+[\.、\s]/i.test(cleanText) || /^[①②③④⑤⑥⑦⑧⑨⑩]/i.test(cleanText) || /^\([0-9a-zA-Z]+\)[\.\s、]/i.test(cleanText);
  if (isListNumber) {
    return text; // Do not modify numbered airport titles or list items
  }

  // Keep prefix emoji if any
  const emojiMatch = text.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}|\p{Emoji}\s*)+/u);
  const emojiPrefix = emojiMatch ? emojiMatch[0] : '';
  const mainText = text.slice(emojiPrefix.length).replace(/\*\*/g, '').trim();

  // 3. Apply semantic matching rules
  if (level === 'h2') {
    if (mainText.includes("简介") || mainText.includes("评测") || mainText.includes("测评") || mainText.includes("深度测评")) {
      const nameMatch = mainText.match(/^([^\(（\s]+)/);
      const airportName = nameMatch ? nameMatch[1] : mainText;
      return `${emojiPrefix}${airportName}怎么样？线路与性价比表现如何？`;
    }
    if (mainText.includes("优势") || mainText.includes("竞争力") || mainText.includes("黑科技") || mainText.includes("特性")) {
      return `${emojiPrefix}该机场有哪些核心优势与特色黑科技？`;
    }
    if (mainText.includes("实测") || mainText.includes("测速") || mainText.includes("抗压测试") || mainText.includes("体验报告") || mainText.includes("使用体验")) {
      return `${emojiPrefix}该机场在实际测速和晚高峰表现如何？`;
    }
    if (mainText.includes("套餐价格") || mainText.includes("套餐资费") || mainText.includes("价格详解") || mainText.includes("套餐") || mainText.includes("资费") || mainText.includes("价格")) {
      return `${emojiPrefix}该机场的套餐价格资费是怎样的？性价比如何？`;
    }
    if (mainText.includes("总结") || mainText.includes("结论") || mainText.includes("结语")) {
      return `${emojiPrefix}关于该机场评测的最终总结与选购建议`;
    }
    if (mainText.includes("使用指南") || mainText.includes("连接") || mainText.includes("配置") || mainText.includes("导入")) {
      return `${emojiPrefix}如何下载、配置和导入该机场节点订阅？`;
    }
    if (mainText.includes("为什么")) {
      return `${emojiPrefix}为什么选择该机场？有哪些核心理由？`;
    }
    if (mainText.includes("常见问题") || mainText.includes("FAQ")) {
      return `${emojiPrefix}关于该机场有哪些常见问题与解答(FAQ)？`;
    }
    if (mainText.includes("便宜机场") || mainText.includes("平价机场")) {
      return `${emojiPrefix}2026年高性价比便宜平价机场有哪些？如何选择？`;
    }
    if (mainText.includes("推荐")) {
      return `${emojiPrefix}2026年稳定好用的翻墙机场推荐榜单：哪些最值得选择？`;
    }
    if (mainText.includes("安全机场") || mainText.includes("安全")) {
      return `${emojiPrefix}高安全性的翻墙机场有哪些？如何实现隐私保护与匿名支付？`;
    }
    if (mainText.includes("老牌机场") || mainText.includes("老牌")) {
      return `${emojiPrefix}国内运营时间长、靠谱不跑路的老牌机场有哪些？`;
    }
    if (mainText.includes("专线机场") || mainText.includes("专线")) {
      return `${emojiPrefix}超低延迟IEPL专线机场有哪些？专线与直连/中转有什么区别？`;
    }
    if (mainText.includes("避坑指南") || mainText.includes("使用指南") || mainText.includes("挑选指南")) {
      return `${emojiPrefix}新手购买和使用科学上网机场有哪些避坑指南与注意事项？`;
    }
    if (mainText.includes("教程") || mainText.includes("配置") || mainText.includes("安装")) {
      return `${emojiPrefix}${mainText}的具体步骤与配置教程是怎样的？`;
    }
    if (mainText.includes("替代")) {
      return `${emojiPrefix}${mainText}有哪些？国内直接可用的替代方案推荐`;
    }
    return `${emojiPrefix}${mainText}：深度解析与常见问答？`;
  } else {
    // h3
    if (mainText.includes("核心特性") || mainText.includes("优势") || mainText.includes("特点") || mainText.includes("竞争力")) {
      return `该服务商的核心特性与网络优势有哪些？`;
    }
    if (mainText.includes("套餐") || mainText.includes("价格") || mainText.includes("资费") || mainText.includes("性价比")) {
      return `该机场的套餐价格资费是怎样的？性价比如何？`;
    }
    if (mainText.includes("线路") || mainText.includes("架构") || mainText.includes("网络质量")) {
      return `该机场的线路质量与节点网络架构表现如何？`;
    }
    if (mainText.includes("客服") || mainText.includes("售后") || mainText.includes("支持")) {
      return `该机场是否提供24小时客服支持与售后响应？`;
    }
    if (mainText.includes("测速") || mainText.includes("速度") || mainText.includes("晚高峰") || mainText.includes("实测")) {
      return `该机场在实际测速中表现如何？晚高峰速度稳定吗？`;
    }
    if (mainText.includes("避坑") || mainText.includes("注意事项") || mainText.includes("风险")) {
      return `购买和使用该机场时有哪些避坑指南与安全注意事项？`;
    }
    if (mainText.includes("如何注册") || mainText.includes("注册步骤") || mainText.includes("购买流程")) {
      return `注册和购买该机场服务的具体流程是怎样的？`;
    }
    if (mainText.includes("第一步")) {
      return `第一步：如何准备相关账号或环境？`;
    }
    if (mainText.includes("第二步")) {
      return `第二步：如何下载与安装配置？`;
    }
    if (mainText.includes("第三步")) {
      return `第三步：如何导入订阅并开启科学上网？`;
    }
    if (mainText.includes("解锁")) {
      return `该机场对Netflix、TikTok和ChatGPT等流媒体与AI的解锁支持如何？`;
    }
    if (mainText.includes("为什么")) {
      return `${mainText}？原因深度剖析`;
    }
    if (mainText.includes("如何")) {
      return `${mainText}？具体操作方法与步骤`;
    }
    return `${mainText}是什么？又该如何选择和使用？`;
  }
}

// Main logic
const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));

console.log(`Found ${files.length} posts to process...`);

let processedCount = 0;

for (const file of files) {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Parse Front Matter
  const parts = content.split('---');
  if (parts.length < 3) {
    console.warn(`Skipping ${file}: invalid front matter format.`);
    continue;
  }

  const frontMatter = parts[1];
  const bodyContent = parts.slice(2).join('---');

  const description = getMetaDescription(frontMatter);
  if (!description) {
    console.warn(`Warning in ${file}: description is missing in front matter.`);
  }

  // Process lines of the body content
  const lines = bodyContent.split('\n');
  let firstH2Index = -1;
  let summaryBlockIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if summary block already exists
    if (line.startsWith('> **快捷导读与核心结论**：')) {
      summaryBlockIndex = i;
    }

    // Process H2 and H3 headings
    if (lines[i].startsWith('## ')) {
      if (firstH2Index === -1) {
        firstH2Index = i;
      }
      const headingText = lines[i].slice(3).trim();
      lines[i] = '## ' + mapHeadingToQuestion(headingText, 'h2');
    } else if (lines[i].startsWith('### ')) {
      const headingText = lines[i].slice(4).trim();
      lines[i] = '### ' + mapHeadingToQuestion(headingText, 'h3');
    }
  }

  // Construct summary block
  const summaryBlock = `> **快捷导读与核心结论**：${description || '本文为翻墙科学上网及机场相关的深度评测与配置指南。'}。为了让您在最短时间内找到适合自己的科学上网工具，本站评测团队经过数月深度测速和晚高峰压测整理出本文，旨在为国内和国外用户提供最真实、客观的选择指南，建议收藏。`;

  // Inject or update summary block
  if (summaryBlockIndex !== -1) {
    // Update existing summary block
    lines[summaryBlockIndex] = summaryBlock;
  } else {
    // Inject summary block right after the first H2 heading (or at the top if no H2 exists)
    if (firstH2Index !== -1) {
      // Find the next empty line or insert directly after
      lines.splice(firstH2Index + 1, 0, '', summaryBlock);
    } else {
      lines.unshift(summaryBlock, '');
    }
  }

  // Join content back
  const newBodyContent = lines.join('\n');
  const newContent = `---${frontMatter}---${newBodyContent}`;

  fs.writeFileSync(filePath, newContent, 'utf-8');
  processedCount++;
}

console.log(`Successfully processed ${processedCount} files for GEO optimization.`);
