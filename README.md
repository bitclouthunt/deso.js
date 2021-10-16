# bitclout-sdk

[![npm version](https://img.shields.io/npm/v/bitclout-sdk.svg)](https://www.npmjs.com/package/bitclout-sdk)

An SDK to interact with BitClout APIs

---

**WARNING:** Project is under heavy development, expect breakage until this warning is removed.

---

## Installation

```sh
yarn add bitclout-sdk
```

or

```sh
npm install --save bitclout-sdk
```

## Usage

Code docs: [documentation](https://bitclouthunt.github.io/bitclout-sdk/)

### Bitclout

#### Fetch a profile

```js
import { Bitclout } from "bitclout-sdk";

const bitclout = new BitClout({ baseUrl: "https://bitclout.com/api" });

const fetchProfile = async (publicKey: string) => {
  const profile = await bitclout.getSingleProfile({
    publicKey,
  });
};
```

### Identity

#### Login

```js
import { identity } from "bitclout-sdk";

const login = async () => {
  const response = await identity.login({ accessLevel });
  const publicKey = response.publicKeyAdded;
  return publickey;
};
```

## Example code / Sample app

A sample app can be found in [/example](/example)

Runing example code project:

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
