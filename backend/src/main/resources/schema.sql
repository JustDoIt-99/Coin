CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    email VARCHAR(254) NOT NULL,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email)
);

CREATE TABLE IF NOT EXISTS refresh_token (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expired_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_refresh_token_user_id (user_id),
    UNIQUE KEY uk_refresh_token_token (token),
    CONSTRAINT fk_refresh_token_user
        FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS asset (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    asset_code VARCHAR(20) NOT NULL,
    balance DECIMAL(24, 8) NOT NULL,
    locked_balance DECIMAL(24, 8) NOT NULL,
    average_buy_price DECIMAL(24, 8) NOT NULL,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_asset_user_asset_code (user_id, asset_code),
    CONSTRAINT fk_asset_user
        FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS asset_transaction (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    asset_code VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(24, 8) NOT NULL,
    balance_after DECIMAL(24, 8) NOT NULL,
    locked_balance_after DECIMAL(24, 8) NOT NULL,
    reference_type VARCHAR(20) NOT NULL,
    reference_id BIGINT NOT NULL,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    PRIMARY KEY (id),
    KEY idx_asset_transaction_user_id (user_id),
    CONSTRAINT fk_asset_transaction_user
        FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS asset_transfer_request (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    asset_code VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(24, 8) NOT NULL,
    transaction_id VARCHAR(64) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    PRIMARY KEY (id),
    KEY idx_asset_transfer_request_user_id (user_id),
    CONSTRAINT fk_asset_transfer_request_user
        FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    market_code VARCHAR(20) NOT NULL,
    trade_side VARCHAR(10) NOT NULL,
    order_type VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,
    quantity DECIMAL(24, 8) NOT NULL,
    limit_price DECIMAL(24, 8) NOT NULL,
    locked_amount DECIMAL(24, 8) NOT NULL,
    executed_quantity DECIMAL(24, 8) NOT NULL,
    executed_amount DECIMAL(24, 8) NOT NULL,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    PRIMARY KEY (id),
    KEY idx_orders_user_id (user_id),
    KEY idx_orders_market_code_status (market_code, status),
    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS trade_history (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    market_code VARCHAR(20) NOT NULL,
    trade_side VARCHAR(255),
    order_type VARCHAR(255),
    quantity DECIMAL(24, 8) NOT NULL,
    price DECIMAL(24, 8) NOT NULL,
    total_amount DECIMAL(24, 8) NOT NULL,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    PRIMARY KEY (id),
    KEY idx_trade_history_user_id (user_id),
    KEY idx_trade_history_market_code (market_code),
    CONSTRAINT fk_trade_history_user
        FOREIGN KEY (user_id) REFERENCES users (id)
);
