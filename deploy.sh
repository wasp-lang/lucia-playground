#!/bin/bash

set -e
set -u
set -o pipefail

CAPROVER_URL=https://captain.apps.twoducks.dev
SERVER_APP=lucia-server
CLIENT_APP=lucia-client
IS_DEPLOYING_SERVER=true
IS_DEPLOYING_CLIENT=true

if [ "$IS_DEPLOYING_SERVER" = true ] ; then
    echo "Tar-ing server..."
    tar -czf server.tar.gz --exclude "node_modules" ./lucia-playground-server/*
    echo "Deploying server..."
    caprover deploy -a $SERVER_APP -t ./server.tar.gz -u $CAPROVER_URL
    rm server.tar.gz
fi

if [ "$IS_DEPLOYING_CLIENT" = true ] ; then
    echo "Building client..."
    echo "Tar-ing client..."
    tar -czf client.tar.gz --exclude "node_modules" ./lucia-playground-client/*
    echo "Deploying client..."
    caprover deploy -a $CLIENT_APP -t client.tar.gz -u $CAPROVER_URL
    rm client.tar.gz
fi