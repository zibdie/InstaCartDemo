I am looking to create a small (MVP) version of a service called "InstaCart". InstaCart is a service where one can order groceries online and it gets delivered. Therefore, we neet a panel to login and select and a way for the store to "fulfil" an order. We also need a panel for the delivery driver.

Create this project using the following tech stack

- Nodejs backend using Express.js, like a lambda style
- React-based frontend project (something thats not an all-in-one project, like Vite)
- PostgresSQL (ensure we have a container that acts as a frontend, like phpMyAdmin)

Ensure there is a login/registration system (very basic, just username and password), a couple of demo stores, a demo checkout system (ensure we have 1 fake credit card number thats considered acceptable AND allow the user to select 'pay by cash'), and some products per store.

It would be nice to have an order status system, like how services like UberEats, allows you to see your order every step of the way.

Finally, and this is very important, ensure we can select the language. We want the choice of either English or Arabic (Engish by default).

You do have the Playwright MCP to use if needed.
