// This controlled vocabulary makes well-known technology detection deterministic.
// AI can suggest additional entities, but cannot silently mutate this registry.
export const TECHNOLOGIES = [
  ['AWS', 'cloud', ['Amazon Web Services', 'AWS']],
  ['Azure', 'cloud', ['Microsoft Azure', 'Azure']],
  ['Google Cloud', 'cloud', ['Google Cloud Platform', 'Google Cloud', 'GCP']],
  ['Kubernetes', 'cloud', ['Kubernetes', 'K8s']],
  ['Docker', 'cloud', ['Docker', 'containerization']],
  ['Terraform', 'cloud', ['Terraform', 'OpenTofu']],
  ['Serverless', 'cloud', ['serverless', 'AWS Lambda', 'Azure Functions']],
  ['OpenTelemetry', 'cloud', ['OpenTelemetry', 'OTel']],
  ['Prometheus', 'cloud', ['Prometheus']],
  ['Linux', 'cloud', ['Linux']],
  ['Zero Trust', 'security', ['Zero Trust']],
  ['CVE', 'security', ['CVE-', 'common vulnerabilities and exposures']],
  ['Phishing', 'security', ['phishing']],
  ['Ransomware', 'security', ['ransomware']],
  ['SIEM', 'security', ['SIEM', 'security information and event management']],
  ['Microsoft Entra', 'security', ['Microsoft Entra', 'Azure AD']],
  ['Passkeys', 'security', ['passkeys', 'passkey', 'FIDO2']],
  ['Python', 'development', ['Python']],
  ['JavaScript', 'development', ['JavaScript']],
  ['TypeScript', 'development', ['TypeScript']],
  ['Node.js', 'development', ['Node.js', 'NodeJS']],
  ['React', 'development', ['React', 'React.js']],
  ['Next.js', 'development', ['Next.js', 'NextJS']],
  ['PostgreSQL', 'development', ['PostgreSQL', 'Postgres']],
  ['SQLite', 'development', ['SQLite']],
  ['REST API', 'development', ['REST API', 'RESTful']],
  ['LLM', 'ai', ['LLM', 'large language model', 'large language models']],
  ['Ollama', 'ai', ['Ollama']],
  ['RAG', 'ai', ['retrieval augmented generation', 'retrieval-augmented generation', 'RAG']],
  ['LangGraph', 'ai', ['LangGraph']],
  ['PyTorch', 'ai', ['PyTorch']],
  ['MCP', 'ai', ['Model Context Protocol']],
].map(([name, category, aliases]) => ({ name, category, aliases }));

export const PROFILES = {
  cloud: { label: 'Cloud / Platform Engineer', weights: { cloud: 4, security: 2, ai: 2, development: 2 } },
  security: { label: 'Cybersecurity Engineer', weights: { security: 4, cloud: 2, ai: 2, development: 1 } },
  software: { label: 'Software Engineer', weights: { development: 4, cloud: 2, ai: 2, security: 1 } },
  ai: { label: 'AI / Automation Engineer', weights: { ai: 4, development: 3, cloud: 2, security: 1 } },
};

function escaped(phrase) {
  return phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function detectTechnologies(text, { maxEvidence = 2 } = {}) {
  const input = String(text || '');
  const results = [];
  for (const entry of TECHNOLOGIES) {
    let count = 0;
    const positions = [];
    // Do not match "React" inside "reactive" or "AI" inside "chair".
    for (const alias of entry.aliases) {
      const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${escaped(alias)}(?![\\p{L}\\p{N}])`, 'giu');
      for (const match of input.matchAll(pattern)) {
        const start = match.index;
        if (!positions.some((p) => Math.abs(start - p) < 2)) positions.push(start);
      }
    }
    count = positions.length;
    if (!count) continue;
    const evidence = positions.slice(0, maxEvidence).map((index) => {
      const start = Math.max(0, input.lastIndexOf('.', index - 1) + 1, index - 85);
      const nextPeriod = input.indexOf('.', index + 1);
      const end = Math.min(input.length, nextPeriod < 0 ? index + 100 : nextPeriod + 1, index + 160);
      return input.slice(start, end).replace(/\s+/g, ' ').trim();
    });
    results.push({ name: entry.name, category: entry.category, mentions: count, evidence });
  }
  return results.sort((a, b) => b.mentions - a.mentions || a.name.localeCompare(b.name));
}

export function recommend(terms, profile = 'cloud') {
  const selected = PROFILES[profile] || PROFILES.cloud;
  return terms.map((term) => ({
    ...term,
    relevanceScore: (selected.weights[term.category] || 1) * 20 + Math.min(term.mentions || term.articles || 0, 15),
    whyLearn: `${term.name} is relevant to ${selected.label.toLowerCase()} work. Explore the cited articles and validate its relevance to your current goals.`,
  })).sort((a, b) => b.relevanceScore - a.relevanceScore);
}
