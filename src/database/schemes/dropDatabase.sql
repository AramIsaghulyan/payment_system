DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP FUNCTION IF EXISTS update_transactions_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_accounts_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_users_updated_at() CASCADE;

DROP TRIGGER IF EXISTS trg_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS trg_accounts_updated_at ON accounts;
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
DROP TRIGGER IF EXISTS notify_transaction_change ON transactions;
