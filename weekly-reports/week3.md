# Builder Track Weekly Report — Week 3

**Name:** Rebecca  
**Week Ending:** 09-04-2026

---

## Courses Completed

**L1 Developer Training Course – Transactions Module**

Worked through the Transactions section of the Nervos L1 Developer Training Course on Gitbook. This covered everything from setting up the devnet environment to sending transactions, examining them, working with cells, and storing data on chain.

Topics covered: Sending a Basic Transaction, Lab Send 100,000 CKBytes, Examining a Transaction, Lab Validating Out Points, Introduction to the Cell Model, Components of a Valid Transaction, Transaction Lifecycle, Introduction to Lumos, Lab Calculating Capacity Requirements, Working with Cell Collection, Lab Implement Automated Cell Collection, Storing Data in a Cell, Lab Store a File in a Cell, Updating Data in a Cell

---

## Key Learnings

**Sending a Transaction**

Used ckb-cli to send CKBytes between two genesis accounts on the devnet. The transaction hash is printed once it is submitted successfully.

**Examining a Transaction**

Used `rpc get_transaction` to pull up the details of a submitted transaction. Looking at the inputs and outputs showed how CKBytes move between cells. The difference between total input capacity and total output capacity is the transaction fee paid to miners. An unspent transaction output is called a UTXO. Used `rpc get_live_cell` to validate out points and check that a cell's status is live.

**The Cell Model**

On Nervos, both inputs and outputs are called cells. A live cell is one that has not been spent yet. A dead cell has already been used as an input. Cells can represent any type of on-chain asset.

**Components of a Valid Transaction**

Unlike Ethereum, Nervos only records valid transactions to the blockchain. For a transaction to be valid it needs at least one input cell, all scripts must execute successfully, capacity requirements must be met, and adequate transaction fees must be included.

**Transaction Lifecycle**

There are clear steps to building a transaction: create an empty transaction skeleton, add input cells, add output cells, add change and fees, add dependencies, add signatures, broadcast the transaction, then wait for confirmation.

**Introduction to Lumos**

Went through the code in `Introduction-to-Lumos-Example/index.js`. The code builds a transaction that follows the same lifecycle steps above. It takes a live cell as input, creates a change output, signs it, and sends it to the node. Running the same code twice with the same out point throws a "Live cell not found" error because the cell was already consumed the first time.

**Cell Collection and the Indexer**

Finding cells manually does not work in a real dapp. The Indexer is a piece of software built into the CKB node that helps locate cells quickly. It is enabled by adding "Indexer" to the modules array in `ckb.toml`. The `collectCapacity` function in Lumos uses the Indexer to automatically gather enough live cells to cover a required amount.

**Storing Data in a Cell**

Any data can be stored in a cell's data field. There are three ways to do it: using ckb-cli, using Lumos, or using Capsule. The capacity of the cell must cover the size of the data on top of the 61 byte base minimum. The hex-encoded content can be retrieved and verified using `get_live_cell` with the `--with-data` flag.

**Updating Data in a Cell**

Updating cell data is not an edit in place. The process is to consume the existing cell and create a new one with the updated data.

---

## Practical Progress

**Devnet Setup**

Set up the full CKB devnet from scratch inside a GitHub Codespace. Downloaded the CKB v0.205.0 binary, initialised the chain, configured the block assembler, enabled the Miner and Indexer RPC modules, imported the two genesis accounts, and confirmed blocks were being produced before starting the labs.

**Sending a Basic Transaction**

Sent CKBytes between the two genesis accounts using `ckb-cli wallet transfer`. Examined the resulting transaction using `rpc get_transaction` and identified the outputs, change cell, and miner fee.

![Examining a Transaction](./assets/week3/nervos%20gallery/examining%20a%20transaction.png)

**Validating Out Points**

Used `rpc get_live_cell` to verify the status of specific outputs. Matched outputs to accounts using the lock args from `account list`. Also confirmed what a dead cell error looks like when trying to use an already consumed cell.

![Dead Cell Error](./assets/week3/nervos%20gallery/dead%20cell.png)

**Introduction to Lumos Example**

Ran the Introduction-to-Lumos-Example. Updated `PREVIOUS_OUTPUT` with a valid live cell out point owned by the `ckt1...gwga` account, ran `node index.js`, and got a successful transaction hash. Running it again with the same out point produced the expected dead cell error.

![Basic Transaction with Lumos](./)
![Transaction with Lumos Committed](./assets/week3/nervos%20gallery/transaction%20with%20lumos%20committed.png)

**Lab Calculating Capacity Requirements**

Filled in `PREVIOUS_OUTPUT`, `TX_FEE`, `outputCapacity2`, and `output2` in the exercise file. Transaction completed with one input, two outputs, and the correct fee.

![Calculating Capacity Requirements](./assets/week3/nervos%20gallery/calculating%20capacity%20requirements%20lab%20work.png)

**Lab Implement Automated Cell Collection**

Filled in `TX_FEE`, `outputCapacity1`, `capacityRequired`, `inputCells` using `collectCapacity`, `outputCapacity2`, and `output2`. The lab set up its own cells automatically and the transaction completed successfully with three inputs and two outputs.

![Implement Automated Cell Collection](./assets/week3/nervos%20gallery/Implement%20automated%20cell%20collection.png)

**Storing Data in a Cell**

Used ckb-cli to store `HelloNervos.txt` on chain with a capacity of 74 CKBytes (61 base plus 13 bytes of data). Verified the stored content using `get_live_cell --with-data` and confirmed the hex decoded to "Hello Nervos!".

![Storing Data in a Cell](./assets/week3/nervos%20gallery/storing%20data%20in%20a%20cell.png)

**Lab Store a File in a Cell**

Ran the lab exercise which stored a file on chain using Lumos. Transaction completed successfully and the data was confirmed on chain.

![Store a File in a Cell Exercise](./assets/week3/nervos%20gallery/store%20a%20file%20in%20a%20cell%20exercise.png)

---

## Environment

GitHub Codespace running Ubuntu x86_64. CKB node v0.205.0 with Dummy-Worker miner running. Miner and Indexer RPC modules enabled. Two genesis accounts imported into ckb-cli. Node.js v18, Rust, and Git installed. Developer Training Course repo cloned with all dependencies installed.

---

## What's Next

Start the Scripting Basics module. Learn how lock scripts and type scripts are written and deployed. Work through the Capsule introduction and the scripting labs.