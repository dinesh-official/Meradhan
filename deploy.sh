git pull
bash setup.sh
cd backend && npm run pm2 && npm run pm2:worker

cd ../
cd frontend/crm/
npm run build
npm run pm2