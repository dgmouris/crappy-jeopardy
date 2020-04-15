# How to deploy

## deploying the front end.

I've done this with netlify so that we can make things a bit easier.

1. go to frontend folder
    cd frontend
2. run the build.
    npm run build
3. deploy the build
    - make sure you have the netlify-cli
        npm install netlify-cli -g
    - deploy 
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
7. install postgres (we're going to use it.) and configure it.
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
8. install redis and make sure it's started o
    - install redis-server on the local machine.
        sudo apt install redis-server -y
    - Make sure it's running correctly
        sudo service redis-server start
        redis-cli ping (should respond with pong)
9. Pull down the project with Git on the server
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

10. Get your dependencies installed
    - Go into the backend folder of jeopardy
        cd crappy-jeopardy/backend
    - install the dependencies (might take a bit)
        pipenv install 

11. Make sure you can run gunicorn
    - run the following
        pipenv run gunicorn --bind 0.0.0.0:8000 crappy_jeopardy.wsgi
    - cretae a socket file with sudo privileges
        sudo nano /etc/systemd/system/gunicorn.socket
    - enter the following in to the file.
        [Unit]
        Description=gunicorn socket

        [Socket]
        ListenStream=/run/gunicorn.sock

        [Install]
        WantedBy=sockets.target
    - create a systemd file 
        sudo nano /etc/systemd/system/gunicorn.service
    - add the folowing to the text to the server
        [Unit]
        Description=gunicorn daemon
        Requires=gunicorn.socket
        After=network.target

        [Service]
        User=ubuntu
        Group=ubuntu
        Restart=always
        Type=simple
        WorkingDirectory=/home/ubuntu/crappy-jeopardy/backend
        ExecStart=/home/ubuntu/.local/bin/pipenv run gunicorn \
                  --access-logfile - \
                  --workers 3 \
                  --bind unix:/run/gunicorn.sock \
                  crappy_jeopardy.wsgi:application

        [Install]
        WantedBy=multi-user.target

    Note: if you come into problems with the file above you'll have to change and reload the daemons with the following command (then you can reload it again.)
        sudo systemctl daemon-reload

    - start the service and make sure it's working.
        - start it
            sudo systemctl start gunicorn.service
        - check status
            sudo systemctl status gunicorn.service

        - with curl you should get the error page
             curl --unix-socket /run/gunicorn.sock localhost


12. Create our nginx configuration.
    - Create a sites availablle file for our project.
        sudo nano /etc/nginx/sites-available/crappy-jeopardy
    - Enter the following text where you'll change DOMAIN_OR_IP


        server {
            listen 80;
            server_name DOMAIN_OR_IP;

            location = /favicon.ico { access_log off; log_not_found off; }
            location /static/ {
                root /home/ubuntu/crappy-jeopardy/backend;
            }

            location / {
                include proxy_params;
                proxy_pass http://unix:/run/gunicorn.sock;
            }
        }



    - make a symbolic link to your configuration by using the following command
        sudo ln -s /etc/nginx/sites-available/crappy-jeopardy /etc/nginx/sites-enabled
    - make a symbolic link to the enabled sites (running sites.)
        sudo ln -s /etc/nginx/sites-available/crappy-jeopardy /etc/nginx/sites-enabled
    - test the nginx configuration and see if there are any errors
        sudo nginx -T

13. Get some project related things done.
    - go in to the "backend" folder
    - run the migrations and the collect static
        pipenv run python manage.py collectstatic
        pipenv run migrate
    - create a user for yourself
        pipenv run python manage.py createsuperuser
    - get some questions.
        pipenv run python manage.py get_questions

14. setup daphne
    - check if daphne can run (in the backend folder)
        pipenv run daphne -b 0.0.0.0 -p 8001 crappy_jeopardy.asgi:application
    - create a system service file
        sudo nano /etc/systemd/system/daphne_cf.socket
    - write the following in there
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

    - You should be able to start daphne with the following command:
        sudo systemctl start daphne_cj.service
    - You should be able to check if works
        sudo systemctl status daphne_cj.service

15. modify your nginx to be able touse this.
    - change of the following file
        sudo nano /etc/nginx/sites-available/crappy-jeopardy
    - so that it looks like this:


        upstream channels-backend {
            server localhost:8001;
        }

        server {
            listen 80;
            server_name DOMAIN_OR_IP;

            location = /favicon.ico { access_log off; log_not_found off; }
            location /static/ {
                root /home/ubuntu/crappy-jeopardy/backend;
            }
            location / {
                try_files $uri @proxy_to_app;
                include proxy_params;
                proxy_pass http://unix:/run/gunicorn.sock;
            }

            location @proxy_to_app {
                proxy_pass http://channels-backend;

                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";

                proxy_redirect off;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Host $server_name;
            }
        }

<!-- 16. Get your certs up and running
    1. install let's encrypt certbot
        sudo add-apt-repository ppa:certbot/certbot -y
    2. install the certbot for nginx
        sudo apt install python-certbot-nginx -y
    3. 

    4. Add the ssl certificate
     sudo certbot --nginx -d 204.209.76.194
 -->