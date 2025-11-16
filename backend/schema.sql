-- create tables
DROP TABLE IF EXISTS rates;
DROP TABLE IF EXISTS currencies;

CREATE TABLE currencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(3) NOT NULL,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    base_currency_id INT,
    target_currency_id INT,
    rate DECIMAL(18, 6) NOT NULL,
    effective_date DATE NOT NULL,
    FOREIGN KEY (base_currency_id) REFERENCES currencies(id),
    FOREIGN KEY (target_currency_id) REFERENCES currencies(id)
);

-- seed currencies
INSERT INTO currencies (id, code, name) VALUES
(1, 'USD', 'US Dollar'),
(2, 'EUR', 'Euro'),
(3, 'GBP', 'British Pound'),
(4, 'JPY', 'Japanese Yen'),
(5, 'AUD', 'Australian Dollar'),
(6, 'MYR', 'Malaysian Ringgit'),
(7, 'CNY', 'Chinese Yuan'),
(8, 'SGD', 'Singapore Dollar'),
(9, 'KRW', 'South Korean Won'),
(10, 'NZD', 'New Zealand Dollar'),
(11, 'CAD', 'Canadian Dollar'),
(12, 'HKD', 'Hong Kong Dollar'),
(13, 'PHP', 'Philippine Peso');

-- seed rates (base = USD)
INSERT INTO rates (base_currency_id, target_currency_id, rate, effective_date) VALUES
(1, 2, 0.85, DATE('now')),
(1, 3, 0.73, DATE('now')),
(1, 4, 110.25, DATE('now')),
(1, 5, 1.35, DATE('now')),
(1, 6, 4.50, DATE('now')),
(1, 7, 6.45, DATE('now')),
(1, 8, 1.35, DATE('now')),
(1, 9, 1180.00, DATE('now')),
(1, 10, 1.42, DATE('now')),
(1, 11, 1.25, DATE('now')),
(1, 12, 7.78, DATE('now')),
(1, 13, 50.12, DATE('now')),

(1, 2, 0.81, '2023-07-01'),
(1, 3, 0.68, '2023-07-01'),
(1, 4, 109.31, '2023-07-01'),
(1, 5, 1.25, '2023-07-01'),
(1, 6, 4.40, '2023-07-01'),
(1, 7, 6.25, '2023-07-01'),
(1, 8, 1.30, '2023-07-01');
