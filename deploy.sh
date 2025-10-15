git pull
bash setup.sh
cd frontend/crm/
npm run build
cd ../../
pm2 start ecosystem.config.js
pm2 restart all
pm2 save