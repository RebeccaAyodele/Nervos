FROM gitpod/workspace-full

# Install Rust
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/home/gitpod/.cargo/bin:${PATH}"
