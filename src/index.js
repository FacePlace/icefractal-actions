const core = require('@actions/core');
const axios = require('axios');

(async function() {
  const pages = core.getInput('pages').split('\n').map((page) => page.trim());
  console.log(pages);
  const apiKey = core.getInput('apiKey');

  await axios.post(
    'https://api.omnifractal.com/v1/auditWithActions',
    {
      pages: [
        ...pages,
      ],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    },
  );
})();
