export default function (name, repos) {
  return repos.map(repo => repo.name).includes(name);
}
