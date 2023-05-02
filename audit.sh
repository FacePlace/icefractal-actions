#!/bin/bash

set -e

pages=$1

echo "Data being sent: {\"pages\": $pages}"

response=$(curl -s -X POST "https://api.omnifractal.com/v1/auditWithActions" \
  -H "Content-Type: application/json" \
  -d "{\"pages\": $pages}")
 
echo "{audit_result}=$response" >> $GITHUB_OUTPUT
