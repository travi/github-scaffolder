export default async function (octokit, nextSteps, repoName, owner) {
  if (octokit && nextSteps) {
    const issues = await Promise.all(
      nextSteps.map(nextStep => octokit.issues.create({title: nextStep.summary, owner, repo: repoName}))
    );

    return {
      nextSteps: issues.map(issue => issue.data.url)
    };
  }

  return {nextSteps: []};
}
