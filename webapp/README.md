Requirement:
 - Node: v22.15.0

Prechecks:
 - Run `npm install` to install all the package
 - Always start the backend first and then frontend client. As Im using sockets it will try to establish connection once you start the client on browser. I didnt handle recovery automatically, you may need to refresh the page to connect with backend if connection  not established.

Command to run frontend on dev
`npm run dev`

Used Techs:
 - vite + react.js
 - sockets