struct Cell {
    capacity: u64,
    data_size: usize,
}

struct Transaction {
    inputs: usize,
    outputs: usize,
    output_data_size: usize,
}

impl Transaction {
    fn new(inputs: usize, outputs: usize, output_data_size: usize) -> Transaction {
        Transaction {
            inputs,
            outputs,
            output_data_size,
        }
    }

    fn estimate_size(&self) -> usize {
    let base = 597;
    let extra_inputs = if self.inputs > 2 { (self.inputs - 2) * 100 } else { 0 };
    let extra_outputs = if self.outputs > 2 { (self.outputs - 2) * 98 } else { 0 };
    base + extra_inputs + extra_outputs + self.output_data_size
}

    fn estimate_fee(&self) -> u64 {
        // CKB charges 1 shannon per byte
        self.estimate_size() as u64
    }

    fn summary(&self, cell: &Cell) {
        let fee = self.estimate_fee();
        let fee_in_ckb = fee as f64 / 100_000_000.0;
        let enough = cell.capacity >= fee;

        println!("=== CKB Transaction Fee Estimator ===");
        println!("Inputs:            {}", self.inputs);
        println!("Outputs:           {}", self.outputs);
        println!("Output data size:  {} bytes", self.output_data_size);
        println!("Estimated tx size: {} bytes", self.estimate_size());
        println!("Estimated fee:     {} shannons ({:.8} CKB)", fee, fee_in_ckb);
        println!("Cell capacity:     {} shannons", cell.capacity);
        println!(
            "Enough to cover:   {}",
            if enough { "yes" } else { "no — increase capacity" }
        );
    }
}

fn main() {
    let tx = Transaction::new(1, 2, 0);
    let cell = Cell {
        capacity: 6_100_000_000, // 61 CKB in shannons, minimum cell capacity
        data_size: 0,
    };

    tx.summary(&cell);

    println!();

    let tx_with_data = Transaction::new(1, 1, 22);
    let cell_with_data = Cell {
        capacity: 6_100_000_000,
        data_size: 22,
    };

    tx_with_data.summary(&cell_with_data);
}