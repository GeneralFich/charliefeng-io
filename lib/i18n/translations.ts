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
      greeting: "Hello! I'm Charlie's AI Digital Twin. Ask me anything about his work, background, or ideas.",
      inputPlaceholder: "Ask me a question...",
      send: "Send",
      clear: "Clear Chat",
      confirmClear: "Confirm Clear",
      error: "Something went wrong. Please try again.",
      thinking: "THINKING...",
      download: "Download Chat",
      suggestions: [
        "Tell me about your background",
        "What is the Strategic Whitepaper?",
        "What are your thoughts on AGI?"
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
      greeting: "你好！我是Charlie的AI数字孪生。你可以问我关于他的工作、背景或想法的任何问题。",
      inputPlaceholder: "输入你的问题...",
      send: "发送",
      clear: "清空对话",
      confirmClear: "确认清空",
      error: "出错了，请重试。",
      thinking: "思考中...",
      download: "下载对话",
      suggestions: [
        "介绍一下你的背景",
        "什么是战略白皮书？",
        "你怎么看AGI？"
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
    }
  }
};

export type Translations = typeof TRANSLATIONS[Language.EN];
