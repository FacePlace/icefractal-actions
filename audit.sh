#!/bin/bash

pages=$1

response=$(curl -s -X POST "https://api.omnifractal.com/v1/auditWithActions" \
  -H "Content-Type: application/json" \
  -d "{\"pages\": $pages}")

echo "::set-output name=audit_result::$response"
