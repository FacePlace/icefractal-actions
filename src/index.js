const core = require('@actions/core');
const axios = require('axios');
const fs = require('fs');

(async function() {
  const pages = core.getInput('pages').split('\n').map((page) => page.trim());
  const budgetPath = core.getInput('budgetPath');
  const budget = JSON.parse(fs.readFileSync(budgetPath, 'utf8'));
  console.log(pages);
  console.log(budget)
  const apiKey = core.getInput('apiKey');

  await axios.post(
    'https://api.omnifractal.com/v1/auditWithActions',
    {
      pages: [
        ...pages,
      ],
      budget: budget,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    },
  );
})();
