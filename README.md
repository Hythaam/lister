# Lister
Gift list application to allow coordination of gifting occasions.

## Getting Started

### Signing up
From the login page, clicking on the "Register" button will allow you to create a new user account.
This page will allow you to enter an email address to be used as a username.
Once a valid email address is entered, clicking the "Register" button will send and email to the provided address with a tokenized login link.

When the page is reloaded, you will automatically be logged in as the last user.

### Creating a new list
TODO

### Sharing a list
TODO

### Commenting on a list item
TODO

## Contributing

### Architecture
Lister is a vite application with a fastify backend and a postgres database.
The database is managed using the TypeORM CRM. More information about the backend API can be found in the `docs/api.json` OpenAPI spec file.

#### Frontend
TODO

#### Backend
TODO

### Local Hosting
Running Lister locally requires docker to be installed. Running `scripts/start-local-dev.sh` will initialize the docker cluster and prepare the database.

### Testing
Once the local environment is running, `scrits/run-integration-tests.sh` will run a test suite on the local instance.

### Deployment
TODO