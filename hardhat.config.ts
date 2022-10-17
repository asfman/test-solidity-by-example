import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const GOERLI_URL = "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
const PRIVATE_KEY = "e6f990a63ae14b51987efe48c392bbec0a96df699f98ebc43ffc010347e5b843"

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: GOERLI_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  }
};

export default config;
