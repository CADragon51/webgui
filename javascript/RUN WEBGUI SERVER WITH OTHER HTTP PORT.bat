@echo off
echo Specify the HTTP port number:
set /p port=
node webgui-server.js --http %port%