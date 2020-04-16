# How to deploy

There are two parts to deploy here, the "frontend" (user interface) which is a React project, and the "backend" piece which is a django project deployed on daphne.

## Both front end and backend
- update the server
    sudo apt update
- install nginx
    sudo apt install nginx -y
- install daphne
    sudo apt install -y daphne
- install python 3.7 with apt
    sudo apt install software-properties-common -y
    sudo add-apt-repository ppa:deadsnakes/ppa -y
    sudo apt install python3.7 -y
    sudo apt install python3-dev -y
- install and pipenv
    sudo apt install python3-pip -y
    pip3 install --user pipenv
    echo "PATH=$HOME/.local/bin:$PATH" >> ~/.bashrc
    source ~/.bashrc
- install postgres (we're going to use it.) and configure it.
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
        GRANT ALL PRIVILEGES ON DATABASE "crappy-jeopardy" TO crappyjeopardy;
    - make surethat database is running correctly.
        sudo service postgresql start
        sudo service postgresql status

- install git
    sudo apt install git
- Pull down the project with Git on the server
    - go to the "~/.ssh" folder server
    - create a key on the server
        ssh-keygen -t rsa
        (I gave it the name id_crappy_jeopary)
    - add the key to the ssh keys of yoru project
    - in your ".ssh" folder create a file called "config"
    with the following contents:
    Host github.com
       HostName github.com
       User ubuntu
       IdentityFile ~/.ssh/id_crappy_jeopardy

    - go back to your root folder (just "cd" in the terminal)
    - pull down the project (from your fork or not.)
        git clone git@github.com:dgmouris/crappy-jeopardy.git

## Deploying the front end React piece.
- install node and npm so that we can build our project
    curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
    sudo apt install nodejs
    node -v
    npm -v
- Installing dependencies and build the project.
    cd /home/ubuntu/crappy-jeopardy/frontend
    npm install
    npm run build
- Make nginx deploy the front end site.
    - Create a sites availablle file for our project.
        sudo nano /etc/nginx/sites-available/crappy-jeopardy
    - Enter the following text where you'll change DOMAIN_OR_IP

    ```
server {
   listen 80 default_server;
   root /home/ubuntu/crappy-jeopardy/frontend/build;
   server_name DOMAIN_OR_IP;
   index index.html index.htm;
   location / {
     try_files $uri /index.html =404;
   }
}
    ```
    - make a symbolic link to your configuration by using the following command
        sudo ln -s /etc/nginx/sites-available/crappy-jeopardy-react /etc/nginx/sites-enabled
    - test the nginx configuration and see if there are any errors
        sudo nginx -T
    - start nginx
        sudo service nginx start
    - check the status
        sudo service nginx start


## Deploying the backend piece

- Get some project related things done.
    - go in to the "backend" folder
    - run the migrations
        pipenv run migrate
    - get some questions.
        pipenv run python manage.py get_questions


- setup daphne
    - check if daphne can run (in the backend folder)
        pipenv run daphne -b 0.0.0.0 -p 8001 crappy_jeopardy.asgi:application
    - create a system service file
        sudo nano /etc/systemd/system/daphne_cf.socket
    - write the following in there
```
[Unit]
Description=daphne daemon

[Service]
User=ubuntu
Group=ubuntu
Restart=always
Type=simple
WorkingDirectory=/home/ubuntu/crappy-jeopardy/backend
ExecStart=/home/ubuntu/.local/bin/pipenv run daphne \
          -p 8001 \
          -b 0.0.0.0 \
          crappy_jeopardy.asgi:application

[Install]
WantedBy=multi-user.target
```
    - You should be able to start daphne with the following command:
        sudo systemctl start daphne_cj.service
    - You should be able to check if works
        sudo systemctl status daphne_cj.service

NOTE: Right now I'm just running a development server because I'm troubleshooting some tasks. Will update this part soon. 
