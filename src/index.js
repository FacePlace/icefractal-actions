const core = require('@actions/core');
const axios = require('axios');
const fs = require('fs');

(async function () {
  try {
    const pages = core.getInput('pages').split('\n').map((page) => page.trim());

    const budgetsPath = core.getInput('budgetsPath');
    const budgets = budgetsPath
      ? JSON.parse(fs.readFileSync(budgetsPath, 'utf8'))
      : undefined;

    const apiKey = core.getInput('apiKey');

    // Retrieve additional information
    const branch = core.getInput('branch');
    const repository = core.getInput('repository');
    const commit_sha = core.getInput('commit_sha');
    const commit_message = core.getInput('commit_message');
    const commit_author = core.getInput('commit_author');
    const commit_author_email = core.getInput('commit_author_email');

    await axios
      .post(
        'https://api.omnifractal.com/v1/auditWithActions',
        {
          pages: pages,
          budgets: budgets,
          branch: branch,
          repository: repository,
          commit_sha: commit_sha,
          commit_message: commit_message,
          commit_author: commit_author,
          commit_author_email: commit_author_email,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        }
      )
      .catch((error) => {
        console.log(error);
        core.setFailed(error.response.data);
      });
  } catch (error) {
    core.setFailed(error.message);
  }
})();
