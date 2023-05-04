const core = require('@actions/core');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

(async function() {
  try {
    const pages = core.getInput('pages').split('\n').map((page) => page.trim());
    
    // const budget = core.getInput('budget');
    // console.log(JSON.parse(budget))
    
    const budgetsPath = core.getInput('budgetsPath');
    const budgets = budgetsPath ? 
      JSON.parse(fs.readFileSync(budgetsPath, 'utf8')) :
      undefined;
    
    const apiKey = core.getInput('apiKey');

    console.log('budgets', budgets);

    await axios.post(
      'https://api.omnifractal.com/v1/auditWithActions',
      {
        pages: pages,
        budgets: budgets,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      },
      )
      .catch((error) => {
        console.log(error);
        core.setFailed(error.response.data);
      });
  }  catch (error) {
    core.setFailed(error.message);
  }
})();
