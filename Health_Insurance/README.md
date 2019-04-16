

## Dependencies
Install these prerequisites to follow along with the tutorial.
- NPM: https://nodejs.org
- Truffle: https://github.com/trufflesuite/truffle
- Ganache: http://truffleframework.com/ganache/
- Metamask: https://metamask.io/


## Step 2. Install dependencies
```
$ cd Health-Insurance-Blockchain
$ npm install
```
## Step 3. Start Ganache
Open the Ganache GUI client that you downloaded and installed. This will start your local blockchain instance. 


## Step 4. Compile & Deploy Regulator Smart Contract
`$ truffle migrate --reset`
You must migrate the Regulator smart contract each time you restart ganache.

## Step 5. Configure Metamask
- Unlock Metamask
- Connect metamask to your local Etherum blockchain provided by Ganache.
- Import an account provided by ganache.

## Step 6. Run the Front End Application
nodejs server.js
Visit this URL in your browser: http://localhost:3000


Important Notes: 
There is file called app.js: In that you have to change the(Regulator,Pharmacy etc.,) addresses according to your MetaMask Address.

