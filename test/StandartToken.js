const assertRevert = require("./assertRevert");
const assertFail = require("./assertFail");
const evmError = require("./evmError");
const { exit } = require("process");
const BigNumber = require('bignumber.js');
const {
	expectEqual,
	expectRevert,
	expectEvent,
	BN,
} = require('./utils/JS');


const ERC20Token = artifacts.require("StandartToken");

// @TODO: implement dynamic grab of decimals from the contract.
const oneToken = 1 * (10 ** 18);
const TOTAL_SUPPLY   = new BN('5000000000000000000000000');


const tenThousandsTokens = new BN('10000').mul(new BN(oneToken.toString()));
const thousandTokens = new BN('1000').mul(new BN(oneToken.toString()));
const hundredTokens = new BN('100').mul(new BN(oneToken.toString()));
const fiftyTokens = new BN('50').mul(new BN(oneToken.toString()));

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';




contract('ERC20Token', function (accounts) {

  let contract;

  const owner = accounts[0];
  const tom = accounts[1];
  const fin = accounts[2];
  const pipi = accounts[3];
  const pooh = accounts[4];
  const zero = accounts[5];


  // Log contract details 
  // ERC20 token contract should have definitions for name, symbol, decimals.
  // Assigning the values defined in the contract
  // @TODO: otherwise defining them here. 
  before(async function () {
    contract = await ERC20Token.new("TEST", "TEST",'5000000', {from: owner});

    let name = await contract.name();
    let symbol = await contract.symbol();
    let decimals = await contract.decimals();

    var contractInfo = '';
    contractInfo ="  " + "-".repeat(40);
    contractInfo += "\n  " + "Current date is: " + new Date().toLocaleString("en-US", {timeZone: "UTC"});
    contractInfo += "\n  " + "-".repeat(40);

    contractInfo += "\n  Token Name: " + name;
    contractInfo += "\n  Token Symbol: " + symbol;
    contractInfo += "\n  Decimals: " + decimals;    
    contractInfo += "\n  " + "=".repeat(40);
    
    console.log(contractInfo);
  });

  beforeEach(async function deploy() {
    contract = await ERC20Token.new("TEST", "TEST", '5000000', {from: owner});
  });
  
  afterEach(async function reset() {
    contract = null;
  });

  describe("Initial state:", function() {

    // checks if the contract constructor is assigning the total supply to contract owner
    it('should have correct total supply', async function() {
      const tokenCount = (await contract.totalSupply()).toString();
      console.log(tokenCount)
      expectEqual(tokenCount, TOTAL_SUPPLY);
    });

    // checks that total supply is a constant - it does not change after trasnfer ot tokens from one account to another
    it('should return the correct total supply after transfer', async function () {
      await contract.transfer(tom, oneToken.toString(), { from: owner });

      const tokenCount = (await contract.totalSupply()).toString();
      expectEqual(tokenCount, TOTAL_SUPPLY);
    });
  });


  describe("Balances:", function() {

    // checks initial balances
    it('should have correct initial balances', async function () {

      const iBalances = [ [accounts[0], TOTAL_SUPPLY],
                          [accounts[1], 0],
                          [accounts[2], 0],
                          [accounts[3], 0],
                          [accounts[4], 0]
                        ];
      for (let i = 0; i < iBalances.length; i++) {
        let address = iBalances[i][0];
        let balance = iBalances[i][1];
        expectEqual(await contract.balanceOf(address), balance);
      }
    });

    // checks for forrect balances of sender and receiver after transfer
    it('should return correct balance after transfer', async function () {
      await contract.transfer(fin, hundredTokens.toString(), { from: owner });
      const finBalance = await contract.balanceOf(fin);
      expectEqual(finBalance, hundredTokens.toString());
    });
  });

  describe("Transfer:", function() {

    // checks for successful transfer with valid parameters and avaialble funds
    it('should transfer to valid address having enough amount in sender address', async function () {
      await contract.transfer(fin, hundredTokens.toString(), { from: owner });

      const ownerBalance = await contract.balanceOf(owner);
      //console.log("test",new BN(Number(TOTAL_SUPPLY) - hundredTokens).toString() )
      console.log("ownerBalance", ownerBalance.toString())

      expectEqual(ownerBalance, TOTAL_SUPPLY.sub(hundredTokens));
      const finBalance = await contract.balanceOf(fin);
      console.log("finBalance", finBalance.toString())
      expectEqual(finBalance, hundredTokens);

      await contract.transfer(pipi, fiftyTokens.toString(), { from: fin });

      const finNewBalance = await contract.balanceOf(fin);
      expectEqual(finNewBalance, fiftyTokens);

      const pipiBalance = await contract.balanceOf(pipi);
      expectEqual(pipiBalance, fiftyTokens);
    });

    // checks Transfer event
    it('emits transfer event', async function () {
      const { logs } = await contract.transfer(pipi, thousandTokens.toString(), { from: owner });

      assert.equal(logs.length, 1);
      assert.equal(logs[0].event, 'Transfer');
      assert.equal(logs[0].args.from, owner);
      assert.equal(logs[0].args.to, pipi);
      //assert(logs[0].args.value.eq(thousandTokens.toString()));
      //console.log('test transfer', logs[0].args[3])
      expectEqual(logs[0].args.value, thousandTokens)
    });

    // checks negative scenario - cannot transfer is there are insufficient funds
    it('should fail when the sender does not have enough balance', async function () {

      await assertRevert(contract.transfer(tom, oneToken.toString(), { from: zero }));

    });

    // // checks negative scenario - cannot transfer to zero address
    it('should revert when recepient is the ZERO address', async function () {

      await assertRevert(contract.transfer(ZERO_ADDRESS, oneToken.toString(), { from: owner }));

    });

    // // checks negative scenario - cannot transfer to short (invalid) address
    // // if this test fails, it means you have not implemented a modifier to be applied
    // // to Transfer function. Modifier should check for correct payload size.
    // // the sample contract in the repo has an example for implementaion
    // it('should fail when recepient is non valid address (covering SHORT ADDRESS attack protection)', async function () {

    //   await assertFail(contract.transfer(SHORT_ADDRESS, oneToken.toString(), { from: owner }));

    // });

  });

  describe("Transfer total supply:", function() {


    // checks that owner cannot transfer more than total supply
    it('should fail on attemt to tranfer more than total supply from owner', async function () {
      await assertRevert(contract.transfer(tom, TOTAL_SUPPLY.add(tenThousandsTokens).toString(), { from: owner }));

    });

    // checks that total supply can be transfered in total
    it('should allow to transfer total supply from owner to another address', async function () {
      await contract.transfer(pooh, TOTAL_SUPPLY.toString(), { from: owner });
      const poohBalance = await contract.balanceOf(pooh);
      expectEqual(poohBalance, TOTAL_SUPPLY);

    });

  });

  describe("Allowance:", function() {

    // checks that initial allowance is 0
    // to check that the test works correctly, chnage one of the 0s to any uint
    it('should have initial allowance 0 for all addresses', async function () {

      const iAllowances = [ [accounts[0], accounts[1], 0],
                            [accounts[0], accounts[2], 0],
                            [accounts[0], accounts[3], 0]
                          ];
      for (let i = 0; i < iAllowances.length; i++) {
        let owner = iAllowances[i][0];
        let spender = iAllowances[i][1];
        let expectedAllowance = iAllowances[i][2];
        assert.equal(await contract.allowance(owner, spender), expectedAllowance);
      }
    });

    it('should return correct allowance after approval', async function () {

      await contract.approve(tom, thousandTokens.toString(), { from: owner })
      await contract.approve(fin, hundredTokens.toString(), { from: tom })
      await contract.approve(pipi, oneToken.toString(), { from: tom })

      expectEqual(await contract.allowance(owner, tom), thousandTokens)
      expectEqual(await contract.allowance(tom, fin), hundredTokens)
      expectEqual(await contract.allowance(tom, pipi), oneToken.toString())

    });

  });

  describe("Approval:", function() {

    // need to reset approval to 0 before making new approval
    // it is good practice to implement Approval function to require allowance to be 0 to make an approval
    // thus, is approval is given once, it has to be reset to 0, before giving second approval for same address
    beforeEach(async function () {
      await contract.approve(tom, 0, { from: owner });
    });

    it('emits an approval event', async function () {
      const { logs } = await contract.approve(tom, oneToken.toString(), { from: owner });

      console.log("Approval",logs)

      assert.equal(logs.length, 1);
      assert.equal(logs[0].event, 'Approval');
      assert.equal(logs[0].args.owner, owner);
      assert.equal(logs[0].args.spender, tom);
      expectEqual(logs[0].args.value,oneToken.toString());
    });

    it('should approve requested amount', async function () {
      await contract.approve(pooh, tenThousandsTokens.toString(), { from: owner });

      const allowance = await contract.allowance(owner, pooh);
      expectEqual(allowance, tenThousandsTokens);
    });

    it('it reverts when spender has more than 0 amount from previuos approval', async function () {

      await contract.approve(pipi, fiftyTokens.toString(), { from: owner });

      const allowance = await contract.allowance(owner, pipi);
      expectEqual(allowance, fiftyTokens);

      await assertRevert(contract.approve(pipi, oneToken.toString(), { from: owner }));
    });
  });

  describe("Transfer from:", function() {


    it('should transfer to valid address when sender has enough balance', async function () {

      await contract.approve(pooh, tenThousandsTokens.toString(), { from: owner });
      await contract.transferFrom(owner, pipi, hundredTokens.toString(), { from: pooh });

      const poohBalance = await contract.balanceOf(owner);
      expectEqual(poohBalance, TOTAL_SUPPLY.sub(hundredTokens));

      const pipiBalance = await contract.balanceOf(pipi);
      expectEqual(pipiBalance, hundredTokens);
    });

    it('should revert when trying to transfer more than available balance', async function () {

      await contract.approve(fin, thousandTokens.toString(), { from: owner });
      await assertRevert(contract.transferFrom(fin, pipi, tenThousandsTokens.toString(), { from: owner }));

    });


  });


  describe("burn:", function() {    
    beforeEach(async function () {
      await contract.mint(owner, "50000000000000000000000000", {from: owner});
    });

    it('should have correct total supply ', async function () {
      await contract.burn(tenThousandsTokens.toString(), { from: owner });

      const ownerBalance = await contract.balanceOf(owner);
      const tokenCount = await contract.totalSupply();
      // console.log('ownerBalance: ', ownerBalance.toString());
      // console.log('tokenCount:   ', tokenCount.toString());
      expectEqual(tokenCount, ownerBalance);
    });
  });  
});