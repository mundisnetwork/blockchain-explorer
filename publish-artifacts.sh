#!/bin/bash

npm run build
aws s3 rm s3://explorer.mundis.io --recursive
aws s3 cp build/ s3://explorer.mundis.io --recursive
aws cloudfront create-invalidation --distribution-id E1NZANEUEM372O --paths "/*"
exit
