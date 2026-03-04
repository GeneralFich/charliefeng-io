import { Language } from '../../types';

export const TRANSLATIONS = {
  [Language.EN]: {
    nav: {
      chat: 'Chat',
      about: 'About',
      essays: 'Essays',
      home: 'Home',
      digitalTwin: 'Digital Twin',
      digitalTwinDesc: 'An AI version of me trained on my work & writing',
    },
    sections: {
      resume: 'Resume',
      summary: 'Executive Summary',
      experience: 'Professional Experience',
      education: 'Education',
      leadership: 'Leadership & Community',
      skills: 'Skills',
    },
    actions: {
      downloadPdf: 'Download PDF',
      share: 'Share',
      copied: 'Copied!',
      viewLinkedin: 'View LinkedIn Profile',
      previous: 'Previous',
      next: 'Next',
    },
    chat: {
      greeting: "I'm Charlie's digital twin \u2014 an AI trained on my essays and experience in AI infrastructure at Google. Describe a challenge you're facing with AI strategy, and I'll give you my honest take.",
      inputPlaceholder: "Describe your AI challenge...",
      send: "Send",
      clear: "Clear Chat",
      confirmClear: "Confirm Clear",
      error: "Something went wrong. Please try again.",
      thinking: "THINKING...",
      download: "Download Chat",
      suggestions: [
        "We're building an AI roadmap \u2014 where do we actually start?",
        "Our AI pilots work in demos but stall in production",
        "Should we fine-tune a model or build a RAG pipeline?"
      ]
    },
    essays: {
      searchPlaceholder: "Search essays...",
      readTime: "min read",
      back: "Back to Essays",
      subtitle: "Thoughts on technology, infrastructure, and the future of AI.",
      noResults: "No essays found matching",
      clearSearch: "Clear search",
      findInEssay: "Find in essay...",
    },
    browse: {
      badge: "Explore",
      heading: "Browse Charlie's Work",
      description: "Read essays and view the full resume — while keeping the conversation going.",
      essaysLabel: "Essays",
      viewAll: "View all",
      resumeLabel: "Resume",
      viewResume: "View Full Resume",
      resumeSubtitle: "Experience, education, and skills",
    },
    now: {
      heading: "What I'm Working On",
      statusActive: "Active",
      statusShipped: "Shipped",
      statusExploring: "Exploring",
    }
  },
  [Language.ZH]: {
    nav: {
      chat: '对话',
      about: '简历',
      essays: '文章',
      home: '首页',
      digitalTwin: '数字孪生',
      digitalTwinDesc: '基于我的作品和写作训练的AI版本',
    },
    sections: {
      resume: '简历',
      summary: '执行摘要',
      experience: '工作经历',
      education: '教育背景',
      leadership: '领导力与社区',
      skills: '技能',
    },
    actions: {
      downloadPdf: '下载 PDF',
      share: '分享',
      copied: '已复制!',
      viewLinkedin: '查看 LinkedIn 档案',
      previous: '上一篇',
      next: '下一篇',
    },
    chat: {
      greeting: "我是Charlie的数字孪生——基于我在Google AI基础设施领域的文章和经验训练的AI。描述你在AI战略方面遇到的挑战，我会给你我的真实看法。",
      inputPlaceholder: "描述你的AI挑战...",
      send: "发送",
      clear: "清空对话",
      confirmClear: "确认清空",
      error: "出错了，请重试。",
      thinking: "思考中...",
      download: "下载对话",
      suggestions: [
        "我们正在制定AI路线图——到底应该从哪里开始？",
        "我们的AI试点在演示中可行，但在生产环境中停滞了",
        "我们应该微调模型还是构建RAG管道？"
      ]
    },
    essays: {
      searchPlaceholder: "搜索文章...",
      readTime: "分钟阅读",
      back: "返回文章列表",
      subtitle: "关于技术、基础设施和人工智能未来的思考。",
      noResults: "未找到匹配的文章",
      clearSearch: "清除搜索",
      findInEssay: "在文章中查找...",
    },
    browse: {
      badge: "探索",
      heading: "浏览 Charlie 的作品",
      description: "阅读文章、查看完整简历——同时保持对话。",
      essaysLabel: "文章",
      viewAll: "查看全部",
      resumeLabel: "简历",
      viewResume: "查看完整简历",
      resumeSubtitle: "工作经历、教育背景与技能",
    },
    now: {
      heading: "正在进行的项目",
      statusActive: "进行中",
      statusShipped: "已上线",
      statusExploring: "探索中",
    }
  }
};

export type Translations = typeof TRANSLATIONS[Language.EN];
