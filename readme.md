# CRM application
This project is node.js back-end code for a customer relationship management application that can create users and tickets as well as manage them.

<br/>

## Features

>Account creation
- When you create a new user (customer or engineeer), an account verification link will be sent to e-mail address provided.
- If the user is a customer, the account will autometically be approved on verification.
- In case of Engineer, an admin will have to approve the account.
- JSON Web Token used for security purpose
- Users can also update some details like name and password
- User search is also available for users with proper authorization

>Ticket creation
- When a new ticket is created, an engineer with least open tickets is assigned to it. (if available)
- On new ticket creation, a notificatiob email is sent to admin, ticket reporter and ticket engineer.
- Users can get all the tickets connected to their account.
- Ticket details can be updated only by related parties.
- Ticket Engineer can only be reassigned by the admin

<br/>

## External modules used
|External modules used|
|-|
|express|
|mongoose|
|jsonwebtoken|
|node-rest-client|
|dotenv|
|bcryptjs|

<br/>

## REST API paths

>User creation
- Sign-up
`POST /crm/api/v2/auth/signup`
- Sign-in
`POST /crm/api/v2/auth/signin`
- Account verification
`GET /crm/api/v2/auth/verifyemail/:token`
- Resend verification link
`GET /crm/api/v2/auth/resendverificationemail/:token`

>User operations
- Get all users (Query params userType and userStatus supported)
`GET /crm/api/v2/users`
- Get user by userId
`get /crm/api/v2/users/:id`
- Update user data
`PUT /crm/api/v2/users/:id`

>Ticket creation and operations
- Create new ticket
`POST /crm/api/v2/tickets/`
- Get all tickets (query param status supported)
`Get /crm/api/v2/tickets/`
- Update ticket
`Put /crm/api/v2/tickets/:id`