# Getting Started

These instructions will get you a copy of the project running on your local machine

## Prerequisites

You must have Git and NodeJS installed on your local machine:

- [Git](https://git-scm.com/downloads)
- [NodeJS](https://nodejs.org/en/download/)

After Git and NodeJS are installed you must clone the repository to your local machine.

Open CMD or any CLI in the folder you want to put the project and type this command

```bash
    git clone https://github.com/osnielvaldivia/cis4911-cewq.git
```

## Database setup

1. Obtain a Mongo Atlas URI to store data
2. Create a file called "default.json" in config
3. Structure the file like such

```json
{
  "mongoURI": "<MongoURIGoesHere>",
  "jwtSecret": "<JWTSecretGoesHere>"
}
```

## Install packages

Go to the project root and type in this command in CMD or any CLI

```bash
npm install
```

## Run the API

Run dev nodemon server

```bash
npm run server
```

Run with just node

```bash
node server
```

## Docker

1. Login to the cis4911 cloud enabled work queue docker account.

**NOTE** replace the ```$DOCKER_USERNAME``` and ```$DOCKER_PASSWORD``` with the actual credentials

**NOTE** also if you have a password with the ```!``` character and are also using bash then you must turn off the ```!``` history substitution by typing in ```set +H``` before step 1

```bash
docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
```

2. Pull the docker image

```bash
docker pull $DOCKER_USER_ID/cis4911-cewq-backend
```

3. Run the docker image locally in a container

```bash
docker run -d -p 49160:5000 $DOCKER_USER_ID/cis4911-cewq-backend
```

You can now access the API at ```http://localhost:49160```

### Docker building and pushing

1. Build the docker image, this includes continuous integration with automated tests. The build will fail if these tests do not pass.

```bash
docker build -f Dockerfile -t $DOCKER_USER_ID/cis4911-cewq-backend .
```

2. Push the docker image to dockerhub

```bash
docker push $DOCKER_USER_ID/cis4911-cewq-backend
```

3. Run the docker image locally in a container

```bash
docker run -d -p 49160:5000 $DOCKER_USER_ID/cis4911-cewq-backend
```

### Docker Cleanup

1. Delete all containers and their volumes

```bash
docker rm -vf $(docker ps -a -q)
```

2. Delete all images

```bash
docker rmi -f $(docker images -a -q)
```

## Maintenance

### Remove unused dependencies

1. In the root of the project run

```bash
npx depcheck
```

2. Remove any unused dependencies in package.json

3. Execute npm clean script

```bash
npm run clean
```

## Authors

- [Osniel Valdivia](https://github.com/osnielvaldivia)
- [Francisco Espinosa Castillo](https://github.com/francespinosa)
