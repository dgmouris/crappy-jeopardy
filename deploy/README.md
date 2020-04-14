# How to deploy

## deploying the front end.

I've done this with netlify so that we can make things a bit easier.

1. go to frontend folder
    cd frontend
2. run the build.
    npm run build
3. deploy the build
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
    sudo apt install python3-dev -y
5. install and pipenv
    sudo apt install python3-pip -y
    pip3 install --user pipenv
    echo "PATH=$HOME/.local/bin:$PATH" >> ~/.bashrc
    source ~/.bashrc
6. install git
    sudo apt install git
7. install postgres (we're going to use it.) and set it up.
    sudo apt install libpq-dev postgresql postgresql-contrib -y
    - Login to postgres
        sudo -u postgres psql
    - Create database
        CREATE DATABASE "crappy-jeopardy"
    - Create user
        CREATE USER crappyjeopardy WITH PASSWORD 'crappyjeopardy';
    - set some options for the user
        ALTER ROLE crappyjeopardy SET client_encoding TO 'utf8';
        ALTER ROLE crappyjeopardy SET default_transaction_isolation TO 'read committed';
        ALTER ROLE crappyjeopardy SET timezone TO 'UTC';
    - grant the privileges of the user
        GRANT ALL PRIVILEGES ON DATABASE "crappy-jeopardy" TO myprojectuser;
8. 