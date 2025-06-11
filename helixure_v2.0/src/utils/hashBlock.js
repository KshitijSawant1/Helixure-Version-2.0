// utils/hashBlock.js
import { SHA3 } from "sha3";
import { blake2bHex } from "blakejs";

const hashBlock = (blockData) => {
  const sha3 = new SHA3(256);
  const dataString = JSON.stringify(blockData);

  sha3.update(dataString);
  const sha3Hash = sha3.digest("hex");

  const finalHash = blake2bHex(sha3Hash);
  return finalHash;
};

export default hashBlock;
