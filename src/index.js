const core = require('@actions/core');
const axios = require('axios');
const fs = require('fs');

async function checkAuditStatus(auditTrackingIDs) {
  const res = await axios
    .post(
      'https://api.omnifractal.com/v1/checkAuditStatus', {
        audits: auditTrackingIDs,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

  return res.data;
}

const formatSpaces = (str) => {
  return str.split('\n').map((line) => '  ' + line).join('\n');
}

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

    let auditTrackingIDs = [];

    await axios
      .post(
        'https://api.omnifractal.com/v1/auditWithActions', {
          pages: pages,
          budgets: budgets,
          branch: branch,
          repository: repository,
          commit_sha: commit_sha,
          commit_message: commit_message,
          commit_author: commit_author,
          commit_author_email: commit_author_email,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        },
      )
      .then(async (res) => {
        if (res.status >= 400) {
          core.setFailed(`Error: ${res.status} - ${res.data.message || res.message || res.statusText || `Something went wrong`}`);
        } else {
          if (res.data && res.data.audits && Array.isArray(res.data.audits)) {
            auditTrackingIDs = res.data.audits;
          }

          const startTime = new Date().getTime();
          const endTime = startTime + (5 * 60 * 1000);
          
          while (true) {
            const finishedAudits = [];

            if (new Date().getTime() >= endTime) {
              let message = `Error: ${finishedAudits.length} out of ${auditTrackingIDs.length} audits took too long to complete.\n`;

              if (finishedAudits.length > 0) {
                message += `The following audits have finished:\n`
                finishedAudits.forEach((audit) => {
                  message += `- Page: ${audit.page_name}.\n  Profile: ${audit.profile_name}.\n  Status: ${audit.status}.\n`
                  if (audit.message) {
                    message += `${formatSpaces(audit.message)}\n`
                  }
                })
              }

              core.setFailed(message);
              break;
            }

            const auditStatus = await checkAuditStatus(auditTrackingIDs);

            if (auditStatus.audits && auditStatus.audits.length > 0) {
              auditStatus.audits.forEach((audit) => {
                if (audit.status === 'completed' || audit.status === 'failed' || audit.status === 'error') {
                  finishedAudits.push(audit);
                }
              });

              if (finishedAudits.length >= auditTrackingIDs.length) {
                let message = `${finishedAudits.length} out of ${auditTrackingIDs.length} audits have finished.\n`;
                
                if (finishedAudits.length > 0) {
                  message += `The following audits have finished:\n`
                  finishedAudits.forEach((audit) => {
                    message += `- Page: ${audit.page_name}.\n  Profile: ${audit.profile_name}.\n  Status: ${audit.status}.\n`
                    if (audit.message) {
                      message += `${formatSpaces(audit.message)}\n`
                    }
                  })
                }

                if (finishedAudits.filter((audit) => audit.status === 'failed' || audit.status === 'error').length > 0) {
                  core.setFailed(message)
                }
                core.debug(message);
                break;
              }
            } else {
              core.setFailed('Error: No response received from the server')
              break;
            }

            await new Promise((resolve) => setTimeout(resolve, 10000));
          }
          
        }
      })
      .catch((error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          core.setFailed(`Error: ${error.response.status} - ${error.response.data.message || error.response.message || error.response.statusText || `Something went wrong`}`);
          console.error('Error details:', error.response.data);
        } else if (error.request) {
          // The request was made but no response was received
          core.setFailed('Error: No response received from the server');
          console.error('Error details:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          core.setFailed(`Error: ${error.message || error.data.message || `Something went wrong`}`);
          console.error('Error details:', error);
        }
      });
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
    console.error('Error details:', error);
  }
})();
