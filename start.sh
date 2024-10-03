#!/bin/bash

pm2 start --name=fuelApp-be index.js
pm2 save
