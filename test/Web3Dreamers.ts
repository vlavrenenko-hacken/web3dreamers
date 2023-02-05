import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import {utils} from "ethers";

describe("Web3Dreamers Test", function () {
  async function deployFixture() {
   const[OWNER, USER, USER1, USER2, NOT_ALLOWED] = await ethers.getSigners();
   
   const Web3Dreamers = await ethers.getContractFactory("Web3Dreamers");
   const dreamers = await Web3Dreamers.connect(OWNER).deploy([USER.address, USER1.address, USER2.address], ethers.utils.parseEther("0.1"));
   await dreamers.deployed();

   return {dreamers, OWNER, USER, NOT_ALLOWED};
  }

  it("Should setURI", async function () {
    const {dreamers, OWNER, NOT_ALLOWED} = await loadFixture(deployFixture);
    const newURL = "ipfs://Qmaa6TuP2s9pSKczHF4rwWhTKUdygrrDs8RmYYqCjP3Hyf/";

    // Set URI
    await dreamers.connect(OWNER).setURI(newURL);
    
    // Mint a token
    await dreamers.connect(NOT_ALLOWED).mint(0, 1, {value: utils.parseEther("0.1")});

    expect(await dreamers.uri(ethers.constants.Zero)).to.eq(newURL+"0.json");

    // Revert: Not owner
    await expect(dreamers.connect(NOT_ALLOWED).setURI(newURL)).to.be.revertedWith("UNAUTHORIZED");
    
    // Revert: Incorrect Id
    await expect(dreamers.connect(NOT_ALLOWED).uri(1)).to.be.revertedWith("INCORRECT_ID");
  });


  it("Should mint", async function () {
    const {dreamers, OWNER, USER, NOT_ALLOWED} = await loadFixture(deployFixture);

    // Mint a token with discount
    await dreamers.connect(USER).mint(0, 1, {value: utils.parseEther("0.05")});
    expect(await dreamers.balanceOf(USER.address, 0)).to.eq(ethers.BigNumber.from("1"));

    // Mint the token without discount
    await dreamers.connect(NOT_ALLOWED).mint(1, 1, {value: utils.parseEther("0.1")});
    expect(await dreamers.balanceOf(NOT_ALLOWED.address, 1)).to.eq(ethers.BigNumber.from("1"));

    // Revert: INCREASE_VALUE
    await expect(dreamers.connect(NOT_ALLOWED).mint(0, 1)).to.be.revertedWith("INCREASE_VALUE");

  });

  it("Should withdraw", async function () {
    const {dreamers, OWNER, USER, NOT_ALLOWED} = await loadFixture(deployFixture);

    // Mint a token with and without discount
    await dreamers.connect(USER).mint(0, 1, {value: utils.parseEther("0.05")});

    await dreamers.connect(NOT_ALLOWED).mint(0, 1, {value: utils.parseEther("0.1")});

    expect(await ethers.provider.getBalance(dreamers.address)).to.eq(ethers.utils.parseEther("0.15"));
    await dreamers.connect(OWNER).withdraw();

    // Revert: UNAUTHORIZED
    await expect(dreamers.connect(USER).withdraw()).to.be.revertedWith("UNAUTHORIZED");

  });
});

