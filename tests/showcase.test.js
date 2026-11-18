const test = require('node:test');
const assert = require('node:assert/strict');

// URL pattern used in showcase validation
const URL_PATTERN = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;

function validateShowcaseSubmission(data) {
  const errors = [];
  if (!data.title || data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }
  if (!data.description || data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }
  if (!data.teamName || !data.teamName.trim()) {
    errors.push('Team name is required');
  }
  if (!data.githubUrl || !URL_PATTERN.test(data.githubUrl.trim())) {
    errors.push('Valid GitHub repository URL is required');
  }
  if (data.liveUrl && !URL_PATTERN.test(data.liveUrl.trim())) {
    errors.push('Live demo URL format is invalid');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

function filterProjects(projects, { domain = 'All', search = '', bookmarks = [], onlyBookmarks = false }) {
  return projects.filter((p) => {
    if (onlyBookmarks && !bookmarks.includes(p.id)) return false;
    if (domain !== 'All' && p.domain !== domain) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchTagline = (p.tagline || '').toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchTech = (p.technologies || []).some((t) => t.toLowerCase().includes(q));
      const matchTeam = (p.teamName || '').toLowerCase().includes(q);
      return matchTitle || matchTagline || matchDesc || matchTech || matchTeam;
    }
    return true;
  });
}

function toggleLike(project, userEmail) {
  const likedBy = Array.isArray(project.likedBy) ? [...project.likedBy] : [];
  const hasLiked = likedBy.includes(userEmail);
  const nextLikedBy = hasLiked ? likedBy.filter((e) => e !== userEmail) : [...likedBy, userEmail];
  const nextLikes = hasLiked ? Math.max(0, project.likes - 1) : project.likes + 1;
  return {
    ...project,
    likes: nextLikes,
    likedBy: nextLikedBy,
    isLiked: !hasLiked,
  };
}

test('Showcase validator accepts valid project submission', () => {
  const validData = {
    title: 'HackHub Platform',
    description: 'Collaborative real-time hackathon management platform.',
    teamName: 'Nexus Innovators',
    githubUrl: 'https://github.com/aasthag01-26/HackHub---Hackathon-Platform',
    liveUrl: 'https://intern-project-igdtuw.vercel.app',
  };

  const result = validateShowcaseSubmission(validData);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.errors.length, 0);
});

test('Showcase validator rejects short title and invalid GitHub URL', () => {
  const invalidData = {
    title: 'Hi',
    description: 'Too short',
    teamName: '',
    githubUrl: 'not_a_url',
    liveUrl: 'ftp://bad-proto',
  };

  const result = validateShowcaseSubmission(invalidData);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.length >= 3);
});

test('Filter matches projects by domain category correctly', () => {
  const sampleProjects = [
    { id: '1', title: 'A', domain: 'Web Development', description: 'Web app', technologies: ['React'] },
    { id: '2', title: 'B', domain: 'AI / ML', description: 'ML model', technologies: ['PyTorch'] },
    { id: '3', title: 'C', domain: 'Mobile Apps', description: 'Android app', technologies: ['Kotlin'] },
  ];

  const webOnly = filterProjects(sampleProjects, { domain: 'Web Development' });
  assert.strictEqual(webOnly.length, 1);
  assert.strictEqual(webOnly[0].id, '1');

  const allProjects = filterProjects(sampleProjects, { domain: 'All' });
  assert.strictEqual(allProjects.length, 3);
});

test('Search filter matches keywords across title, tech, and team name', () => {
  const sampleProjects = [
    { id: '1', title: 'HackHub', domain: 'Web Development', description: 'Dashboard', teamName: 'Alpha', technologies: ['TypeScript'] },
    { id: '2', title: 'NeuroAI', domain: 'AI / ML', description: 'PyTorch classifier', teamName: 'Beta', technologies: ['Python'] },
  ];

  const searchByTech = filterProjects(sampleProjects, { search: 'typescript' });
  assert.strictEqual(searchByTech.length, 1);
  assert.strictEqual(searchByTech[0].title, 'HackHub');

  const searchByTeam = filterProjects(sampleProjects, { search: 'beta' });
  assert.strictEqual(searchByTeam.length, 1);
  assert.strictEqual(searchByTeam[0].title, 'NeuroAI');
});

test('Like toggle increments and decrements without negative counts', () => {
  let project = { id: 'p1', likes: 0, likedBy: [] };

  // First like
  project = toggleLike(project, 'user@example.com');
  assert.strictEqual(project.likes, 1);
  assert.strictEqual(project.isLiked, true);

  // Second like (unlike)
  project = toggleLike(project, 'user@example.com');
  assert.strictEqual(project.likes, 0);
  assert.strictEqual(project.isLiked, false);

  // Another unlike guard against negative
  project.likes = 0;
  project.likedBy = ['user@example.com'];
  project = toggleLike(project, 'user@example.com');
  assert.strictEqual(project.likes, 0);
});

test('Bookmark filter isolates saved project IDs', () => {
  const sampleProjects = [
    { id: '1', title: 'One', domain: 'Web Development', description: 'App' },
    { id: '2', title: 'Two', domain: 'AI / ML', description: 'Model' },
    { id: '3', title: 'Three', domain: 'Cloud & DevOps', description: 'CI/CD' },
  ];

  const bookmarked = filterProjects(sampleProjects, { bookmarks: ['1', '3'], onlyBookmarks: true });
  assert.strictEqual(bookmarked.length, 2);
  assert.deepStrictEqual(bookmarked.map((p) => p.id), ['1', '3']);
});
