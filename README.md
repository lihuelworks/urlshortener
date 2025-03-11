🚀 URL Shortener Microservice
Welcome to the URL Shortener Microservice! This project is designed to showcase a lightweight, efficient URL shortening service, where users can submit URLs and receive a shortened version for easy sharing. Built with Node.js, Express, and a SQLite backend, this service ensures high performance and scalability for URL management.

Key Features:
URL Validation: Ensures only valid URLs are accepted.
Redundancy Check: Avoids generating duplicate short URLs by checking the database.
Efficient URL Storage: Uses SQLite for lightweight, fast key-value storage.
Dynamic Short URL Generation: Generates unique short URLs using shortid.
Easy Redirection: Translates short URLs back to the original with a simple redirect.
🚀 How It Works:
User submits a URL: A valid URL is sent to the API.
Short URL is generated: If the URL is valid and not already stored, a unique short ID is created.
Redirection: Users can visit the short URL to be redirected to the original URL.
