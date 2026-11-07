// Replace this file's demo records with your real portfolio content.
// Empty links are deliberately disabled in the UI, never fake destinations.
export const profile = {
  name: 'Your name',
  title: 'Unity developer',
  years: 9,
  bio: 'I build interactive experiences with Unity. Take a little drive through my work, career, and the things I love making.',
  email: '',
  linkedin: '',
  resume: '',
  portrait: '',
};

export const projects = [
  ['Orbit Runner', 'space', 'Gameplay', 'A little adventure beyond the atmosphere.'],
  ['Puzzle Garden', 'puzzle', 'Puzzle', 'Small puzzles. Playful worlds. Satisfying discoveries.'],
  ['Drift Circuit', 'race', 'Racing', 'A playful experiment in speed, handling, and feel.'],
  ['Island Builder', 'puzzle', 'Simulation', 'A miniature world with room for big ideas.'],
  ['Mission Control', 'space', 'Tools', 'Making complex workflows feel simple.'],
  ['Castle Quest', 'arena', 'Gameplay', 'A bite-sized journey through a handcrafted world.'],
  ['World Toolkit', 'puzzle', 'Editor tools', 'Better tools for building better worlds.'],
  ['Beyond the Coast', 'space', 'Prototype', 'An experiment in movement, mood, and discovery.'],
].map(([name, visual, category, summary], index) => ({
  name, visual, category, summary, demo: true,
  images: [`/media/${visual === 'race' ? 'arena' : visual}.jpg`, `/media/${visual === 'puzzle' ? 'arena' : 'puzzle'}.jpg`],
  role: 'Your responsibilities and technical decisions will appear here.',
  outcome: 'Add verified results, improvements, and what you delivered.',
  technologies: ['Unity', 'C#'],
  links: { watch: '', play: '', source: '' },
  index,
}));

export const companies = Array.from({ length: 4 }, (_, index) => ({
  name: `Company ${String(index + 1).padStart(2, '0')}`,
  role: 'Your role title',
  dates: 'Employment dates',
  description: 'Your responsibilities, team context, and key contributions go here.',
  outcome: 'Add a meaningful result from your time here.',
  projectIndices: [index % projects.length, (index + 1) % projects.length],
  demo: true,
}));

export const skillGroups = [
  { name: 'Unity', title: 'Building interactive worlds', summary: '9 years of experience with Unity. Add your specific systems, platforms, and specialties here.', images: ['puzzle', 'arena'] },
  { name: 'C#', title: 'The systems behind the play', summary: 'Use this space for your architecture, tooling, and programming experience.', images: ['space', 'puzzle'] },
  { name: 'Focus areas', title: 'What I bring to a project', summary: 'Add the specialties you want employers and clients to know about.', images: ['arena', 'space'] },
];

export const hub = [
  { id: 'intro', name: 'Intro', subtitle: 'A little about me', icon: 'hello' },
  { id: 'career', name: 'Career', subtitle: 'The journey so far', icon: 'case' },
  { id: 'projects', name: 'Projects', subtitle: 'Things I have built', icon: 'game' },
  { id: 'skills', name: 'Skills', subtitle: 'Tools of the trade', icon: 'blocks' },
  { id: 'contact', name: 'Contact', subtitle: 'Make something together', icon: 'mail' },
];
