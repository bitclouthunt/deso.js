# deso.js

[![npm version](https://img.shields.io/npm/v/deso.js.svg)](https://www.npmjs.com/package/deso.js)

An SDK to interact with DeSo APIs

---

**WARNING:** Project is under heavy development, expect breakage until this warning is removed.

---

## Installation

```sh
yarn add deso.js
```

or

```sh
npm install --save deso.js
```

## Usage

See full usage in code docs: [documentation](https://bitclouthunt.github.io/deso.js/)

### DeSo

#### Fetch a profile

```js
import { Deso } from "deso.js";

const deso = new Deso({ baseUrl: "https://node.deso.org/api" });

const fetchProfile = async (publicKey: string) => {
  const response = await deso.getSingleProfile({ publicKey });
  return response['Profile'];
};
```

### Identity

#### Login

```js
import { Identity } from "deso.js";

const identity = new Identity({ referralCode: 'WSZRQFPY' });

const login = async () => {
  const payload = await identity.login({ accessLevel: 2 });
  const publicKey = payload.publicKeyAdded;
  return publicKey;
};
```

## Example code / Sample app

A sample app can be found in [/example](/example)

Running example code project:

```sh
yarn example
```

Navigate to [http://localhost:3000](http://localhost:3000)

### Identity login example

Navigate to [http://localhost:3000/login](http://localhost:3000/login)

## Building code for development

Install dependencies:

Depends on `node.js` & `yarn`

```sh
yarn install
```

Build output:

```bash
yarn build
```

## License

MIT
