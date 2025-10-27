#!/bin/bash

cd MeradhanProject/
./setup.sh
cd frontend/crm/
npm run lint
npm run check
npm run build
cd ../meradhan/
npm run lint
npm run check
npm run build
cd ../../
cd backend
npm run lint
npm run check
pm2 restart ecosystem.config.js
pm2 restart all
pm2 save
