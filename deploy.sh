git pull
bash setup.sh
cd backend && npm run pm2 && npm run pm2:worker
cd frontend/crm/
npm run build
cd ../../
pm2 start ecosystem.config.js
pm2 restart all
pm2 save