#!/bin/bash
source /root/myenv/bin/activate
exec sqlite-web -h 0.0.0.0 data.db &
exec gunicorn -w 4 -b 0.0.0.0:5000 server:app
