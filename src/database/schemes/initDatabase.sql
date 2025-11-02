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

CREATE OR REPLACE FUNCTION notify_transaction_change()
RETURNS trigger AS $$
DECLARE
  payload JSON;
BEGIN
  payload := json_build_object(
    'transaction_id', NEW.transaction_id,
    'account_id', NEW.account_id,
    'type', NEW.type,
    'amount', NEW.amount,
    'direction', NEW.direction,
    'status', NEW.status,
    'message', NEW.message,
    'reference_id', NEW.reference_id,
    'created_at', NEW.created_at,
    'updated_at', NEW.updated_at
  );

  PERFORM pg_notify('transaction_changes', payload::text);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_notify_transaction_change
AFTER INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION notify_transaction_change();



-- ==========================================================
-- INSERT INTO FOR USERS
-- ==========================================================

INSERT INTO users (name, surname, email, password) VALUES
('Aram', 'Isaghulyan', 'aram@example.com', '$2b$12$0ON1xIe.KGrLk5mFjGdjZeS5KOR1j5KhpzlzyI49XktD9KJnFDWNq'),
('Lilit', 'Hakobyan', 'lilit@example.com', '$2b$12$klmc/d34dqWMD0TqZJ5VfudsMWoxtQB3Ibm6nekCh8e3/e2x4W.A2'),
('Tigran', 'Mkrtchyan', 'tigran@example.com', '$2b$12$LPdYf/D9.VuS8nLMVE.qYe4tEH5yiQpauZgmYXr8bl8rElfAY3YYy'),
('Anna', 'Sargsyan', 'anna@example.com', '$2b$12$NesiV6llfaKrr2U0tvsFX.wovSzFHSX1Lc4mzvJ6GbmyZP/q0Joj6'),
('Karen', 'Vardanyan', 'karen@example.com', '$2b$12$LdzBB0El80UI36RWqS9dcu99QvHxTqNFkFsfp0Qg4T7nIWtG3oXa2'),
('Mariam', 'Grigoryan', 'mariam@example.com', '$2b$12$Or9inqDdwK9v1y.z/KWPA.IMIr2yNMkrsreHdZz.6nrlpVNPWxn2.'),
('Hayk', 'Petrosyan', 'hayk@example.com', '$2b$12$RziFqjVtX0MAk9GQu95V2uRAhv9RY6eqkM9ptQzB9LvdChh3A.Ez.'),
('Sona', 'Harutyunyan', 'sona@example.com', '$2b$12$70sz0gYDMgyGMKYsjm3y6ersvdMERo63OnQEA0fYJVdBZU.HqtsAm'),
('Vahagn', 'Ghazaryan', 'vahagn@example.com', '$2b$12$qjwnwjuvmZSJDX9t3pTOeu6Q5gx984rxQeaRiZDGDFBSind9JlKD2'),
('Narek', 'Stepanyan', 'narek@example.com', '$2b$12$buRsEE8CDT502/GzsdUalOgO1wSIInkhsuwAjBhy862COuDF3mxcm'),
('Ani', 'Karapetyan', 'ani@example.com', '$2b$12$aV8dnl7tId16f.gK8b6sx.nML5zl/NFZhidzvoq.Mh/yTPsiXH/GC'),
('David', 'Melikyan', 'david@example.com', '$2b$12$6WD6BV0YlfWAUJkn5b/P3ekj/q2lK7/wqsXsIJuURvHuWHXh9ax7C'),
('Lusine', 'Avetisyan', 'lusine@example.com', '$2b$12$TI00V4irr5k1dZjBA2EHJON.hA0eT2bEU1BtbGr8i0hLC74jJCUfS'),
('Edgar', 'Manukyan', 'edgar@example.com', '$2b$12$uU47o6k0Y6piKakN5oWE2OvI3T7DRG4FW2SieaOFo7RlUTej3gyAq'),
('Marine', 'Asatryan', 'marine@example.com', '$2b$12$5Ei3ric6m0gS5I2T8JImx.SLNIOEs/LG1ruU9u8L4svaPG3SwTbGG'),
('Artur', 'Khachatryan', 'artur@example.com', '$2b$12$MIFcXcoZK7VVgrEjCa0d4e1D1QSOT2.qj5be/b9M.lbtOcgPOBssC'),
('Armine', 'Sahakyan', 'armine@example.com', '$2b$12$JJ0iFOBa1bRo3iKpyu.WfOOPSbT3hya6kwnZZjachd9GD6v7AGVWG'),
('Arsen', 'Hovhannisyan', 'arsen@example.com', '$2b$12$HtTJ.lFZjQpEdqfTaMFBVuF8m8qINR5EMMRQdtr.El43IeyuxGBje'),
('Kristine', 'Gevorgyan', 'kristine@example.com', '$2b$12$V78MIoncO7zQstXW6/a5F.cInAIImnLHMDrV/3Kq9uPK0puFAtjuC'),
('Gor', 'Simonyan', 'gor@example.com', '$2b$12$jA838VUQxjXsidgbsaZm5.fVNT52DcjjUD83FZLLDu5gQilQWoF4K');

-- ==========================================================
-- REAL PASSWORDS
-- 1.  Aram123$
-- 2.  Lilit123$
-- 3.  Tigran123$
-- 4.  Anna123$
-- 5.  Karen123$
-- 6.  Mariam123$
-- 7.  Hayk123$
-- 8.  Sona123$
-- 9.  Vahagn123$
-- 10. Narek123$
-- 11. Ani1234$
-- 12. David123$
-- 13. Lusine123$
-- 14. Edgar123$
-- 15. Marine123$
-- 16. Artur123$
-- 17. Armine123$
-- 18. Arsen123$
-- 19. Kristine123$
-- 20. Gor1234$
-- ==========================================================


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
