const Web3 = require("web3");
require("dotenv").config();
const API_URL = process.env.API_URL;
const ERC20_ADMIN_WALLET = process.env.ERC20_ADMIN_WALLET;
const DAPP_TOKEN_CONTRACT = process.env.DAPP_TOKEN_CONTRACT;
const GENEALOGY_CONTRACT = process.env.GENEALOGY_CONTRACT;
const ABI = {
  dappToken: require("./ABI/tokenAbi.json"),
  genealogy: require("./ABI/genealogyAbi.json"),
  tokenFarm: require("./ABI/tokenFarm.json"),
};
const web3 = new Web3(API_URL);

const wallet = web3.eth.accounts.privateKeyToAccount("0x" + ERC20_ADMIN_WALLET);

const dappTokenContract = new web3.eth.Contract(
  ABI.dappToken,
  DAPP_TOKEN_CONTRACT
);
const genealogyContract = new web3.eth.Contract(
  ABI.genealogy,
  GENEALOGY_CONTRACT
);
const express = require("express");
const app = express();
app.use(express.json());

app.post("/transfer", async (req, res) => {
  try {
    const { amount, receiver } = req.body;
    const result = await transferToken(amount, receiver);
    res.send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Genealogy Bonuses

app.post("/binarybonus", async (req, res) => {
  try {
    const gas = await genealogyContract.methods
      .binaryBonus()
      .estimateGas({ from: wallet.address });

    await genealogyContract.methods
      .binaryBonus()
      .send({ from: wallet.address, gas: gas })
      .then((res) => {
        result = res;
      });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});

const transferToken = async (amount, receiver) => {
  let result;
  web3.eth.accounts.wallet.add(ERC20_ADMIN_WALLET);
  const value = web3.utils.toWei(amount);
  const gas = await dappTokenContract.methods
    .transfer(receiver, value)
    .estimateGas({ from: wallet.address });

  await dappTokenContract.methods
    .transfer(receiver, value)
    .send({ from: wallet.address, gas: gas })
    .then((res) => {
      result = res;
    });

  return result;
};
