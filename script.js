// Load projects
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('projects-container');
  
  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <h3>${project.name}</h3>
      <p>${project.description}</p>
      <div class="project-stack">
        ${project.stack.map(tech => `<span>${tech}</span>`).join('')}
      </div>
      <div class="project-links">
        ${project.github ? `<a href="${project.github}" target="_blank">Source</a>` : ''}
        ${project.demo ? `<a href="${project.demo}" target="_blank">Demo</a>` : ''}
        ${project.architecture ? `<a href="${project.architecture}" target="_blank">Architecture</a>` : ''}
      </div>
    `;
    container.appendChild(card);
  });

  // Optional: GitHub stats (simple fetch, add your username)
  loadGitHubStats('YOUR_GITHUB_USERNAME');
});

async function loadGitHubStats(username) {
  if (!username || username === 'YOUR_GITHUB_USERNAME') return;
  
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    const user = await response.json();
    
    document.getElementById('github-container').innerHTML = `
      <img src="${user.avatar_url}" alt="${username}" style="width:80px;height:80px;border-radius:50%;margin-bottom:1rem;">
      <p>Public repos: ${user.public_repos} | Stars: ${user.public_gists || 'N/A'}</p>
      <a href="${user.html_url}" target="_blank" class="project-links" style="margin-top:1rem;">
        View GitHub →
      </a>
    `;
  } catch (e) {
    console.log('GitHub stats unavailable');
  }
}
