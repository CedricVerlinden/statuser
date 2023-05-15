<h1>Statuser</h1>

This app is designed to help you monitor the availability of your favorite websites and ensure that they are up and running smoothly.

---

<h2>Features</h2>
<h3>Back-end</h3>

- Easy configuration management for different environments.
- Simple data management with features like create, read, update, list, and delete.
- Capability to perform CRUD operations for managing users, tokens, and website status checks.
- Helper functions for various tasks like hashing, JSON conversion, generating random strings, and sending SMS messages.
- Built-in logging functionality for tracking website status checks and storage optimization.
- Convenient server management for HTTP and HTTPS servers.
- Background workers that execute website checks on startup and every minute thereafter, ensuring continuous monitoring.

<h3>Front-end</h3>

- Simple, intuitive user interface.
- Easy account creation and management.
- Ability to create, edit, and delete website status checks.

---

<h1>Build</h1>
<h2>Prerequisites</h2>

- [Node.js](https://nodejs.org/en/download) (v18.16.0 LTS)
- [Postman](https://www.postman.com/downloads/) for easy API testing

<h2>Installation</h2>

1. Fork this  repository at the top of the page
2. Clone the repository to your local machine: `git clone https://github.com/<yourname>/status-app.git`
3. Run the app with `node index.js`. To run with debug messages:
   1. Windows: `$env:NODE_DEBUG='server,workers'; node index.js`
   2. Unix: `NODE_DEBUG=server,workers node index.js`

---

<h1>API Usage</h1> 

<h2>Users</h2>
This end-point allows you to perform CRUD operations on users.

<h3>Create</h3>

To create a user, send a `POST` request to `/users` with the following body (JSON):
```json
{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "5551234567",
    "password": "password",
    "tos": true
}
```
Phone numbers must be 10 digits long. The `tos` field must be set to `true` to indicate that the user has agreed to the terms of service, providing a value of `false` will result in a `400`.

When a user is created, a file is created in the `users` directory with the phone number as the filename. The file contains the user's data, including a hashed password, and the rest of their details.

<h3>Read</h3>

To retrieve information about a user, send a `GET` request to `/users` with the following query parameters:

- `phone`: the user's phone number.

The header must contain a valid token in the `token` field. The token must belong to the user who is requesting the information, or the request will be denied. (Look at the [Tokens](#tokens-create) section for more information.)
<h3>Update</h3>

To update a user's information, send a `PUT` request to `/users` with the following body (JSON):

```json
{
    "phone": "5551234567",
    "firstName": "Jane",
    "lastName": "Doe",
    "password": "password"
}
```
The header must contain a valid token in the `token` field. The token must belong to the user who is updating the information, or the request will be denied. (Look at the [Tokens](#tokens-create) section for more information.)

The `phone` field is required and must be 10 digits long, this is to identify who to update. All other fields are optional, though at least one must be provided.

The `tos` field cannot be updated, as it is a one-time agreement.
<h3>Delete</h3>

To delete a user, send a `DELETE` request to `/users` with the following query parameters:

- `phone`: the user's phone number.

The header must contain a valid token in the `token` field. The token must belong to the user who is deleting the account, or the request will be denied. (Look at the [Tokens](#tokens-create) section for more information.)


<h2>Tokens</h2>
This end-point allows you to perform CRUD operations on tokens. Tokens are also used to authenticate users.

<h3 id="tokens-create">Create</h3>

To create a token, send a `POST` request to `/tokens` with the following body (JSON):

```json
{
    "phone": "5551234567",
    "password": "password"
}
```

The `phone` and `password` fields are required. The `password` field must match the password of the user with the provided phone number, otherwise the request will be denied.

When a token is created, a file is created in the `tokens` directory with the token id as the filename. The file contains the token's data, including the phone number of the user who created it, the token's expiration date, and the token id. The token expires after 1 hour.

<h2>Read</h2>

To retrieve information about a token, send a `GET` request to `/tokens` with the following query parameters:

- `id`: the token id.

<h3>Update</h3>

To update a token's expiration date, send a `PUT` request to `/tokens` with the following body (JSON):

```json
{
    "id": "token_id",
    "extend": true
}
```

You can only update a token's expiration date if it has not expired yet.

The `id` and `extend` fields are required. The `id` field must be the id of the token to update. The `extend` field must be set to `true` to extend the token's expiration date, providing a value of `false` will result in a `400`.

<h3>Delete</h3>

To delete a token, send a `DELETE` request to `/tokens` with the following query parameters:


- `id`: the token id.
<h2>Checks</h2>
This end-point allows you to perform CRUD operations on checks.

<h3>Create</h3>

To create a check, send a `POST` request to `/checks` with the following body (JSON):

```json
{
    "protocol": "http",
    "url": "example.com",
    "method": "get",
    "successCodes": [200, 201, 301, 302],
    "timeoutSeconds": 3
}
```

The `protocol`, `url`, `method`, and `timeoutSeconds` fields are required. The `protocol` field must be either `http` or `https`. The `url` field must be a valid URL. The `method` field must be either `get`, `post`, `put`, or `delete`. The `successCodes` field must be an array of valid HTTP status codes. The `timeoutSeconds` field must be an integer between 1 - 5 inclusive.

When a check is created, a file is created in the `checks` directory with the check id as the filename. The file contains the check's data, including the user's phone who created it, the check's expiration date, and the check id.

<h3>Read</h3>

To retrieve information about a check, send a `GET` request to `/checks` with the following query parameters:

- `id`: the check id.

The header must contain a valid token in the `token` field. The token must belong to the user that owns the check, or the request will be denied. (Look at the [Tokens](#tokens-create) section for more information.)

<h3>Update</h3>

To update a check, send a `PUT` request to `/checks` with the following body (JSON):

```json
{
    "id": "check_id",
    "protocol": "https",
    "url": "example.com",
    "method": "post",
    "successCodes": [200, 201, 301, 302],
    "timeoutSeconds": 3
}
```

The `id` field is required and must be the id of the check to update. All other fields are optional, though at least one must be provided.

The header must contain a valid token in the `token` field. The token must belong to the user that owns the check, or the request will be denied. (Look at the [Tokens](#tokens-create) section for more information.)

<h3>Delete</h3>

To delete a check, send a `DELETE` request to `/checks` with the following query parameters:

- `id`: the check id.

The header must contain a valid token in the `token` field. The token must belong to the user that owns the check, or the request will be denied. (Look at the [Tokens](#tokens-create) section for more information.)


---


<h1>Contributing</h1>

Whether you find a bug, have a feature request, or want to submit code changes, please feel free to contribute. Here are some ways you can contribute:

- Report a bug by opening an issue
- Discuss a feature request by opening an issue
- Submit a pull request with code changes

<h2>Getting Started</h2>

1. Fork this repository
2. Clone the forked repository to your local machine
3. Create a new branch for your changes (`git checkout -b my-new-branch`)
4. Make your changes and commit them (`git commit -am 'Add some feature'`)
5. Push your changes to your forked repository (`git push origin my-new-branch`)
6. Create a new pull request

<h2>Code Style</h2>

Please make sure to follow our code style guidelines. We use [Prettier](https://prettier.io/) for JavaScript files and the built-in VS Code HTML formatter for HTML files to ensure consistent and readable code.

<h1>Contributors</h1>

- [Cédric](https://github.com/CedricVerlinden) - Project Author

If you contribute, we will add your name to this list (unless you prefer to remain anonymous).

<h1>License</h1>

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
