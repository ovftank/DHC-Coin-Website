import sqlite3
from datetime import datetime

from flask import Flask, jsonify, render_template, request

app = Flask(__name__, template_folder="public", static_folder="public")


def get_connection():
    return sqlite3.connect('data.db')


def init_table():
    conn = get_connection()
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS customers
                (id TEXT PRIMARY KEY, balance REAL)''')

    c.execute('''CREATE TABLE IF NOT EXISTS transactions
                (customer_id TEXT, amount REAL, transaction_date TEXT, FOREIGN KEY (customer_id) REFERENCES customers(id))''')
    c.execute('''CREATE TABLE IF NOT EXISTS coin
                (sale_bonus INTEGER, token_price REAL, raised INTEGER, target INTEGER)''')
    conn.commit()
    conn.close()


def init_coin():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM coin")
    count = c.fetchone()[0]
    if count == 0:
        c.execute("INSERT INTO coin (sale_bonus, token_price, raised, target) VALUES (?, ?, ?, ?)",
                  (0, 0.1, 0, 200000))
    conn.commit()
    conn.close()


def add_customer(customer_id, balance):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id FROM customers WHERE id=?", (customer_id,))
    existing_customer = c.fetchone()
    if existing_customer:
        c.execute("UPDATE customers SET balance = ? WHERE id = ?",
                  (balance, customer_id))
    else:
        c.execute("INSERT INTO customers (id, balance) VALUES (?, ?)",
                  (customer_id, balance))
    conn.commit()
    conn.close()


def add_transaction(customer_id, amount):
    transaction_date = datetime.now().strftime("%H:%M:%S %d-%m-%Y")
    conn = get_connection()
    c = conn.cursor()
    c.execute("INSERT INTO transactions (customer_id, amount, transaction_date) VALUES (?, ?, ?)",
              (customer_id, amount, transaction_date))
    conn.commit()
    conn.close()


def get_balance(customer_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT balance FROM customers WHERE id=?", (customer_id,))
    result = c.fetchone()
    balance = result[0] if result else None
    conn.close()
    return balance


def get_transaction_history(customer_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM transactions WHERE customer_id=?", (customer_id,))
    transaction_history = c.fetchall()
    conn.close()
    return transaction_history


@app.template_filter('format_number')
def format_number(value):
    return "{:,.0f}".format(value).replace(",", ".")


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/login')
def login():
    conn = get_connection()
    c = conn.cursor()
    saleBonus = c.execute("SELECT sale_bonus FROM coin").fetchone()[0]
    tokenPrice = c.execute("SELECT token_price FROM coin").fetchone()[0]
    raised = c.execute("SELECT raised FROM coin").fetchone()[0]
    target = c.execute("SELECT target FROM coin").fetchone()[0]
    process = int(raised / target * 100)
    return render_template('home.html', saleBonus=saleBonus, tokenPrice=tokenPrice, raised=raised, target=target, process=process)


@app.route('/api/get-history')
def get_history():
    customer_id = request.args.get('customer_id')
    transaction_history = get_transaction_history(customer_id)
    return jsonify({'History': transaction_history})


@app.get('/api/info')
def get_info():
    customer_id = request.args.get('customer_id')
    amount = 0
    if not get_balance(customer_id):
        add_customer(customer_id, amount)
    info = get_balance(customer_id)
    return jsonify({'balance': info})


@app.route('/api/buy', methods=['POST'])
def buy():
    if request.is_json:
        data = request.json
        customer_id = data['customer_id']
        amount = data['amount']

        if not get_balance(customer_id):
            add_customer(customer_id, amount)
        else:
            balance = get_balance(customer_id)
            new_balance = balance + amount
            conn = get_connection()
            c = conn.cursor()
            c.execute("UPDATE customers SET balance = ? WHERE id = ?",
                      (new_balance, customer_id))
            conn.commit()
            conn.close()
        add_transaction(customer_id, amount)

        conn = get_connection()
        c = conn.cursor()
        c.execute("UPDATE coin SET raised = raised + ?",
                  (amount))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Transaction successful', 'balance': new_balance})
    else:
        return jsonify({'message': 'Request must be JSON'}), 400


@app.route('/setting')
def setting():
    return render_template('coming-soon.html')


@app.route('/withdraw')
def withdraw():
    return render_template('coming-soon.html')


@app.route('/history')
def history():
    return render_template('history.html')


if __name__ == '__main__':
    init_table()
    init_coin()
    app.run(host='0.0.0.0', port=5000, debug=True)
