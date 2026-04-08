@echo off
echo Starting installation... > install_log.txt 2>&1

echo [BACKEND] >> install_log.txt
cd "c:\Users\Berith Ajao\Desktop\BProduct\admin-backend"
call npm install >> "c:\Users\Berith Ajao\Desktop\BProduct\install_log.txt" 2>&1
call npx prisma db pull >> "c:\Users\Berith Ajao\Desktop\BProduct\install_log.txt" 2>&1
call npx prisma generate >> "c:\Users\Berith Ajao\Desktop\BProduct\install_log.txt" 2>&1

echo [FRONTEND] >> "c:\Users\Berith Ajao\Desktop\BProduct\install_log.txt"
cd "c:\Users\Berith Ajao\Desktop\BProduct\admin-frontend"
call npm install >> "c:\Users\Berith Ajao\Desktop\BProduct\install_log.txt" 2>&1

echo Done! >> "c:\Users\Berith Ajao\Desktop\BProduct\install_log.txt"
