-- ==========================================================
-- USERS TABLE & TRIGGER
-- ==========================================================

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  user_id INT GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT pk_users PRIMARY KEY (user_id)
);

-- Trigger function: auto-update the `updated_at` field on update
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: call the function before each row update
CREATE OR REPLACE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();

-- ==========================================================
-- ACCOUNTS TABLE & TRIGGER
-- ==========================================================

-- Table: accounts
CREATE TABLE IF NOT EXISTS accounts (
  account_id INT GENERATED ALWAYS AS IDENTITY,
  user_id INT NOT NULL,
  card_number VARCHAR(16) UNIQUE NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  balance NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT pk_account_id PRIMARY KEY (account_id),
  CONSTRAINT fk_user_id FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT chk_currency_usd CHECK (currency = 'USD'),
  CONSTRAINT chk_balance CHECK (balance >= 0)
);

-- Trigger function: auto-update the `updated_at` field on update
CREATE OR REPLACE FUNCTION update_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_accounts_updated_at
BEFORE UPDATE ON accounts
FOR EACH ROW
EXECUTE FUNCTION update_accounts_updated_at();


-- ==========================================================
-- TRANSACTION TABLE
-- ==========================================================

CREATE TABLE IF NOT EXISTS transactions (
  transaction_id INT GENERATED ALWAYS AS IDENTITY,
  account_id INT NOT NULL,
  type VARCHAR(20) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  direction VARCHAR(10) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  reference_id INT,                       
  status VARCHAR(20) DEFAULT 'success',
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT pk_transactions PRIMARY KEY (transaction_id),
  CONSTRAINT fk_account FOREIGN KEY (account_id)
    REFERENCES accounts(account_id) ON DELETE CASCADE,
  CONSTRAINT chk_amount CHECK (amount > 0),
  CONSTRAINT chk_direction  CHECK (direction IN ('debit', 'credit')),
  CONSTRAINT chk_type CHECK (type IN ('transfer', 'deposit', 'withdraw', 'rollback'))
);

CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_transactions_updated_at();


-- ==========================================================
-- INSERT INTO FOR USERS
-- ==========================================================

INSERT INTO users (name, surname, email, password)
VALUES
('Aram', 'Isaghulyan', 'aram@example.com', 'hashed_password_1'),
('Lilit', 'Hakobyan', 'lilit@example.com', 'hashed_password_2'),
('Tigran', 'Mkrtchyan', 'tigran@example.com', 'hashed_password_3'),
('Anna', 'Sargsyan', 'anna@example.com', 'hashed_password_4'),
('Karen', 'Vardanyan', 'karen@example.com', 'hashed_password_5'),
('Mariam', 'Grigoryan', 'mariam@example.com', 'hashed_password_6'),
('Hayk', 'Petrosyan', 'hayk@example.com', 'hashed_password_7'),
('Sona', 'Harutyunyan', 'sona@example.com', 'hashed_password_8'),
('Vahagn', 'Ghazaryan', 'vahagn@example.com', 'hashed_password_9'),
('Narek', 'Stepanyan', 'narek@example.com', 'hashed_password_10'),
('Ani', 'Karapetyan', 'ani@example.com', 'hashed_password_11'),
('David', 'Melikyan', 'david@example.com', 'hashed_password_12'),
('Lusine', 'Avetisyan', 'lusine@example.com', 'hashed_password_13'),
('Edgar', 'Manukyan', 'edgar@example.com', 'hashed_password_14'),
('Marine', 'Asatryan', 'marine@example.com', 'hashed_password_15'),
('Artur', 'Khachatryan', 'artur@example.com', 'hashed_password_16'),
('Armine', 'Sahakyan', 'armine@example.com', 'hashed_password_17'),
('Arsen', 'Hovhannisyan', 'arsen@example.com', 'hashed_password_18'),
('Kristine', 'Gevorgyan', 'kristine@example.com', 'hashed_password_19'),
('Gor', 'Simonyan', 'gor@example.com', 'hashed_password_20');


-- ==========================================================
-- INSERT INTO FOR ACCOUNTS
-- ==========================================================

INSERT INTO accounts (user_id, card_number, currency, balance)
VALUES
(1, '4921756230485273', 'USD', 250.00),
(2, '4539812047523984', 'USD', 310.50),
(3, '4024007159826321', 'USD', 1200.75),
(4, '5167842053987451', 'USD', 950.00),
(5, '4556738492037456', 'USD', 130.20),
(6, '4921852098374162', 'USD', 785.10),
(7, '4024007198762345', 'USD', 0.00),
(8, '5100893274659823', 'USD', 640.30),
(9, '4556738400923176', 'USD', 1520.00),
(10, '4539126472058341', 'USD', 85.75),
(11, '4921756230192837', 'USD', 900.00),
(12, '4024007198236541', 'USD', 112.90),
(13, '5167842098123475', 'USD', 50.00),
(14, '4539812076549823', 'USD', 475.60),
(15, '4921852034592871', 'USD', 1340.40),
(16, '4556738490012387', 'USD', 720.00),
(17, '4024007198237654', 'USD', 95.00),
(18, '4921756230459867', 'USD', 285.00),
(19, '4539812098345621', 'USD', 660.50),
(20, '5167842053012398', 'USD', 110.00);
