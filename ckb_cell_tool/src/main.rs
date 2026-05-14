use bech32::FromBase32;

struct CKBCell {
    network: String,
    code_hash: String,
    hash_type: u8,
    lock_args: String,
}

impl CKBCell {
    fn new(network: String, code_hash: String, hash_type: u8, lock_args: String) -> CKBCell {
        CKBCell {
            network,
            code_hash,
            hash_type,
            lock_args,
        }
    }

    fn lock_type(&self) -> &str {
        match self.hash_type {
            0x01 => "type",
            0x00 => "data",
            _ => "unknown",
        }
    }

    fn summary(&self) {
        println!("=== CKB Cell Info ===");
        println!("Network:     {}", self.network);
        println!("Code hash:   0x{}", self.code_hash);
        println!("Hash type:   {} (0x{:02x})", self.lock_type(), self.hash_type);
        println!("Lock args:   0x{}", self.lock_args);
    }
}

fn to_hex(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{:02x}", b)).collect()
}

fn main() {
    let address = "ckt1qrejnmlar3r452tcg57gvq8patctcgy8acync0hxfnyka35ywafvkqgjse2wue39yx9mvpumxysyrz9dz7v9dsdzqq3utv6w";

    let (hrp, data, _variant) = bech32::decode(address).unwrap();
    let payload = Vec::<u8>::from_base32(&data).unwrap();

    let code_hash = &payload[1..33];
    let hash_type = payload[33];
    let lock_args = &payload[34..];

    let cell = CKBCell::new(
        hrp,
        to_hex(code_hash),
        hash_type,
        to_hex(lock_args),
    );

    cell.summary();
}