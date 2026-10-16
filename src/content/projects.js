export const projects = [
  {
    slug: 'security-monitoring',
    number: '01',
    name: 'Security monitoring & triage',
    category: 'Systems & security',
    tag: 'Featured work',
    demo: 'monitor',
    summary:
      'Turning Microsoft 365 and Entra events into a clearer picture of what needs attention.',
    stack: ['Python', 'Microsoft Graph', 'SQLite', 'REST APIs'],
    status: 'Active development',
    role: 'Design & development',
    problem:
      'Security events are scattered across identity and email activity. Investigating them means connecting evidence across multiple sources before deciding what needs attention.',
    approach:
      'I am building a Python monitoring application around Microsoft Graph APIs, authentication, detection rules, stored event state, and alerts. The work focuses on making investigations more consistent and giving IT a useful starting point for triage.',
    outcome:
      'The monitoring workflow supports investigation of suspicious activity. In a recent phishing investigation, reviewing sign-in logs and email traces did not reveal evidence of account compromise. That finding is distinct from proving every account was safe.',
    next: 'I am exploring locally hosted models through Ollama for event correlation and investigation summaries. AI-assisted triage is planned work, not a deployed capability.',
    note: 'The interactive panel below is a portfolio demonstration using synthetic events. It is not connected to Resolut or a live tenant.',
  },
  {
    slug: 'tech-trends-api',
    number: '02',
    name: 'Tech Trends API & discovery feed',
    category: 'Development',
    tag: 'Live-data API',
    demo: 'trends',
    summary:
      'A personal tech-news API that gathers and filters recent engineering headlines for ongoing learning.',
    stack: ['Node.js', 'REST APIs', 'Caching', 'Docker'],
    status: 'Version 2 implemented · deployment pending',
    role: 'Backend engineering & integration',
    repo: 'https://github.com/RJ060501/tech-trends-api',
    repoLabel: 'Original API repository ↗',
    problem:
      'To answer “How do you stay current with technology?” with something more useful than a reading list, I built an API to find articles. My original implementation scraped arbitrary links from two static webpages; it lacked reliable dates, relevance filters, and failure handling.',
    approach:
      'I refactored the proof of concept into a Node.js REST service using the Hacker News Algolia and DEV Community JSON APIs. It normalizes published timestamps and sources, deduplicates URLs, filters topics and queries, caches successful results, and handles partial upstream failures and timeouts. The React demo consumes the API through an Nginx reverse proxy when deployed.',
    outcome:
      'The upgraded project can power a repeatable personal reading workflow across AI, cloud, security, and software engineering. It demonstrates integration design, defensive input validation, caching, service health checks, and automated tests—not just a frontend list of articles.',
    next: 'Deploy the combined site and API, refine article relevance, and optionally add saved reading lists and digests. A live production feed is not claimed until the public endpoint is operational.',
    note: 'The v2 implementation is included in this updated portfolio source, but is not yet pushed to the original API repository. The live mode requires a running Node API; fictional sample records are clearly labeled. No AI summaries are fabricated.',
  },
  {
    slug: 'terraform-aws-ec2',
    number: '03',
    name: 'AWS infrastructure with Terraform',
    category: 'Cloud & AI',
    tag: 'Infrastructure as code',
    demo: null,
    summary:
      'Provisioning a real EC2 instance with declarative Terraform, then exploring a repeatable deployment for this portfolio.',
    stack: ['Terraform', 'AWS EC2', 'Infrastructure as Code', 'Linux'],
    status: 'Original EC2 lab stopped · deployment planned',
    role: 'Infrastructure provisioning',
    repo: 'https://github.com/RJ060501/terraform-cloud-project',
    problem:
      'I wanted practical evidence that I could provision cloud infrastructure, not just describe EC2 concepts. The first lab deliberately focused on the smallest useful resource.',
    approach:
      'I wrote Terraform configuration for an AWS t3.micro EC2 instance in us-east-1 and an output exposing its public IP. I used the Terraform plan/apply workflow, then stopped the instance when it was no longer needed. It did not serve an application.',
    outcome:
      'This work demonstrates basic EC2 and Terraform resource configuration. It is not evidence of a previously hosted website, a production-grade network, or a production deployment.',
    next: 'The portfolio repository now includes a separate, optional AWS deployment example for a Dockerized website and trends API. Connecting a domain, securing HTTPS, applying the plan, and monitoring the deployment remain operational steps—not completed work.',
    note: 'The uploaded Terraform lab provisions one instance only. An accompanying deployment blueprint lives in this portfolio source repository; it has not been applied to an AWS account.',
  },
  {
    slug: 'snake',
    number: '04',
    name: 'Snake: algorithms in action',
    category: 'Development',
    tag: 'Playable experiment',
    demo: 'snake',
    summary:
      'A classic game built around a grid, a game loop, and a few unforgiving collision rules.',
    stack: ['Python', 'Algorithms', 'React'],
    status: 'Portfolio project',
    role: 'Game logic & development',
    problem:
      'A simple game provides a concrete way to explore state, input handling, timing, and collision detection.',
    approach:
      'I originally built Snake in Python. This browser adaptation separates a pure, testable movement engine from React UI state. Each tick advances a grid-based linked body, enforces direction rules, checks walls and self-collisions, and places food only in unoccupied cells.',
    outcome:
      'The playable browser adaptation demonstrates deterministic state transitions, arrays, coordinate logic, collision detection, and edge-case testing. The original project was written in Python.',
    next: 'The browser adaptation supports keyboard and touch controls, pause, restart, and difficulty selection.',
    note: 'Playable React adaptation of my original Python project. The browser game is new code, and is not running Python in the browser.',
  },
  {
    slug: 'accounting-assistant',
    number: '05',
    name: 'AI accounting assistant',
    category: 'Cloud & AI',
    tag: 'Cloud application',
    demo: 'accounting',
    summary: 'A conversational interface connecting a React frontend to AWS-powered answers.',
    stack: ['React', 'Node.js', 'Amazon Bedrock', 'AWS Lex V2'],
    status: 'Portfolio project',
    role: 'Full-stack development',
    repo: 'https://github.com/RJ060501/ai-accountant-bot',
    problem:
      'An accounting question should be easy to ask without navigating a complex application interface.',
    approach:
      'I built a full-stack chatbot using a React frontend, a Node.js/Express backend, AWS Lex V2, and Amazon Bedrock. The project brings together conversational UI, API boundaries, and cloud services.',
    outcome:
      'The project demonstrates integration across a browser client, backend services, and AWS conversational tooling.',
    next: 'Further work includes grounded responses, clearer failure states, and evaluation of answer quality.',
    note: 'This guided preview uses fixed educational responses, not a live AI model or financial advice. No AWS credentials are needed.',
  },
  {
    slug: 'article-scraper',
    number: '06',
    name: 'Article discovery API',
    category: 'Development',
    tag: 'API integration',
    demo: 'scraper',
    summary: 'Fetch, filter, and surface relevant articles through a Node.js API.',
    stack: ['Node.js', 'Express', 'REST APIs', 'JavaScript'],
    status: 'Portfolio project',
    role: 'API & interface development',
    repo: 'https://github.com/RJ060501/climate-change-api',
    video: 'https://www.youtube.com/watch?v=4OHvyMP6VQs',
    problem:
      'Finding relevant articles across multiple websites creates repetitive searching and filtering.',
    approach:
      'I developed a Node.js application that scrapes articles from specified websites and filters results using user-provided keywords. An API allows the frontend to request and display the results.',
    outcome:
      'The project demonstrates data extraction, keyword filtering, and a reusable API boundary.',
    next: 'Source reliability, timeouts, and respectful request limits are important areas for continued work.',
    note: 'This interactive filter runs against a small, fictional local dataset. It demonstrates the interaction without scraping external websites.',
  },
  {
    slug: 'localdb-investigation',
    number: '07',
    name: 'Tracing a failure below the application',
    category: 'Systems & security',
    tag: 'Technical case study',
    demo: null,
    summary:
      'Following a Revit connection failure through SQL Server LocalDB to Windows storage reporting.',
    stack: ['Windows', 'SQL Server LocalDB', 'Revit', 'Troubleshooting'],
    status: 'Investigation case study',
    role: 'Diagnosis & escalation',
    problem:
      'Revit 2025 Steel Connections could not start its SQL Server LocalDB instance. Automatic repair did not restore functionality.',
    approach:
      'I read the Revit journal, reproduced the instance-start failure with sqllocaldb, and inspected the drive with fsutil fsinfo sectorinfo. The system reported a 32 KB physical sector size for performance, identifying a storage compatibility issue to investigate.',
    outcome:
      'The investigation produced a specific diagnosis and remediation handoff instead of repeating application reinstall steps. The reported storage setting was changed; final application recovery was not confirmed in the information available for this case study.',
    next: 'The validation sequence is to recheck sector reporting, retry LocalDB startup, and test Steel Connections in Revit.',
    note: 'This case study omits internal device names, account names, and infrastructure addresses.',
  },
  {
    slug: 'video-explorer',
    number: '08',
    name: 'Video explorer',
    category: 'Development',
    tag: 'Frontend application',
    demo: null,
    summary: 'Search and watch videos in a responsive interface backed by the YouTube Data API.',
    stack: ['React', 'YouTube Data API', 'JavaScript'],
    status: 'Portfolio project',
    role: 'Frontend development',
    repo: 'https://github.com/RJ060501/portfolio-videos',
    problem:
      'A video search experience needs to coordinate the search query, result list, selected video, and playback layout.',
    approach:
      'I used YouTube Data API v3 to retrieve video results and built a responsive interface for searching, browsing, and watching them.',
    outcome:
      'The project shows API integration, frontend state management, and responsive layout work.',
    next: 'A reliable hosted demo needs managed API quota, restricted credentials, and useful loading and error states. The source is linked here without relying on the previous deployment.',
    note: 'Source walkthrough only. This portfolio does not connect to the YouTube API.',
  },
];
