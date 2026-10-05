(function () {
  "use strict";
  const messageBytes = function (message) { return Array.from(new TextEncoder().encode(message)); };
  const protocol = [1, "brc100 demo"];
  const examples = {
    identity: {
      method: "getPublicKey",
      result: "publicKey",
      description: "Request the wallet’s public identity key. A wallet may ask the user for permission.",
      editable: false,
      args: function () { return { identityKey: true }; },
      response: '{\n  publicKey: string // compressed public key, hex encoded\n}'
    },
    signature: {
      method: "createSignature",
      result: "signature",
      description: "Sign message bytes under a protocol and key ID. Using anyone makes this signature publicly verifiable.",
      editable: true,
      args: function (message) { return { data: messageBytes(message), protocolID: protocol, keyID: "1", counterparty: "anyone" }; },
      response: '{\n  signature: number[] // DER-encoded signature bytes\n}'
    },
    encryption: {
      method: "encrypt",
      result: "ciphertext",
      description: "Encrypt message bytes for the wallet itself. The same protocol, key ID, and counterparty are needed to decrypt.",
      editable: true,
      args: function (message) { return { plaintext: messageBytes(message), protocolID: protocol, keyID: "1", counterparty: "self" }; },
      response: '{\n  ciphertext: number[] // encrypted bytes\n}'
    },
    transaction: {
      method: "createAction",
      result: "txid, tx",
      description: "Create a transaction with a one-satoshi data output. Running this code in your app can spend funds and incur fees.",
      editable: false,
      args: function () { return { description: "Publish a hello message", outputs: [{ lockingScript: "006a0d48656c6c6f2c2042524331303021", satoshis: 1, outputDescription: "A public hello message" }] }; },
      response: '{\n  txid?: string,\n  tx?: number[] | Uint8Array, // Atomic BEEF\n  signableTransaction?: {\n    tx: number[] | Uint8Array,\n    reference: string\n  }\n}'
    },
    outputs: {
      method: "listOutputs",
      result: "totalOutputs, outputs",
      description: "List up to ten outputs tracked in an application basket. Wallets can require permission before listing outputs.",
      editable: false,
      args: function () { return { basket: "brc100 demo", limit: 10 }; },
      response: '{\n  totalOutputs: number,\n  outputs: Array<{\n    outpoint: string,\n    satoshis: number,\n    spendable: boolean\n  }>\n  // Other fields depend on requested options.\n}'
    },
    network: {
      method: "getNetwork",
      result: "network",
      description: "Check whether the connected wallet uses mainnet or testnet before creating transactions.",
      editable: false,
      args: function () { return {}; },
      response: '{\n  network: "mainnet" | "testnet"\n}'
    }
  };
  function stringify(args) {
    return JSON.stringify(args, null, 2).replace(/\[\n(?:\s+\d+,?\n)+\s*\]/g, function (match) {
      return "[" + (match.match(/\d+/g) || []).join(", ") + "]";
    });
  }
  function code(id, view, message) {
    const example = examples[id] || examples.identity;
    const args = example.args(message || "Hello, BRC-100.");
    if (view === "request") {
      return stringify({ method: example.method, args: args });
    }
    if (view === "response") return "// Response type shape — not a live wallet result\n" + example.response;
    let formatted = stringify(args);
    let preparation = "";
    if (example.editable) {
      preparation = "const message = Array.from(\n  new TextEncoder().encode(" + JSON.stringify(message || "Hello, BRC-100.") + ")\n);\n\n";
      formatted = formatted.replace(/\[(?:\d+,\s*)*\d+\]/, "message");
    }
    return 'import { WalletClient } from "@bsv/sdk";\n\nconst wallet = new WalletClient();\n\n' +
      preparation + "const { " + example.result + " } = await wallet." + example.method + "(" + formatted + ");";
  }
  globalThis.BRC_EXAMPLES = { examples: examples, code: code };
})();
