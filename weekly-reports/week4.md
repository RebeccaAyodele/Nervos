## Builder Track Weekly Report — Week 4

**Name:** Rebecca Ayodele  
**Week Ending:** 04-16-2026  

---

### Courses Completed

- **CKB Script Basics (Developer Training Course)**:
  - Transaction validation using scripts
  - Syscalls and sources (`Input`, `Output`, `CellDep`)
  - IC3Type → OC5Type concept (cell counting logic)
  - Accessing and validating cell data (Data10 type script)

- **Rust (Intro via Script Examples)**:
  - Learned basic Rust syntax through reading and modifying CKB script code
  - Compared Rust concepts with JavaScript

- **CCC Playground**:
  - Ran and analyzed a transaction-building example using the CCC SDK

---

### Key Learnings

- Scripts validate transactions by inspecting cells using **CKB syscalls**
- Learned how to iterate through inputs/outputs using `load_cell`
- Understood validation patterns:
  - enforcing number of cells (IC3Type / OC5Type)
  - limiting data size (Data10)
- Learned the **minimal concern pattern** (scripts only validate relevant cells)

- **Rust Fundamentals (from script reading)**:
  - Functions return values using `Result<(), Error>`
  - Strong typing system (explicit types required)
  - Variables are **immutable by default**, using `mut` when needed
  - Structured conditionals (`if`, `match`)
  - Explicit error handling instead of silent failures

- Gained understanding of transaction flow using CCC:
  - address → lock script
  - defining outputs
  - completing inputs and fees programmatically

---

### Practical Progress

- **OC5Type Script (Attempted)**
  - Modified script logic to count **output cells** instead of input cells
  - Updated required count to **5**
  - Attempted to build and test using Capsule but encountered version incompatibility

- **Always Success Lock (Executed)**
  - Successfully ran and observed lock script behavior in a transaction  

  ![Always Success Lock Execution](./assets/week4/always%20success%20lock.png)

- **CCC Playground Transaction**
  - Executed transaction example:
    - created output
    - auto-filled inputs
    - calculated transaction fee
  
  ![CCC Transfer Example Execution](./assets/week4/ccc%20transfer-example.png)

---

### Environment Setup

- Cloned the **developer-training-course-script-examples** repository from GitHub
- Installed and configured **Capsule** (version compatibility issue encountered)
- Set up and used **CCC Playground**
- Explored project structure and Rust contract files (`entry.rs`, etc.)

---

### Challenges Faced

- Capsule version mismatch (`0.10` vs required `0.9`) prevented successful build/test
- MetaMask connection issue in CCC Playground limited full wallet interaction

---

### Reflection

This week focused on understanding how CKB scripts enforce transaction rules at a low level. I developed a solid understanding of syscall-based validation and how type scripts define constraints on cells.

Even though I encountered environment issues with Capsule, I was still able to understand and modify script logic conceptually. Additionally, learning Rust through real script examples helped me understand how low-level blockchain logic is implemented compared to JavaScript.

Using the CCC Playground helped bridge the gap between theory and practical transaction construction.

---

### Next Week Plan

- Resolve **Capsule version issues** and successfully build/test the OC5Type script
- Continue remaining **CKB Script Basics lessons**
- Practice writing small **Rust programs** to strengthen understanding of ownership, mutability, and error handling
- Revisit CCC Playground and attempt more complex transaction scenarios (including wallet connection)