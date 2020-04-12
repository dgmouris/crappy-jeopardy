# Crappy Jeopardy

## Running the React Project
- In the root folder
npm run start --prefix frontend
- In the frontend folder
npm run start

## Running the django project locally

- Start your redis
    - Make sure redis-server is installed
    sudo apt install redis-server
    - run the server
    sudo service redis-server start
    - check if the redis-server is running successfully
    redis-cli ping
    Note: output should be PONG

- Command to Run the server
    - in the root folder
    (cd backend && pipenv run python manage.py runserver)
    - go into the backend folder
        - run the shell
        pipenv shell
        - run the server
         python manage.py runserver

- Make sure you're using postgresql and it's started
    sudo service start postgresql

## Getting New Questions

- I've created a management command to do this.
    1. Go in to the backend folder
    2. Start the shell
        pipenv shell
    3. Run the command
        python manage.py get_questions


## Todo
1. Get questions
2. Set/Check answers
3. Render answers of all users.
4. Deploy.
5. Do writeup.
