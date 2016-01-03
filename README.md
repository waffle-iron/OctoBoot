# OctoBoot (WIP !!)
![screen1](http://ronandrouglazet.github.io/OctoBoot/screen1.png)
![screen2](http://ronandrouglazet.github.io/OctoBoot/screen2.png)
![screen3](http://ronandrouglazet.github.io/OctoBoot/screen3.png)
OctoBoot is a fast, powerful, and user friendly tools to create your own website in a few clic, all free !! (with help of some free/custom template and gh-pages)

## Online Version
[http://octoboot.soizen.ovh](http://octoboot.soizen.ovh)

## Local Requirement

    > node
    > npm
    > bower

## Local Install

    > npm i

## Local Build

    Next time
    > npm start

    Or watch
    > npm run watch

## Local Run

OctoBoot is a GitHub application, so you need to get your GitHub app credential to work on it

Go to your GitHub account `settings / application / Devellopers Application` => Register New Application

`Authorization callback URL` Is important, as `Homepage URL`, fill these with `http://localhost:8080` to work on this project
Then, you need to create and fill `gituhubconf.json` file at `./` with your credentials like this:

    {
        "client_id": "[CLIENT-ID]",
        "client_secret": "[CLIENT-SECRET]",
        "authorization_callback_url": "http://localhost:8080"
    }

When all is done, you can start OctoBot ! 

    > node server.js

--> go to [localhost:8080](http://localhost:8080)

## License
[gpl-2.0](http://www.gnu.org/licenses/gpl-2.0.txt)
