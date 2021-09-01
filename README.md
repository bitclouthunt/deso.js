# bitclout-sdk

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
npm install bitclout-sdk
```

## Usage

```js
import { Bitclout } from "bitclout-sdk";

const bitclout = new BitClout({ baseUrl: "https://bitclout.com/api" });

const fetchProfile = async (publicKey: string) => {
  const profile = await bitclout.getSingleProfile({
    publicKey,
  });
};
```

## Example code / Sample app

A sample app can be found in [/example](/example)

Runing example code project:

```sh
yarn example
```

Navigate to [http://localhost:3000](http://localhost:3000)

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
