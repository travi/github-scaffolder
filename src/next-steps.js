export default async function (octokit, nextSteps, repoName, owner) {
  if (octokit && nextSteps) {
    const issues = await Promise.all(
      nextSteps.map(({summary, description}) => octokit.issues.create({
        title: summary,
        body: description,
        owner,
        repo: repoName
      }))
    );

    return {
      nextSteps: issues.map(issue => issue.data.url)
    };
  }

  return {nextSteps: []};
}
