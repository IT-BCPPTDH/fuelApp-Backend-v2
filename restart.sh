#!/bin/bash

pm2 stop fuelApp-be
pm2 delete fuelApp-be
pm2 save

pm2 start --name=fuelApp-be index.js
pm2 save