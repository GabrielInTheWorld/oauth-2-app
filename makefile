build-client:
	cd client && npm run build

start: | build-client
	npm start

electron:
	echo('Not implemented')