Builder Track Weekly Report — Week 14

Name: Rebecca Ayodele
Week Ending: 26-06-2026

---

Courses Completed

- SSRI (Script-Sourced Rich Information)
  
  - https://crates.io/crates/ckb-ssri-std
  - https://docs.rs/ckb-ssri-std/latest/ckb_ssri_std/
  - https://github.com/ckb-devrel/ssri-server

- CKB Fundamentals
  
  - https://www.nervos.org/knowledge-base/bitcoin_and_ckb_security_models

---

Key Learnings

ckb-ssri-std (Crates.io):

The "ckb-ssri-std" crate is a Rust library for building SSRI-compatible smart contracts on CKB. Instead of every contract exposing its own custom interface, SSRI provides a common way for contracts to describe themselves so wallets and other applications know how to interact with them.

The crate provides traits, macros, and helper functions that reduce boilerplate when writing contracts. The main goal is to make smart contracts easier to build and easier for wallets, explorers, and dApps to integrate with.

ckb-ssri-std Documentation (docs.rs):

The documentation explains the different modules available in the crate and how they are used. I learned about the macros for defining SSRI modules and methods, the helper utilities, and the prelude module that re-exports commonly used items.

I also learned that the crate is built for "no_std" environments since CKB scripts run with limited resources. Reading the documentation gave me a better idea of how developers are expected to use the library in real smart contracts.

SSRI Server:

The SSRI Server is an off-chain application that reads information from SSRI-enabled smart contracts and exposes it through an HTTP API. Instead of every frontend communicating directly with the blockchain, applications can query the server to learn what a contract supports.

This helped me understand that SSRI is more than just a smart contract standard. It also includes tools that make it easier for wallets and web applications to interact with contracts without writing custom logic for each one.

Bitcoin and CKB Security Models:

This article explains how Nervos CKB builds on Bitcoin's security model. Both blockchains use Proof of Work, but CKB extends the idea by supporting smart contracts and the Cell model while keeping the focus on decentralization and security.

One thing that stood out to me was how the Cell model works. Instead of updating data directly, CKB creates and consumes Cells whenever state changes. That made the transfer bug I fixed in LandLedger make much more sense because ownership only changes when the old parcel cell is consumed.

---

Practical Progress

LandLedger — Transfer Bug Fix

Fixed the ownership transfer bug where transactions remained on "Submitting transfer..." without completing. The issue was that the parcel cell was not being consumed as an input. "completeInputsByCapacity" only added random capacity cells, leaving the original parcel cell untouched.

The fix was to explicitly add the parcel cell's OutPoint as a transaction input before completing the transaction. After this change, transfers worked correctly and ownership moved as expected.

LandLedger — Type Script Integration

Integrated the deployed Rust type script into both the parcel registration and transfer transactions. Every parcel cell now includes the deployed type script, and the required "cellDeps" are added so the script is executed by the CKB VM during transaction verification.

Verified the implementation by registering a parcel on the Pudge testnet. The transaction was confirmed successfully with the type script attached.

LandLedger — Explorer Links and Documentation

Added transaction explorer links after successful parcel registration and transfer so transactions can be viewed directly on the Pudge Explorer. Also updated the parcel cards to display the current owner's address.

---

Challenges Faced

- The transfer hang was subtle — no error, no timeout, just silence. The wallet signed the transaction successfully but the parcel never moved because the existing cell was never consumed. The fix was straightforward once the cause was identified, but diagnosing it required checking the transaction structure rather than the wallet or network.
- The Leaflet marker icon fix had to be applied carefully since the same code had previously caused a "render is not a function" crash before the react-leaflet version was sorted out.

---

Reflection

The transfer bug was a good reminder of how CKB's cell model differs from account-based chains. On Ethereum, a transfer modifies state in place by updating a contract's storage. On CKB, ownership only changes if the existing cell is consumed and a new one is created. Reading about the Cell model this week made that behaviour much clearer to me.

LandLedger is now functionally complete across Phase 1 and Phase 2: wallet connection, parcel registration, map view, ownership transfer, Molecule serialization, and a Rust type script enforcing parcel ID immutability on-chain. The reading this week also gave me a better understanding of the ecosystem around the project, especially how SSRI aims to make smart contracts easier for wallets and applications to understand.

---

Next Week Plan
- Learn more about SSRI and other standards used in the Nervos ecosystem.
- Explore more on the reading in the advanced stage from the ckb builder handbook. 
