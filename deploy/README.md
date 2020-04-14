# How to deploy

## deploying the front end.

I've done this with netlify so that we can make things a bit easier.

1. go to frontend folder
    cd frontend
2. run the build.
    npm run build
2. deploy the build
    netlify deploy -d build

## deploying the backend

I've deployed this project on cybera so that we can get some stuff working for the talk.

### Server build and process.

1. update the server
    sudo apt update
2. install nginx
    sudo apt install nginx -y
3. install daphne
    sudo apt install -y daphne
4. install python 3.7 with apt
    sudo apt install software-properties-common -y
    sudo add-apt-repository ppa:deadsnakes/ppa -y
    sudo apt install python3.7 -y
5. 