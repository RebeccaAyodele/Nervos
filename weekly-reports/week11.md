## Builder Track Weekly Report — Week 11

**Name:** Rebecca Ayodele
**Week Ending:** 06-05-2026

---

### Courses Completed

- [JS VM API](https://docs.nervos.org/docs/script/js/js-api)
- [JS VM Tests](https://docs.nervos.org/docs/script/js/js-tests)
- [Spore Protocol Introduction](https://docs.nervos.org/docs/tech-explanation/spore-protocol)
- [Create On-Chain Blog — Spore Tutorial](https://docs.spore.pro/tutorials/create-on-chain-blog/)
- [DOB Cookbook](https://github.com/sporeprotocol/dob-cookbook)
- [sUDT Standards Document](https://docs-xi-two.vercel.app/docs/rfcs/0025-simple-udt/0025-simple-udt)
- [Nervos DAO Introduction](https://messari.io/copilot/share/understanding-nervos-dao-830c1d00-0afc-47aa-a65c-465701adc67f)
- [RFC-0023: Deposit and Withdraw in Nervos DAO](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0023-dao-deposit-withdraw/0023-dao-deposit-withdraw.md)
- [Ecosystem Scripts and Libraries](https://docs.nervos.org/docs/ecosystem-scripts/introduction)
- [Understanding Molecule and Serialization](https://docs.nervos.org/docs/serialization/serialization-molecule-in-ckb)
- [Detailed Rust Scripting — Quick Start](https://docs.nervos.org/docs/script/rust/rust-quick-start)
- [Nervos: An In-Depth Overview](https://blog.cryptostars.is/nervos-an-in-depth-overview-of-a-blockchain-network-built-for-modularity)
- [A Deep Dive Into CKB Tokenomics](https://medium.com/nervosnetwork/a-deep-dive-into-the-tokenomics-of-nervos-network)

---

### Key Learnings

**JS VM API:**

This covers the tools needed to pull live chain data into a JavaScript contract. The main takeaway is how it handles reading cell data, script arguments, and whole transaction structures dynamically. Because JavaScript runs inside an interpreter on CKB, you have to use specific QueryIter patterns to fetch cells without draining your execution cycle budget. It handles things like low-level syscalls that connect the JavaScript layer to the actual blockchain state.

**JS VM Tests:**

Since mistakes on-chain are permanent and can freeze funds, off-chain testing is non-negotiable. This section explains how to set up local environment runners to mimic transaction inputs and outputs, and how to mock a transaction to verify that a contract throws the correct errors when things like malicious script arguments are passed.

**Spore Protocol — On-Chain Blog and DOB Cookbook:**

The on-chain blog tutorial shows a real-world use case beyond collectibles. Every blog post is its own independent Spore cell — the text content, formatting, and author identity are all packed into cell state, meaning you can run an entire decentralized publishing platform without a traditional database or hosting provider.

The DOB Cookbook provides pre-made code blueprints for minting, transferring, and melting Spore cells. It shows how to minimize repetitive code and handle cell dependencies efficiently when interacting with the Spore SDK.

**sUDT:**

sUDT is the simple token standard on CKB — the ecosystem's equivalent of ERC-20. The verification logic is straightforward: the contract sums up token amounts in the transaction inputs and compares them to the outputs. If the output amount is greater than the input, the transaction fails. This prevents tokens from being created out of thin air. Minting and burning require the token owner's unique lock script signature. This is the foundation that xUDT builds on by adding extensible validation logic on top.

**Nervos DAO:**

CKB uses a dual issuance model. Primary issuance is capped like Bitcoin, but secondary issuance runs indefinitely as a state rent mechanism. If you are holding CKB long-term without actively using it to store data on-chain, secondary issuance gradually dilutes you. The DAO fixes this — by locking tokens inside it, you receive a payout that offsets that inflation exactly, proportional to your locked percentage of total circulation.

RFC-0023 outlines the technical withdrawal process. It is a two-step cycle: in step one you signal intent to withdraw, which freezes interest accumulation. In step two you wait until the lock period completes before fully unlocking and claiming both the principal and accrued rewards. The lock period is 180 epochs — each epoch is approximately 4 hours, so one full cycle is about 30 days. This means the minimum deposit period in the DAO is roughly 30 days.

**Ecosystem Scripts and Libraries:**

This covers open-source lock scripts and type scripts maintained by the core team — things like secp256k1 signature verifiers, multisig wallets, and base token logic. These are available as cell dependencies, which means standard cryptographic operations do not need to be reimplemented from scratch in every project.

**Molecule and Serialization:**

Molecule is CKB's custom serialization framework. Different languages and hardware architectures format data differently, which would break consensus on a blockchain if nodes read the same bytes in different ways. Molecule addresses this through three key properties: canonicalization (results from different language implementations are consistent in bytes), partial reading (substructures are self-contained and can be extracted independently without reading the full parent structure), and zero-copy access (scripts can read directly from specified memory locations without parsing overhead). These properties are what make deterministic execution reliable across all nodes.

**Detailed Rust Scripting:**

The Rust quick start covers setting up an environment targeting native RISC-V compilation using the `riscv64-unknown-elf` target. It uses `cargo generate` with core CKB templates and emphasizes why contracts must use `no_std` — there is no standard operating system running inside CKB-VM, so the Rust standard library is not available.

**Nervos Overview and Tokenomics:**

Nervos separates concerns across layers. Layer 1 (CKB) is built purely as a secure data verification engine, while speed and transaction volume are handled at Layer 2. This protects the base chain from getting overloaded as usage scales. The tokenomics article ties the economics together — block rewards, miner incentives, and storage costs are all designed so miners remain adequately compensated even decades from now when primary issuance drops close to zero.

**What Stood Out — State Bloat:**

The most interesting realization from combining all these readings is how Nervos handles storage. On Ethereum, you pay gas once to store data but full nodes are stuck holding that data forever. CKB ties storage directly to the token: 1 CKB = 1 byte of on-chain space. If a blog post takes 150 bytes, you lock 150 CKB to hold it. When you no longer need it, burning the cell returns those 150 CKB immediately. You can then deposit them into the DAO or sell them. The chain cleans itself up naturally because holding unnecessary data has a real ongoing economic cost.

---

### Practical Progress

No new builds this week. This was a documentation-heavy week focused on understanding how CKB works under the hood before returning to hands-on work next week.

---

### Reflection

The DAO and tokenomics reading gave more context for why CKB is designed the way it is. The dual issuance model is not just a technical detail — it directly shapes how every part of the system behaves, from why the DAO exists to why storage costs are tied to token holdings. The state bloat realization connected a lot of the earlier reading together in a way that made the whole design feel intentional rather than arbitrary.

---

### Next Week Plan

- Set up a local CKB Devnet environment and research how to model basic land title data inside a single CKB cell — first step toward building a decentralized Land Title Registry aligned with SDG 16. The idea is to map individual property deeds to sovereign CKB cells so ownership records are immutable and cannot be altered by a centralized authority. The longer-term plan includes a React/TypeScript frontend with interactive mapping, and JoyID integration for biometric login so citizens do not need seed phrases to interact with the application
- Begin the Detailed Rust scripting quick start practically in Codespace
