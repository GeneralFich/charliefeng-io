
import { performance } from 'perf_hooks';

// Increase data size to make the difference more apparent
const nodes = Array.from({ length: 100 }, (_, i) => ({
  id: `node-${i}`,
  type: i % 5 === 0 ? 'essay' : (i % 5 === 1 ? 'role' : (i % 5 === 2 ? 'education' : (i % 5 === 3 ? 'skill' : 'hub'))),
  label: `Label ${i}`,
  meta: {
    slug: `slug-${i}`,
  }
}));

const posts = Array.from({ length: 50 }, (_, i) => ({
  slug: `slug-${i * 2}`,
  attributes: { title: `Post Title ${i * 2}` },
  tags: [`tag-${i}`]
}));

const resume = {
  experience: Array.from({ length: 20 }, (_, i) => ({
    company: `Company ${i}`,
    role: `Role ${i}`,
    dates: `Dates ${i}`
  })),
  education: Array.from({ length: 10 }, (_, i) => ({
    school: i % 2 === 0 ? 'Yale' : 'New York',
    degree: `Degree ${i}`,
    details: `Details ${i}`
  })),
  skills: Array.from({ length: 15 }, (_, i) => ({
    category: `category-${i}`,
    items: `Items ${i}`
  }))
};

const skillIdMapMock = Object.fromEntries(
    Array.from({ length: 100 }, (_, i) => [`node-${i}`, `category-${i % 15}`])
);

function legacyGetGraphData() {
  return nodes.map(node => {
    const n = { ...node };

    if (n.type === 'essay' && n.meta?.slug) {
      const post = posts.find((p) => p.slug === n.meta!.slug);
      if (post) {
        n.label = post.attributes.title;
        n.meta = { ...n.meta, tags: post.tags };
      }
    }

    if (n.type === 'role') {
      const exp = resume.experience.find(
        (e) => e.company.toLowerCase().includes(n.id.replace('role-', '').toLowerCase())
      );
      if (exp) {
        n.meta = { ...n.meta, subtitle: exp.role, dates: exp.dates };
      }
    }

    if (n.type === 'education') {
      const edu = resume.education.find(
        (e) => e.school.toLowerCase().includes(n.id.includes('yale') ? 'yale' : 'new york')
      );
      if (edu) {
        n.meta = { ...n.meta, subtitle: edu.degree, details: edu.details };
      }
    }

    if (n.type === 'skill') {
      const skillIdMap: Record<string, string> = {
        'skill-product-strategy': 'product strategy',
        'skill-ai-infra': 'ai & compute',
        'skill-data-stack': 'data & technical',
      };
      // For benchmark purpose we use the larger mock map
      const searchTerm = (skillIdMapMock as any)[n.id];
      if (searchTerm) {
        const skill = resume.skills.find(
          (s) => s.category.toLowerCase().includes(searchTerm)
        );
        if (skill) {
          n.meta = { ...n.meta, items: skill.items };
        }
      }
    }
    return n;
  });
}

function optimizedGetGraphData() {
  // Pre-indexing
  const postMap = new Map(posts.map(p => [p.slug, p]));
  const experienceEntries = resume.experience.map(e => ({
    lowerCompany: e.company.toLowerCase(),
    data: e
  }));
  const educationEntries = resume.education.map(e => ({
    lowerSchool: e.school.toLowerCase(),
    data: e
  }));
  const skillMapRes = new Map(resume.skills.map(s => [s.category.toLowerCase(), s]));

  const skillIdMap: Record<string, string> = {
    'skill-product-strategy': 'product strategy',
    'skill-ai-infra': 'ai & compute',
    'skill-data-stack': 'data & technical',
  };

  return nodes.map(node => {
    const n = { ...node };

    if (n.type === 'essay' && n.meta?.slug) {
      const post = postMap.get(n.meta.slug);
      if (post) {
        n.label = post.attributes.title;
        n.meta = { ...n.meta, tags: post.tags };
      }
    }

    if (n.type === 'role') {
      const companyId = n.id.replace('role-', '').toLowerCase();
      const entry = experienceEntries.find(e => e.lowerCompany.includes(companyId));
      if (entry) {
        const exp = entry.data;
        n.meta = { ...n.meta, subtitle: exp.role, dates: exp.dates };
      }
    }

    if (n.type === 'education') {
      const schoolSearch = n.id.includes('yale') ? 'yale' : 'new york';
      const entry = educationEntries.find(e => e.lowerSchool.includes(schoolSearch));
      if (entry) {
        const edu = entry.data;
        n.meta = { ...n.meta, subtitle: edu.degree, details: edu.details };
      }
    }

    if (n.type === 'skill') {
      // For benchmark purpose we use the larger mock map
      const searchTerm = (skillIdMapMock as any)[n.id];
      if (searchTerm) {
        const skill = skillMapRes.get(searchTerm);
        if (skill) {
          n.meta = { ...n.meta, items: skill.items };
        }
      }
    }
    return n;
  });
}

const iterations = 50000;

console.log(`Running benchmark with ${iterations} iterations and larger dataset (refined)...`);

// Warm up
for(let i=0; i<1000; i++) {
    legacyGetGraphData();
    optimizedGetGraphData();
}

const startLegacy = performance.now();
for (let i = 0; i < iterations; i++) {
  legacyGetGraphData();
}
const endLegacy = performance.now();

const startOptimized = performance.now();
for (let i = 0; i < iterations; i++) {
  optimizedGetGraphData();
}
const endOptimized = performance.now();

console.log(`Legacy:    ${(endLegacy - startLegacy).toFixed(2)}ms`);
console.log(`Optimized: ${(endOptimized - startOptimized).toFixed(2)}ms`);
console.log(`Improvement: ${((endLegacy - startLegacy) / (endOptimized - startOptimized)).toFixed(2)}x faster`);
