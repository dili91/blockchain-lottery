const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3'); //Uppercase because it's a constructor
const web3 = new Web3(ganache.provider());
const { abi, evm } = require('../compile');

let accounts; 
let lettory;

beforeEach(async() =>{
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(abi)
        .deploy({
            data: evm.bytecode.object
        })
        .send({from: accounts[0], gas: '1000000'});
})

describe('Lottery contract', () => {
    it('deploys a contract', () =>{
        assert.ok(lottery.options.address);
    })

    it('allows one account to join the lottery', async () =>{
        await lottery.methods.join().send({
            from: accounts[0], 
            value: web3.utils.toWei('0.02', 'ether') //amount in wei
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length)
    })
})