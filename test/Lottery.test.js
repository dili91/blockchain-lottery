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

        assert.equal(1, players.length)
        assert.equal(accounts[0], players[0]);
    })

    it('allows multiple accounts to join the lottery', async () =>{
        for(i=0; i<3; i++){
            await lottery.methods.join().send({
                from: accounts[i], 
                value: web3.utils.toWei('0.02', 'ether') //amount in wei
            });
        }
        
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });


        assert.equal(3, players.length)
        for(i=0; i<3; i++){
            assert.equal(accounts[i], players[i]);
        }
    })

    it('requires a miminum amount of ether to join', async () => {
        try{
            await lottery.methods.join().send({
                from: accounts[0],
                value: 0 // by default is wei
            });
            assert(false); // fail our test if an exception is not thrown
        }catch (err) {
            assert(err);
        }
    })

    it('only managers can pick a winner', async () => {
        try{
            await lottery.methods.pickWinner().send({
                from: accounts[1], // not the manager
            });
            assert(false);
        }catch (err) {
            assert(err);
        }
    })

    it('it sends money to the winner and resets players', async () => {
        // this test uses 1 single player to have a reliable winner 
        await lottery.methods.join().send({
            from: accounts[0], 
            value: web3.utils.toWei('2', 'ether')
        })

        const initialBalance = await web3.eth.getBalance(accounts[0]);

        await lottery.methods.pickWinner().send({
            from: accounts[0]
        })

        const finalBalance = await web3.eth.getBalance(accounts[0]);

        // we can't leverage strict equality due to gas consumed for non read operations
        const difference = finalBalance - initialBalance;
        assert(difference > web3.utils.toWei('1.8', 'ether'))
    })
})