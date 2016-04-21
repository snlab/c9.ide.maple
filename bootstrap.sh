#!/usr/bin/env bash

apt-get update
apt-get install g++ npm nodejs-legacy
git clone https://github.com/c9/core.git c9sdk
cd c9sdk
./scripts/install-sdk.sh
