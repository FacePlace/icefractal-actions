const core = require('@actions/core');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

(async function() {
  try {
    const pages = core.getInput('pages').split('\n').map((page) => page.trim());
    
    // const budget = core.getInput('budget');
    // console.log(JSON.parse(budget))
    
    const budgetPath = core.getInput('budgetPath');
    const budget = budgetPath ? 
    JSON.parse(fs.readFileSync(budgetPath, 'utf8')) :
    undefined;
    
    console.log(pages);
    console.log(budget);
    
    const apiKey = core.getInput('apiKey');

    await axios.post(
      'https://api.omnifractal.com/v1/auditWithActions',
      {
        pages: pages,
        budget: budget,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      },
      )
      .catch((error) => {
        console.log(error.response.data);
        core.setFailed(error.response.data);
      });
  }  catch (error) {
    core.setFailed(error.message);
  }
})();
