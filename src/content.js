// Replace this file's demo records with your real portfolio content.
// Empty links are deliberately disabled in the UI, never fake destinations.
export const profile = {
  name: 'Hafeez Akram',
  title: 'Lead Unity Developer',
  years: 9,
  bio: 'I build mobile games, VR applications and WebGL experiences with Unity and C#. My work covers gameplay, multiplayer systems and performance optimization, from early planning through release. At Infinity-Up, I lead a team of 10 developers and stay involved in day-to-day development.',
  email: 'hafeez.akram21@gmail.com',
  linkedin: 'https://www.linkedin.com/in/hafeez-akr/',
  github: 'https://github.com/breaker-of-code',
  whatsapp: 'https://wa.me/923088127585',
  availability: 'Open to full-time roles and freelance / contract work',
  resume: '/files/Hafeez-Akram-Developer.pdf',
  portrait: '/media/profile/hafeez-akram.jpg',
};

// These eleven real projects are approved locally. Further supplied projects await review.
export const projects = [{
  name: 'Arthur VR', visual: 'vr', category: 'VR / WebGL Collaboration',
  summary: 'A virtual workspace where teams meet, share content and collaborate in real time.',
  role: 'Built collaboration features including pinboards, real-time drawing and whiteboards, video broadcasting, an integrated browser, bookmarks and crop-copy tools. Led the VR-to-WebGL conversion, wrote custom service wrappers and improved memory use and runtime performance.',
  outcome: '', technologies: ['Unity', 'C#', 'Photon', 'AWS', 'WebGL'],
  images: Array.from({ length: 17 }, (_, i) => `/media/projects/arthur/image-${String(i + 1).padStart(2, '0')}.webp`),
  thumbnails: Array.from({ length: 17 }, (_, i) => `/media/projects/arthur/thumb-${String(i + 1).padStart(2, '0')}.webp`),
  videos: [
    { src: '/media/projects/arthur/pinboard.mp4', poster: '/media/projects/arthur/pinboard-poster.webp', title: 'Pinboard' },
    { src: '/media/projects/arthur/whiteboard.mp4', poster: '/media/projects/arthur/whiteboard-poster.webp', title: 'Whiteboard' },
    { src: '/media/projects/arthur/browser-broadcast.mp4', poster: '/media/projects/arthur/browser-broadcast-poster.webp', title: 'Browser and video broadcasting' },
  ],
  links: { watch: '', play: '', source: 'https://arthur.digital/' },
  demo: false, index: 0,
}, {
  name: 'Gods of Chess', visual: 'chess', category: 'Multiplayer / Strategy',
  summary: 'A 3D online multiplayer auto-battler with chess-inspired combat.',
  role: 'Worked on gameplay, server programming, Unity UI, particle effects and 3D scene setup.',
  outcome: '', technologies: ['Unity', 'C#', 'Photon'],
  images: Array.from({ length: 19 }, (_, i) => `/media/projects/gods-of-chess/image-${String(i + 1).padStart(2, '0')}.webp`),
  thumbnails: Array.from({ length: 19 }, (_, i) => `/media/projects/gods-of-chess/thumb-${String(i + 1).padStart(2, '0')}.webp`),
  videos: [], links: { watch: '', play: '', source: '' }, demo: false, index: 1,
}, {
  name: 'Pet Idle Miner', visual: 'pet', category: 'Personal Project / Idle Management',
  summary: 'An idle management game where players raise pets and sell them to earn money. Keep food and supplies stocked, invest in upgrades and hire a crew to grow the business.',
  role: 'Main developer, working alongside a fellow developer on this personal project.',
  outcome: 'Lion Studios approached us about publishing the game.', technologies: ['Unity', 'C#'],
  images: Array.from({ length: 10 }, (_, i) => `/media/projects/pet-idle-miner/image-${String(i + 1).padStart(2, '0')}.webp`),
  thumbnails: Array.from({ length: 10 }, (_, i) => `/media/projects/pet-idle-miner/thumb-${String(i + 1).padStart(2, '0')}.webp`),
  videos: Array.from({ length: 5 }, (_, i) => ({ src: `/media/projects/pet-idle-miner/gameplay-${String(i + 1).padStart(2, '0')}.mp4`, poster: `/media/projects/pet-idle-miner/gameplay-${String(i + 1).padStart(2, '0')}-poster.webp`, title: `Pet Idle Miner gameplay ${i + 1}` })),
  links: { watch: '', play: '', source: '' }, demo: false, index: 2,
}, {
  name: 'E.V.A.L.', visual: 'eval', category: 'Platformer',
  summary: 'A platformer built in Unity.',
  role: 'Worked as the main developer on E.V.A.L.',
  outcome: '', technologies: ['Unity', 'C#'],
  images: Array.from({ length: 12 }, (_, i) => `/media/projects/eval/image-${String(i + 1).padStart(2, '0')}.webp`),
  thumbnails: Array.from({ length: 12 }, (_, i) => `/media/projects/eval/thumb-${String(i + 1).padStart(2, '0')}.webp`),
  videos: [], links: { watch: '', play: '', source: '' }, demo: false, index: 3,
}, {
  name: 'XANA', visual: 'metaverse', category: 'Metaverse / Multiplayer',
  summary: 'A multiplayer metaverse experience for mobile and VR.',
  role: 'Worked on core application programming and UI implementation, and led the development team.',
  outcome: '', technologies: ['Unity', 'C#'],
  images: Array.from({ length: 16 }, (_, i) => `/media/projects/xana/image-${String(i + 1).padStart(2, '0')}.webp`),
  thumbnails: Array.from({ length: 16 }, (_, i) => `/media/projects/xana/thumb-${String(i + 1).padStart(2, '0')}.webp`),
  videos: [{ src: '/media/projects/xana/xana-demo.mp4', poster: '/media/projects/xana/xana-demo-poster.webp', title: 'XANA esports arena demo' }],
  links: { watch: '', play: '', source: '' }, demo: false, index: 4,
}, {
  name: 'Tap Challenge', visual: 'tap', category: 'Casual / Competitive',
  summary: 'A competitive tapping game with power-ups.',
  role: 'Built gameplay and power-ups, implemented the UI, and integrated Firebase, Facebook, ads and analytics.',
  outcome: '', technologies: ['Unity', 'C#', 'Firebase'],
  images: Array.from({ length: 12 }, (_, i) => `/media/projects/tap-challenge/image-${String(i + 1).padStart(2, '0')}.webp`),
  thumbnails: Array.from({ length: 12 }, (_, i) => `/media/projects/tap-challenge/thumb-${String(i + 1).padStart(2, '0')}.webp`),
  videos: [], links: { watch: '', play: '', source: '' }, demo: false, index: 5,
}, {
  name: 'Game Changer', visual: 'boxing', category: '3D Boxing',
  summary: 'A 3D boxing game.',
  role: 'Worked as an associate developer on Game Changer.',
  outcome: '', technologies: ['Unity', 'C#'],
  images: Array.from({ length: 12 }, (_, i) => `/media/projects/game-changer/image-${String(i + 1).padStart(2, '0')}.webp`),
  thumbnails: Array.from({ length: 12 }, (_, i) => `/media/projects/game-changer/thumb-${String(i + 1).padStart(2, '0')}.webp`),
  videos: [], links: { watch: '', play: '', source: '' }, demo: false, index: 6,
}, {
  name: 'Enter the Dungeons', visual: 'dungeon', category: '2D / Multiplayer Strategy',
  summary: 'A multiplayer 2D strategy game.',
  role: 'Worked as the main developer on Enter the Dungeons.',
  outcome: '', technologies: ['Unity', 'C#'],
  images: Array.from({ length: 5 }, (_, i) => `/media/projects/enter-the-dungeons/image-${String(i + 1).padStart(2, '0')}.webp`),
  thumbnails: Array.from({ length: 5 }, (_, i) => `/media/projects/enter-the-dungeons/thumb-${String(i + 1).padStart(2, '0')}.webp`),
  videos: [], links: { watch: '', play: '', source: '' }, demo: false, index: 7,
}, {
  name: 'Shape Jump', visual: 'jump', category: 'Endless / Survival',
  summary: 'An endless jumping survival game with drawing controls.',
  role: 'Worked as the main developer on Shape Jump.',
  outcome: '', technologies: ['Unity', 'C#'],
  images: Array.from({ length: 17 }, (_, i) => `/media/projects/shape-jump/image-${String(i + 1).padStart(2, '0')}.webp`),
  thumbnails: Array.from({ length: 17 }, (_, i) => `/media/projects/shape-jump/thumb-${String(i + 1).padStart(2, '0')}.webp`),
  videos: [], links: { watch: '', play: '', source: '' }, demo: false, index: 8,
}, {
  name: 'Pong 3D', visual: 'pong', category: '3D / Table Tennis',
  summary: 'A 3D table tennis game.',
  role: 'Worked as the main developer on Pong 3D.',
  outcome: '', technologies: ['Unity', 'C#'],
  images: Array.from({ length: 6 }, (_, i) => `/media/projects/pong/image-${String(i + 1).padStart(2, '0')}.webp`),
  thumbnails: Array.from({ length: 6 }, (_, i) => `/media/projects/pong/thumb-${String(i + 1).padStart(2, '0')}.webp`),
  videos: [{ src: '/media/projects/pong/pong-demo.mp4', poster: '/media/projects/pong/pong-demo-poster.webp', title: 'Pong 3D gameplay' }],
  links: { watch: '', play: '', source: '' }, demo: false, index: 9,
}, {
  name: 'Wonderland Runner', visual: 'race', category: '3D / Endless Runner',
  summary: 'A 3D endless runner game.',
  role: 'Worked as the main developer on Wonderland Runner.',
  outcome: '', technologies: ['Unity', 'C#'],
  images: Array.from({ length: 3 }, (_, i) => `/media/projects/wonderland-runner/image-${String(i + 1).padStart(2, '0')}.webp`),
  thumbnails: Array.from({ length: 3 }, (_, i) => `/media/projects/wonderland-runner/thumb-${String(i + 1).padStart(2, '0')}.webp`),
  videos: [], links: { watch: '', play: '', source: '' }, demo: false, index: 10,
}];

// All seven experience entries are approved locally; publish once after full content review.
export const companies = [{
  name: "Zepro Digital",
  logo: '/media/company-logos/zepro.jpg',
  role: "Unity Developer Intern",
  dates: "2016–2017",
  timelineYear: 2016,
  description: "Started my career as a Unity Developer Intern, learning Unity and the fundamentals of game development.",
  outcome: "",
  projectIndices: [6],
  demo: false,
}, {
  name: "Nutty Apps",
  logo: '/media/company-logos/nutty-apps.jpeg',
  role: "Unity Game Developer",
  dates: "2017–2018",
  timelineYear: 2017,
  description: "Worked on Unity games, focusing on user interfaces and gameplay modules.",
  work: "Built interfaces with Unity UI, integrated third-party plugins and developed game modules while building my understanding of game architecture.",
  outcome: "",
  projectIndices: [10],
  demo: false,
}, {
  name: "Five Rivers Technologies",
  logo: '/media/company-logos/five-rivers-technologies.jpg',
  role: "Unity Developer → Senior Unity Developer",
  dates: "Apr 2018–Oct 2020",
  timelineYear: 2018,
  description: "Promoted to Senior Unity Developer within my first year and took on a lead role within a 12-person team.",
  work: "Built gameplay systems in C# and contributed to HTC Vive VR applications. Helped new developers through code reviews, walkthroughs and pair programming.",
  outcome: "Delivered 10 products during my time with the company.",
  projectIndices: [1, 5, 3, 8, 7, 9],
  demo: false,
}, {
  name: "No Borders Innovations",
  logo: '/media/company-logos/no-borders-innovations.jpeg',
  role: "Senior Game Developer",
  dates: "Nov 2020–Mar 2021",
  timelineYear: 2020,
  description: "Led a team of four working on the Xana metaverse platform and Xana Live streaming app.",
  work: "Integrated Agora for real-time communication and AWS GameLift for server infrastructure. Improved QA practices and documented recurring technical issues to help the team avoid repeat problems.",
  outcome: "Delivered both products on schedule.",
  projectIndices: [4],
  demo: false,
}, {
  name: "Arthur Technologies",
  logo: '/media/company-logos/arthur.png',
  role: "Senior VR Unity Developer",
  dates: "Mar 2021–Apr 2024",
  timelineYear: 2021,
  description: "Built core features for Arthur’s VR collaboration platform using Unity, C#, Photon and AWS. My work focused on multiplayer functionality, cross-platform development and performance.",
  work: "Led the VR-to-WebGL conversion, writing custom wrappers for services without browser support. Integrated AWS services, including EC2 and S3, into the application and deployment workflow.",
  outcome: "Improved memory use and runtime performance to support stable, real-time HD video streaming in VR.",
  projectIndices: [0],
  demo: false,
}, {
  name: 'Arkadium',
  logo: '/media/company-logos/arkadium.png',
  role: 'Freelance Senior Unity Developer — Contract',
  dates: 'Apr 2024–Present',
  timelineYear: 2024,
  description: 'I work with Arkadium on an ongoing freelance contract, providing development and maintenance support as projects arise.',
  work: 'Handle Unity upgrades, performance improvements and mobile game releases as needed.',
  outcome: 'Ongoing, project-based freelance work with no fixed hours.',
  projectIndices: [],
  demo: false,
}, {
  name: 'Infinity Up',
  logo: '/media/company-logos/infinity-up.png',
  role: 'Lead Unity Developer',
  dates: 'Nov 2024–Present',
  timelineYear: 2024,
  description: 'I lead a team of 10 developers across three client projects and three in-house games. I plan development with clients, set technical direction, review code and contribute directly through release.',
  outcome: 'Galactic Peggle achieved D1, D3 and D7 retention rates of 27%, 10% and 8%.',
  work: 'Shipped Galactic Peggle, Boat Magnet, Crossy Bridge, Clucky Chick and other games. Established shared architecture and coding standards, and built internal tools for in-app purchases, notifications and validation.',
  projectIndices: [],
  demo: false,
}];

export const skillGroups = [
  {
    "name": "Development",
    "title": "From gameplay to release",
    "skills": [
      {
        "skill": "Unity / C#",
        "level": "Strong"
      },
      {
        "skill": "Gameplay development",
        "level": "Strong"
      },
      {
        "skill": "Android and iOS development",
        "level": "Strong"
      },
      {
        "skill": "WebGL development",
        "level": "Strong"
      },
      {
        "skill": "Addressables",
        "level": "Strong"
      },
      {
        "skill": "Performance and memory optimization",
        "level": "Strong"
      }
    ]
  },
  {
    "name": "XR & Multiplayer",
    "title": "Connected experiences",
    "skills": [
      {
        "skill": "VR: Meta/Oculus and HTC Vive",
        "level": "Strong"
      },
      {
        "skill": "Multiplayer: Photon PUN/Fusion and custom servers",
        "level": "Strong"
      },
      {
        "skill": "Unity AR / Vuforia",
        "level": "Working knowledge"
      },
      {
        "skill": "Agora video / voice",
        "level": "Working knowledge"
      }
    ]
  },
  {
    "name": "Cloud & Services",
    "title": "Services behind the game",
    "skills": [
      {
        "skill": "Firebase",
        "level": "Strong"
      },
      {
        "skill": "PlayFab",
        "level": "Strong"
      },
      {
        "skill": "Google Cloud Platform (GCP)",
        "level": "Strong"
      },
      {
        "skill": "AWS EC2 / S3",
        "level": "Working knowledge"
      },
      {
        "skill": "AWS GameLift",
        "level": "Working knowledge"
      }
    ]
  },
  {
    "name": "Publishing",
    "title": "Supporting live games",
    "skills": [
      {
        "skill": "AdMob / AppLovin",
        "level": "Strong"
      },
      {
        "skill": "Unity Ads / IronSource / Chartboost",
        "level": "Strong"
      },
      {
        "skill": "Unity Analytics",
        "level": "Strong"
      },
      {
        "skill": "Google Play / App Store publishing",
        "level": "Strong"
      }
    ]
  },
  {
    "name": "Leadership",
    "title": "Building with a team",
    "skills": [
      {
        "skill": "Architecture, SOLID and dependency injection",
        "level": "Strong"
      },
      {
        "skill": "Team leadership, code reviews and mentoring",
        "level": "Strong"
      },
      {
        "skill": "Client scoping and release planning",
        "level": "Strong"
      }
    ]
  },
  {
    "name": "Rendering",
    "title": "Rendering & continued learning",
    "skills": [
      {
        "skill": "URP",
        "level": "Working knowledge"
      },
      {
        "skill": "HDRP",
        "level": "Learning"
      },
      {
        "skill": "Shader Graph",
        "level": "Learning"
      }
    ]
  }
];

export const hub = [
  { id: 'intro', name: 'Intro', subtitle: 'A little about me', icon: 'hello' },
  { id: 'career', name: 'Career', subtitle: 'The journey so far', icon: 'case' },
  { id: 'projects', name: 'Projects', subtitle: 'Things I have built', icon: 'game' },
  { id: 'skills', name: 'Skills', subtitle: 'Tools of the trade', icon: 'blocks' },
  { id: 'contact', name: 'Contact', subtitle: 'Make something together', icon: 'mail' },
];
