from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from datetime import datetime

app = Flask(__name__)
CORS(app)

db_config = {
    "host": "localhost",
    "user": "root",
    "password": "trustGod4ever",
    "database": "sakila"
}
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="trustGod4ever",
        database="sakila"
    )
@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Sakila API!"
    })
@app.route("/films/top", methods=["GET"])
def top_films():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT 
                f.film_id,
                f.title,
                c.name AS category_name,
                COUNT(r.rental_id) AS rental_count
            FROM rental r
            JOIN inventory i 
            ON r.inventory_id = i.inventory_id
            JOIN film f 
            ON i.film_id = f.film_id
            JOIN film_category fc 
            ON f.film_id = fc.film_id
            JOIN category c 
            ON fc.category_id = c.category_id
            GROUP BY f.film_id, f.title, c.name
            ORDER BY rental_count DESC
            LIMIT 5;
        """
        cursor.execute(query)
        films = cursor.fetchall()

        cursor.close()
        conn.close()
        return jsonify(films)
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/films/<int:film_id>", methods=["GET"])
def film_details(film_id):
    print("FILM ID RECEIVED:", film_id)   # Debugging statement to check if film_id is received correctly
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        query = """
SELECT
    f.film_id,
    f.title,
    f.description,
    f.release_year,
    f.length,
    f.rating,
    MAX(c.name) AS category,
    GROUP_CONCAT(
        CONCAT(a.first_name, ' ', a.last_name)
        SEPARATOR ', '
    ) AS actors
FROM film f
LEFT JOIN film_category fc ON f.film_id = fc.film_id
LEFT JOIN category c ON fc.category_id = c.category_id
LEFT JOIN film_actor fa ON f.film_id = fa.film_id
LEFT JOIN actor a ON fa.actor_id = a.actor_id
WHERE f.film_id = %s
GROUP BY f.film_id;
"""

        cursor.execute(query, (film_id,))
        film = cursor.fetchone()

        cursor.close()
        conn.close()

        if film:
            return jsonify(film)
        else:
            return jsonify({"message": "Film not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)})
    

@app.route("/actors/top", methods=["GET"])
def top_actors():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT
                a.actor_id,
                CONCAT(a.first_name, ' ', a.last_name) AS actor_name,
                COUNT(r.rental_id) AS rental_count
            FROM actor a
            JOIN film_actor fa ON a.actor_id = fa.actor_id
            JOIN inventory i ON fa.film_id = i.film_id
            JOIN rental r ON i.inventory_id = r.inventory_id
            GROUP BY a.actor_id
            ORDER BY rental_count DESC
            LIMIT 5;
        """
        cursor.execute(query)
        actors = cursor.fetchall()

        cursor.close()
        conn.close()
        return jsonify(actors)
    except Exception as e:
        return jsonify({"error": str(e)})
    
@app.route("/actors/<int:actor_id>", methods=["GET"])
def actor_details(actor_id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT
                a.actor_id,
                CONCAT(a.first_name, ' ', a.last_name) AS actor_name,
                f.film_id,
                f.title,
                COUNT(r.rental_id) AS rental_count
            FROM actor a
            JOIN film_actor fa ON a.actor_id = fa.actor_id
            JOIN film f ON fa.film_id = f.film_id
            JOIN inventory i ON f.film_id = i.film_id
            JOIN rental r ON i.inventory_id = r.inventory_id
            WHERE a.actor_id = %s
            GROUP BY a.actor_id, f.film_id, f.title
            ORDER BY rental_count DESC
            LIMIT 5;
        """

        cursor.execute(query, (actor_id,))
        films = cursor.fetchall()

        cursor.close()
        conn.close()

        if films:
            return jsonify(films)
        else:
            return jsonify({"message": "Actor not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/films/search", methods=["GET"])
def search_films():
    try:
        query_text = request.args.get("q")

        if not query_text:
            return jsonify({"message": "Search query required"}), 400

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        sql = """
            SELECT DISTINCT
                f.film_id,
                f.title,
                c.name AS category
            FROM film f
            LEFT JOIN film_actor fa ON f.film_id = fa.film_id
            LEFT JOIN actor a ON fa.actor_id = a.actor_id
            LEFT JOIN film_category fc ON f.film_id = fc.film_id
            LEFT JOIN category c ON fc.category_id = c.category_id
            WHERE
                f.title LIKE %s
                OR a.first_name LIKE %s
                OR a.last_name LIKE %s
                OR c.name LIKE %s
            LIMIT 20;
        """

        search_pattern = f"%{query_text}%"

        cursor.execute(sql, (
            search_pattern,
            search_pattern,
            search_pattern,
            search_pattern
        ))

        results = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/rentals", methods=["POST"])
def rent_film():
    try:
        data = request.get_json()

        customer_id = data.get("customer_id")
        film_id = data.get("film_id")

        if not customer_id or not film_id:
            return jsonify({"message": "customer_id and film_id required"}), 400

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        find_inventory = """
            SELECT i.inventory_id
            FROM inventory i
            LEFT JOIN rental r
                ON i.inventory_id = r.inventory_id
                AND r.return_date IS NULL
            WHERE i.film_id = %s
            AND r.rental_id IS NULL
            LIMIT 1;
        """

        cursor.execute(find_inventory, (film_id,))
        inventory = cursor.fetchone()

        if not inventory:
            return jsonify({"message": "Film not available"}), 400

        inventory_id = inventory["inventory_id"]


        insert_rental = """
            INSERT INTO rental
            (rental_date, inventory_id, customer_id, staff_id)
            VALUES (%s, %s, %s, %s);
        """

        cursor.execute(insert_rental, (
            datetime.now(),
            inventory_id,
            customer_id,
            1  # default staff
        ))

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            "message": "Film rented successfully",
            "inventory_id": inventory_id
        })

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/customers", methods=["GET"])
def get_customers():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    offset = (page - 1) * limit

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Get paginated customers
    cursor.execute("""
        SELECT customer_id, first_name, last_name, email
        FROM customer
        LIMIT %s OFFSET %s
    """, (limit, offset))

    customers = cursor.fetchall()

    #  COUNT TOTAL CUSTOMERS
    cursor.execute("SELECT COUNT(*) AS total FROM customer")
    total = cursor.fetchone()["total"]

    cursor.close()
    conn.close()

    return jsonify({
        "customers": customers,
        "total": total,
        "page": page,
        "limit": limit
    })


@app.route("/customers/search", methods=["GET"])
def search_customers():
    try:
        search_term = request.args.get("q")

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT customer_id, first_name, last_name, email
        FROM customer
        WHERE first_name LIKE %s
           OR last_name LIKE %s
        LIMIT 20;
        """

        like_term = f"%{search_term}%"

        cursor.execute(query, (like_term, like_term))
        customers = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(customers)

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/customers/<int:customer_id>/rentals", methods=["GET"])
def customer_rentals(customer_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT
                r.rental_id,
                f.title,
                r.rental_date,
                r.return_date
            FROM rental r
            JOIN inventory i
                ON r.inventory_id = i.inventory_id
            JOIN film f
                ON i.film_id = f.film_id
            WHERE r.customer_id = %s
            ORDER BY r.rental_date DESC;
        """

        cursor.execute(query, (customer_id,))
        rentals = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(rentals)

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/rentals/return", methods=["POST"])
def return_film():
    try:
        data = request.get_json()
        rental_id = data.get("rental_id")

        if not rental_id:
            return jsonify({"message": "rental_id is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        check_query = """
            SELECT return_date
            FROM rental
            WHERE rental_id = %s
        """
        cursor.execute(check_query, (rental_id,))
        rental = cursor.fetchone()

        if not rental:
            cursor.close()
            conn.close()
            return jsonify({"message": "Rental not found"}), 404

        if rental["return_date"] is not None:
            cursor.close()
            conn.close()
            return jsonify({"message": "Film already returned"}), 400

        update_query = """
            UPDATE rental
            SET return_date = %s
            WHERE rental_id = %s
        """
        from datetime import datetime
        cursor.execute(update_query, (datetime.now(), rental_id))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"message": "Film returned successfully"})

    except Exception as e:
        return jsonify({"error": str(e)})
    
@app.route("/customers", methods=["POST"])
def add_customer():
    try:
        data = request.get_json()
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        email = data.get("email")

        if not first_name or not last_name or not email:
            return jsonify({"message": "All fields are required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

      
        insert_query = """
            INSERT INTO customer (store_id, first_name, last_name, email, address_id, active, create_date)
            VALUES (1, %s, %s, %s, 1, 1, NOW())
        """

        cursor.execute(insert_query, (first_name, last_name, email))
        conn.commit()

        customer_id = cursor.lastrowid  # get the ID of the new customer

        cursor.close()
        conn.close()

        return jsonify({
            "customer_id": customer_id,
            "message": "Customer added successfully"
        }), 201

    except Exception as e:
        return jsonify({"message": str(e)}), 500


# Edit customer
@app.route("/customers/<int:customer_id>", methods=["PUT"])
def update_customer(customer_id):
    data = request.get_json()
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "UPDATE customer SET first_name=%s, last_name=%s, email=%s WHERE customer_id=%s",
            (data["first_name"], data["last_name"], data["email"], customer_id)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Customer updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Delete customer
@app.route("/customers/<int:customer_id>", methods=["DELETE"])
def delete_customer(customer_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Optional: check if customer exists
        cursor.execute("SELECT * FROM customer WHERE customer_id = %s", (customer_id,))
        customer = cursor.fetchone()
        if not customer:
            cursor.close()
            conn.close()
            return jsonify({"message": "Customer not found"}), 404

        # Delete the customer
        cursor.execute("DELETE FROM customer WHERE customer_id = %s", (customer_id,))
        conn.commit()

        cursor.close()
        conn.close()
        return jsonify({"message": "Customer deleted successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/customers/<int:customer_id>", methods=["GET"])
def get_single_customer(customer_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = "SELECT customer_id, first_name, last_name, email, active FROM customer WHERE customer_id = %s"
        cursor.execute(query, (customer_id,))
        customer = cursor.fetchone()

        cursor.close()
        conn.close()

        if customer:
            return jsonify(customer)
        else:
            return jsonify({"message": "Customer not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/rentals/<int:rental_id>/return", methods=["PUT"])
def return_movie(rental_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            UPDATE rental
            SET return_date = NOW()
            WHERE rental_id = %s
              AND return_date IS NULL
        """

        cursor.execute(query, (rental_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"message": "Rental already returned or not found"}), 404

        cursor.close()
        conn.close()

        return jsonify({"message": "Movie returned successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)