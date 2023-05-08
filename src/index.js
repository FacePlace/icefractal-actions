const core = require('@actions/core');
const axios = require('axios');
const fs = require('fs');

(async function() {
  try {
    const pages = core.getInput('pages').split(/[\n\s]+/).map((page) => page.trim());

    const budgetsPath = core.getInput('budgetsPath');
    const budgets = budgetsPath ?
      JSON.parse(fs.readFileSync(budgetsPath, 'utf8')) :
      undefined;

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
            'Authorization': `Bearer ${apiKey}`,
          },
        },
      )
      .catch((error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          core.setFailed(`Error: ${error.response.status} - ${error.response.statusText}`);
          console.error('Error details:', error.response.data);
        } else if (error.request) {
          // The request was made but no response was received
          core.setFailed('Error: No response received from the server');
          console.error('Error details:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          core.setFailed(`Error: ${error.message}`);
          console.error('Error details:', error);
        }
      });
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
    console.error('Error details:', error);
  }
})();
