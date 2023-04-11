
const {ethers} = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners()
  const Contract = await ethers.getContractFactory('NFTMarketplace');
  const marketplaceContract = await Contract.deploy();
  await marketplaceContract.deployed();

  console.log("The contract is deployed on the address: ",marketplaceContract.address);
  console.log("The contract is deployed by: ",deployer.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
