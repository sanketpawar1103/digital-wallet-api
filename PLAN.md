# Project Overview.

**What has done**

```
[✔️]: Designs Interface Plan.
[✔️]: Implements Functionality.
[✔️]: Validation.
[✔️]: Validation Testing.
```

**What has to be done**

```
[❌]: Segregation Of Code.
[❌]: UI Implementation.
[❌]: Database Implementation.
```

**Future scope**

```
[⏳]: Network Connections.
```

# Program Flow.

```
main.js
- Sets up env, and calls application layer.

digital_wallet.js(application layer).
- Acts as intermediatory layer between UI, db_queries, and validations.

validation.js 
- Validates the input data.

digital_wallet_ui.js
- Reads from user and displays to the user.

digital_wallet_services.js
- All changes making logic(business logic)
```

# Network Connectivity Plan

```
1. Create Account
- URL: POST /createAccount
{
  name: abc,
  phone: 123, 
  balance: 100,
  pin: ****,
  pass: ****
}

- Responses: 

HTTP 201
{
  type: ACCOUNT_CREATED,
  data: {
    name: abc
  }
}

HTTP 409
{
  type: USER_ALREADY_EXISTS,
}

HTTP 400
{
  type: INVALID_INPUT_FORMAT,
}

2. Login Account
- URL: POST /loginAccount
{
  phone: 123,
  pass: ****
}

- Responses: 

HTTP 200
{
  type: LOGIN_SUCCESS,
  data {
    name: abc,
    phone: 123,
    id: <num>
  }
}

HTTP 401
{
  type: INVALID_CREDENTIALS,
}

HTTP 400
{
    type: INVALID_INPUT_FORMAT,
}


3. CHECK BALANCE
- URL: POST /balance
{
  phone: 123,
  pass: ****
}

Response:

HTTP 200
{
  "type": "BALANCE_FETCH_SUCCESS",
  "data": {
    "balance": 5000
  }
}

HTTP 401
{
  "type": "INVALID_CREDENTIALS"
}

HTTP 400
{
  "type": "INVALID_INPUT_FORMAT"
}


4. ADD BALANCE
- URL: POST /deposit
{
  pin: ****,
  "amount": 1000
}

Response:

HTTP 200
{
  "type": "BALANCE_ADDED_SUCCESS",
  "data": {
    "updatedBalance": 6000
  }
}

HTTP 401
{
  "type": "INVALID_CREDENTIALS"
}

HTTP 400
{
  "type": "INVALID_INPUT_FORMAT"
}


5. SEND MONEY
- URL: POST /transactions
{
  "receiverPhone": 456,
  pin: ****,
  "amount": 500,
}

Response:

HTTP 200
{
  "type": "MONEY_SENT_SUCCESS",
  "data": {
    "transactionId": 7891,
    "remainingBalance": 5500
  }
}

HTTP 401
{
  "type": "INVALID_CREDENTIALS"
}

HTTP 400
{
  "type": "INVALID_INPUT_FORMAT"
}


6. TRANSACTION HISTORY
- URL: POST /transactions
{
  pin: ****
}

Response:

HTTP 200
{
  "type": "TRANSACTION_HISTORY_FETCH_SUCCESS",
  "data": [
    { 
      "date",
      "description",
      "amount"
    }
  ]
}

HTTP 401
{
  "type": "INVALID_CREDENTIALS"
}

HTTP 400
{
  "type": "INVALID_INPUT_FORMAT"
}


7. LOGOUT
URL: POST /logout

Response:

HTTP 200
{
  "type": "LOGOUT_SUCCESS"
}

HTTP 401
{
  "type": "INVALID_CREDENTIALS"
}

8. EXIT APPLICATION (SIMULATED)
- URL: POST /app/exit

Response:

HTTP 200
{
  "type": "EXIT_SUCCESS"
}
```
