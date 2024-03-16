# build and push the backend image to docker hub
cd backend
docker build -t michac789/taskmaster_backend_prod:latest -f Dockerfile.prod .
docker login
docker push michac789/taskmaster_backend_prod:latest

# remove running container and image, then pull new image and run it
docker stop taskmaster_backend_prod
docker rm taskmaster_backend_prod
docker rmi taskmaster_backend_prod:latest
docker pull michac789/taskmaster_backend_prod:latest
docker run -d -p 8510:8510 --name taskmaster_backend michac789/taskmaster_backend_prod:latest
