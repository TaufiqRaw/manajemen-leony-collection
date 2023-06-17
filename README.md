
# Manajemen Leony Collection

Monolithic app that use Express, homebrew Nest-like framework, and Inversify to handle dependency injection.

## Requirements

- Node (^16.0.0)
- sql database (preferably Postgresql)

## Installation

Install my-project with npm

```bash
  npm install
```
    
copy .env.example and paste to the same folder and rename it to .env
```bash
PORT=5000
DB_USER=
DB_PASSWORD=
DB_NAME=
....
```

run the project locally
```bash
npm run dev
```
## How To

### Create new Modules
write the code below in terminal
```bash
npm run gen
```
you will be asked to enter the new module name 
```bash
Enter module name :
```
enter the new module and press enter, the module will be generated in src/modules/{{module name}}/
## Tech Stack

**Client:** Pug, TailwindCSS

**Server:** Node, Express, Inversify, Mikro-Orm
